import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Property, { type PropertyDocument } from "@/models/Property";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatMessage {
  type?: string;
  text?: string;
}

// POST /api/chatbot/message — public
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }

    console.log("User message:", message);

    const properties = await searchProperties(message);
    console.log("Properties found:", properties.length);

    let alternatives: PropertyDocument[] = [];
    if (properties.length === 0) {
      alternatives = await getAlternativeSuggestions(message);
      console.log("Alternative suggestions:", alternatives.length);
    }

    const aiResponse = await generateAIResponse(message, properties, alternatives, conversationHistory);
    console.log("AI response generated");

    const suggestions = generateFollowUpSuggestions(message, properties, alternatives);

    return NextResponse.json({
      success: true,
      reply: aiResponse,
      properties: properties.length > 0 ? properties.slice(0, 3) : alternatives.length > 0 ? alternatives.slice(0, 3) : null,
      suggestions: suggestions.length > 0 ? suggestions : null,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process message",
        reply:
          "I apologize, but I encountered an error. Please try again or contact our support team at +91 000000.",
      },
      { status: 500 }
    );
  }
}

function generateFollowUpSuggestions(
  query: string,
  properties: PropertyDocument[],
  alternatives: PropertyDocument[]
): string[] {
  const suggestions: string[] = [];
  const lowerQuery = query.toLowerCase();

  if (properties.length > 0) {
    const firstProperty = properties[0];

    if (firstProperty.bhk === 2) {
      suggestions.push("Show me 3 BHK properties");
    } else if (firstProperty.bhk === 3) {
      suggestions.push("Show me 2 BHK properties");
    }

    if (firstProperty.city) {
      suggestions.push(`More properties in ${firstProperty.city}`);
    }

    const price = firstProperty.price;
    if (price < 5000000) {
      suggestions.push("Properties under 50 lakh");
    } else if (price >= 5000000 && price < 10000000) {
      suggestions.push("Properties 50-100 lakh");
    }
  } else if (alternatives.length === 0) {
    if (lowerQuery.includes("bhk")) {
      suggestions.push("Show me all available properties");
    }
    if (lowerQuery.includes("lakh") || lowerQuery.includes("crore")) {
      suggestions.push("What's your latest property?");
    }
    suggestions.push("Contact information");
    suggestions.push("Schedule a property visit");
  } else {
    suggestions.push("Show me all available properties");
    suggestions.push("Contact a dealer");
    suggestions.push("What amenities are available?");
  }

  if (suggestions.length < 3) {
    const generic = ["Contact information", "Schedule a property visit", "What amenities are available?"];
    generic.forEach((s) => {
      if (suggestions.length < 4 && !suggestions.includes(s)) {
        suggestions.push(s);
      }
    });
  }

  return suggestions.slice(0, 4);
}

async function searchProperties(query: string): Promise<PropertyDocument[]> {
  try {
    const lowerQuery = query.toLowerCase();

    const bhkMatch = lowerQuery.match(/(\d+)\s*(bhk|bedroom|bed)/);
    const bhk = bhkMatch ? parseInt(bhkMatch[1]) : null;

    let minPrice: number | null = null;
    let maxPrice: number | null = null;

    const underMatch = lowerQuery.match(/under|below|less than|up to\s*(\d+)\s*(lakh|l|cr|crore)/);
    if (underMatch) {
      const amount = parseFloat(underMatch[1]);
      const unit = underMatch[2];
      maxPrice = unit.startsWith("cr") ? amount * 10000000 : amount * 100000;
    }

    const rangeMatch = lowerQuery.match(/(\d+)\s*-\s*(\d+)\s*(lakh|l|cr|crore)/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      const unit = rangeMatch[3];
      minPrice = unit.startsWith("cr") ? min * 10000000 : min * 100000;
      maxPrice = unit.startsWith("cr") ? max * 10000000 : max * 100000;
    }

    const cityMatch = lowerQuery.match(/in\s+(\w+)|(\w+)\s+city|near\s+(\w+)/);
    const city = cityMatch ? cityMatch[1] || cityMatch[2] || cityMatch[3] : null;

    const searchQuery: Record<string, unknown> = {};

    if (bhk) searchQuery.bhk = bhk;

    if (minPrice || maxPrice) {
      const priceQuery: Record<string, number> = {};
      if (minPrice) priceQuery.$gte = minPrice;
      if (maxPrice) priceQuery.$lte = maxPrice;
      searchQuery.price = priceQuery;
    }

    if (city) searchQuery.city = new RegExp(city, "i");

    if (Object.keys(searchQuery).length === 0) {
      if (
        lowerQuery.includes("property") ||
        lowerQuery.includes("properties") ||
        lowerQuery.includes("house") ||
        lowerQuery.includes("flat") ||
        lowerQuery.includes("apartment") ||
        lowerQuery.includes("show") ||
        lowerQuery.includes("available") ||
        lowerQuery.includes("latest") ||
        lowerQuery.includes("new")
      ) {
        return await Property.find().sort({ createdAt: -1 }).limit(5);
      }
      return [];
    }

    return await Property.find(searchQuery).sort({ createdAt: -1 }).limit(5);
  } catch (error) {
    console.error("Property search error:", error);
    return [];
  }
}

async function getAlternativeSuggestions(query: string): Promise<PropertyDocument[]> {
  try {
    const lowerQuery = query.toLowerCase();

    const bhkMatch = lowerQuery.match(/(\d+)\s*(bhk|bedroom|bed)/);
    const bhk = bhkMatch ? parseInt(bhkMatch[1]) : null;

    const underMatch = lowerQuery.match(/under|below|less than|up to\s*(\d+)\s*(lakh|l|cr|crore)/);
    let maxPrice: number | null = null;
    if (underMatch) {
      const amount = parseFloat(underMatch[1]);
      const unit = underMatch[2];
      maxPrice = unit.startsWith("cr") ? amount * 10000000 : amount * 100000;
    }

    const cityMatch = lowerQuery.match(/in\s+(\w+)|(\w+)\s+city|near\s+(\w+)/);
    const city = cityMatch ? cityMatch[1] || cityMatch[2] || cityMatch[3] : null;

    if (maxPrice && bhk) {
      const relaxedMaxPrice = maxPrice * 1.2;
      const alternatives = await Property.find({
        bhk,
        price: { $lte: relaxedMaxPrice },
        ...(city && { city: new RegExp(city, "i") }),
      })
        .sort({ price: 1 })
        .limit(3);
      if (alternatives.length > 0) return alternatives;
    }

    if (bhk && maxPrice) {
      const alternatives = await Property.find({
        bhk: { $in: [bhk - 1, bhk + 1] },
        price: { $lte: maxPrice },
        ...(city && { city: new RegExp(city, "i") }),
      })
        .sort({ bhk: 1, price: 1 })
        .limit(3);
      if (alternatives.length > 0) return alternatives;
    }

    if (bhk && city) {
      const alternatives = await Property.find({ bhk, city: new RegExp(city, "i") })
        .sort({ price: 1 })
        .limit(3);
      if (alternatives.length > 0) return alternatives;
    }

    if (maxPrice) {
      const alternatives = await Property.find({ price: { $lte: maxPrice * 1.3 } })
        .sort({ price: 1 })
        .limit(3);
      if (alternatives.length > 0) return alternatives;
    }

    return await Property.find().sort({ createdAt: -1 }).limit(3);
  } catch (error) {
    console.error("Alternative suggestions error:", error);
    return [];
  }
}

async function generateAIResponse(
  userMessage: string,
  properties: PropertyDocument[],
  alternatives: PropertyDocument[],
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not found - using enhanced fallback");
      return generateFallbackResponse(userMessage, properties, alternatives);
    }

    let searchStatus = "";
    if (properties.length > 0) {
      searchStatus = "EXACT_MATCH";
    } else if (alternatives.length > 0) {
      searchStatus = "NO_EXACT_MATCH_BUT_ALTERNATIVES";
    } else {
      searchStatus = "NO_RESULTS";
    }

    const messages: { role: string; content: string }[] = [
      {
        role: "system",
        content: `You are an intelligent property assistant for Brothers Real Estate real estate website. Your role is to:

1. Answer user questions naturally and conversationally
2. Help users find properties based on their specific requirements
3. Provide detailed information about properties, pricing, locations, and amenities
4. When no exact match found, politely inform user and suggest alternatives
5. Be friendly, helpful, and always respond directly to what the user asks

Company Information:
- Name: Brothers Real Estate
- Phone: +91 000000
- Email: info@brothersrealestate.com
- Location: 1st floor alt.f MPD Tower, Sector 43, Gurugram, Haryana 122009
- Specialization: Premium residential properties

SEARCH STATUS: ${searchStatus}

${
  searchStatus === "EXACT_MATCH" && properties.length > 0
    ? `
PERFECT MATCHES FOUND:
${properties
  .map(
    (p, i) => `
${i + 1}. ${p.title}
   Price: Rs.${p.price.toLocaleString()}
   Config: ${p.bhk} BHK, ${p.bathrooms} Bathrooms
   Location: ${p.city}, ${p.address}
   Area: ${p.area || "Not specified"}
   Amenities: ${p.amenities.join(", ") || "Basic amenities"}
`
  )
  .join("\n")}

Present these properties enthusiastically! These are exactly what the user is looking for!
`
    : ""
}

${
  searchStatus === "NO_EXACT_MATCH_BUT_ALTERNATIVES" && alternatives.length > 0
    ? `
NO EXACT MATCHES for the user's specific requirements.

However, we have ALTERNATIVE SUGGESTIONS:
${alternatives
  .map(
    (p, i) => `
${i + 1}. ${p.title}
   Price: Rs.${p.price.toLocaleString()}
   Config: ${p.bhk} BHK, ${p.bathrooms} Bathrooms
   Location: ${p.city}, ${p.address}
   Area: ${p.area || "Not specified"}
   Amenities: ${p.amenities.join(", ") || "Basic amenities"}
`
  )
  .join("\n")}

IMPORTANT:
- First apologize that we don't have exact matches for their requirements
- Explain what's different (price, BHK, location)
- Present these alternatives as "close matches" or "similar options"
- Be encouraging: "You might also like..." or "Here are some great alternatives..."
- Ask if they'd like to adjust their budget/requirements
`
    : ""
}

${
  searchStatus === "NO_RESULTS"
    ? `
NO PROPERTIES FOUND matching the user's query AND no suitable alternatives.

IMPORTANT:
- Politely apologize: "I'm sorry, we don't currently have properties matching your exact requirements."
- Suggest: Call +91 000000 to discuss requirements
- Offer to notify them when matching properties become available
- Suggest they try: Different budget range, different BHK, different location
- Offer to show them our latest properties
- Be empathetic and helpful
`
    : ""
}

CONVERSATION STYLE:
- Be warm, friendly, and empathetic
- Answer questions directly and naturally
- Use emojis occasionally: 🏠 🔑 💰 📍 ✨ 😊
- When no match: be apologetic but helpful
- Always end with a helpful follow-up question or offer
- Keep responses concise but informative (2-4 sentences for most answers)
- For contact queries, provide: Phone: +91 000000, Email: info@brothersrealestate.com`,
      },
    ];

    conversationHistory
      .filter((msg) => msg.type !== "system")
      .slice(-6)
      .forEach((msg) => {
        messages.push({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.text || "",
        });
      });

    messages.push({ role: "user", content: userMessage });

    console.log("Calling OpenAI API...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        max_tokens: 800,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      return generateFallbackResponse(userMessage, properties, alternatives);
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log("OpenAI response received");
      return data.choices[0].message.content;
    }

    console.error("Unexpected OpenAI response format:", data);
    return generateFallbackResponse(userMessage, properties, alternatives);
  } catch (error) {
    console.error("AI generation error:", (error as Error).message);
    return generateFallbackResponse(userMessage, properties, alternatives);
  }
}

function generateFallbackResponse(
  message: string,
  properties: PropertyDocument[],
  alternatives: PropertyDocument[]
): string {
  const lowerMessage = message.toLowerCase();

  if (properties.length > 0) {
    const p = properties[0];
    return `Great news! I found ${properties.length} ${
      properties.length === 1 ? "property" : "properties"
    } that match your requirements! 🎉\n\n📍 Top match: "${p.title}"\n💰 Price: ₹${p.price.toLocaleString()}\n🏠 ${p.bhk} BHK, ${p.bathrooms} Bath\n📍 Location: ${p.city}\n\nCheck out the property cards below for full details! Would you like to know more about any of these properties? 😊`;
  }

  if (alternatives.length > 0) {
    const a = alternatives[0];
    return `I'm sorry, we don't have properties that exactly match your requirements right now. 😔\n\nHowever, I found ${
      alternatives.length
    } similar ${
      alternatives.length === 1 ? "property" : "properties"
    } you might like!\n\n📍 Closest match: "${a.title}"\n💰 ₹${a.price.toLocaleString()}\n🏠 ${a.bhk} BHK in ${a.city}\n\nWould you like to see these alternatives, or should I help you adjust your search? 🏠`;
  }

  if (
    lowerMessage.includes("contact") ||
    lowerMessage.includes("phone") ||
    lowerMessage.includes("call") ||
    lowerMessage.includes("dealer")
  ) {
    return `📞 Contact Brothers Real Estate:\n\n• Phone: +91 000000\n• Email: info@brothersrealestate.com\n• Location: 1st floor alt.f MPD Tower, Sector 43, Gurugram, Haryana 122009\n\nOur team is ready to assist you! You can also click on any property to contact the dealer directly. How else can I help you? 😊`;
  }

  if (
    lowerMessage.includes("amenities") ||
    lowerMessage.includes("features") ||
    lowerMessage.includes("facilities")
  ) {
    return `Our properties come with premium amenities:\n\n🅿️ Parking spaces\n🔒 24/7 Security\n🏋️ Gymnasium\n🏊 Swimming pool\n🌳 Landscaped gardens\n⚡ Power backup\n\nEach property has different amenities. Want to search for properties with specific features? 😊`;
  }

  if (
    lowerMessage.includes("visit") ||
    lowerMessage.includes("schedule") ||
    lowerMessage.includes("viewing") ||
    lowerMessage.includes("tour")
  ) {
    return `I'd love to help you schedule a property visit! 🏠\n\nPlease contact us:\n📱 Call: +91-956000 2261\n📧 Email: info@brothersrealestate.com\n\nOr fill out the enquiry form on our Contact page. Our team will arrange a convenient time for you! What type of property are you interested in? 😊`;
  }

  if (lowerMessage.includes("about") || lowerMessage.includes("who are you") || lowerMessage.includes("company")) {
    return `Brothers Real Estate - Your trusted real estate partner! 🏡\n\nWe specialize in:\n✅ Premium residential properties\n✅ Expert property consultation\n✅ Transparent dealings\n✅ Customer satisfaction\n\n📞 Contact: +91 000000\n📧 Email: info@brothersrealestate.com\n\nHow can I help you find your dream home today? 😊`;
  }

  if (lowerMessage.includes("process") || lowerMessage.includes("how to buy") || lowerMessage.includes("procedure")) {
    return `Our property buying process:\n\n1️⃣ Browse & shortlist properties\n2️⃣ Contact our dealer\n3️⃣ Schedule property visit\n4️⃣ Document verification\n5️⃣ Finalize the deal\n\nOur expert team guides you through each step! 📞 Call +91 000000 for personalized assistance. What type of property interests you? 😊`;
  }

  if (
    lowerMessage.includes("bhk") ||
    lowerMessage.includes("lakh") ||
    lowerMessage.includes("crore") ||
    lowerMessage.includes("property") ||
    lowerMessage.includes("flat")
  ) {
    return `I apologize, but we don't currently have properties matching your specific requirements. 😔\n\nLet me help you find alternatives:\n• Adjust your budget range? 💰\n• Try different BHK? 🏠\n• Explore other locations? 📍\n• See our latest properties?\n\n📞 Call us at +91 000000 and we'll find the perfect match for you! What would you prefer? 😊`;
  }

  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey") ||
    lowerMessage === "hi"
  ) {
    return "Hello! 👋 Welcome to Brothers Real Estate! I'm here to help you find your dream property. What are you looking for today? 🏠";
  }

  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
    return "You're very welcome! 😊 If you have any more questions about properties, feel free to ask. Happy house hunting! 🏠✨";
  }

  return `I'm here to help you find your perfect property! 🏠\n\nYou can ask me:\n• "Show me 2 BHK under 50 lakh"\n• "Properties in Mumbai"\n• "What amenities are available?"\n• "Contact information"\n• "Schedule a property visit"\n\n📞 Or call us: +91 000000\n\nWhat can I help you with? 😊`;
}

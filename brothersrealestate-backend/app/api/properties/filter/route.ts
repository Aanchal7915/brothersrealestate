import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { errorResponse } from "@/lib/errorResponse";
import Property from "@/models/Property";
// Imported so its schema is registered before `.populate(...)` runs —
// Mongoose only knows a ref model once something imports it.
import "@/models/Category";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/properties/filter — public
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const sp = request.nextUrl.searchParams;
    const city = sp.get("city");
    const minPrice = sp.get("minPrice");
    const maxPrice = sp.get("maxPrice");
    const bhk = sp.get("bhk");
    const sort = sp.get("sort");
    const rentalCategory = sp.get("rentalCategory");
    const page = parseInt(sp.get("page") || "1");
    const limit = parseInt(sp.get("limit") || "10");
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (city) query.city = { $regex: city, $options: "i" };
    if (minPrice || maxPrice) {
      const priceQuery: Record<string, number> = {};
      if (minPrice) priceQuery.$gte = parseFloat(minPrice);
      if (maxPrice) priceQuery.$lte = parseFloat(maxPrice);
      query.price = priceQuery;
    }
    if (bhk) query.bhk = parseInt(bhk);
    // NEW (plan Section 2) — rentalCategory filter support
    if (rentalCategory) query.rentalCategory = rentalCategory;

    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price_asc") sortQuery = { price: 1 };
    else if (sort === "price_desc") sortQuery = { price: -1 };
    else if (sort === "bhk_asc") sortQuery = { bhk: 1 };
    else if (sort === "bhk_desc") sortQuery = { bhk: -1 };

    const properties = await Property.find(query)
      .populate("rentalCategory", "_id name slug")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Property.countDocuments(query);

    return NextResponse.json({
      success: true,
      count: properties.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: properties,
    });
  } catch (error) {
    console.error("filterProperties ERROR:", error);
    return errorResponse(error);
  }
}

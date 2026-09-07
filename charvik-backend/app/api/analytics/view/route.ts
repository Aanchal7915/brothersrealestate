import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getClientIp } from "@/lib/auth";
import Analytics from "@/models/Analytics";
import Property from "@/models/Property";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/analytics/view — public
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { propertyId, sessionId } = await request.json();

    if (!propertyId) {
      return NextResponse.json(
        { success: false, message: "Property ID is required" },
        { status: 400 }
      );
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 });
    }

    const ip = getClientIp(request);
    const analytics = await Analytics.create({
      propertyId,
      eventType: "view",
      city: property.city,
      price: property.price,
      bhk: property.bhk,
      sessionId: sessionId || ip,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, data: analytics }, { status: 201 });
  } catch (error) {
    console.error("trackView ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to track view", error: (error as Error).message },
      { status: 500 }
    );
  }
}

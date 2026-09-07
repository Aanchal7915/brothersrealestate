import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getClientIp } from "@/lib/auth";
import Analytics from "@/models/Analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/analytics/filter — public
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { city, priceRange, bhk, sessionId } = await request.json();

    const ip = getClientIp(request);
    const analytics = await Analytics.create({
      propertyId: null,
      eventType: "filter",
      city: city || null,
      price: priceRange?.max || null,
      bhk: bhk || null,
      sessionId: sessionId || ip,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, data: analytics }, { status: 201 });
  } catch (error) {
    console.error("trackFilter ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to track filter", error: (error as Error).message },
      { status: 500 }
    );
  }
}

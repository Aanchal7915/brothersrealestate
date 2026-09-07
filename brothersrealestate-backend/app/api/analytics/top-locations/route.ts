import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import Analytics from "@/models/Analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/analytics/top-locations — protect
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

    const topLocations = await Analytics.aggregate([
      // See analytics/summary/route.ts for why this is `$ne: ""` only —
      // preserves the original (buggy) duplicate-key runtime behavior.
      { $match: { city: { $ne: "" } } },
      {
        $group: {
          _id: "$city",
          views: { $sum: { $cond: [{ $eq: ["$eventType", "view"] }, 1, 0] } },
          clicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } },
          totalEvents: { $sum: 1 },
        },
      },
      { $sort: { totalEvents: -1 } },
      { $limit: limit },
    ]);

    return NextResponse.json({ success: true, count: topLocations.length, data: topLocations });
  } catch (error) {
    return errorResponse(error);
  }
}

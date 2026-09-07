import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import Analytics from "@/models/Analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/analytics/summary — protect
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const totalViews = await Analytics.countDocuments({ eventType: "view" });
    const totalClicks = await Analytics.countDocuments({ eventType: "click" });

    const topCity = await Analytics.aggregate([
      // NOTE: the original Express controller had duplicate `$ne` keys in
      // this object literal (`{ $ne: null, $ne: '' }`); JS object literals
      // silently keep only the last duplicate key, so the actual runtime
      // behavior only ever excluded empty strings, never null. Preserved
      // here for behavioral parity (TS disallows the duplicate-key literal).
      { $match: { city: { $ne: "" } } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    // topPriceRange is computed but unused in the original response payload
    // (matches enquiryController.js's getSummary exactly — kept for parity).
    await Analytics.aggregate([
      { $match: { price: { $ne: null } } },
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 5000000, 10000000, 20000000, 50000000, Infinity],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalViews,
        totalClicks,
        topCity: topCity[0]?._id || "N/A",
        topCityCount: topCity[0]?.count || 0,
        engagementRate: totalClicks > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

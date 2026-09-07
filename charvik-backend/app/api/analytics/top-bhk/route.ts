import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import Analytics from "@/models/Analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/analytics/top-bhk — protect
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const bhkAnalytics = await Analytics.aggregate([
      { $match: { bhk: { $ne: null }, eventType: { $in: ["view", "click"] } } },
      { $group: { _id: "$bhk", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: bhkAnalytics.map((item) => ({ bhk: item._id, count: item.count })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

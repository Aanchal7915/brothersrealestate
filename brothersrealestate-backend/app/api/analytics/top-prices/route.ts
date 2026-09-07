import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import Analytics from "@/models/Analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRICE_RANGES = [
  { label: "Under 50L", min: 0, max: 5000000 },
  { label: "50L - 1Cr", min: 5000000, max: 10000000 },
  { label: "1Cr - 2Cr", min: 10000000, max: 20000000 },
  { label: "2Cr - 5Cr", min: 20000000, max: 50000000 },
  { label: "Above 5Cr", min: 50000000, max: Infinity },
];

// GET /api/analytics/top-prices — protect
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const analytics = await Promise.all(
      PRICE_RANGES.map(async (range) => {
        const count = await Analytics.countDocuments({
          price: { $gte: range.min, $lt: range.max },
          eventType: { $in: ["view", "click"] },
        });
        return { range: range.label, count };
      })
    );

    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    return errorResponse(error);
  }
}

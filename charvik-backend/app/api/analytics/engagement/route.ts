import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import Analytics from "@/models/Analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/analytics/engagement — protect
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const engagement = await Analytics.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            eventType: "$eventType",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const formattedData: Record<string, { date: string; views: number; clicks: number }> = {};
    for (const item of engagement) {
      const date = item._id.date as string;
      if (!formattedData[date]) {
        formattedData[date] = { date, views: 0, clicks: 0 };
      }
      const key = `${item._id.eventType}s` as "views" | "clicks";
      if (key === "views" || key === "clicks") {
        formattedData[date][key] = item.count;
      }
    }

    return NextResponse.json({ success: true, data: Object.values(formattedData) });
  } catch (error) {
    return errorResponse(error);
  }
}

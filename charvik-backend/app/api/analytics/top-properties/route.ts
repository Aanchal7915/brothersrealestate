import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import Analytics from "@/models/Analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/analytics/top-properties — protect
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const eventType = request.nextUrl.searchParams.get("eventType") || "view";
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

    const topProperties = await Analytics.aggregate([
      { $match: { eventType, propertyId: { $ne: null } } },
      { $group: { _id: "$propertyId", count: { $sum: 1 }, lastActivity: { $max: "$timestamp" } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $lookup: { from: "properties", localField: "_id", foreignField: "_id", as: "property" } },
      { $unwind: "$property" },
      {
        $project: {
          propertyId: "$_id",
          title: "$property.title",
          city: "$property.city",
          price: "$property.price",
          bhk: "$property.bhk",
          image: { $arrayElemAt: ["$property.images.url", 0] },
          count: 1,
          lastActivity: 1,
        },
      },
    ]);

    return NextResponse.json({ success: true, count: topProperties.length, data: topProperties });
  } catch (error) {
    return errorResponse(error);
  }
}

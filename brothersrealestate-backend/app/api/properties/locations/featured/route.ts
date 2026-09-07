import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Property from "@/models/Property";

export const runtime = "nodejs";
// Hits live Mongo data — must not be statically cached at build time.
export const dynamic = "force-dynamic";

// GET /api/properties/locations/featured — public
export async function GET() {
  try {
    await connectDB();

    const manual = await Property.aggregate([
      { $match: { status: "active", "featuredLocation.title": { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$featuredLocation.title",
          count: { $sum: 1 },
          sampleImage: { $first: "$featuredLocation.image.url" },
        },
      },
      { $sort: { count: -1 } },
      { $project: { _id: 0, title: "$_id", count: 1, image: "$sampleImage" } },
    ]);

    return NextResponse.json({ success: true, data: { manual, cities: [] } });
  } catch (error) {
    console.error("Error fetching featured locations:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching featured locations" },
      { status: 500 }
    );
  }
}

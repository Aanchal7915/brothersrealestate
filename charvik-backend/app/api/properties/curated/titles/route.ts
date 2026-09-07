import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Property from "@/models/Property";

export const runtime = "nodejs";
// Hits live Mongo data — must not be statically cached at build time.
export const dynamic = "force-dynamic";

// GET /api/properties/curated/titles — public
export async function GET() {
  try {
    await connectDB();

    const manual = await Property.aggregate([
      { $match: { status: "active", "curatedProperty.title": { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$curatedProperty.title",
          count: { $sum: 1 },
          sampleImage: { $first: "$curatedProperty.image.url" },
        },
      },
      { $sort: { count: -1 } },
      { $project: { _id: 0, title: "$_id", count: 1, image: "$sampleImage" } },
    ]);

    return NextResponse.json({ success: true, data: manual });
  } catch (error) {
    console.error("Error fetching curated titles:", error);
    return NextResponse.json(
      { success: false, error: "Server Error fetching curated titles" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { errorResponse } from "@/lib/errorResponse";
import Property from "@/models/Property";

export const runtime = "nodejs";
// Hits live Mongo data — must not be statically cached at build time.
export const dynamic = "force-dynamic";

const COLLECTION_KEYS = [
  {
    key: "new-projects",
    title: "New Projects",
    defaultImage: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200",
  },
  {
    key: "ready-to-move",
    title: "Ready to Move",
    defaultImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
  },
  {
    key: "luxury",
    title: "Luxury Homes",
    defaultImage: "https://images.unsplash.com/photo-1512914890250-353c97c9e7e2?w=1200",
  },
  {
    key: "budget-friendly",
    title: "Budget Friendly",
    defaultImage: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200",
  },
];

// GET /api/properties/collections/curated — public
export async function GET() {
  try {
    await connectDB();
    const curatedCollections = [];

    for (const col of COLLECTION_KEYS) {
      const count = await Property.countDocuments({ collections: col.key, status: "active" });
      const sample = await Property.findOne({
        collections: col.key,
        status: "active",
        "images.0": { $exists: true },
      }).select("images");
      curatedCollections.push({
        title: col.title,
        count: `${count} Properties`,
        image: sample?.images?.[0]?.url || col.defaultImage,
        key: col.key,
        properties: count,
      });
    }

    return NextResponse.json({ success: true, data: curatedCollections });
  } catch (error) {
    console.error("getCuratedCollections ERROR:", error);
    return errorResponse(error);
  }
}

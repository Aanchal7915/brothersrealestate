import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { errorResponse } from "@/lib/errorResponse";
import Property from "@/models/Property";

export const runtime = "nodejs";
// Hits live Mongo data — must not be statically cached at build time.
export const dynamic = "force-dynamic";

// GET /api/properties/cities — public
export async function GET() {
  try {
    await connectDB();
    const cities = await Property.distinct("city");
    return NextResponse.json({ success: true, count: cities.length, data: cities.sort() });
  } catch (error) {
    console.error("getCities ERROR:", error);
    return errorResponse(error);
  }
}

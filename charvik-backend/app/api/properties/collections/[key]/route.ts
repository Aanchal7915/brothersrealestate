import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { errorResponse } from "@/lib/errorResponse";
import Property from "@/models/Property";
// Imported so its schema is registered before `.populate(...)` runs —
// Mongoose only knows a ref model once something imports it.
import "@/models/Category";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCEPTED_KEYS = ["new-projects", "ready-to-move", "luxury", "budget-friendly"];

// GET /api/properties/collections/:key — public
export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    await connectDB();
    const sp = request.nextUrl.searchParams;
    const page = parseInt(sp.get("page") || "1");
    const limit = parseInt(sp.get("limit") || "20");
    const skip = (page - 1) * limit;

    const keyNormalized = (params.key || "").toLowerCase().trim();

    if (!ACCEPTED_KEYS.includes(keyNormalized)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unknown collection key: ${params.key}. Valid keys: ${ACCEPTED_KEYS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const query = { collections: keyNormalized, status: "active" };

    const properties = await Property.find(query)
      .populate("rentalCategory", "_id name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Property.countDocuments(query);

    return NextResponse.json({
      success: true,
      count: properties.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: properties,
    });
  } catch (error) {
    console.error("getPropertiesByCollectionKey ERROR:", error);
    return errorResponse(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import Property from "@/models/Property";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUT /api/properties/:id/toggle-featured — protect
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 });
    }

    const newFeaturedStatus = !property.featured;

    const updatedProperty = await Property.findByIdAndUpdate(
      params.id,
      { $set: { featured: newFeaturedStatus } },
      { new: true }
    );

    return NextResponse.json({
      message: "Property featured status toggled successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(error);
  }
}

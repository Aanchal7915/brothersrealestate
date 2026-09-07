import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import { deleteFile } from "@/lib/cloudinary";
import Property from "@/models/Property";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE /api/properties/:id/images/:imageIndex — protect
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageIndex: string } }
) {
  try {
    await requireAdmin(request);
    await connectDB();

    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 });
    }

    const imageIndex = parseInt(params.imageIndex);
    if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= property.images.length) {
      return NextResponse.json({ success: false, message: "Invalid image index" }, { status: 400 });
    }

    const image = property.images[imageIndex];
    if (image.publicId) {
      await deleteFile(image.publicId, "image");
    }

    property.images.splice(imageIndex, 1);
    await property.save();

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
      data: property,
    });
  } catch (error) {
    console.error("deletePropertyImage ERROR:", error);
    return errorResponse(error);
  }
}

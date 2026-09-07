import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import { extractSingleFile } from "@/lib/upload";
import { uploadImageFromBuffer, deleteFile } from "@/lib/cloudinary";
import Developer from "@/models/Developer";
import Property from "@/models/Property";
import FeaturedProject from "@/models/FeaturedProject";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUT /api/developers/:id — protect.
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const developer = await Developer.findById(params.id);
    if (!developer) {
      throw new HttpError(404, "Developer not found");
    }

    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const bio = formData.get("bio") as string | null;
    const website = formData.get("website") as string | null;
    const status = formData.get("status") as string | null;
    const order = formData.get("order");
    const removeLogo = formData.get("removeLogo") as string | null;

    if (name !== null) {
      if (!name.trim()) {
        throw new HttpError(400, "Please provide a non-empty developer name");
      }
      const existing = await Developer.findOne({ name: name.trim(), _id: { $ne: developer._id } });
      if (existing) {
        throw new HttpError(400, "A developer with this name already exists");
      }
      developer.name = name.trim();
    }

    if (bio !== null) developer.bio = bio;
    if (website !== null) developer.website = website;
    if (status === "active" || status === "inactive") developer.status = status;
    if (order !== null && Number.isFinite(Number(order))) developer.order = Number(order);

    if (removeLogo === "true") {
      if (developer.logo?.publicId) await deleteFile(developer.logo.publicId, "image");
      developer.logo = undefined;
    } else {
      const logoFile = await extractSingleFile(formData, "developerLogo");
      if (logoFile) {
        if (developer.logo?.publicId) await deleteFile(developer.logo.publicId, "image");
        developer.logo = await uploadImageFromBuffer(logoFile.buffer, "developers/logos");
      }
    }

    await developer.save();

    return NextResponse.json({
      success: true,
      message: "Developer updated successfully",
      data: developer,
    });
  } catch (error) {
    console.error("updateDeveloper ERROR:", error);
    return errorResponse(error);
  }
}

// DELETE /api/developers/:id — protect. Unlinks (never deletes) any
// Property/FeaturedProject records pointing at this developer, same
// unassign-not-cascade-delete approach as Category.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const developer = await Developer.findById(params.id);
    if (!developer) {
      throw new HttpError(404, "Developer not found");
    }

    const [propResult, featuredResult] = await Promise.all([
      Property.updateMany({ developer: developer._id }, { $set: { developer: null } }),
      FeaturedProject.updateMany({ developer: developer._id }, { $set: { developer: null } }),
    ]);

    if (developer.logo?.publicId) {
      await deleteFile(developer.logo.publicId, "image").catch((e) =>
        console.error("Cloudinary cleanup failed:", e)
      );
    }

    await developer.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Developer deleted successfully",
      unassignedCount: (propResult.modifiedCount || 0) + (featuredResult.modifiedCount || 0),
    });
  } catch (error) {
    console.error("deleteDeveloper ERROR:", error);
    return errorResponse(error);
  }
}

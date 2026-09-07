import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import { extractSingleFile } from "@/lib/upload";
import { uploadImageFromBuffer, deleteFile, deleteMultipleFiles } from "@/lib/cloudinary";
import Category from "@/models/Category";
import Property from "@/models/Property";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUT /api/categories/:id — protect. Edit name/description. No cascade
// needed — properties reference the category by id, so renaming is free.
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const category = await Category.findById(params.id);
    if (!category) {
      throw new HttpError(404, "Category not found");
    }

    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const order = formData.get("order");
    if (order !== null && Number.isFinite(Number(order))) {
      category.order = Number(order);
    }
    const removeImage = formData.get("removeImage") as string | null;

    if (name !== null) {
      if (!name.trim()) {
        throw new HttpError(400, "Please provide a non-empty category name");
      }
      const existing = await Category.findOne({ name: name.trim(), _id: { $ne: category._id } });
      if (existing) {
        throw new HttpError(400, "A category with this name already exists");
      }
      category.name = name.trim();
    }

    if (description !== null) {
      category.description = description;
    }

    if (removeImage === "true") {
      if (category.image?.publicId) {
        await deleteFile(category.image.publicId, "image");
      }
      category.image = undefined;
    } else {
      const imageFile = await extractSingleFile(formData, "categoryImage");
      if (imageFile) {
        if (category.image?.publicId) {
          await deleteFile(category.image.publicId, "image");
        }
        category.image = await uploadImageFromBuffer(imageFile.buffer, "categories/images");
      }
    }

    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("updateCategory ERROR:", error);
    return errorResponse(error);
  }
}

// DELETE /api/categories/:id — protect. Cascades by unsetting
// rentalCategory on any properties referencing this category before
// deleting the Category doc; response reports how many were unassigned.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const category = await Category.findById(params.id);
    if (!category) {
      throw new HttpError(404, "Category not found");
    }

    // `deleteProperties=true` removes the rental listings with the category.
    // Without it they are only unassigned — which made deleted rentals
    // reappear in the Add Property list as ordinary listings.
    const alsoDeleteProperties =
      new URL(request.url).searchParams.get("deleteProperties") === "true";

    let unassignedCount = 0;
    let deletedCount = 0;

    if (alsoDeleteProperties) {
      const linked = await Property.find({ rentalCategory: category._id });

      const publicIds = linked
        .flatMap((p) => [
          ...(p.images || []).map((i) => i.publicId),
          ...(p.videos || []).map((v: any) => v?.publicId),
        ])
        .filter(Boolean) as string[];

      if (publicIds.length) {
        await deleteMultipleFiles(publicIds, "image").catch((e) =>
          console.error("Cloudinary cleanup failed:", e)
        );
      }

      const res = await Property.deleteMany({ rentalCategory: category._id });
      deletedCount = res.deletedCount || 0;
    } else {
      const cascadeResult = await Property.updateMany(
        { rentalCategory: category._id },
        { $set: { rentalCategory: null } }
      );
      unassignedCount = cascadeResult.modifiedCount;
    }

    await category.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
      unassignedCount,
      deletedCount,
    });
  } catch (error) {
    console.error("deleteCategory ERROR:", error);
    return errorResponse(error);
  }
}

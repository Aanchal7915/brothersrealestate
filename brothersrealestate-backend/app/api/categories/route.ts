import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import { extractSingleFile } from "@/lib/upload";
import { uploadImageFromBuffer } from "@/lib/cloudinary";
import Category from "@/models/Category";

export const runtime = "nodejs";
// Hits live Mongo data — must not be statically cached at build time.
export const dynamic = "force-dynamic";

// GET /api/categories — public. Lists all categories with a property-count
// per category via aggregation, so the admin table doesn't need N+1 lookups.
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Each admin page lists only the categories created there.
    const scope = new URL(request.url).searchParams.get("scope");

    // Categories written before `scope` existed carry no such field. The schema
    // default is "rental", so a missing scope has to read as rental — otherwise
    // those rows disappear from the Rental Property page and the home strip
    // while their properties keep showing on the public rent page.
    const scopeMatch =
      scope === "rental"
        ? { $or: [{ scope: "rental" }, { scope: { $exists: false } }, { scope: null }] }
        : { scope };

    const categories = await Category.aggregate([
      ...(scope ? [{ $match: scopeMatch }] : []),
      { $sort: { order: 1, name: 1 } },
      {
        $lookup: {
          from: "properties",
          localField: "_id",
          foreignField: "rentalCategory",
          as: "properties",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          order: 1,
          scope: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          propertyCount: { $size: "$properties" },
          // Prefer the category's own uploaded image; fall back to the
          // first active property's first image (curated-collections style)
          // for categories that predate the image field.
          image: {
            $ifNull: [
              "$image.url",
              {
                $let: {
                  vars: {
                    sample: {
                      $first: {
                        $filter: {
                          input: "$properties",
                          as: "p",
                          cond: {
                            $and: [
                              { $eq: ["$$p.status", "active"] },
                              { $gt: [{ $size: { $ifNull: ["$$p.images", []] } }, 0] },
                            ],
                          },
                        },
                      },
                    },
                  },
                  in: { $arrayElemAt: ["$$sample.images.url", 0] },
                },
              },
            ],
          },
        },
      },
    ]);

    return NextResponse.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    console.error("getCategories ERROR:", error);
    return errorResponse(error);
  }
}

// POST /api/categories — protect. Accepts multipart form data so an image
// can be attached (name/description-only JSON bodies are no longer used).
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;

    if (!name || !name.trim()) {
      throw new HttpError(400, "Please provide a category name");
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      throw new HttpError(400, "A category with this name already exists");
    }

    let image: { url: string; publicId: string } | undefined;
    const imageFile = await extractSingleFile(formData, "categoryImage");
    if (imageFile) {
      image = await uploadImageFromBuffer(imageFile.buffer, "categories/images");
    }

    const scopeIn = formData.get("scope") as string | null;
    const category = await Category.create({
      name: name.trim(),
      scope: scopeIn === "property" ? "property" : "rental",
      description: description || undefined,
      image,
    });

    return NextResponse.json(
      { success: true, message: "Category created successfully", data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("createCategory ERROR:", error);
    return errorResponse(error);
  }
}

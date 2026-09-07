import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import { extractFiles, extractSingleFile } from "@/lib/upload";
import { uploadImageFromBuffer, uploadVideoFromBuffer } from "@/lib/cloudinary";
import Property from "@/models/Property";
// Imported so their schemas are registered before `.populate(...)` runs —
// Mongoose only knows a ref model once something imports it.
import "@/models/Category";
import "@/models/Developer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/properties — public, paginated list
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const sp = request.nextUrl.searchParams;
    const page = parseInt(sp.get("page") || "1");
    const limit = parseInt(sp.get("limit") || "10");
    const skip = (page - 1) * limit;
    const rentalCategory = sp.get("rentalCategory");

    const query: Record<string, unknown> = {};
    if (rentalCategory) query.rentalCategory = rentalCategory;

    const properties = await Property.find(query)
      .populate("rentalCategory", "_id name slug")
      .populate("category", "_id name slug")
      .populate("developer", "_id name slug logo")
      .sort({ displayOrder: 1, createdAt: -1 })
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
    console.error("getAllProperties ERROR:", error);
    return errorResponse(error);
  }
}

function parseAmenities(amenities: unknown): string[] {
  if (!amenities) return [];
  if (typeof amenities === "string") {
    try {
      const parsed = JSON.parse(amenities);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }
  }
  if (Array.isArray(amenities)) return amenities as string[];
  return [];
}

type ConnectivityKind = "school" | "hospital" | "metro" | "highway" | "landmark";
const CONNECTIVITY_KINDS: ConnectivityKind[] = ["school", "hospital", "metro", "highway", "landmark"];

function parseConnectivity(raw: unknown): { kind: ConnectivityKind; label: string }[] {
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e) =>
          e &&
          CONNECTIVITY_KINDS.includes(e.kind) &&
          typeof e.label === "string" &&
          e.label.trim()
      )
      .map((e) => ({ kind: e.kind as ConnectivityKind, label: e.label.trim() }));
  } catch {
    return [];
  }
}

// POST /api/properties — protect
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const formData = await request.formData();

    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") as string | null;
    const bhk = formData.get("bhk") as string | null;
    const configuration = formData.get("configuration") as string | null;
    const highlights = formData.get("highlights") as string | null;
    const reraNumber = formData.get("reraNumber") as string | null;
    const propertyType = formData.get("propertyType") as string | null;
    const possession = formData.get("possession") as string | null;
    const bathrooms = formData.get("bathrooms") as string | null;
    const city = formData.get("city") as string | null;
    const address = formData.get("address") as string | null;
    const area = formData.get("area") as string | null;
    const amenities = formData.get("amenities") as string | null;
    const status = formData.get("status") as string | null;
    const featuredLocationTitle = formData.get("featuredLocationTitle") as string | null;
    const curatedPropertyTitle = formData.get("curatedPropertyTitle") as string | null;
    const builderName = formData.get("builderName") as string | null;
    const builderDetails = formData.get("builderDetails") as string | null;
    const ownerName = formData.get("ownerName") as string | null;
    const ownerDetails = formData.get("ownerDetails") as string | null;
    // NEW (plan Section 2) — plain rentalCategory field from form data
    const rentalCategory = (formData.get("rentalCategory") as string | null) || null;
    const category = (formData.get("category") as string | null) || null;
    const developer = (formData.get("developer") as string | null) || null;
    const connectivity = parseConnectivity(formData.get("connectivity"));

    if (!title || !price || !city || !bhk || !bathrooms) {
      return NextResponse.json(
        { success: false, message: "Please fill all required fields" },
        { status: 400 }
      );
    }

    const amenitiesArray = parseAmenities(amenities);

    // Upload images
    const imageFiles = await extractFiles(formData, "images");
    if (imageFiles.length > 15) {
      return NextResponse.json(
        { success: false, message: "Maximum 15 images allowed" },
        { status: 400 }
      );
    }
    const uploadedImages = await Promise.all(
      imageFiles.map((f) => uploadImageFromBuffer(f.buffer))
    );

    // Upload videos (support `videos` field, fall back to legacy `video`)
    let videoFiles = await extractFiles(formData, "videos");
    if (videoFiles.length === 0) {
      videoFiles = await extractFiles(formData, "video");
    }
    if (videoFiles.length > 2) {
      return NextResponse.json(
        { success: false, message: "Maximum 2 videos allowed" },
        { status: 400 }
      );
    }
    const uploadedVideos = await Promise.all(
      videoFiles.map((f) => uploadVideoFromBuffer(f.buffer))
    );

    // Featured location — reuse existing image for a known title, else require upload
    let featuredLocation: { title: string; image: { url: string; publicId: string } } | undefined;
    if (featuredLocationTitle) {
      const featuredImageFile = await extractSingleFile(formData, "featuredLocationImage");
      if (!featuredImageFile) {
        const existing = await Property.findOne({
          "featuredLocation.title": featuredLocationTitle,
          "featuredLocation.image.url": { $exists: true },
        }).select("featuredLocation.image");
        if (existing?.featuredLocation?.image?.url) {
          featuredLocation = {
            title: featuredLocationTitle,
            image: {
              url: existing.featuredLocation.image.url,
              publicId: existing.featuredLocation.image.publicId || "",
            },
          };
        } else {
          return NextResponse.json(
            { success: false, message: "Featured location requires an image for a new title" },
            { status: 400 }
          );
        }
      } else {
        const uploaded = await uploadImageFromBuffer(featuredImageFile.buffer);
        featuredLocation = { title: featuredLocationTitle, image: uploaded };
      }
    }

    // Curated property — same reuse-or-upload pattern
    let curatedProperty: { title: string; image: { url: string; publicId: string } } | undefined;
    if (curatedPropertyTitle) {
      const curatedImageFile = await extractSingleFile(formData, "curatedPropertyImage");
      if (!curatedImageFile) {
        const existingCurated = await Property.findOne({
          "curatedProperty.title": curatedPropertyTitle,
          "curatedProperty.image.url": { $exists: true },
        }).select("curatedProperty.image");
        if (existingCurated?.curatedProperty?.image?.url) {
          curatedProperty = {
            title: curatedPropertyTitle,
            image: {
              url: existingCurated.curatedProperty.image.url,
              publicId: existingCurated.curatedProperty.image.publicId || "",
            },
          };
        } else {
          return NextResponse.json(
            { success: false, message: "Curated property requires an image for a new title" },
            { status: 400 }
          );
        }
      } else {
        const uploaded = await uploadImageFromBuffer(curatedImageFile.buffer);
        curatedProperty = { title: curatedPropertyTitle, image: uploaded };
      }
    }

    if (isNaN(parseFloat(price)) || isNaN(parseInt(bhk))) {
      return NextResponse.json(
        { success: false, message: "Price and BHK must be valid numbers" },
        { status: 400 }
      );
    }

    const property = await Property.create({
      title,
      description: description || "",
      price: parseFloat(price),
      bhk: parseInt(bhk),
      ...(configuration?.trim() ? { configuration: configuration.trim() } : {}),
      ...(highlights?.trim() ? { highlights: highlights.split("|").map((h) => h.trim()).filter(Boolean) } : {}),
      ...(reraNumber?.trim() ? { reraNumber: reraNumber.trim() } : {}),
      ...(propertyType?.trim() ? { propertyType: propertyType.trim() } : {}),
      ...(possession?.trim() ? { possession: possession.trim() } : {}),
      bathrooms: parseInt(bathrooms),
      city,
      address: address || "",
      area: area ? parseFloat(area) : undefined,
      amenities: amenitiesArray,
      images: uploadedImages,
      video: uploadedVideos[0] || null,
      videos: uploadedVideos,
      featured: false,
      featuredLocation: featuredLocation || undefined,
      curatedProperty: curatedProperty || undefined,
      status: status || "active",
      builderName: builderName || undefined,
      builderDetails: builderDetails || undefined,
      ownerName: ownerName || undefined,
      ownerDetails: ownerDetails || undefined,
      rentalCategory: rentalCategory || null,
      category: category || null,
      developer: developer || null,
      connectivity,
    });

    return NextResponse.json(
      { success: true, message: "Property created successfully", data: property },
      { status: 201 }
    );
  } catch (error) {
    console.error("createProperty ERROR:", error);
    if (error instanceof Error && (error as { statusCode?: number }).statusCode) {
      return errorResponse(error);
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create property",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import { extractFiles, extractSingleFile } from "@/lib/upload";
import {
  uploadImageFromBuffer,
  uploadVideoFromBuffer,
  deleteFile,
  deleteMultipleFiles,
} from "@/lib/cloudinary";
import Property from "@/models/Property";
// Imported so their schemas are registered before `.populate(...)` runs —
// Mongoose only knows a ref model once something imports it.
import "@/models/Category";
import "@/models/Developer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/properties/:id — public
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const property = await Property.findById(params.id)
      .populate("rentalCategory", "_id name slug")
      .populate("category", "_id name slug")
      .populate("developer", "_id name slug logo bio website");

    if (!property) {
      return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error("getPropertyById ERROR:", error);
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

// PUT /api/properties/:id — protect
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 });
    }

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
    const amenities = formData.get("amenities");
    const featured = formData.get("featured") as string | null;
    const status = formData.get("status") as string | null;
    const featuredLocationTitle = formData.get("featuredLocationTitle") as string | null;
    const curatedPropertyTitle = formData.get("curatedPropertyTitle") as string | null;
    const removeFeaturedLocation = formData.get("removeFeaturedLocation") as string | null;
    const removeCuratedProperty = formData.get("removeCuratedProperty") as string | null;
    // NEW (plan Section 2)
    const rentalCategoryRaw = formData.get("rentalCategory");
    const categoryRaw = formData.get("category");
    if (categoryRaw !== null) {
      property.category = (categoryRaw as string)
        ? (categoryRaw as unknown as typeof property.category)
        : null;
    }
    const removeRentalCategory = formData.get("removeRentalCategory") as string | null;
    const developerRaw = formData.get("developer");
    if (developerRaw !== null) {
      property.developer = (developerRaw as string)
        ? (developerRaw as unknown as typeof property.developer)
        : null;
    }
    const connectivityRaw = formData.get("connectivity");
    if (connectivityRaw !== null) {
      property.connectivity = parseConnectivity(connectivityRaw);
    }
    const builderName = formData.get("builderName") as string | null;
    const builderDetails = formData.get("builderDetails") as string | null;
    const ownerName = formData.get("ownerName") as string | null;
    const ownerDetails = formData.get("ownerDetails") as string | null;

    if (title) property.title = title;
    if (description) property.description = description;
    if (price) property.price = parseFloat(price);
    if (bhk) property.bhk = parseInt(bhk);
    if (configuration !== null) property.configuration = configuration.trim() || undefined;
    if (highlights !== null)
      property.highlights = highlights.split("|").map((h) => h.trim()).filter(Boolean);
    if (reraNumber !== null) property.reraNumber = reraNumber.trim() || undefined;
    if (propertyType) property.propertyType = propertyType.trim() as typeof property.propertyType;

    const displayOrder = formData.get("displayOrder");
    if (displayOrder !== null && Number.isFinite(Number(displayOrder))) {
      property.displayOrder = Number(displayOrder);
    }
    if (possession) property.possession = possession.trim() as typeof property.possession;
    if (bathrooms) property.bathrooms = parseInt(bathrooms);
    if (city) property.city = city;
    if (address) property.address = address;
    if (area) property.area = parseFloat(area) as unknown as string;
    if (featured !== null && featured !== undefined) {
      property.featured = featured === "true";
    }
    if (status) property.status = status as typeof property.status;

    if (removeRentalCategory === "true") {
      property.rentalCategory = null;
    } else if (rentalCategoryRaw) {
      property.rentalCategory = rentalCategoryRaw as unknown as typeof property.rentalCategory;
    }
    
    if (builderName !== null) property.builderName = builderName;
    if (builderDetails !== null) property.builderDetails = builderDetails;
    if (ownerName !== null) property.ownerName = ownerName;
    if (ownerDetails !== null) property.ownerDetails = ownerDetails;

    if (amenities !== null && amenities !== undefined) {
      property.amenities = parseAmenities(amenities);
    }

    // Handle existing images
    let remainingExistingImages = property.images;
    const existingImagesRaw = formData.get("existingImages") as string | null;
    if (existingImagesRaw) {
      try {
        const parsed = JSON.parse(existingImagesRaw);
        if (Array.isArray(parsed)) {
          remainingExistingImages = parsed.map((i: any) => ({ url: i.url, publicId: i.publicId }));
        }
      } catch (e) {
        remainingExistingImages = property.images;
      }
    }

    if (existingImagesRaw) {
      const remainingPublicIds = remainingExistingImages.map(i => i.publicId).filter(Boolean);
      const toDeleteImages = property.images
        .filter(i => i.publicId && !remainingPublicIds.includes(i.publicId!))
        .map(i => i.publicId!);
      
      if (toDeleteImages.length > 0) {
        await Promise.all(toDeleteImages.map(id => deleteFile(id, "image")));
      }
    }

    // Add new images
    let newImages: { url: string; publicId: string }[] = [];
    const newImageFiles = await extractFiles(formData, "images");
    if (newImageFiles.length > 0) {
      if (remainingExistingImages.length + newImageFiles.length > 15) {
        return NextResponse.json(
          { success: false, message: "Total images cannot exceed 15" },
          { status: 400 }
        );
      }
      newImages = await Promise.all(newImageFiles.map((f) => uploadImageFromBuffer(f.buffer)));
    }
    
    property.images = [...remainingExistingImages, ...newImages];

    // Featured location updates/removal
    if (removeFeaturedLocation === "true") {
      if (property.featuredLocation?.image?.publicId) {
        await deleteFile(property.featuredLocation.image.publicId, "image");
      }
      property.featuredLocation = undefined;
    } else if (featuredLocationTitle) {
      const featuredImageFile = await extractSingleFile(formData, "featuredLocationImage");
      if (featuredImageFile) {
        if (property.featuredLocation?.image?.publicId) {
          await deleteFile(property.featuredLocation.image.publicId, "image");
        }
        const uploaded = await uploadImageFromBuffer(featuredImageFile.buffer);
        property.featuredLocation = { title: featuredLocationTitle, image: uploaded };
      } else {
        property.featuredLocation = property.featuredLocation || {};
        property.featuredLocation.title = featuredLocationTitle;
      }
    }

    // Curated property updates/removal
    if (removeCuratedProperty === "true") {
      if (property.curatedProperty?.image?.publicId) {
        await deleteFile(property.curatedProperty.image.publicId, "image");
      }
      property.curatedProperty = undefined;
    } else if (curatedPropertyTitle) {
      const curatedImageFile = await extractSingleFile(formData, "curatedPropertyImage");
      if (curatedImageFile) {
        if (property.curatedProperty?.image?.publicId) {
          await deleteFile(property.curatedProperty.image.publicId, "image");
        }
        const uploaded = await uploadImageFromBuffer(curatedImageFile.buffer);
        property.curatedProperty = { title: curatedPropertyTitle, image: uploaded };
      } else {
        property.curatedProperty = property.curatedProperty || {};
        property.curatedProperty.title = curatedPropertyTitle;
      }
    }

    // Videos: existingVideos JSON from client + new uploads under `videos` or `video`
    let remainingExistingVideos: { url?: string; publicId?: string }[] = [];
    const existingVideosRaw = formData.get("existingVideos") as string | null;
    if (existingVideosRaw) {
      try {
        const parsed = JSON.parse(existingVideosRaw);
        remainingExistingVideos = Array.isArray(parsed)
          ? parsed.map((v: { url?: string; publicId?: string }) => ({ url: v.url, publicId: v.publicId }))
          : [];
      } catch {
        remainingExistingVideos = [];
      }
    } else if (property.videos && property.videos.length > 0) {
      remainingExistingVideos = property.videos.map((v) => ({ url: v.url, publicId: v.publicId }));
    } else if (property.video) {
      remainingExistingVideos = [{ url: property.video.url, publicId: property.video.publicId }];
    }

    let newVideoFiles = await extractFiles(formData, "videos");
    if (newVideoFiles.length === 0) {
      newVideoFiles = await extractFiles(formData, "video");
    }
    if (remainingExistingVideos.length + newVideoFiles.length > 2) {
      return NextResponse.json(
        { success: false, message: "Total videos cannot exceed 2" },
        { status: 400 }
      );
    }
    const newlyUploadedVideos = await Promise.all(
      newVideoFiles.map((f) => uploadVideoFromBuffer(f.buffer))
    );

    // Delete removed videos from Cloudinary
    const previousVideos =
      property.videos && property.videos.length
        ? property.videos
        : property.video
          ? [property.video]
          : [];
    const remainingPublicIds = remainingExistingVideos.map((v) => v.publicId).filter(Boolean);
    const toDelete = previousVideos
      .filter((v) => v.publicId && !remainingPublicIds.includes(v.publicId))
      .map((v) => v.publicId)
      .filter((id): id is string => Boolean(id));
    if (toDelete.length > 0) {
      await deleteMultipleFiles(toDelete, "video");
    }

    property.videos = [...remainingExistingVideos, ...newlyUploadedVideos];
    property.video = property.videos[0] || null;

    await property.save();
    await property.populate("rentalCategory", "_id name slug");
    await property.populate("category", "_id name slug");
    await property.populate("developer", "_id name slug logo bio website");

    return NextResponse.json({
      success: true,
      message: "Property updated successfully",
      data: property,
    });
  } catch (error) {
    console.error("updateProperty ERROR:", error);
    return errorResponse(error);
  }
}

// DELETE /api/properties/:id — protect
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 });
    }

    if (property.images?.length > 0) {
      const publicIds = property.images.map((img) => img.publicId).filter((id): id is string => Boolean(id));
      if (publicIds.length > 0) await deleteMultipleFiles(publicIds, "image");
    }

    if (property.videos && property.videos.length > 0) {
      const videoIds = property.videos.map((v) => v.publicId).filter((id): id is string => Boolean(id));
      if (videoIds.length > 0) await deleteMultipleFiles(videoIds, "video");
    } else if (property.video?.publicId) {
      await deleteFile(property.video.publicId, "video");
    }

    await property.deleteOne();

    return NextResponse.json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    console.error("deleteProperty ERROR:", error);
    return errorResponse(error);
  }
}

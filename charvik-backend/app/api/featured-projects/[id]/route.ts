import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import { extractFiles } from "@/lib/upload";
import { uploadImageFromBuffer, deleteMultipleFiles } from "@/lib/cloudinary";
import FeaturedProject from "@/models/FeaturedProject";
// Imported so its schema is registered before `.populate("developer", ...)`
// runs — Mongoose only knows a ref model once something imports it.
import "@/models/Developer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGES = 15;

function parseList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}

type ConnectivityKind = "school" | "hospital" | "metro" | "highway" | "landmark";
const CONNECTIVITY_KINDS: ConnectivityKind[] = ["school", "hospital", "metro", "highway", "landmark"];

function parseConnectivity(
  value: FormDataEntryValue | null
): { kinds: ConnectivityKind[]; label: string; mapLink?: string }[] {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e) =>
          e &&
          Array.isArray(e.kinds) &&
          e.kinds.some((k: unknown) => CONNECTIVITY_KINDS.includes(k as ConnectivityKind)) &&
          typeof e.label === "string" &&
          e.label.trim()
      )
      .map((e) => ({
        kinds: (e.kinds as unknown[]).filter((k) =>
          CONNECTIVITY_KINDS.includes(k as ConnectivityKind)
        ) as ConnectivityKind[],
        label: e.label.trim(),
        mapLink: typeof e.mapLink === "string" && e.mapLink.trim() ? e.mapLink.trim() : undefined,
      }));
  } catch {
    return [];
  }
}

/** Accepts either a Mongo id or the project's slug, so URLs can stay readable. */
async function findProject(id: string) {
  const byId = /^[0-9a-fA-F]{24}$/.test(id)
    ? await FeaturedProject.findById(id).populate("developer", "_id name slug logo bio website")
    : null;
  const project =
    byId ||
    (await FeaturedProject.findOne({ slug: id }).populate(
      "developer",
      "_id name slug logo bio website"
    ));
  if (!project) throw new HttpError(404, "Featured project not found");
  return project;
}

// GET /api/featured-projects/[id] — public.
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const project = await findProject(params.id);
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("getFeaturedProject ERROR:", error);
    return errorResponse(error);
  }
}

// PUT /api/featured-projects/[id] — protect. `existingImages` carries the URLs
// the admin kept; anything missing from it is removed from Cloudinary.
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const project = await findProject(params.id);
    const formData = await request.formData();

    const setIfPresent = (field: string, transform?: (v: string) => unknown) => {
      const raw = formData.get(field);
      if (raw === null) return;
      const value = typeof raw === "string" ? raw.trim() : raw;
      (project as any)[field] = transform ? transform(String(value)) : value || undefined;
    };

    setIfPresent("title", (v) => v);
    setIfPresent("city", (v) => v);
    setIfPresent("address", (v) => v);
    setIfPresent("description", (v) => v);
    setIfPresent("area");
    setIfPresent("configuration");
    setIfPresent("propertyType");
    setIfPresent("reraNumber");
    setIfPresent("videoUrl");

    if (formData.get("price") !== null) {
      const price = Number(formData.get("price"));
      if (!Number.isFinite(price) || price < 0) {
        throw new HttpError(400, "Please provide a valid price");
      }
      project.price = price;
    }
    if (formData.get("bhk") !== null) {
      const bhk = Number(formData.get("bhk"));
      project.bhk = Number.isFinite(bhk) && bhk > 0 ? bhk : undefined;
    }
    if (formData.get("bathrooms") !== null) {
      const b = Number(formData.get("bathrooms"));
      project.bathrooms = Number.isFinite(b) && b > 0 ? b : undefined;
    }
    if (formData.get("order") !== null) {
      const order = Number(formData.get("order"));
      project.order = Number.isFinite(order) ? order : 0;
    }
    if (formData.get("possession") !== null) {
      project.possession =
        formData.get("possession") === "ready" ? "ready" : "under-construction";
    }
    if (formData.get("status") !== null) {
      project.status = formData.get("status") === "inactive" ? "inactive" : "active";
    }
    if (formData.get("highlights") !== null) {
      project.highlights = parseList(formData.get("highlights"));
    }
    if (formData.get("amenities") !== null) {
      project.amenities = parseList(formData.get("amenities"));
    }
    if (formData.get("connectivity") !== null) {
      project.connectivity = parseConnectivity(formData.get("connectivity"));
    }
    const developerRaw = formData.get("developer");
    if (developerRaw !== null) {
      project.developer = (developerRaw as string)
        ? (developerRaw as unknown as typeof project.developer)
        : null;
    }

    // Drop any image the admin removed, then append the newly uploaded ones.
    // The submitted list carries the admin's chosen order, so rebuild from it
    // rather than filtering — filtering would keep the old order.
    if (formData.get("existingImages") !== null) {
      const kept = parseList(formData.get("existingImages"));
      const keep = new Set(kept);
      const removed = project.images.filter((img) => !keep.has(img.url));
      if (removed.length) {
        await deleteMultipleFiles(
          removed.map((img) => img.publicId).filter(Boolean),
          "image"
        ).catch((e) => console.error("Cloudinary cleanup failed:", e));
      }
      const byUrl = new Map(project.images.map((img) => [img.url, img]));
      project.images = kept
        .map((url) => byUrl.get(url))
        .filter(Boolean) as typeof project.images;
    }

    const files = await extractFiles(formData, "images");
    if (project.images.length + files.length > MAX_IMAGES) {
      throw new HttpError(400, `You can have at most ${MAX_IMAGES} images`);
    }
    for (const file of files) {
      project.images.push(
        (await uploadImageFromBuffer(file.buffer, "featured-projects/images")) as any
      );
    }

    await project.save();
    await project.populate("developer", "_id name slug logo bio website");

    return NextResponse.json({
      success: true,
      message: "Featured project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("updateFeaturedProject ERROR:", error);
    return errorResponse(error);
  }
}

// DELETE /api/featured-projects/[id] — protect. Cascades the Cloudinary assets.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const project = await findProject(params.id);

    const publicIds = project.images.map((img) => img.publicId).filter(Boolean);
    if (publicIds.length) {
      await deleteMultipleFiles(publicIds, "image").catch((e) =>
        console.error("Cloudinary cleanup failed:", e)
      );
    }

    await project.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Featured project deleted successfully",
    });
  } catch (error) {
    console.error("deleteFeaturedProject ERROR:", error);
    return errorResponse(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import { extractFiles } from "@/lib/upload";
import { uploadImageFromBuffer } from "@/lib/cloudinary";
import FeaturedProject from "@/models/FeaturedProject";
// Imported so its schema is registered before `.populate("developer", ...)`
// runs — Mongoose only knows a ref model once something imports it.
import "@/models/Developer";

export const runtime = "nodejs";
// Hits live Mongo data — must not be statically cached at build time.
export const dynamic = "force-dynamic";

const MAX_IMAGES = 15;

/** Highlights and amenities arrive pipe-delimited from the admin form. */
function parseList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || !value.trim()) return [];
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

// GET /api/featured-projects — public. Powers the Featured Listing grid and
// each project's brochure page.
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";
    const slug = searchParams.get("slug");

    const query: Record<string, unknown> = {};
    if (!includeInactive) query.status = "active";
    if (slug) query.slug = slug;

    const projects = await FeaturedProject.find(query)
      .populate("developer", "_id name slug logo bio website")
      .sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error("getFeaturedProjects ERROR:", error);
    return errorResponse(error);
  }
}

// POST /api/featured-projects — protect. Multipart, so gallery images upload
// alongside the text fields.
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const formData = await request.formData();

    const title = (formData.get("title") as string | null)?.trim();
    const city = (formData.get("city") as string | null)?.trim();
    const address = (formData.get("address") as string | null)?.trim();
    const description = (formData.get("description") as string | null)?.trim();
    const price = Number(formData.get("price"));

    if (!title) throw new HttpError(400, "Please provide a project title");
    if (!city) throw new HttpError(400, "Please provide a city");
    if (!address) throw new HttpError(400, "Please provide an address");
    if (!description) throw new HttpError(400, "Please provide a description");
    if (!Number.isFinite(price) || price < 0) {
      throw new HttpError(400, "Please provide a valid price");
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (await FeaturedProject.findOne({ slug })) {
      throw new HttpError(400, "A featured project with this title already exists");
    }

    const files = await extractFiles(formData, "images");
    if (files.length > MAX_IMAGES) {
      throw new HttpError(400, `You can upload at most ${MAX_IMAGES} images`);
    }
    const images = [];
    for (const file of files) {
      images.push(await uploadImageFromBuffer(file.buffer, "featured-projects/images"));
    }

    const bhk = Number(formData.get("bhk"));
    const bathrooms = Number(formData.get("bathrooms"));
    const order = Number(formData.get("order"));

    const project = await FeaturedProject.create({
      title,
      city,
      address,
      price,
      bhk: Number.isFinite(bhk) && bhk > 0 ? bhk : undefined,
      bathrooms: Number.isFinite(bathrooms) && bathrooms > 0 ? bathrooms : undefined,
      area: (formData.get("area") as string | null)?.trim() || undefined,
      configuration: (formData.get("configuration") as string | null)?.trim() || undefined,
      propertyType:
        ((formData.get("propertyType") as string | null)?.trim() as any) || "residential",
      possession:
        (formData.get("possession") as string | null) === "ready"
          ? "ready"
          : "under-construction",
      reraNumber: (formData.get("reraNumber") as string | null)?.trim() || undefined,
      description,
      videoUrl: (formData.get("videoUrl") as string | null)?.trim() || undefined,
      highlights: parseList(formData.get("highlights")),
      amenities: parseList(formData.get("amenities")),
      images,
      developer: (formData.get("developer") as string | null) || null,
      connectivity: parseConnectivity(formData.get("connectivity")),
      order: Number.isFinite(order) ? order : 0,
      status:
        (formData.get("status") as string | null) === "inactive" ? "inactive" : "active",
    });

    return NextResponse.json(
      { success: true, message: "Featured project created successfully", data: project },
      { status: 201 }
    );
  } catch (error) {
    console.error("createFeaturedProject ERROR:", error);
    return errorResponse(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import { extractSingleFile } from "@/lib/upload";
import { uploadImageFromBuffer } from "@/lib/cloudinary";
import Developer from "@/models/Developer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/developers — public. `?status=active` (used by the public site's
// Developer Partners strip and the project-page "About the Developer"
// section) hides anything the admin marked inactive without deleting it.
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const status = new URL(request.url).searchParams.get("status");
    const filter = status ? { status } : {};

    const developers = await Developer.find(filter).sort({ order: 1, name: 1 });

    return NextResponse.json({ success: true, count: developers.length, data: developers });
  } catch (error) {
    console.error("getDevelopers ERROR:", error);
    return errorResponse(error);
  }
}

// POST /api/developers — protect. Multipart so a logo can be attached.
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const bio = formData.get("bio") as string | null;
    const website = formData.get("website") as string | null;

    if (!name || !name.trim()) {
      throw new HttpError(400, "Please provide a developer name");
    }

    const existing = await Developer.findOne({ name: name.trim() });
    if (existing) {
      throw new HttpError(400, "A developer with this name already exists");
    }

    let logo: { url: string; publicId: string } | undefined;
    const logoFile = await extractSingleFile(formData, "developerLogo");
    if (logoFile) {
      logo = await uploadImageFromBuffer(logoFile.buffer, "developers/logos");
    }

    const developer = await Developer.create({
      name: name.trim(),
      bio: bio || undefined,
      website: website || undefined,
      logo,
    });

    return NextResponse.json(
      { success: true, message: "Developer added successfully", data: developer },
      { status: 201 }
    );
  } catch (error) {
    console.error("createDeveloper ERROR:", error);
    return errorResponse(error);
  }
}

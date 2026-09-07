import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import CompanySettings, { COMPANY_SETTINGS_ID } from "@/models/CompanySettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIELDS = [
  "phone",
  "whatsapp",
  "email",
  "address",
  "rera",
  "facebookUrl",
  "instagramUrl",
  "linkedinUrl",
  "youtubeUrl",
  "googleMapsUrl",
] as const;

// GET /api/company-settings — public. Returns `{}` (never 404) when the
// admin hasn't set anything up yet, so the frontend can fall back cleanly.
export async function GET() {
  try {
    await connectDB();
    const settings = await CompanySettings.findById(COMPANY_SETTINGS_ID);
    return NextResponse.json({ success: true, data: settings || {} });
  } catch (error) {
    console.error("getCompanySettings ERROR:", error);
    return errorResponse(error);
  }
}

// PUT /api/company-settings — protect. Upserts the singleton; blank strings
// clear a field rather than leaving the old value in place.
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const body = await request.json();
    const update: Record<string, string> = {};
    for (const field of FIELDS) {
      if (typeof body[field] === "string") update[field] = body[field].trim();
    }

    // Bare 10-digit mobile numbers only — no country code, spaces, or dashes.
    // Formatted with +91 wherever they're actually shown/linked on the site.
    for (const field of ["phone", "whatsapp"] as const) {
      const value = update[field];
      if (value && !/^\d{10}$/.test(value)) {
        throw new HttpError(400, `${field === "phone" ? "Phone" : "WhatsApp"} number must be exactly 10 digits`);
      }
    }

    const settings = await CompanySettings.findByIdAndUpdate(
      COMPANY_SETTINGS_ID,
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Company settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("updateCompanySettings ERROR:", error);
    return errorResponse(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import Enquiry from "@/models/Enquiry";
// Imported so its schema is registered before `.populate(...)` runs —
// Mongoose only knows a ref model once something imports it.
import "@/models/Property";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/enquiries/recent — protect
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const enquiries = await Enquiry.find()
      .populate("propertyId", "title price city")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (error) {
    return errorResponse(error);
  }
}

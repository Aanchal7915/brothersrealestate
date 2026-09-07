import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import Enquiry from "@/models/Enquiry";
// Imported so their schemas are registered before `.populate(...)` runs —
// Mongoose only knows a ref model once something imports it.
import "@/models/Property";
import "@/models/FeaturedProject";
import "@/models/Admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/enquiries/all — protect
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const status = request.nextUrl.searchParams.get("status");
    const query: Record<string, unknown> = {};
    if (status && ["pending", "handled"].includes(status)) {
      query.status = status;
    }

    const enquiries = await Enquiry.find(query)
      .populate("propertyId", "title price city address images")
      .populate("featuredProjectId", "title price city address images")
      .populate("adminNotes.admin", "name email")
      .sort({ createdAt: -1 });

    const total = await Enquiry.countDocuments();
    const pending = await Enquiry.countDocuments({ status: "pending" });
    const handled = await Enquiry.countDocuments({ status: "handled" });

    return NextResponse.json({
      success: true,
      count: enquiries.length,
      stats: { total, pending, handled },
      data: enquiries,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

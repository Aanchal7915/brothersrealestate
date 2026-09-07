import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import Enquiry from "@/models/Enquiry";
// Imported so its schema is registered before `.populate(...)` runs —
// Mongoose only knows a ref model once something imports it.
import "@/models/Property";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUT /api/enquiries/:id — protect (update status)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const { status } = await request.json();

    if (!status || !["pending", "handled"].includes(status)) {
      throw new HttpError(400, "Please provide a valid status (pending or handled)");
    }

    const enquiry = await Enquiry.findById(params.id);
    if (!enquiry) {
      throw new HttpError(404, "Enquiry not found");
    }

    enquiry.status = status;
    await enquiry.save();
    await enquiry.populate("propertyId", "title price city address");

    return NextResponse.json({
      success: true,
      message: "Enquiry status updated successfully",
      data: enquiry,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/enquiries/:id — protect
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const enquiry = await Enquiry.findById(params.id);
    if (!enquiry) {
      throw new HttpError(404, "Enquiry not found");
    }

    await enquiry.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Enquiry deleted successfully",
      data: { id: params.id },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

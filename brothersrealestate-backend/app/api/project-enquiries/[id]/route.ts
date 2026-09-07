import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import ProjectEnquiry from "@/models/ProjectEnquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = ["contacted", "converted", "interested", "not responded"];

// PUT /api/project-enquiries/:id — protect
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const { status } = await request.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      throw new HttpError(
        400,
        "Please provide a valid status (contacted, converted, interested, or not responded)"
      );
    }

    const enquiry = await ProjectEnquiry.findById(params.id);
    if (!enquiry) {
      throw new HttpError(404, "Enquiry not found");
    }

    enquiry.status = status;
    await enquiry.save();

    return NextResponse.json({
      success: true,
      message: "Enquiry status updated successfully",
      data: enquiry,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/project-enquiries/:id — protect
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const enquiry = await ProjectEnquiry.findById(params.id);
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

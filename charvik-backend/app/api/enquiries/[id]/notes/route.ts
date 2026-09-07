import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import Enquiry from "@/models/Enquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUT /api/enquiries/:id/notes — protect (append an admin note)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    await connectDB();

    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new HttpError(400, "Please provide a non-empty note text");
    }

    const enquiry = await Enquiry.findById(params.id);
    if (!enquiry) {
      throw new HttpError(404, "Enquiry not found");
    }

    enquiry.adminNotes = enquiry.adminNotes || [];
    enquiry.adminNotes.push({ text: text.trim(), admin: admin._id, createdAt: new Date() });
    await enquiry.save();

    const populated = await enquiry.populate([
      { path: "propertyId", select: "title price city address" },
      { path: "adminNotes.admin", select: "name email" },
    ]);

    return NextResponse.json({ success: true, message: "Note added", data: populated });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/enquiries/:id/notes?noteId=... — protect (remove one admin note)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await connectDB();

    const noteId = new URL(request.url).searchParams.get("noteId");
    if (!noteId) {
      throw new HttpError(400, "Please provide the note id to delete");
    }

    const enquiry = await Enquiry.findById(params.id);
    if (!enquiry) {
      throw new HttpError(404, "Enquiry not found");
    }

    const before = (enquiry.adminNotes || []).length;
    enquiry.adminNotes = (enquiry.adminNotes || []).filter(
      (n: any) => String(n._id) !== String(noteId)
    ) as typeof enquiry.adminNotes;

    if (enquiry.adminNotes.length === before) {
      throw new HttpError(404, "Note not found");
    }

    await enquiry.save();

    const populated = await enquiry.populate([
      { path: "propertyId", select: "title price city address" },
      { path: "adminNotes.admin", select: "name email" },
    ]);

    return NextResponse.json({ success: true, message: "Note deleted", data: populated });
  } catch (error) {
    return errorResponse(error);
  }
}

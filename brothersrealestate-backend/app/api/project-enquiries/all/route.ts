import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import ProjectEnquiry from "@/models/ProjectEnquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/project-enquiries/all — protect
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const status = request.nextUrl.searchParams.get("status");
    const validStatuses = ["contacted", "converted", "interested", "not responded"];
    const query: Record<string, unknown> = {};
    if (status && validStatuses.includes(status)) {
      query.status = status;
    }

    const enquiries = await ProjectEnquiry.find(query).sort({ createdAt: -1 });

    const total = await ProjectEnquiry.countDocuments();
    const contacted = await ProjectEnquiry.countDocuments({ status: "contacted" });
    const converted = await ProjectEnquiry.countDocuments({ status: "converted" });
    const interested = await ProjectEnquiry.countDocuments({ status: "interested" });
    const notResponded = await ProjectEnquiry.countDocuments({ status: "not responded" });

    return NextResponse.json({
      success: true,
      count: enquiries.length,
      stats: { total, contacted, converted, interested, notResponded },
      data: enquiries,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { errorResponse } from "@/lib/errorResponse";
import { requireAdmin } from "@/lib/auth";
import LoginHistory from "@/models/LoginHistory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RECORDS = 200;

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Was hand-rolled here (verify the JWT, trust decoded.id) which accepted
    // any valid token, including a regular site user's. requireAdmin resolves
    // the id against the Admin collection.
    const admin = await requireAdmin(request);

    const history = await LoginHistory.find({ adminId: admin._id })
      .sort({ createdAt: -1 })
      .limit(MAX_RECORDS)
      .lean();

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

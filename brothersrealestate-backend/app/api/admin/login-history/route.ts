import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import LoginHistory from "@/models/LoginHistory";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Not authorized");
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    } catch (err) {
      throw new HttpError(401, "Not authorized, token failed");
    }

    const history = await LoginHistory.find({ adminId: decoded.id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

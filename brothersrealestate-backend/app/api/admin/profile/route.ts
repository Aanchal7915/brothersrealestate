import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import Admin from "@/models/Admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateToken(id: string) {
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || "7d") as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign({ id }, process.env.JWT_SECRET as string, options);
}

export async function GET(request: NextRequest) {
  try {
    const authed = await requireAdmin(request);
    await connectDB();
    const admin = await Admin.findById(authed._id);

    if (!admin) {
      throw new HttpError(404, "Admin not found");
    }

    return NextResponse.json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authed = await requireAdmin(request);
    await connectDB();
    const admin = await Admin.findById(authed._id);

    if (!admin) {
      throw new HttpError(404, "Admin not found");
    }

    const body = await request.json();

    admin.name = body.name || admin.name;
    admin.email = body.email || admin.email;

    if (body.password) {
      if (body.password.length < 6) {
        throw new HttpError(400, "Password must be at least 6 characters");
      }
      admin.password = body.password;
    }

    const updatedAdmin = await admin.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        token: generateToken(updatedAdmin._id.toString()),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

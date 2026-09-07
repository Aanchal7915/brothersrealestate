import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      throw new HttpError(400, "Please provide all required fields");
    }

    if (password.length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters");
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      throw new HttpError(400, "Admin already exists with this email");
    }

    const admin = await Admin.create({ name, email, password });

    return NextResponse.json(
      {
        success: true,
        message: "Admin registered successfully",
        data: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          token: generateToken(admin._id.toString()),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

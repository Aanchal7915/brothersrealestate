import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateToken(id: string) {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "30d" });
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide name, email and password" },
        { status: 400 }
      );
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 400 }
      );
    }

    const user = await User.create({ name, email, password, phone });

    const token = generateToken(user._id.toString());

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register user", error: (error as Error).message },
      { status: 500 }
    );
  }
}

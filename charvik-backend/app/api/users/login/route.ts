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
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide email and password" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id.toString());
      return NextResponse.json({
        success: true,
        message: "Login successful",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          token,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Login failed", error: (error as Error).message },
      { status: 500 }
    );
  }
}

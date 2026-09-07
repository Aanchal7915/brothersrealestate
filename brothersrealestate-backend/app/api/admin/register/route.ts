import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import { jwtSecret } from "@/lib/auth";
import Admin from "@/models/Admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Length-safe constant-time comparison for secrets. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function generateToken(id: string) {
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || "7d") as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign({ id }, jwtSecret(), options);
}

/**
 * Authorizes admin creation two ways:
 *
 *   1. A valid bearer token belonging to an existing admin, or
 *   2. an `x-admin-setup-key` header matching ADMIN_SETUP_KEY — the bootstrap
 *      path for creating the very first admin when no token can exist yet.
 *
 * When ADMIN_SETUP_KEY is unset, path 2 is disabled entirely rather than
 * falling open.
 *
 * SECURITY: this endpoint previously had no authorization at all, so anyone
 * who found the URL could POST a name/email/password and receive a working
 * admin token — bypassing the password lockout and the security passcode.
 */
async function authorizeRegistration(request: NextRequest): Promise<void> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, jwtSecret()) as { id: string };
      const existingAdmin = await Admin.findById(decoded.id).select("_id");
      if (existingAdmin) return;
    } catch {
      // Fall through to the setup-key path below.
    }
  }

  const setupKey = process.env.ADMIN_SETUP_KEY;
  const providedKey = request.headers.get("x-admin-setup-key");
  if (setupKey && setupKey.length >= 16 && providedKey && safeEqual(providedKey, setupKey)) {
    return;
  }

  throw new HttpError(403, "Not authorized to create an admin account");
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    await authorizeRegistration(request);

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      throw new HttpError(400, "Please provide all required fields");
    }

    // Raised from 6. An admin password guards every listing, enquiry and
    // company setting on the site.
    if (String(password).length < 12) {
      throw new HttpError(400, "Password must be at least 12 characters");
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

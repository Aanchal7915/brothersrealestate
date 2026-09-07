import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { HttpError } from "./errorResponse";
import { connectDB } from "./db";
import Admin from "@/models/Admin";
import User from "@/models/User";

function getBearerToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new HttpError(401, "Not authorized, no token");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new HttpError(401, "Not authorized, no token");
  }
  return token;
}

function verifyToken(token: string): { id: string } {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
  } catch {
    throw new HttpError(401, "Not authorized, token failed");
  }
}

/**
 * Replaces authMiddleware.js's `protect`. Accepts either an Admin or a User
 * bearer token — mirrors the old behavior of trying the Admin collection
 * first, then falling back to User (and treating a valid User token as
 * authorized for admin-protected routes, same as the old
 * `req.admin = user` fallback assignment).
 */
export async function requireAdmin(request: NextRequest) {
  await connectDB();
  const token = getBearerToken(request);
  const decoded = verifyToken(token);

  const admin = await Admin.findById(decoded.id).select("-password");
  if (admin) return admin;

  const user = await User.findById(decoded.id).select("-password");
  if (user) return user;

  throw new HttpError(401, "Not authorized");
}

/**
 * Replaces authMiddleware.js's `protectUser`. Only accepts a User bearer
 * token.
 */
export async function requireUser(request: NextRequest) {
  await connectDB();
  const token = getBearerToken(request);
  const decoded = verifyToken(token);

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    throw new HttpError(401, "Not authorized");
  }
  return user;
}

/**
 * Derives a client IP from proxy headers since `req.ip` doesn't exist on the
 * Web Request object Next.js route handlers receive.
 */
export function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip");
}

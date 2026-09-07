import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { HttpError } from "./errorResponse";
import { connectDB } from "./db";
import Admin from "@/models/Admin";
import User from "@/models/User";

/**
 * Fails closed when JWT_SECRET is missing or obviously weak. Without this,
 * `jwt.verify(token, undefined)` throws a generic error that the catch block
 * below reports as "token failed", hiding a misconfigured deployment.
 */
export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    console.error("JWT_SECRET is missing or shorter than 16 characters — refusing to issue/verify tokens");
    throw new HttpError(500, "Server authentication is not configured correctly");
  }
  return secret;
}

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
  const secret = jwtSecret();
  try {
    return jwt.verify(token, secret) as { id: string };
  } catch {
    throw new HttpError(401, "Not authorized, token failed");
  }
}

/**
 * Admin-only gate for every /api/admin/* and management route.
 *
 * SECURITY: this used to fall back to the `User` collection and treat any
 * valid user token as an admin (mirroring the old Express `req.admin = user`
 * assignment). Because /api/users/signup is public and needs no security
 * passcode, that turned "anyone can sign up on the website" into "anyone is
 * an admin". The fallback is gone: only a token whose id resolves in the
 * Admin collection is accepted.
 */
export async function requireAdmin(request: NextRequest) {
  await connectDB();
  const token = getBearerToken(request);
  const decoded = verifyToken(token);

  const admin = await Admin.findById(decoded.id).select("-password");
  if (!admin) {
    throw new HttpError(403, "Not authorized: admin access required");
  }
  return admin;
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
 *
 * Only used for logging and rate limiting, and only trustworthy because
 * Vercel overwrites x-forwarded-for at the edge. Never accept an IP from a
 * request body — a caller can put anything there.
 */
export function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip");
}

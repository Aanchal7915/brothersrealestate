import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import { getClientIp, jwtSecret } from "@/lib/auth";
import { formatLocation, mapsUrl, parseCoordinates, type Coordinates } from "@/lib/geo";
import Admin, { type AdminDocument } from "@/models/Admin";
import LoginAttempt from "@/models/LoginAttempt";
import LoginHistory from "@/models/LoginHistory";
import sendEmail from "@/lib/sendEmail";
import { getAdminLockedEmailTemplate } from "@/lib/emailTemplate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Two independent lockout tiers, since the login password and the security
// passcode are separate secrets guarding separate things. Both are 5 wrong
// entries -> 5 minute lock, and every lock sends an alert to the admin's
// own address — so a second round of 5 sends a second email, a third sends
// a third, each stamped with the round number.
const PASSWORD_ATTEMPT_LIMIT = 5;
const PASSWORD_LOCK_MINUTES = 5;
const PASSCODE_ATTEMPT_LIMIT = 5;
const PASSCODE_LOCK_MINUTES = 5;

// Failures older than this stop counting, so an honest typo months ago plus
// four today doesn't lock the account.
const ATTEMPT_WINDOW_MINUTES = 15;

// Per-IP ceiling, which unlike the per-account counters also covers attempts
// against email addresses that don't exist.
const IP_ATTEMPT_LIMIT = 20;
const IP_WINDOW_MINUTES = 15;
const IP_BLOCK_MINUTES = 15;

/** Length-safe constant-time comparison, so a wrong passcode can't be
 *  narrowed down by measuring how fast it was rejected. */
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

function remainingMinutes(until: Date) {
  return Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60000));
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000);
}

/**
 * The second factor has no safe default. It used to fall back to a literal
 * "31082004" written in this file, so any deployment missing the env var
 * accepted a passcode published in the repository. Fail closed instead.
 */
function expectedPasscode(): string {
  const passcode = process.env.ADMIN_SECURITY_PASSCODE;
  if (!passcode || passcode.length < 6) {
    console.error("ADMIN_SECURITY_PASSCODE is missing or shorter than 6 characters — refusing all admin logins");
    throw new HttpError(500, "Admin sign-in is not configured correctly. Contact the site administrator.");
  }
  return passcode;
}

/**
 * Rolling per-IP counter. Upserts rather than find-then-create so two
 * simultaneous failed logins from one IP can't race into a duplicate-key
 * error, and never throws: losing a throttle tick is not a reason to hand
 * the caller a confusing 400 instead of "invalid credentials".
 */
async function registerIpFailure(ip: string): Promise<void> {
  try {
    const now = new Date();

    const record = await LoginAttempt.findOneAndUpdate(
      { ipAddress: ip },
      {
        $setOnInsert: { ipAddress: ip, windowStartedAt: now },
        $inc: { count: 1 },
        $set: { updatedAt: now },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!record) return;

    // Reset rather than accumulate once the window has aged out.
    if (record.windowStartedAt.getTime() < minutesAgo(IP_WINDOW_MINUTES).getTime()) {
      record.count = 1;
      record.windowStartedAt = now;
    }

    if (record.count >= IP_ATTEMPT_LIMIT) {
      record.blockedUntil = new Date(Date.now() + IP_BLOCK_MINUTES * 60 * 1000);
      record.count = 0;
      record.windowStartedAt = now;
    }

    await record.save();
  } catch (e) {
    console.error("Failed to record IP login failure:", e);
  }
}

async function assertIpNotBlocked(ip: string): Promise<void> {
  const record = await LoginAttempt.findOne({ ipAddress: ip });
  if (record?.blockedUntil && record.blockedUntil.getTime() > Date.now()) {
    throw new HttpError(
      429,
      `Too many sign-in attempts from this network. Try again in ${remainingMinutes(record.blockedUntil)} minute(s).`
    );
  }
}

async function clearIpFailures(ip: string): Promise<void> {
  await LoginAttempt.deleteOne({ ipAddress: ip });
}

interface AttemptContext {
  ip: string;
  userAgent: string;
  coords: Coordinates | null;
  claimedLocation: string;
  email: string;
}

async function recordAttempt(
  adminId: unknown,
  ctx: AttemptContext,
  success: boolean,
  reason = ""
): Promise<void> {
  try {
    await LoginHistory.create({
      adminId,
      success,
      reason,
      emailAttempted: ctx.email,
      latitude: ctx.coords?.latitude ?? null,
      longitude: ctx.coords?.longitude ?? null,
      accuracy: ctx.coords?.accuracy ?? null,
      location: ctx.coords ? formatLocation(ctx.coords) : "Unknown",
      approxLocationClaimed: ctx.claimedLocation,
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });
  } catch (e) {
    // Never let an audit-log write failure decide whether someone can log in.
    console.error("Failed to record login attempt:", e);
  }
}

async function sendLockAlert(
  admin: AdminDocument,
  ctx: AttemptContext,
  reason: string,
  attempts: number,
  minutes: number,
  round: number
): Promise<void> {
  try {
    await sendEmail({
      to: admin.email,
      toName: admin.name,
      subject:
        round > 1
          ? `Security Alert: Admin ${reason} locked again (attempt ${round})`
          : "Security Alert: Admin Account Locked",
      html: getAdminLockedEmailTemplate({
        adminName: admin.name,
        reason,
        attempts,
        minutes,
        round,
        ipAddress: ctx.ip,
        location: ctx.coords ? formatLocation(ctx.coords) : "Not provided",
        mapsUrl: ctx.coords ? mapsUrl(ctx.coords) : null,
        userAgent: ctx.userAgent,
        emailAttempted: ctx.email,
      }),
    });
  } catch (e) {
    console.error(`${reason} lock alert email failed:`, e);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password, securityPasscode, location } = body ?? {};

    // The IP is taken from proxy headers, never from the body — the old code
    // stored a caller-supplied `ipAddress`, which made the audit log fiction.
    const ip = getClientIp(request) || "Unknown";
    const userAgent = request.headers.get("user-agent") || "";
    const coords = parseCoordinates(location);
    const ctx: AttemptContext = {
      ip,
      userAgent,
      coords,
      claimedLocation: typeof body?.approxLocation === "string" ? body.approxLocation.slice(0, 200) : "",
      email: typeof email === "string" ? email.slice(0, 200) : "",
    };

    await assertIpNotBlocked(ip);

    if (!email || !password || !securityPasscode) {
      throw new HttpError(400, "Please provide email, password, and security passcode");
    }

    // Precise location is mandatory for admin access. Checked before the
    // credentials so a caller with no location learns nothing about whether
    // the email or password was right. ALLOW_LOGIN_WITHOUT_LOCATION=true is
    // the documented recovery path if the permission is ever unavailable.
    if (!coords && process.env.ALLOW_LOGIN_WITHOUT_LOCATION !== "true") {
      throw new HttpError(
        428,
        "Location access is required to sign in to the admin panel. Enable location permission for this site in your browser and try again."
      );
    }

    // Verify the passcode is configured before touching the database, so a
    // misconfigured deployment fails the same way for everyone.
    const passcode = expectedPasscode();

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      await registerIpFailure(ip);
      throw new HttpError(401, "Invalid credentials or security passcode");
    }

    // An existing lock always wins over evaluating this attempt — both tiers
    // are checked, since either one being active should block the login.
    if (admin.lockUntil && admin.lockUntil.getTime() > Date.now()) {
      await recordAttempt(admin._id, ctx, false, "locked");
      throw new HttpError(
        403,
        `Account is temporarily locked. Try again in ${remainingMinutes(admin.lockUntil)} minute(s).`
      );
    }
    if (admin.passcodeLockUntil && admin.passcodeLockUntil.getTime() > Date.now()) {
      await recordAttempt(admin._id, ctx, false, "locked");
      throw new HttpError(
        403,
        `Security passcode is temporarily locked. Try again in ${remainingMinutes(admin.passcodeLockUntil)} minute(s).`
      );
    }

    // Stale counters expire so old failures don't accumulate into a lock.
    const staleBefore = minutesAgo(ATTEMPT_WINDOW_MINUTES).getTime();
    if (admin.lastFailedLoginAt && admin.lastFailedLoginAt.getTime() < staleBefore) {
      admin.failedLoginAttempts = 0;
    }
    if (admin.lastFailedPasscodeAt && admin.lastFailedPasscodeAt.getTime() < staleBefore) {
      admin.failedPasscodeAttempts = 0;
    }

    const isPasswordMatch = await admin.matchPassword(password);
    const isPasscodeMatch = safeEqual(String(securityPasscode), passcode);

    if (isPasswordMatch && isPasscodeMatch) {
      admin.failedLoginAttempts = 0;
      admin.lockUntil = null;
      admin.lastFailedLoginAt = null;
      admin.failedPasscodeAttempts = 0;
      admin.passcodeLockUntil = null;
      admin.lastFailedPasscodeAt = null;
      await admin.save();

      await clearIpFailures(ip);
      await recordAttempt(admin._id, ctx, true);

      return NextResponse.json({
        success: true,
        message: "Login successful",
        data: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          token: generateToken(admin._id.toString()),
        },
      });
    }

    // At least one of the two secrets was wrong — track each independently
    // and lock whichever one just hit its own limit.
    const now = new Date();
    const lockMessages: string[] = [];
    const pendingAlerts: Array<() => Promise<void>> = [];

    if (!isPasswordMatch) {
      admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
      admin.lastFailedLoginAt = now;

      if (admin.failedLoginAttempts >= PASSWORD_ATTEMPT_LIMIT) {
        admin.lockUntil = new Date(Date.now() + PASSWORD_LOCK_MINUTES * 60 * 1000);
        admin.failedLoginAttempts = 0;
        admin.lockCount = (admin.lockCount || 0) + 1;
        const round = admin.lockCount;

        lockMessages.push(
          `Account locked for ${PASSWORD_LOCK_MINUTES} minutes due to ${PASSWORD_ATTEMPT_LIMIT} incorrect password attempts.`
        );
        pendingAlerts.push(() =>
          sendLockAlert(admin, ctx, "login password", PASSWORD_ATTEMPT_LIMIT, PASSWORD_LOCK_MINUTES, round)
        );
      }
    }

    if (!isPasscodeMatch) {
      admin.failedPasscodeAttempts = (admin.failedPasscodeAttempts || 0) + 1;
      admin.lastFailedPasscodeAt = now;

      if (admin.failedPasscodeAttempts >= PASSCODE_ATTEMPT_LIMIT) {
        admin.passcodeLockUntil = new Date(Date.now() + PASSCODE_LOCK_MINUTES * 60 * 1000);
        admin.failedPasscodeAttempts = 0;
        admin.passcodeLockCount = (admin.passcodeLockCount || 0) + 1;
        const round = admin.passcodeLockCount;

        lockMessages.push(
          `Security passcode locked for ${PASSCODE_LOCK_MINUTES} minutes due to ${PASSCODE_ATTEMPT_LIMIT} incorrect passcode attempts.`
        );
        pendingAlerts.push(() =>
          sendLockAlert(admin, ctx, "security passcode", PASSCODE_ATTEMPT_LIMIT, PASSCODE_LOCK_MINUTES, round)
        );
      }
    }

    // Persist the counters before sending mail, so a slow or failing email
    // provider can't cost us the lock itself.
    await admin.save();
    await registerIpFailure(ip);
    await recordAttempt(admin._id, ctx, false, isPasswordMatch ? "passcode" : "password");

    for (const send of pendingAlerts) {
      await send();
    }

    if (lockMessages.length > 0) {
      throw new HttpError(403, `${lockMessages.join(" ")} An alert email has been sent.`);
    }

    throw new HttpError(401, "Invalid credentials or security passcode");
  } catch (error) {
    return errorResponse(error);
  }
}

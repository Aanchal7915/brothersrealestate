import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import Admin from "@/models/Admin";
import LoginHistory from "@/models/LoginHistory";
import sendEmail from "@/lib/sendEmail";
import { getAdminLockedEmailTemplate } from "@/lib/emailTemplate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Two independent lockout tiers, since the login password and the security
// passcode are separate secrets guarding separate things:
//   - the password: 5 wrong entries -> 10 minute lock
//   - the security passcode: 10 wrong entries -> 15 minute lock (stricter,
//     since it's the second factor everyone with the password would still
//     need to guess)
const PASSWORD_ATTEMPT_LIMIT = 5;
const PASSWORD_LOCK_MINUTES = 10;
const PASSCODE_ATTEMPT_LIMIT = 10;
const PASSCODE_LOCK_MINUTES = 15;

function generateToken(id: string) {
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || "7d") as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign({ id }, process.env.JWT_SECRET as string, options);
}

function remainingMinutes(until: Date) {
  return Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60000));
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password, securityPasscode, location, ipAddress } = await request.json();

    if (!email || !password || !securityPasscode) {
      throw new HttpError(400, "Please provide email, password, and security passcode");
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      throw new HttpError(401, "Invalid email or password");
    }

    // An existing lock always wins over evaluating this attempt — both tiers
    // are checked, since either one being active should block the login.
    if (admin.lockUntil && admin.lockUntil.getTime() > Date.now()) {
      throw new HttpError(
        403,
        `Account is temporarily locked. Try again in ${remainingMinutes(admin.lockUntil)} minute(s).`
      );
    }
    if (admin.passcodeLockUntil && admin.passcodeLockUntil.getTime() > Date.now()) {
      throw new HttpError(
        403,
        `Security passcode is temporarily locked. Try again in ${remainingMinutes(admin.passcodeLockUntil)} minute(s).`
      );
    }

    const isPasswordMatch = await admin.matchPassword(password);
    const expectedPasscode = process.env.ADMIN_SECURITY_PASSCODE || "31082004";
    const isPasscodeMatch = securityPasscode === expectedPasscode;

    if (isPasswordMatch && isPasscodeMatch) {
      admin.failedLoginAttempts = 0;
      admin.lockUntil = null;
      admin.failedPasscodeAttempts = 0;
      admin.passcodeLockUntil = null;
      await admin.save();

      await LoginHistory.create({
        adminId: admin._id,
        location: location || "Unknown",
        ipAddress: ipAddress || request.headers.get("x-forwarded-for") || "Unknown",
      });

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
    const lockMessages: string[] = [];

    if (!isPasswordMatch) {
      admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
      if (admin.failedLoginAttempts >= PASSWORD_ATTEMPT_LIMIT) {
        admin.lockUntil = new Date(Date.now() + PASSWORD_LOCK_MINUTES * 60 * 1000);
        admin.failedLoginAttempts = 0;
        lockMessages.push(
          `Account locked for ${PASSWORD_LOCK_MINUTES} minutes due to ${PASSWORD_ATTEMPT_LIMIT} incorrect password attempts.`
        );

        try {
          await sendEmail({
            to: admin.email,
            toName: admin.name,
            subject: "Security Alert: Admin Account Locked",
            html: getAdminLockedEmailTemplate({
              adminName: admin.name,
              reason: "login password",
              attempts: PASSWORD_ATTEMPT_LIMIT,
              minutes: PASSWORD_LOCK_MINUTES,
            }),
          });
        } catch (e) {
          console.error("Password-lock alert email failed:", e);
        }
      }
    }

    if (!isPasscodeMatch) {
      admin.failedPasscodeAttempts = (admin.failedPasscodeAttempts || 0) + 1;
      if (admin.failedPasscodeAttempts >= PASSCODE_ATTEMPT_LIMIT) {
        admin.passcodeLockUntil = new Date(Date.now() + PASSCODE_LOCK_MINUTES * 60 * 1000);
        admin.failedPasscodeAttempts = 0;
        lockMessages.push(
          `Security passcode locked for ${PASSCODE_LOCK_MINUTES} minutes due to ${PASSCODE_ATTEMPT_LIMIT} incorrect passcode attempts.`
        );

        try {
          await sendEmail({
            to: admin.email,
            toName: admin.name,
            subject: "Security Alert: Security Passcode Locked",
            html: getAdminLockedEmailTemplate({
              adminName: admin.name,
              reason: "security passcode",
              attempts: PASSCODE_ATTEMPT_LIMIT,
              minutes: PASSCODE_LOCK_MINUTES,
            }),
          });
        } catch (e) {
          console.error("Passcode-lock alert email failed:", e);
        }
      }
    }

    await admin.save();

    if (lockMessages.length > 0) {
      throw new HttpError(403, `${lockMessages.join(" ")} An alert email has been sent.`);
    }

    throw new HttpError(401, "Invalid credentials or security passcode");
  } catch (error) {
    return errorResponse(error);
  }
}

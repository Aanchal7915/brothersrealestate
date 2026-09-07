import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Per-IP throttle for the admin login endpoint.
 *
 * The per-account lockout on the Admin document can't see an attacker who
 * sprays many different email addresses: a miss on an unknown email has no
 * account to count against, so that path was previously unlimited. This
 * counts by source IP instead, independent of which email was tried.
 *
 * Stored in Mongo rather than memory because serverless instances don't
 * share state — an in-process counter resets whenever a new lambda spins up.
 */
export interface LoginAttemptDocument extends Document {
  ipAddress: string;
  count: number;
  windowStartedAt: Date;
  blockedUntil: Date | null;
  updatedAt: Date;
}

const loginAttemptSchema = new Schema<LoginAttemptDocument>({
  ipAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  windowStartedAt: {
    type: Date,
    default: Date.now,
  },
  blockedUntil: {
    type: Date,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Housekeeping: drop rows nothing has touched for a day so this collection
// doesn't grow without bound.
loginAttemptSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

const LoginAttempt: Model<LoginAttemptDocument> =
  mongoose.models.LoginAttempt ||
  mongoose.model<LoginAttemptDocument>("LoginAttempt", loginAttemptSchema);

export default LoginAttempt;

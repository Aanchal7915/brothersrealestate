import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface LoginHistoryDocument extends Document {
  adminId: mongoose.Types.ObjectId;
  /** Whether these credentials actually got in. Failures are recorded too —
   *  a log that only holds successes can't show you an attack in progress. */
  success: boolean;
  /** Short machine-readable reason for a failure: "password", "passcode",
   *  "locked", "no-location", "ip-throttled". Empty on success. */
  reason: string;
  emailAttempted: string;
  /** Exact coordinates from the browser Geolocation API, required for admin
   *  sign-in (see ALLOW_LOGIN_WITHOUT_LOCATION). */
  latitude: number | null;
  longitude: number | null;
  /** Radius of confidence in metres, as reported by the browser. Desktop
   *  wifi/IP positioning is often several km; phone GPS is a few metres. */
  accuracy: number | null;
  /** Human-readable label. Derived from coordinates when present. */
  location: string;
  /** Coarse city/region string the client reported. Never trusted for
   *  anything — kept only as a cross-check against the coordinates. */
  approxLocationClaimed: string;
  /** Server-derived from proxy headers, never from the request body. */
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const loginHistorySchema = new Schema<LoginHistoryDocument>({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  success: {
    type: Boolean,
    default: true,
  },
  reason: {
    type: String,
    default: "",
  },
  emailAttempted: {
    type: String,
    default: "",
  },
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },
  accuracy: {
    type: Number,
    default: null,
  },
  location: {
    type: String,
    default: "Unknown",
  },
  approxLocationClaimed: {
    type: String,
    default: "",
  },
  ipAddress: {
    type: String,
    default: "Unknown",
  },
  userAgent: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// The history page lists one admin's attempts newest-first.
loginHistorySchema.index({ adminId: 1, createdAt: -1 });

const LoginHistory: Model<LoginHistoryDocument> =
  mongoose.models.LoginHistory ||
  mongoose.model<LoginHistoryDocument>("LoginHistory", loginHistorySchema);

export default LoginHistory;

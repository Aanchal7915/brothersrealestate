import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface LoginHistoryDocument extends Document {
  adminId: mongoose.Types.ObjectId;
  location: string;
  ipAddress: string;
  createdAt: Date;
}

const loginHistorySchema = new Schema<LoginHistoryDocument>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    location: {
      type: String,
      default: "Unknown",
    },
    ipAddress: {
      type: String,
      default: "Unknown",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const LoginHistory: Model<LoginHistoryDocument> =
  mongoose.models.LoginHistory || mongoose.model<LoginHistoryDocument>("LoginHistory", loginHistorySchema);

export default LoginHistory;

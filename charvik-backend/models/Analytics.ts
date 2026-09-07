import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface AnalyticsDocument extends Document {
  userId?: Types.ObjectId | null;
  propertyId?: Types.ObjectId | null;
  eventType: "view" | "click" | "filter";
  city?: string;
  price?: number;
  bhk?: number;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const analyticsSchema = new Schema<AnalyticsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      // Filter events aren't tied to a property, so this can't be required —
      // requiring it made every filter-tracking call fail validation.
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      enum: ["view", "click", "filter"],
      required: true,
      index: true,
    },
    city: {
      type: String,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
    },
    bhk: {
      type: Number,
    },
    sessionId: {
      type: String,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ propertyId: 1, eventType: 1 });
analyticsSchema.index({ city: 1, eventType: 1 });

const Analytics: Model<AnalyticsDocument> =
  mongoose.models.Analytics || mongoose.model<AnalyticsDocument>("Analytics", analyticsSchema);

export default Analytics;

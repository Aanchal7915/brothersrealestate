import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

interface AdminNote {
  text: string;
  admin?: Types.ObjectId;
  createdAt: Date;
}

export interface EnquiryDocument extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  specialEnquiry?: string;
  /** Budget range picked in the enquiry form, e.g. "1-2 Cr". Free text so the
   *  form can offer whatever brackets make sense without a schema change. */
  budget?: string;
  /** Buying for investment vs to live in — lead-qualification field. */
  purpose?: "investment" | "self-use";
  propertyId?: Types.ObjectId | null;
  /** Set when the enquiry is about a Featured Listing project instead. */
  featuredProjectId?: Types.ObjectId | null;
  /** Where the form was filled in, e.g. "contact-page", "property-detail". */
  source?: string;
  /** What it was about in plain words, e.g. "Brochure — Oberoi 360 North". */
  sourceLabel?: string;
  adminNotes: AdminNote[];
  status: "pending" | "handled";
  createdAt: Date;
  updatedAt: Date;
}

const enquirySchema = new Schema<EnquiryDocument>(
  {
    name: {
      type: String,
      required: [true, "Please add your name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add your email"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Please add your phone number"],
      match: [/^[0-9]{10}$/, "Please add a valid 10-digit phone number"],
    },
    message: {
      type: String,
      required: [true, "Please add a message"],
      maxlength: [1000, "Message cannot be more than 1000 characters"],
    },
    specialEnquiry: {
      type: String,
      trim: true,
      maxlength: [500, "Special enquiry cannot be more than 500 characters"],
    },
    budget: {
      type: String,
      trim: true,
      maxlength: [50, "Budget cannot be more than 50 characters"],
    },
    purpose: {
      type: String,
      enum: ["investment", "self-use"],
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    featuredProjectId: {
      type: Schema.Types.ObjectId,
      ref: "FeaturedProject",
      default: null,
    },
    source: {
      type: String,
      trim: true,
      default: "website",
      index: true,
    },
    sourceLabel: {
      type: String,
      trim: true,
      maxlength: [200, "Source label cannot be more than 200 characters"],
    },
    adminNotes: [
      {
        text: { type: String },
        admin: { type: Schema.Types.ObjectId, ref: "Admin" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "handled"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ propertyId: 1 });

const Enquiry: Model<EnquiryDocument> =
  mongoose.models.Enquiry || mongoose.model<EnquiryDocument>("Enquiry", enquirySchema);

export default Enquiry;

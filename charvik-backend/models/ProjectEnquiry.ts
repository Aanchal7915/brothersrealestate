import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ProjectEnquiryDocument extends Document {
  name: string;
  email: string;
  phone: string;
  message?: string;
  specialEnquiry?: string;
  budget?: string;
  purpose?: "investment" | "self-use";
  project: string;
  status: "contacted" | "converted" | "interested" | "not responded";
  createdAt: Date;
  updatedAt: Date;
}

const projectEnquirySchema = new Schema<ProjectEnquiryDocument>(
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
    project: {
      type: String,
      default: "Shapoorji Pallonji Dualis",
    },
    status: {
      type: String,
      enum: ["contacted", "converted", "interested", "not responded"],
      default: "not responded",
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

projectEnquirySchema.index({ status: 1, createdAt: -1 });

const ProjectEnquiry: Model<ProjectEnquiryDocument> =
  mongoose.models.ProjectEnquiry ||
  mongoose.model<ProjectEnquiryDocument>("ProjectEnquiry", projectEnquirySchema);

export default ProjectEnquiry;

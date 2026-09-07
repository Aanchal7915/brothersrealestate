import mongoose, { Schema, type Document, type Model } from "mongoose";

// Developer Partners (requirements doc section 8) — a first-class entity so
// its logo/bio are admin-editable and individual projects can be linked to
// it, instead of the free-text builderName/builderDetails fields on
// Property/FeaturedProject (which stay as-is for projects that don't need a
// full partner profile).
export interface DeveloperDocument extends Document {
  name: string;
  slug: string;
  logo?: { url: string; publicId: string };
  /** Short intro shown in the "About the Developer" section on a project page. */
  bio?: string;
  website?: string;
  /** Lower numbers render first in the Developer Partners strip. */
  order: number;
  /** Hidden from the public site without deleting the record. */
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

function slugify(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const developerSchema = new Schema<DeveloperDocument>(
  {
    name: {
      type: String,
      required: [true, "Please add a developer name"],
      unique: true,
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    logo: {
      url: { type: String },
      publicId: { type: String },
    },
    bio: {
      type: String,
      trim: true,
      // Kept short on purpose — it renders as a card teaser and inside a
      // capped-height "About the Developer" block on project pages.
      maxlength: [300, "Bio cannot be more than 300 characters"],
    },
    website: {
      type: String,
      trim: true,
    },
    order: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

developerSchema.pre("validate", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

const Developer: Model<DeveloperDocument> =
  mongoose.models.Developer || mongoose.model<DeveloperDocument>("Developer", developerSchema);

export default Developer;

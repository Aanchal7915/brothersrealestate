import mongoose, { Schema, type Document, type Model } from "mongoose";

// NEW model (D7 / plan Section 2) — rental categories, referenced by
// ObjectId from Property.rentalCategory rather than a plain string tag, so
// rename/delete-with-cascade can be done cleanly.
export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; publicId: string };
  /** Lower numbers render first in the admin and on the rental strip. */
  order: number;
  /** Where the category was created — each admin page shows only its own. */
  scope: "property" | "rental";
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

const categorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Please add a category name"],
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
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    order: { type: Number, default: 0, index: true },
    scope: {
      type: String,
      enum: ["property", "rental"],
      default: "rental",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-derive a kebab-case slug from the name whenever the name changes.
categorySchema.pre("validate", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

const Category: Model<CategoryDocument> =
  mongoose.models.Category || mongoose.model<CategoryDocument>("Category", categorySchema);

export default Category;

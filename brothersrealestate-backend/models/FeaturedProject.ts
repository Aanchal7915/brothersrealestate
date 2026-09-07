import mongoose, { Schema, type Document, type Model } from "mongoose";

// Featured Listing showcase projects. Deliberately a separate collection from
// `Property`: these are marketing landing pages with their own brochure layout,
// and must never appear in the Listings or Rental listing pages.
export interface FeaturedProjectDocument extends Document {
  title: string;
  slug: string;
  city: string;
  address: string;
  price: number;
  bhk?: number;
  bathrooms?: number;
  area?: string;
  /** Free-text unit mix, e.g. "4 & 5 BHK" or "Retail & Office". Drives the Floor Plan / Price List cards. */
  configuration?: string;
  /** Drives the Property Type filter across the site. */
  propertyType?: "residential" | "commercial" | "rent" | "land";
  possession: "under-construction" | "ready";
  reraNumber?: string;
  description: string;
  /** A single YouTube link — the Video Gallery embeds it. */
  videoUrl?: string;
  highlights: string[];
  amenities: string[];
  images: { url: string; publicId: string }[];
  /** Links this project to a Developer Partner — drives the "About the
   *  Developer" section on the project page. */
  developer?: mongoose.Types.ObjectId | null;
  /** Structured Location & Connectivity list (section 6) — each entry is a
   *  short label like "DLF Cyber City", tagged by one or more kinds so it can
   *  render under every matching group, plus an optional map link. */
  connectivity: {
    kinds: ("school" | "hospital" | "metro" | "highway" | "landmark")[];
    label: string;
    mapLink?: string;
  }[];
  /** Lower numbers render first in the Featured Listing grid. */
  order: number;
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

const featuredProjectSchema = new Schema<FeaturedProjectDocument>(
  {
    title: {
      type: String,
      required: [true, "Please add a project title"],
      trim: true,
      maxlength: [150, "Title cannot be more than 150 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    city: {
      type: String,
      required: [true, "Please add a city"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price cannot be negative"],
    },
    bhk: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    area: { type: String, trim: true },
    configuration: { type: String, trim: true },
    propertyType: {
      type: String,
      enum: ["residential", "commercial", "rent", "land"],
      default: "residential",
      index: true,
    },
    possession: {
      type: String,
      enum: ["under-construction", "ready"],
      default: "under-construction",
    },
    reraNumber: { type: String, trim: true },
    description: {
      type: String,
      required: [true, "Please add a description"],
      trim: true,
    },
    videoUrl: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
    amenities: [{ type: String, trim: true }],
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    developer: {
      type: Schema.Types.ObjectId,
      ref: "Developer",
      default: null,
      index: true,
    },
    connectivity: {
      type: [
        {
          kinds: {
            type: [
              {
                type: String,
                enum: ["school", "hospital", "metro", "highway", "landmark"],
              },
            ],
            validate: {
              validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
              message: "Pick at least one type for each Location & Connectivity entry",
            },
          },
          label: { type: String, required: true, trim: true, maxlength: 120 },
          mapLink: { type: String, trim: true, maxlength: 500 },
        },
      ],
      default: [],
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

// Auto-derive a kebab-case slug from the title whenever the title changes.
featuredProjectSchema.pre("validate", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title);
  }
  next();
});

const FeaturedProject: Model<FeaturedProjectDocument> =
  mongoose.models.FeaturedProject ||
  mongoose.model<FeaturedProjectDocument>("FeaturedProject", featuredProjectSchema);

export default FeaturedProject;

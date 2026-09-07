import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

interface MediaAsset {
  url?: string;
  publicId?: string;
}

interface TitledAsset {
  title?: string;
  image?: MediaAsset;
}

export interface PropertyDocument extends Document {
  title: string;
  description: string;
  price: number;
  bhk: number;
  /** Free-text unit mix, e.g. "4 & 5 BHK" or "Retail & Office". Falls back to `${bhk} BHK`. */
  configuration?: string;
  /** Key selling points shown as a bulleted Highlights section. */
  highlights?: string[];
  /** RERA registration number displayed on the project page. */
  reraNumber?: string;
  /** Residential vs commercial — drives the Property Type filter. */
  propertyType?: "residential" | "commercial" | "rent" | "land";
  /** Construction stage — drives the Property Status filter. */
  possession?: "under-construction" | "ready";
  bathrooms: number;
  city: string;
  address: string;
  area?: string;
  featured: boolean;
  /** Lower numbers render first in the admin and on the public lists. */
  displayOrder: number;
  /** Category chosen in Add Property. Separate from rentalCategory so a
   *  categorised sale listing is never treated as a rental. */
  category?: Types.ObjectId | null;
  /** Links this project to a Developer Partner (section 8). Free-text
   *  builderName/builderDetails below stay for projects with no full profile. */
  developer?: Types.ObjectId | null;
  /** Structured Location & Connectivity list (section 6) — each entry is a
   *  short label like "DLF Cyber City" tagged by kind for the right icon. */
  connectivity: { kind: "school" | "hospital" | "metro" | "highway" | "landmark"; label: string }[];
  collections: string[];
  featuredLocation?: TitledAsset;
  curatedProperty?: TitledAsset;
  amenities: string[];
  images: MediaAsset[];
  video?: MediaAsset;
  videos: MediaAsset[];
  status: "active" | "inactive" | "sold";
  views: number;
  builderName?: string;
  builderDetails?: string;
  ownerName?: string;
  ownerDetails?: string;
  // NEW (D7 / plan Section 2) — first-class rental category reference.
  rentalCategory?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<PropertyDocument>(
  {
    title: {
      type: String,
      required: [true, "Please add a property title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price cannot be negative"],
    },
    bhk: {
      type: Number,
      required: [true, "Please specify BHK"],
      min: [1, "BHK must be at least 1"],
      max: [10, "BHK cannot exceed 10"],
    },
    // Optional display override for the unit mix — lets a project read
    // "4 & 5 BHK" or "Retail & Office" instead of a single number.
    configuration: {
      type: String,
      trim: true,
    },
    // Bulleted key selling points for the project page.
    highlights: {
      type: [String],
      default: [],
    },
    reraNumber: {
      type: String,
      trim: true,
    },
    // Drives the Property Type / Property Status filters on the listings page.
    // "land" replaces "rent" as the third public category (Residential /
    // Commercial / Land) — "rent" stays in the enum so existing rental
    // records already saved with it don't fail validation on their next
    // save; the rental UI itself is commented out, not removed.
    propertyType: {
      type: String,
      enum: ["residential", "commercial", "rent", "land"],
      default: "residential",
      index: true,
    },
    possession: {
      type: String,
      enum: ["under-construction", "ready"],
      default: "ready",
      index: true,
    },
    bathrooms: {
      type: Number,
      required: [true, "Please specify number of bathrooms"],
      min: [1, "Bathrooms must be at least 1"],
      max: [10, "Bathrooms cannot exceed 10"],
    },
    city: {
      type: String,
      required: [true, "Please add a city"],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    developer: {
      type: Schema.Types.ObjectId,
      ref: "Developer",
      default: null,
      index: true,
    },
    connectivity: {
      type: [
        {
          kind: {
            type: String,
            enum: ["school", "hospital", "metro", "highway", "landmark"],
            required: true,
          },
          label: { type: String, required: true, trim: true, maxlength: 120 },
        },
      ],
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    collections: {
      type: [String],
      default: [],
      index: true,
    },
    featuredLocation: {
      title: { type: String, trim: true },
      image: {
        url: { type: String },
        publicId: { type: String },
      },
    },
    curatedProperty: {
      title: { type: String, trim: true },
      image: {
        url: { type: String },
        publicId: { type: String },
      },
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    images: {
      type: [
        {
          url: String,
          publicId: String,
        },
      ],
      default: [],
      validate: {
        validator: function (arr: unknown[]) {
          return arr.length <= 15;
        },
        message: "Cannot upload more than 15 images",
      },
    },
    video: {
      url: String,
      publicId: String,
    },
    videos: {
      type: [
        {
          url: String,
          publicId: String,
        },
      ],
      default: [],
      validate: {
        validator: function (arr: unknown[]) {
          return arr.length <= 2;
        },
        message: "Cannot upload more than 2 videos",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "sold"],
      default: "active",
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    builderName: {
      type: String,
      trim: true,
    },
    builderDetails: {
      type: String,
      trim: true,
    },
    ownerName: {
      type: String,
      trim: true,
    },
    ownerDetails: {
      type: String,
      trim: true,
    },
    rentalCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
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

propertySchema.index({ city: 1, price: 1 });
propertySchema.index({ status: 1, createdAt: -1 });

propertySchema.virtual("isRecent").get(function (this: PropertyDocument) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.createdAt >= thirtyDaysAgo;
});

const Property: Model<PropertyDocument> =
  mongoose.models.Property || mongoose.model<PropertyDocument>("Property", propertySchema);

export default Property;

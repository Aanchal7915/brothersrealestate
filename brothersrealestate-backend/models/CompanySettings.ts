import mongoose, { Schema, type Document, type Model } from "mongoose";

// Singleton document (requirements doc section 13/14) — lets the business
// edit its own contact details, address, and RERA number from the admin
// panel instead of a developer editing frontend source files. Always
// fetched/updated by the fixed id below rather than a query filter.
export const COMPANY_SETTINGS_ID = "company-settings-singleton";

export interface CompanySettingsDocument extends Document<string> {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  /** Company-wide RERA registration — stays blank/hidden on the public site
   *  until the admin fills it in. */
  rera?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  googleMapsUrl?: string;
  updatedAt: Date;
}

const companySettingsSchema = new Schema<CompanySettingsDocument>(
  {
    _id: { type: String, default: COMPANY_SETTINGS_ID },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    rera: { type: String, trim: true },
    facebookUrl: { type: String, trim: true },
    instagramUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    youtubeUrl: { type: String, trim: true },
    googleMapsUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

const CompanySettings: Model<CompanySettingsDocument> =
  mongoose.models.CompanySettings ||
  mongoose.model<CompanySettingsDocument>("CompanySettings", companySettingsSchema);

export default CompanySettings;

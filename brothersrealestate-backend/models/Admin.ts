import mongoose, { Schema, type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface AdminDocument extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  /** Counts wrong security-passcode entries specifically — separate from
   *  password failures above, since it has its own (stricter) threshold. */
  failedPasscodeAttempts: number;
  passcodeLockUntil: Date | null;
  /** When the most recent failure happened, so a stale counter can expire
   *  instead of accumulating across weeks (4 failures today + 1 next month
   *  used to be enough to lock the account). */
  lastFailedLoginAt: Date | null;
  lastFailedPasscodeAt: Date | null;
  /** How many times this account has been locked. Included in the alert
   *  email so repeated rounds are visibly an attack, not a typo. */
  lockCount: number;
  passcodeLockCount: number;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const adminSchema = new Schema<AdminDocument>(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [12, "Password must be at least 12 characters"],
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    failedPasscodeAttempts: {
      type: Number,
      default: 0,
    },
    passcodeLockUntil: {
      type: Date,
    },
    lastFailedLoginAt: {
      type: Date,
      default: null,
    },
    lastFailedPasscodeAt: {
      type: Date,
      default: null,
    },
    lockCount: {
      type: Number,
      default: 0,
    },
    passcodeLockCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving.
// D5 fix: the original hitech-backend code was missing a `return` before
// `next()` when the password wasn't modified, so execution fell through and
// re-hashed whatever was in `this.password` (often `undefined`, since the
// field has `select: false`) on every `.save()` — silently corrupting stored
// hashes on saves that only touched name/email (e.g. updateAdminProfile).
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.matchPassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Admin: Model<AdminDocument> =
  mongoose.models.Admin || mongoose.model<AdminDocument>("Admin", adminSchema);

export default Admin;

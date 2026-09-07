import mongoose from "mongoose";

// Import every model so its schema is registered as a side effect of this
// module loading, regardless of which route handler actually calls
// connectDB(). Without this, a route that only imports Property but calls
// .populate("rentalCategory") can fail in production with "Schema hasn't
// been registered for model 'Category'" — each serverless function bundles
// only what it directly imports, unlike the long-lived dev server process
// where every route's imports eventually get loaded into the same process.
import "../models/Admin";
import "../models/Analytics";
import "../models/Category";
import "../models/Enquiry";
import "../models/FeaturedProject";
import "../models/ProjectEnquiry";
import "../models/Property";
import "../models/User";

const MONGO_URI = process.env.MONGO_URI;

// Cached global mongoose connection singleton, so hot-reload in dev and
// serverless invocations in prod don't open a fresh connection per request.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGO_URI) {
    // Unlike the old Express server (which logged and process.exit(1)'d),
    // a Next.js route handler must not kill the whole server process —
    // throw so the caller can turn it into a JSON error response.
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI)
      .then((m) => {
        console.log(`MongoDB Connected: ${m.connection.host}`);
        return m;
      })
      .catch((error) => {
        cached.promise = null;
        console.error(`MongoDB connection error: ${error.message}`);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;

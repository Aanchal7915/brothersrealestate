import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Adopts errorHandler.js's richer Mongoose/JWT error mapping (CastError,
// duplicate key 11000, ValidationError, JsonWebTokenError, TokenExpiredError)
// — this logic existed in the old backend but was never actually wired up
// in server.js (controllers called next(error) into Express's minimal
// default handler instead). Every route here funnels caught errors through
// this helper.
export function errorResponse(error: unknown): NextResponse {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (error instanceof Error) {
    message = error.message;

    const err = error as Error & {
      name?: string;
      code?: number;
      errors?: Record<string, { message: string }>;
      statusCode?: number;
    };

    if (err.statusCode) {
      statusCode = err.statusCode;
    }

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
      message = "Resource not found";
      statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      message = "Duplicate field value entered";
      statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === "ValidationError" || error instanceof mongoose.Error.ValidationError) {
      const errs = err.errors;
      if (errs) {
        message = Object.values(errs)
          .map((val) => val.message)
          .join(", ");
      }
      statusCode = 400;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
      message = "Invalid token";
      statusCode = 401;
    }

    if (err.name === "TokenExpiredError") {
      message = "Token expired";
      statusCode = 401;
    }
  }

  return NextResponse.json(
    {
      success: false,
      message,
      stack:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.stack
          : undefined,
    },
    { status: statusCode }
  );
}

// Helper for handlers that want to throw a specific status code, mirroring
// the old `res.status(400); throw new Error(...)` pattern from Express
// controllers.
export class HttpError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
}

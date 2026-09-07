import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "./lib/cors";

// Applies CORS headers to every /api/* request and short-circuits OPTIONS
// preflight requests, replacing Express's `cors()` middleware.
export function middleware(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers });
    }

    const response = NextResponse.next();
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message + " " + error.stack : String(error);
    return new NextResponse(JSON.stringify({ error: "Middleware Error", details: errorMessage }), { status: 500 });
  }
}

export const config = {
  matcher: "/api/:path*",
};

import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, isOriginAllowed } from "@/lib/cors";

/**
 * CORS is allow-list driven (see lib/cors.ts).
 *
 * This used to reflect whatever `Origin` the caller sent back in
 * `Access-Control-Allow-Origin` together with `Allow-Credentials: true`,
 * which let any website on the internet call this API from a visitor's
 * browser with their credentials attached. Only listed origins get CORS
 * headers now; everything else is refused at the preflight.
 *
 * Requests with no `Origin` header (server-to-server, curl, health checks)
 * pass through untouched — a browser always sends Origin cross-origin, so
 * withholding the header is what actually blocks the browser case.
 */
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  // This is an API — nothing here should ever be cached by a shared proxy.
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowed = isOriginAllowed(origin);

  if (request.method === "OPTIONS") {
    if (origin && !allowed) {
      return new NextResponse(null, { status: 403 });
    }
    return withSecurityHeaders(
      new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
    );
  }

  const response = NextResponse.next();

  if (allowed) {
    for (const [key, value] of Object.entries(corsHeaders(origin))) {
      response.headers.set(key, value);
    }
  } else if (origin) {
    // Cross-origin request from an origin we don't trust: no CORS headers,
    // so the browser discards the response before the page can read it.
    response.headers.set("Vary", "Origin");
  }

  return withSecurityHeaders(response);
}

export const config = {
  matcher: "/api/:path*",
};

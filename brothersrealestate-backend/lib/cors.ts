// Allow-list for CORS. Drops the old hardcoded hitechhomes/vercel/third-party
// domains from the Express server's cors() config — those were specific to
// the old brand's deployments. Local Vite dev server is always allowed.
//
// Anything not on this list is refused. Add production/preview frontend
// origins through the CORS_ALLOWED_ORIGINS env var (comma-separated) rather
// than editing this file, so a new deployment URL doesn't need a code change.
const STATIC_ALLOWED_ORIGINS = [
  "https://brothersrealestate-swn9.vercel.app",
  "https://brothersrealestate.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
];

/** Origins compare exactly, so normalize away a trailing slash and casing. */
function normalize(origin: string): string {
  return origin.trim().replace(/\/+$/, "").toLowerCase();
}

function envOrigins(): string[] {
  return (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map(normalize)
    .filter(Boolean);
}

export function allowedOrigins(): string[] {
  return Array.from(new Set([...STATIC_ALLOWED_ORIGINS.map(normalize), ...envOrigins()]));
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return allowedOrigins().includes(normalize(origin));
}

/**
 * Headers for an allowed cross-origin request. Returns CORS headers only when
 * the origin is on the list — reflecting an arbitrary Origin back (what the
 * middleware used to do) lets any site on the internet call this API from a
 * logged-in browser.
 */
export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = normalize(origin);
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

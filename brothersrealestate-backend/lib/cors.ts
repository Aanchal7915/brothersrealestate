// Allow-list for CORS. Drops the old hardcoded hitechhomes/vercel/third-party
// domains from the Express server's cors() config — those were specific to
// the old brand's deployments. Local Vite dev server is always allowed.
export const ALLOWED_ORIGINS = [
  "https://brothersrealestate-swn9.vercel.app",
  "https://brothersrealestate.vercel.app",
  "http://localhost:5173", 
  "http://localhost:3000", 
  "http://localhost:3001"
];

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

export function corsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Vary"] = "Origin";
  }

  return headers;
}

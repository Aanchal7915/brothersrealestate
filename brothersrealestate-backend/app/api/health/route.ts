import { NextResponse } from "next/server";

// Force dynamic so the timestamp (and DB connectivity, once checked) is
// computed per-request rather than frozen at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
}

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || "*";

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Allow-Credentials", "true");

    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers });
    }

    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");

    return response;
  } catch (error) {
    const details = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
    return new NextResponse(JSON.stringify({ error: "Middleware Error", details }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  matcher: "/__diagnostic_never_matches__",
};

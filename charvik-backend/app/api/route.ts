import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Root route — mirrors the old server.js "/" payload, rebranded per plan
// Section 3 ("Hi-Tech Homes API" -> "Brothers Realestate API").
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Brothers Realestate API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      properties: "/api/properties",
      users: "/api/users",
      admin: "/api/admin",
      enquiries: "/api/enquiries",
      analytics: "/api/analytics",
      chatbot: "/api/chatbot",
      dashboard: "/api/dashboard",
      projectEnquiries: "/api/project-enquiries",
      categories: "/api/categories",
    },
  });
}

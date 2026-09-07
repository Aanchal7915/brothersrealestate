import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errorResponse";
import Property from "@/models/Property";
import Enquiry from "@/models/Enquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/dashboard/stats — protect (matches the Express route exactly;
// the frontend's DashboardStats.jsx calls `/dashboard/stats`)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalProperties = await Property.countDocuments();

    const propertiesThisMonth = await Property.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });

    const propertiesLastMonth = await Property.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });

    const propertiesGrowth =
      propertiesLastMonth > 0
        ? (((propertiesThisMonth - propertiesLastMonth) / propertiesLastMonth) * 100).toFixed(1)
        : propertiesThisMonth > 0
          ? 100
          : 0;

    const activeListings = await Property.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      status: "active",
    });

    const totalEnquiries = await Enquiry.countDocuments();

    const enquiriesThisMonth = await Enquiry.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });

    const enquiriesLastMonth = await Enquiry.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });

    const enquiriesGrowth =
      enquiriesLastMonth > 0
        ? (((enquiriesThisMonth - enquiriesLastMonth) / enquiriesLastMonth) * 100).toFixed(1)
        : enquiriesThisMonth > 0
          ? 100
          : 0;

    const pendingEnquiries = await Enquiry.countDocuments({ status: "pending" });
    const handledEnquiries = await Enquiry.countDocuments({ status: "handled" });

    const cityStats = await Property.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const popularCity = cityStats.length > 0 ? cityStats[0]._id : "N/A";

    const priceStats = await Property.aggregate([
      { $group: { _id: null, avgPrice: { $avg: "$price" } } },
    ]);
    const avgPrice = priceStats.length > 0 ? Math.round(priceStats[0].avgPrice) : 0;

    const bhkStats = await Property.aggregate([
      { $group: { _id: "$bhk", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const popularBHK = bhkStats.length > 0 ? bhkStats[0]._id : "N/A";

    return NextResponse.json({
      success: true,
      stats: {
        properties: {
          total: totalProperties,
          thisMonth: propertiesThisMonth,
          lastMonth: propertiesLastMonth,
          growth: parseFloat(propertiesGrowth as unknown as string),
          active: activeListings,
        },
        enquiries: {
          total: totalEnquiries,
          thisMonth: enquiriesThisMonth,
          lastMonth: enquiriesLastMonth,
          growth: parseFloat(enquiriesGrowth as unknown as string),
          pending: pendingEnquiries,
          handled: handledEnquiries,
        },
        insights: { popularCity, avgPrice, popularBHK },
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

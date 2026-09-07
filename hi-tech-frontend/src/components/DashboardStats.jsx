import {
  Building2,
  FileText,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { EnquiryContext } from "../context/EnquiryContext";
import api from "../utils/api";

const DashboardStats = ({ properties }) => {
  const { stats: enquiryStats } = useContext(EnquiryContext);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch comprehensive stats from backend
  useEffect(() => {
    fetchDashboardStats();
  }, [properties, enquiryStats]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      if (response.data.success) {
        setDashboardStats(response.data.stats);
      }
    } catch (error) {
      console.error("❌ Failed to fetch dashboard stats:", error);
      // Fallback to local calculation
      calculateLocalStats();
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Calculate stats locally if API fails
  const calculateLocalStats = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Properties growth
    const propertiesThisMonth = properties.filter(
      (p) => new Date(p.createdAt) >= lastMonth
    ).length;
    const propertiesLastMonth = properties.filter(
      (p) =>
        new Date(p.createdAt) >= twoMonthsAgo &&
        new Date(p.createdAt) < lastMonth
    ).length;

    const propertiesGrowth =
      propertiesLastMonth > 0
        ? (
            ((propertiesThisMonth - propertiesLastMonth) /
              propertiesLastMonth) *
            100
          ).toFixed(1)
        : propertiesThisMonth > 0
        ? 100
        : 0;

    // Active listings
    const activeListings = properties.filter(
      (p) => new Date(p.createdAt) >= thirtyDaysAgo
    ).length;

    setDashboardStats({
      properties: {
        total: properties.length,
        growth: parseFloat(propertiesGrowth),
        active: activeListings,
      },
      enquiries: {
        total: enquiryStats.total,
        growth: 12.5, // Placeholder
        pending: enquiryStats.pending,
        handled: enquiryStats.handled,
      },
    });
  };

  // Get stats data (from API or local calculation)
  const getStatsData = () => {
    if (dashboardStats) {
      return [
        {
          label: "Total Properties",
          value: dashboardStats.properties.total,
          icon: Building2,
          color: "#2563eb",
          bgGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
          growth: dashboardStats.properties.growth,
        },
        {
          label: "Total Enquiries",
          value: dashboardStats.enquiries.total,
          icon: FileText,
          color: "#dc2626",
          bgGradient: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
          growth: dashboardStats.enquiries.growth,
        },
        {
          label: "Active Listings",
          value: dashboardStats.properties.active,
          icon: TrendingUp,
          color: "#10b981",
          bgGradient: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          growth:
            dashboardStats.properties.active > 0
              ? (
                  (dashboardStats.properties.active /
                    dashboardStats.properties.total) *
                  100
                ).toFixed(1)
              : 0,
        },
      ];
    }

    // Loading state
    return [
      {
        label: "Total Properties",
        value: "...",
        icon: Building2,
        color: "#2563eb",
        bgGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
        growth: 0,
      },
      {
        label: "Total Enquiries",
        value: "...",
        icon: FileText,
        color: "#dc2626",
        bgGradient: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
        growth: 0,
      },
      {
        label: "Active Listings",
        value: "...",
        icon: TrendingUp,
        color: "#10b981",
        bgGradient: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        growth: 0,
      },
    ];
  };

  const stats = getStatsData();

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  };

  const cardStyle = (index) => ({
    background: "white",
    borderRadius: "0.75rem",
    padding: "1.25rem",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    animation: `scaleUp 0.5s ease-out ${0.1 * (index + 1)}s backwards`,
    cursor: "pointer",
    border: "1px solid rgba(0, 0, 0, 0.05)",
  });

  const cardHoverStyle = {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)",
  };

  const cardHeaderStyle = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
  };

  const cardLeftStyle = {
    flex: 1,
  };

  const cardTitleStyle = {
    color: "#6b7280",
    fontSize: "0.8rem",
    fontWeight: 600,
    marginBottom: "0.375rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const cardValueStyle = {
    fontSize: "1.75rem",
    fontWeight: 900,
    color: "#111827",
    marginBottom: "0.375rem",
    fontFamily: "'Poppins', sans-serif",
  };

  const iconContainerStyle = (bgGradient) => ({
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "0.625rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    background: bgGradient,
    animation: "pulse 3s ease-in-out infinite",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  });

  const changeStyle = (growth) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: growth >= 0 ? "#10b981" : "#ef4444",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.5rem",
    backgroundColor: growth >= 0 ? "#f0fdf4" : "#fef2f2",
    width: "fit-content",
  });

  return (
    <>
      <style>{`
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .loading-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <div style={gridStyle}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const isPositiveGrowth = stat.growth >= 0;
          const GrowthIcon = isPositiveGrowth ? TrendingUp : TrendingDown;
          const isLoading = stat.value === "...";

          return (
            <div
              key={idx}
              style={cardStyle(idx)}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = cardHoverStyle.transform;
                  e.currentTarget.style.boxShadow = cardHoverStyle.boxShadow;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div style={cardHeaderStyle}>
                <div style={cardLeftStyle}>
                  <p style={cardTitleStyle}>
                    {stat.label}
                    {!isLoading && idx === 2 && (
                      <Sparkles
                        style={{
                          width: "1rem",
                          height: "1rem",
                          color: "#10b981",
                        }}
                      />
                    )}
                  </p>
                  <p
                    style={cardValueStyle}
                    className={isLoading ? "loading-shimmer" : ""}
                  >
                    {isLoading ? "..." : stat.value}
                  </p>
                  {!isLoading && (
                    <div style={changeStyle(stat.growth)}>
                      <GrowthIcon style={{ width: "1rem", height: "1rem" }} />
                      <span>
                        {isPositiveGrowth ? "+" : ""}
                        {stat.growth}%
                        {idx === 2 ? " active now" : " vs last month"}
                      </span>
                    </div>
                  )}
                </div>
                <div style={iconContainerStyle(stat.bgGradient)}>
                  <Icon
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: stat.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default DashboardStats;


import { useContext, useEffect, useState } from "react";
import { EnquiryContext } from "../context/EnquiryContext";
import { Mail, Phone, Clock } from "lucide-react";
import {
  Edit,
  Trash2,
  Building2,
  Search,
  LogOut,
  AlertCircle,
  Star,
} from "lucide-react";
import { PropertyContext } from "../context/PropertyContext";
import AdminSidebar from "../components/AdminSidebar";
import DashboardStats from "../components/DashboardStats";
import Loader from "../components/Loader";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = ({ setCurrentPage, selectedPropertyId, setSelectedPropertyId }) => {
  const { properties, fetchProperties } = useContext(PropertyContext);
  const { stats: enquiryStats, fetchRecentEnquiries } = useContext(EnquiryContext);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");

    if (!token) {
      console.log("❌ No token found - redirecting to login");
      setTimeout(() => {
        alert("Please login to access the dashboard");
        setCurrentPage("admin-login");
      }, 100);
    } else {
      console.log("✅ Token found:", token.substring(0, 30) + "...");
      fetchProperties();
      loadRecentEnquiries();
    }

    setAuthChecked(true);
  }, []);

  const loadRecentEnquiries = async () => {
    const recent = await fetchRecentEnquiries();
    setRecentEnquiries(recent || []);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      localStorage.clear();
      alert("Logged out successfully!");
      setCurrentPage("home");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      setLoading(true);
      try {
        const response = await api.delete(`/properties/${id}`);
        console.log("✅ Delete response:", response.data);

        await fetchProperties();
        alert("Property deleted successfully!");
      } catch (error) {
        console.error("❌ Delete Error:", {
          status: error.response?.status,
          message: error.response?.data?.message,
          fullError: error,
        });

        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.clear();
          setCurrentPage("admin-login");
        } else {
          alert(
            `Failed to delete: ${
              error.response?.data?.message || error.message
            }`
          );
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleFeatured = async (id, currentFeaturedStatus) => {
    setLoading(true);
    try {
      const response = await api.put(`/properties/${id}/toggle-featured`);
      console.log("✅ Featured status updated:", response.data);
      
      await fetchProperties();
      const action = !currentFeaturedStatus ? "marked as featured" : "removed from featured";
      alert(`Property ${action} successfully!`);
    } catch (error) {
      console.error("❌ Toggle Featured Error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        fullError: error,
      });

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        setCurrentPage("admin-login");
      } else {
        alert(
          `Failed to update: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditProperty = (propertyId) => {
    setSelectedPropertyId(propertyId);
    setCurrentPage("edit-property");
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ivory">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      <AdminSidebar
        currentPage="admin-dashboard"
        setCurrentPage={setCurrentPage}
      />
      <div className="flex-1 p-5 pt-24 md:p-6 md:pt-24">
        {/* Auth Warning Banner */}
        {!localStorage.getItem("token") && !localStorage.getItem("userToken") && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Not Authenticated!</span>
            <button
              onClick={() => setCurrentPage("admin-login")}
              className="ml-auto bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Header Section - Centered */}
        <div className="mb-6">
          <div className="flex flex-col items-center justify-center text-center mb-4">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-black bg-matte bg-clip-text text-transparent">
                Dashboard
              </h1>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Manage your properties and view statistics
            </p>
          </div>
        </div>

        <DashboardStats properties={properties} />

        {/* Enquiry Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-matte">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold mb-1">Total Enquiries</p>
                <p className="text-2xl font-black text-gray-900">{enquiryStats.total}</p>
              </div>
              <div className="w-11 h-11 bg-matte rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-matte" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold mb-1">Pending</p>
                <p className="text-2xl font-black text-gray-900">{enquiryStats.pending}</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold mb-1">Handled</p>
                <p className="text-2xl font-black text-gray-900">{enquiryStats.handled}</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Enquiries Section */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-matte" />
              Recent Enquiries
            </h2>
            <button
              onClick={() => setCurrentPage("admin-enquiries")}
              className="text-matte hover:text-matte font-semibold text-sm hover:underline"
            >
              View All →
            </button>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No enquiries yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEnquiries.map((enquiry) => (
                <div
                  key={enquiry._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-ivory transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-gray-900">{enquiry.name}</p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          enquiry.status === "pending"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{enquiry.email}</p>
                    {enquiry.propertyId && (
                      <p className="text-xs text-matte mt-1">
                        Property: {enquiry.propertyId.title}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(enquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Properties Table Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-gray-900">
              All Properties
            </h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-matte focus:border-matte outline-none transition-all w-52"
              />
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-10">
              <div className="bg-gray-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                No properties found
              </h3>
              <p className="text-gray-500 text-sm">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start by adding your first property"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      BHK
                    </th>
                    <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-3 py-2 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProperties.map((property) => (
                    <tr
                      key={property._id}
                      className="hover:bg-ivory/60 transition-colors duration-200 group"
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              property.image ||
                              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100"
                            }
                            alt={property.title}
                            className="w-9 h-9 rounded-md object-cover"
                          />
                          <span className="font-semibold text-gray-900 text-sm">
                            {property.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-gray-700 text-sm">
                          {property.city}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-bold text-gold-dark text-sm">
                          ₹{property.price?.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-ivory text-matte">
                          {property.bhk} BHK
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleToggleFeatured(property._id, property.featured)}
                          className={`p-1 rounded-lg transition-all duration-200 ${
                            property.featured
                              ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                          title={property.featured ? "Remove from featured" : "Mark as featured"}
                          disabled={loading}
                        >
                          <Star className="w-3.5 h-3.5" fill={property.featured ? "currentColor" : "none"} />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEditProperty(property._id)}
                            className="p-1 text-matte hover:bg-ivory rounded-lg transition-all duration-200"
                            title="Edit property"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(property._id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Delete property"
                            disabled={loading}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Property Count */}
          {filteredProperties.length > 0 && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              Showing {filteredProperties.length} of {properties.length}{" "}
              properties
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
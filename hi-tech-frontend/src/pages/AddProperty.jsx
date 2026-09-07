import { useState, useContext, useEffect } from "react";
import { PropertyContext } from "../context/PropertyContext";
import { DeveloperContext } from "../context/DeveloperContext";
import { FeaturedProjectContext } from "../context/FeaturedProjectContext";
import AdminSidebar from "../components/AdminSidebar";
import AdminBackButton from "../components/admin/AdminBackButton";
import Loader from "../components/Loader";
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Home,
  MapPin,
  IndianRupee,
  Bed,
  Bath,
  Maximize,
  Sparkles,
  Plus,
  Building2,
  Edit,
  Trash2,
  Star,
  Info,
  User,
} from "lucide-react";
import { PROPERTY_TYPE_OPTIONS } from "../utils/propertyType";
import { useDragReorder, DragHandle, move } from "../components/admin/ReorderControls";
import api from "../utils/api";

const AddProperty = ({ setCurrentPage, setSelectedPropertyId }) => {
  const { properties, loading: propertiesLoading, fetchProperties } = useContext(PropertyContext);
  const { developers, fetchDevelopers } = useContext(DeveloperContext);
  const { findFeatured } = useContext(FeaturedProjectContext);
  // Always land on the properties list (even when empty) - the form only
  // opens when "Add Property" is clicked, matching the Rental Categories page.
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) {
      setCurrentPage("admin-login");
    }
  }, [setCurrentPage]);

  // Rentals and Featured Listing projects are managed on their own pages, so
  // this table only shows what was actually added through "Add Property".
  const saleProperties = (properties || []).filter(
    (p) => !p.rentalCategory && !findFeatured(p)
  );

  // Reordering rewrites displayOrder across the list so it stays a clean
  // 0..n sequence, then refetches.
  const moveProperty = async (from, to) => {
    if (to < 0 || to >= saleProperties.length || reordering) return;
    setReordering(true);
    try {
      const next = move(saleProperties, from, to);
      await Promise.all(
        next.map((p, i) => {
          if (p.displayOrder === i) return null;
          const fd = new FormData();
          fd.append("displayOrder", String(i));
          return api.put(`/properties/${p._id}`, fd);
        })
      );
      await fetchProperties("?limit=200");
    } catch (err) {
      console.error("Reorder error:", err);
      alert(err.response?.data?.message || "Could not reorder. Please try again.");
    } finally {
      setReordering(false);
    }
  };

  const rowDrag = useDragReorder((a, b) => moveProperty(a, b), { disabled: reordering });

  // Creates a Developer Partner and selects it straight away.
  const handleCreateDeveloper = async () => {
    const name = newDeveloperName.trim();
    if (!name) return;
    setSavingDeveloper(true);
    setDeveloperError("");
    try {
      const fd = new FormData();
      fd.append("name", name);
      const res = await api.post("/developers", fd);
      if (res.data?.success) {
        await fetchDevelopers();
        setSelectedDeveloper(res.data.data._id);
        setCreatingDeveloper(false);
        setNewDeveloperName("");
      }
    } catch (err) {
      console.error("Create developer error:", err);
      setDeveloperError(err.response?.data?.message || "Could not create the developer.");
    } finally {
      setSavingDeveloper(false);
    }
  };

  const handleEditProperty = (propertyId) => {
    setSelectedPropertyId(propertyId);
    setCurrentPage("edit-property");
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    setActionLoading(id);
    try {
      await api.delete(`/properties/${id}`);
      await fetchProperties();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete property");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (id, currentFeaturedStatus) => {
    setActionLoading(id);
    try {
      await api.put(`/properties/${id}/toggle-featured`);
      await fetchProperties();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update featured status");
    } finally {
      setActionLoading(null);
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    address: "",
    bhk: "",
    area: "",
    bathrooms: "",
    propertyType: "residential",
    amenities: "",
    builderName: "",
    builderDetails: "",
    ownerName: "",
    ownerDetails: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  // Shown inside the video section itself — the banner at the top of this long
  // form is off-screen while the admin is working down here, which made a
  // rejected upload look like nothing happened at all.
  const [videoError, setVideoError] = useState("");
  const [selectedDeveloper, setSelectedDeveloper] = useState("");
  const [creatingDeveloper, setCreatingDeveloper] = useState(false);
  const [newDeveloperName, setNewDeveloperName] = useState("");
  const [savingDeveloper, setSavingDeveloper] = useState(false);
  const [developerError, setDeveloperError] = useState("");
  const [isFeaturedLocation, setIsFeaturedLocation] = useState(false);
  const [existingFeaturedLocations, setExistingFeaturedLocations] = useState([]);
  const [existingCuratedProperties, setExistingCuratedProperties] = useState([]);
  const [selectedFeaturedLocation, setSelectedFeaturedLocation] = useState("");
  const [newFeaturedTitle, setNewFeaturedTitle] = useState("");
  const [featuredLocationFile, setFeaturedLocationFile] = useState(null);
  const [featuredLocationPreview, setFeaturedLocationPreview] = useState(null);
  // Curated property fields (mirror featured location behavior)
  const [isCuratedProperty, setIsCuratedProperty] = useState(false);
  const [selectedCuratedProperty, setSelectedCuratedProperty] = useState("");
  const [newCuratedTitle, setNewCuratedTitle] = useState("");
  const [curatedPropertyFile, setCuratedPropertyFile] = useState(null);
  const [curatedPropertyPreview, setCuratedPropertyPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (imageFiles.length + files.length > 15) {
      setError("Maximum 15 images allowed");
      return;
    }

    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError("Each image must be less than 5MB");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setError("");
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files || []);
    // Let the same file be picked again after an error, otherwise the input
    // keeps the old value and never fires change a second time.
    e.target.value = "";
    if (files.length === 0) return;

    const room = 2 - videoFiles.length;
    if (files.length > room) {
      const msg =
        room <= 0
          ? "You can add at most 2 videos. Remove one to add another."
          : `Only ${room} more video can be added (2 in total).`;
      setError(msg);
      setVideoError(msg);
      return;
    }

    const invalidFiles = files.filter((file) => file.size > 50 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      const msg = `"${invalidFiles[0].name}" is larger than 50MB. Please compress it and try again.`;
      setError(msg);
      setVideoError(msg);
      return;
    }

    setVideoError("");
    setVideoFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setError("");
  };

  const handleFeaturedLocationFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Featured location image must be less than 5MB");
      return;
    }
    setFeaturedLocationFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFeaturedLocationPreview(reader.result);
    reader.readAsDataURL(file);
    setError("");
  };

  const handleCuratedPropertyFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Curated property image must be less than 5MB");
      return;
    }
    setCuratedPropertyFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCuratedPropertyPreview(reader.result);
    reader.readAsDataURL(file);
    setError("");
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideoFiles([]);
    setVideoPreviews([]);
    setVideoError("");
  };

  // The browser silently refuses to submit when a field fails validation — it
  // only shows a native tooltip on that field, which is invisible when the
  // admin is at the bottom of this long form. Surface it as a real message.
  const handleInvalidField = (e) => {
    const label =
      e.target.labels?.[0]?.innerText?.replace(/\s*\*\s*$/, "").trim() ||
      e.target.placeholder ||
      "A required field";
    const msg = `${label}: ${e.target.validationMessage}`;
    setError(msg);
    alert(msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("bhk", formData.bhk);
      formDataToSend.append("propertyType", formData.propertyType);
      formDataToSend.append("bathrooms", formData.bathrooms);
      if (formData.area) formDataToSend.append("area", formData.area);
      if (formData.amenities)
        formDataToSend.append("amenities", formData.amenities);
      if (formData.builderName) formDataToSend.append("builderName", formData.builderName);
      if (formData.builderDetails) formDataToSend.append("builderDetails", formData.builderDetails);
      if (formData.ownerName) formDataToSend.append("ownerName", formData.ownerName);
      if (formData.ownerDetails) formDataToSend.append("ownerDetails", formData.ownerDetails);
      if (selectedDeveloper) formDataToSend.append("developer", selectedDeveloper);

      imageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      videoFiles.forEach((file) => {
        formDataToSend.append("videos", file);
      });

      // Featured location fields
      if (isFeaturedLocation) {
        // If selected existing location, use that title
        if (selectedFeaturedLocation) {
          formDataToSend.append("featuredLocationTitle", selectedFeaturedLocation);
        } else if (newFeaturedTitle) {
          formDataToSend.append("featuredLocationTitle", newFeaturedTitle);
          if (featuredLocationFile) {
            formDataToSend.append("featuredLocationImage", featuredLocationFile);
          }
        }
      }

      // Curated property fields
      if (isCuratedProperty) {
        if (selectedCuratedProperty) {
          formDataToSend.append("curatedPropertyTitle", selectedCuratedProperty);
        } else if (newCuratedTitle) {
          formDataToSend.append("curatedPropertyTitle", newCuratedTitle);
          if (curatedPropertyFile) {
            formDataToSend.append("curatedPropertyImage", curatedPropertyFile);
          }
        }
      }

      const response = await api.post("/properties", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        await fetchProperties("?limit=200");
        // Stay on this page and show the updated list, so several properties
        // can be added in a row without bouncing to the dashboard.
        setFormData({
          title: "",
          description: "",
          price: "",
          city: "",
          address: "",
          bhk: "",
          area: "",
          bathrooms: "",
          propertyType: "residential",
          amenities: "",
          builderName: "",
          builderDetails: "",
          ownerName: "",
          ownerDetails: "",
        });
        setImageFiles([]);
        setImagePreviews([]);
        setVideoFiles([]);
        setVideoPreviews([]);
        setSelectedDeveloper("");
        setIsFeaturedLocation(false);
        setIsCuratedProperty(false);
        setTimeout(() => {
          setSuccess(false);
          setShowForm(false);
        }, 1800);
      }
    } catch (error) {
      console.error("Error adding property:", error);
      const msg = error.response?.data?.message || "Failed to add property. Please try again.";
      setError(msg);
      alert(msg);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        currentPage="add-property"
        setCurrentPage={setCurrentPage}
      />
      <div className="flex-1 bg-gradient-to-br from-ivory to-red-50 p-4 md:p-6 pt-20 md:pt-24">
        <div className="max-w-5xl mx-auto">
          {!showForm ? (
            <>
              {/* Properties List */}
              <AdminBackButton setCurrentPage={setCurrentPage} label="Back" />
              <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-matte to-red-600 bg-clip-text text-transparent mb-1">
                    Properties
                  </h1>
                  <p className="text-gray-600 text-xs md:text-sm">
                    Manage your listed properties, or add a new one
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-matte to-matte hover:from-matte hover:to-matte text-white rounded-lg font-bold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  <Plus size={16} />
                  Add Property
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {propertiesLoading ? (
                  <div className="p-10">
                    <Loader />
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    <Building2 size={32} className="mx-auto mb-3 text-gray-300" />
                    No properties yet. Click "Add Property" to create one.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Property</th>
                          <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">City</th>
                          <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Price</th>
                          <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">BHK</th>
                          <th className="px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider">Featured</th>
                          <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {saleProperties.map((property, rowIndex) => (
                          <tr
                            key={property._id}
                            {...rowDrag.dragProps(rowIndex)}
                            className={`hover:bg-ivory/60 transition-colors ${
                              rowDrag.draggingIndex === rowIndex ? "opacity-40" : ""
                            } ${
                              rowDrag.overIndex === rowIndex &&
                              rowDrag.draggingIndex !== rowIndex
                                ? "border-t-2 border-gold"
                                : ""
                            }`}
                          >
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-3">
                                <DragHandle label="Drag to reorder property" />
                                <img
                                  src={
                                    property.images?.[0]?.url ||
                                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100"
                                  }
                                  alt={property.title}
                                  className="w-11 h-11 rounded-lg object-cover shadow-sm"
                                />
                                <span className="font-semibold text-gray-900 text-sm">{property.title}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-sm text-gray-700 font-medium">{property.city}</td>
                            <td className="px-4 py-2.5 text-sm font-bold text-matte">
                              ₹{property.price?.toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ivory text-matte">
                                {property.bhk} BHK
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <button
                                onClick={() => handleToggleFeatured(property._id, property.featured)}
                                disabled={actionLoading === property._id}
                                className={`p-1.5 rounded-lg transition-all duration-200 ${
                                  property.featured
                                    ? "bg-gold/15 text-gold-dark hover:bg-gold/25"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}
                                title={property.featured ? "Remove from featured" : "Mark as featured"}
                              >
                                <Star className="w-4 h-4" fill={property.featured ? "currentColor" : "none"} />
                              </button>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <div className="flex justify-end items-center gap-1.5">
                                <button
                                  onClick={() => handleEditProperty(property._id)}
                                  className="p-1.5 text-gold-dark hover:bg-ivory rounded-lg transition-colors"
                                  title="Edit property"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProperty(property._id)}
                                  disabled={actionLoading === property._id}
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                  title="Delete property"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
          <>
          {/* Header Section */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-4">
              {/* <Sparkles className="w-10 h-10 text-gold-dark" /> */}
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-matte to-red-600 bg-clip-text text-transparent">
                Add Property
              </h1>
              {/* <Sparkles className="w-10 h-10 text-red-600" /> */}
            </div>
            <p className="text-sm text-gray-600 font-medium max-w-2xl mx-auto">
              List your premium property and reach thousands of potential buyers
            </p>
          </div>

          {success && (
            <div className="bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-500 text-green-900 p-5 rounded-2xl mb-6 shadow-lg">
              <p className="font-bold text-lg mb-1">🎉 Success!</p>
              <p className="text-sm">
                Property added successfully. It's now in your properties list below.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-r from-red-100 to-red-200 border-2 border-red-500 text-red-900 p-5 rounded-2xl mb-6 shadow-lg">
              <p className="font-bold text-lg mb-1">⚠️ Error!</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 md:p-7 shadow-lg border border-white/50">
            <form onSubmit={handleSubmit} onInvalid={handleInvalidField}>
              {/* Property Details Section */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="text-gold-dark" />
                  Property Details
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Home size={18} className="text-gold-dark" />
                      Property Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      placeholder="e.g., Luxury 3BHK Villa in Bandra West"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPin size={18} className="text-gold-dark" />
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                      placeholder="Mumbai"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <IndianRupee size={18} className="text-gold-dark" />
                      Price (₹) *
                    </label>
                    {/* step is 1, not 1000 — a round-thousand rule rejected
                        legitimate prices (a ₹8,500 rent) and blocked the whole
                        save with only a native tooltip to explain it. */}
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      placeholder="5000000"
                      min="0"
                      step="1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-600 focus:ring-4 focus:ring-red-100 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPin size={18} className="text-gold-dark" />
                      Full Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                      placeholder="123 Main Street, Bandra West, Mumbai - 400050"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications Section */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bed className="text-gold-dark" />
                  Specifications
                </h2>

                {/* Developer — links this project to a Developer Partner for the
                    "About the Developer" section; pick an existing one or create inline. */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Building2 size={18} className="text-gold-dark" />
                    Developer (optional)
                  </label>

                  {creatingDeveloper ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={newDeveloperName}
                        onChange={(e) => setNewDeveloperName(e.target.value)}
                        placeholder="New developer name"
                        className="min-w-[200px] flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleCreateDeveloper}
                        disabled={savingDeveloper || !newDeveloperName.trim()}
                        className="rounded-lg bg-matte px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-matte disabled:opacity-50"
                      >
                        {savingDeveloper ? "Saving..." : "Create"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCreatingDeveloper(false);
                          setNewDeveloperName("");
                          setDeveloperError("");
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={selectedDeveloper}
                        onChange={(e) => setSelectedDeveloper(e.target.value)}
                        className="min-w-[200px] flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                      >
                        <option value="">-- No Developer --</option>
                        {developers.map((dev) => (
                          <option key={dev._id} value={dev._id}>
                            {dev.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setCreatingDeveloper(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-matte transition-colors hover:border-matte hover:bg-ivory"
                      >
                        <Plus size={15} />
                        New Developer
                      </button>
                    </div>
                  )}
                  {developerError && (
                    <p className="mt-1.5 text-xs text-red-600">{developerError}</p>
                  )}
                </div>

                {/* Property Type — drives the Property Type filter site-wide */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Building2 size={18} className="text-gold-dark" />
                    Property Type *
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) =>
                      setFormData({ ...formData, propertyType: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                  >
                    {PROPERTY_TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Bed size={18} className="text-gold-dark" />
                      BHK *
                    </label>
                    <input
                      type="number"
                      value={formData.bhk}
                      onChange={(e) =>
                        setFormData({ ...formData, bhk: e.target.value })
                      }
                      required
                      placeholder="3"
                      min="1"
                      max="10"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Bath size={18} className="text-gold-dark" />
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bathrooms: e.target.value })
                      }
                      required
                      placeholder="2"
                      min="1"
                      max="10"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Maximize size={18} className="text-gold-dark" />
                      Area (sq.ft)
                    </label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                      placeholder="1200"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Description & Amenities */}
              <div className="mb-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    placeholder="Describe your property in detail - location benefits, unique features, nearby amenities..."
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all resize-vertical"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amenities (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) =>
                      setFormData({ ...formData, amenities: e.target.value })
                    }
                    placeholder="Swimming Pool, Gym, Parking, 24/7 Security, Power Backup"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Builder & Owner Details */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="text-gold-dark" />
                  Builder & Owner Details (Optional)
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Builder Name</label>
                    <input type="text" value={formData.builderName} onChange={(e) => setFormData({ ...formData, builderName: e.target.value })} placeholder="e.g. DLF" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Builder Details</label>
                    <input type="text" value={formData.builderDetails} onChange={(e) => setFormData({ ...formData, builderDetails: e.target.value })} placeholder="e.g. 10 years experience" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Name</label>
                    <input type="text" value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} placeholder="e.g. John Doe" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Details</label>
                    <input type="text" value={formData.ownerDetails} onChange={(e) => setFormData({ ...formData, ownerDetails: e.target.value })} placeholder="e.g. Contact info or preferences" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Media Upload Section */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="text-gold-dark" />
                  Media Upload
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {/* Images Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Property Images 
                    </label>
                    <button
                      type="button"
                      onClick={() => document.getElementById("images").click()}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-gold to-gold text-white rounded-lg font-semibold text-sm hover:from-matte hover:to-matte transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <ImageIcon size={16} />
                      Upload Images
                    </button>
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      PNG, JPG, WEBP up to 5MB each
                    </p>

                    {imagePreviews.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {imagePreviews.map((preview, index) => (
                          <div
                            key={index}
                            className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md"
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Property Video (Optional){" "}
                      <span className="font-normal text-gray-500">
                        ({videoFiles.length} of 2 used)
                      </span>
                    </label>
                    <button
                      type="button"
                      disabled={videoFiles.length >= 2}
                      onClick={() => document.getElementById("video").click()}
                      className={`w-full px-4 py-2.5 ${
                        videoFiles.length >= 2
                          ? "bg-gray-300 cursor-not-allowed"
                          : videoFiles.length > 0
                            ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            : "bg-gradient-to-r from-red-400 to-red-400 hover:from-red-400 hover:to-red-700"
                      } text-white rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
                    >
                      <Video size={16} />
                      {videoFiles.length >= 2
                        ? "Limit reached — remove a video first"
                        : videoFiles.length > 0
                          ? `${videoFiles.length} video(s) ready`
                          : "Upload Video(s)"}
                    </button>
                    {videoError && (
                      <p className="mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                        {videoError}
                      </p>
                    )}
                    <input
                      id="video"
                      type="file"
                      accept="video/*" 
                      multiple
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      MP4, MOV up to 50MB
                    </p>

                    {videoPreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 gap-3">
                        {videoPreviews.map((preview, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-100 rounded-xl">
                            <div className="flex items-center gap-3">
                              <video src={preview} className="w-40 h-24 object-cover rounded-md" controls />
                              <span className="text-sm text-gray-700 font-medium">Video {idx + 1}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setVideoFiles((prev) => prev.filter((_, i) => i !== idx));
                                setVideoPreviews((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Featured Location Section */}
              <div className="mb-8">
                  <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="text-gold-dark" />
                    Featured Location (optional)
                  </h2>

                  <div className="flex items-center gap-4 mb-4">
                    <input
                      id="featuredToggle"
                      type="checkbox"
                      checked={isFeaturedLocation}
                      onChange={(e) => {
                        setIsFeaturedLocation(e.target.checked);
                        if (e.target.checked) {
                          api.get('/properties/locations/featured')
                            .then(res => {
                              const manual = res.data?.data?.manual || [];
                              setExistingFeaturedLocations(manual);
                            })
                            .catch(() => setExistingFeaturedLocations([]));
                        } else {
                          setSelectedFeaturedLocation("");
                          setNewFeaturedTitle("");
                          setFeaturedLocationFile(null);
                          setFeaturedLocationPreview(null);
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <label htmlFor="featuredToggle" className="text-base font-medium">Add to Featured Location</label>
                  </div>

                  {isFeaturedLocation && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Existing</label>
                        <select
                          value={selectedFeaturedLocation}
                          onChange={(e) => {
                            setSelectedFeaturedLocation(e.target.value);
                            setNewFeaturedTitle("");
                            setFeaturedLocationFile(null);
                            setFeaturedLocationPreview(null);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none"
                        >
                          <option value="">-- Choose existing --</option>
                          {existingFeaturedLocations.map((loc) => (
                            <option key={loc.title} value={loc.title}>{loc.title}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Choose to reuse an existing featured location image</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Or New Location Title</label>
                        <input
                          type="text"
                          value={newFeaturedTitle}
                          onChange={(e) => {
                            setNewFeaturedTitle(e.target.value);
                            if (e.target.value) setSelectedFeaturedLocation("");
                          }}
                          placeholder="e.g., Mumbai Central"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">If new title, upload an image (required)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location Image</label>
                        <button
                          type="button"
                          onClick={() => document.getElementById('featuredLocationImage').click()}
                          className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl font-semibold"
                        >
                          Upload Location Image
                        </button>
                        <input id="featuredLocationImage" type="file" accept="image/*" onChange={handleFeaturedLocationFile} className="hidden" />
                        {featuredLocationPreview && (
                          <div className="mt-3 w-36 h-24 rounded-lg overflow-hidden shadow-md">
                            <img src={featuredLocationPreview} alt="loc" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Curated Property Section (mirrors featured location UI) */}
                <div className="mb-8">
                  <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="text-gold-dark" />
                    Curated Property (optional)
                  </h2>

                  <div className="flex items-center gap-4 mb-4">
                    <input
                      id="curatedToggle"
                      type="checkbox"
                      checked={isCuratedProperty}
                      onChange={(e) => {
                        setIsCuratedProperty(e.target.checked);
                        if (e.target.checked) {
                          api.get('/properties/curated/titles')
                            .then(res => {
                              const manual = res.data?.data || [];
                              setExistingCuratedProperties(manual);
                            })
                            .catch(() => setExistingCuratedProperties([]));
                        } else {
                          setSelectedCuratedProperty("");
                          setNewCuratedTitle("");
                          setCuratedPropertyFile(null);
                          setCuratedPropertyPreview(null);
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <label htmlFor="curatedToggle" className="text-base font-medium">Add as Curated Property</label>
                  </div>

                  {isCuratedProperty && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Existing (optional)</label>
                        <select
                          value={selectedCuratedProperty}
                          onChange={(e) => {
                            setSelectedCuratedProperty(e.target.value);
                            setNewCuratedTitle("");
                            setCuratedPropertyFile(null);
                            setCuratedPropertyPreview(null);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none"
                        >
                          <option value="">-- Choose existing --</option>
                          {existingCuratedProperties.map((loc) => (
                            <option key={loc.title} value={loc.title}>{loc.title}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Choose to reuse an existing curated image</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Or New Curated Title</label>
                        <input
                          type="text"
                          value={newCuratedTitle}
                          onChange={(e) => {
                            setNewCuratedTitle(e.target.value);
                            if (e.target.value) setSelectedCuratedProperty("");
                          }}
                          placeholder="e.g., Editor's Pick - South Rohtak"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">If new title, upload an image (required)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Curated Image</label>
                        <button
                          type="button"
                          onClick={() => document.getElementById('curatedPropertyImage').click()}
                          className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl font-semibold"
                        >
                          Upload Curated Image
                        </button>
                        <input id="curatedPropertyImage" type="file" accept="image/*" onChange={handleCuratedPropertyFile} className="hidden" />
                        {curatedPropertyPreview && (
                          <div className="mt-3 w-36 h-24 rounded-lg overflow-hidden shadow-md">
                            <img src={curatedPropertyPreview} alt="curated" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-5 py-2.5 ${
                    loading
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-gold to-gold hover:from-matte hover:to-matte hover:shadow-lg"
                  } text-white rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding Property...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Add Property
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 bg-white text-gray-700 rounded-lg font-bold text-sm border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProperty;

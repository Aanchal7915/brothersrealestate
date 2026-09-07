import { useState, useContext, useEffect } from "react";
import { PropertyContext } from "../context/PropertyContext";
import { DeveloperContext } from "../context/DeveloperContext";
import AdminSidebar from "../components/AdminSidebar";
import AdminBackButton from "../components/admin/AdminBackButton";
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
  Building2,
  Trash2,
  AlertCircle,
  User,
} from "lucide-react";
import { PROPERTY_TYPE_OPTIONS } from "../utils/propertyType";
import {
  useDragReorder,
  dragClass,
  OrderBadge,
  move,
} from "../components/admin/ReorderControls";
import api from "../utils/api";

const EditProperty = ({ setCurrentPage, propertyId }) => {
  const { properties, fetchProperties } = useContext(PropertyContext);
  const { developers } = useContext(DeveloperContext);
  const [rentalCategory, setRentalCategory] = useState("");
  const [developer, setDeveloper] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    address: "",
    bhk: "",
    propertyType: "residential",
    area: "",
    bathrooms: "",
    amenities: "",
    status: "active",
    builderName: "",
    builderDetails: "",
    ownerName: "",
    ownerDetails: "",
  });
  const [existingImages, setExistingImages] = useState([]);
  const [existingCurated, setExistingCurated] = useState(null);
  const [existingCuratedOptions, setExistingCuratedOptions] = useState([]);
  const [selectedCuratedProperty, setSelectedCuratedProperty] = useState("");
  const [existingFeatured, setExistingFeatured] = useState(null);
  const [existingFeaturedOptions, setExistingFeaturedOptions] = useState([]);
  const [selectedFeaturedLocation, setSelectedFeaturedLocation] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [curatedPropertyFile, setCuratedPropertyFile] = useState(null);
  const [curatedPropertyPreview, setCuratedPropertyPreview] = useState(null);
  const [removeCurated, setRemoveCurated] = useState(false);
  const [featuredPropertyFile, setFeaturedPropertyFile] = useState(null);
  const [featuredPropertyPreview, setFeaturedPropertyPreview] = useState(null);
  const [removeFeatured, setRemoveFeatured] = useState(false);
  const [existingVideos, setExistingVideos] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  // Shown inside the video section itself — the banner at the top of this long
  // form is off-screen while the admin is working down here, which made a
  // rejected upload look like nothing happened at all.
  const [videoError, setVideoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) {
      setCurrentPage("admin-login");
      return;
    }
    const property = properties.find((p) => p._id === propertyId);
    if (property) {
      setFormData({
        title: property.title,
        description: property.description,
        price: property.price,
        city: property.city,
        address: property.address,
        bhk: property.bhk,
        propertyType: property.propertyType || "residential",
        area: property.area || "",
        bathrooms: property.bathrooms,
        amenities: Array.isArray(property.amenities)
          ? property.amenities.join(", ")
          : property.amenities,
        status: property.status,
        builderName: property.builderName || "",
        builderDetails: property.builderDetails || "",
        ownerName: property.ownerName || "",
        ownerDetails: property.ownerDetails || "",
      });
      setExistingImages(property.images || []);
      // `videos` is the source of truth — the legacy single `video` field can
      // be missing even when the property has videos.
      setExistingVideos(
        property.videos?.length
          ? property.videos
          : property.video
            ? [property.video]
            : []
      );
      setExistingCurated(property.curatedProperty || null);
      setExistingFeatured(property.featuredLocation || null);
      setRentalCategory(property.rentalCategory?._id || property.rentalCategory || "");
      setDeveloper(property.developer?._id || property.developer || "");
      // Pre-select any manual curated/featured titles if present
      setSelectedCuratedProperty(property.curatedProperty?.title || "");
      setSelectedFeaturedLocation(property.featuredLocation?.title || "");
    }
    setInitialLoading(false);
  }, [propertyId, properties]);

  // Fetch existing curated titles and featured locations for reuse
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const curatedRes = await fetch(`${import.meta.env.VITE_API_URL}/properties/curated/titles`);
        const curatedJson = await curatedRes.json();
        if (curatedJson.success) setExistingCuratedOptions(curatedJson.data || []);
      } catch (err) {
        console.error('Failed to fetch curated titles', err);
        setExistingCuratedOptions([]);
      }

      try {
        const featuredRes = await fetch(`${import.meta.env.VITE_API_URL}/properties/locations/featured`);
        const featuredJson = await featuredRes.json();
        if (featuredJson.success) {
          const manual = featuredJson.data?.manual || [];
          setExistingFeaturedOptions(manual || []);
        }
      } catch (err) {
        console.error('Failed to fetch featured locations', err);
        setExistingFeaturedOptions([]);
      }
    };

    fetchOptions();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (existingImages.length + imageFiles.length + files.length > 15) {
      setError("Maximum 15 images allowed in total");
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

    const room = 2 - (existingVideos.length + videoFiles.length);
    if (files.length > room) {
      const msg =
        room <= 0
          ? "This property already has 2 videos. Remove one above to add a new one."
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

  const imageDrag = useDragReorder((a, b) => setExistingImages((p) => move(p, a, b)));

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingVideo = (index) => {
    setExistingVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoError("");
  };

  const handleCuratedPropertyFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Curated property image must be less than 5MB");
      return;
    }
    setCuratedPropertyFile(file);
    // If admin uploads a new curated image, clear any selected existing curated option
    setSelectedCuratedProperty("");
    const reader = new FileReader();
    reader.onloadend = () => setCuratedPropertyPreview(reader.result);
    reader.readAsDataURL(file);
    setError("");
  };

  const handleFeaturedPropertyFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Featured location image must be less than 5MB");
      return;
    }
    setFeaturedPropertyFile(file);
    // If admin uploads a new featured image, clear any selected existing featured option
    setSelectedFeaturedLocation("");
    const reader = new FileReader();
    reader.onloadend = () => setFeaturedPropertyPreview(reader.result);
    reader.readAsDataURL(file);
    setError("");
  };

  const removeNewVideo = (index) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
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
      formDataToSend.append("status", formData.status);
      if (formData.builderName) formDataToSend.append("builderName", formData.builderName);
      if (formData.builderDetails) formDataToSend.append("builderDetails", formData.builderDetails);
      if (formData.ownerName) formDataToSend.append("ownerName", formData.ownerName);
      if (formData.ownerDetails) formDataToSend.append("ownerDetails", formData.ownerDetails);
      if (rentalCategory) {
        formDataToSend.append("rentalCategory", rentalCategory);
      } else {
        formDataToSend.append("removeRentalCategory", "true");
      }
      formDataToSend.append("developer", developer);

      // Carries both which images survived and the order the admin arranged.
      formDataToSend.append("existingImages", JSON.stringify(existingImages));

      // Add new images only
      imageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      // Add new videos (up to 2 total)
      videoFiles.forEach((file) => {
        formDataToSend.append("videos", file);
      });

      // If existingVideos were modified (some removed), send the remaining list so backend can keep them.
      if (existingVideos && existingVideos.length > 0) {
        try {
          formDataToSend.append('existingVideos', JSON.stringify(existingVideos));
        } catch (e) {
          // ignore
        }
      }

      // Curated property handling
      if (removeCurated) {
        formDataToSend.append("removeCuratedProperty", true);
      } else if (selectedCuratedProperty) {
        // Reuse existing curated title (backend will reuse image)
        formDataToSend.append("curatedPropertyTitle", selectedCuratedProperty);
      } else if (curatedPropertyFile) {
        // If new curated image provided, include it and the edited/existing title
        formDataToSend.append("curatedPropertyImage", curatedPropertyFile);
        if (existingCurated?.title) formDataToSend.append("curatedPropertyTitle", existingCurated.title);
      } else if (existingCurated?.title) {
        // Admin typed/edited a curated title but didn't upload a new image — send title-only update
        formDataToSend.append("curatedPropertyTitle", existingCurated.title);
      }

      // Featured location handling (mirror curated behavior)
      if (removeFeatured) {
        formDataToSend.append("removeFeaturedLocation", true);
      } else if (selectedFeaturedLocation) {
        formDataToSend.append("featuredLocationTitle", selectedFeaturedLocation);
      } else if (featuredPropertyFile) {
        formDataToSend.append("featuredLocationImage", featuredPropertyFile);
        if (existingFeatured?.title) formDataToSend.append("featuredLocationTitle", existingFeatured.title);
      } else if (existingFeatured?.title) {
        // Admin typed/edited a featured title but didn't upload a new image — send title-only update
        formDataToSend.append("featuredLocationTitle", existingFeatured.title);
      }

      const response = await api.put(
        `/properties/${propertyId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        await fetchProperties("?limit=200");
        setTimeout(() => {
          setCurrentPage("add-property");
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating property:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        setCurrentPage("admin-login");
      } else {
        const msg = error.response?.data?.message || "Failed to update property. Please try again.";
        setError(msg);
        alert(msg);
      }
    }

    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar currentPage="edit-property" setCurrentPage={setCurrentPage} />
        <div className="flex-1 bg-ivory p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-black/10 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        currentPage="edit-property"
        setCurrentPage={setCurrentPage}
      />
      <div className="flex-1 bg-ivory p-4 md:p-6 pt-24 md:pt-24">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-6 animate-fade-in">
            <AdminBackButton setCurrentPage={setCurrentPage} to="add-property" label="Back" />
            <h1 className="mb-4 text-2xl md:text-3xl font-black bg-matte bg-clip-text text-transparent">
              Edit Property
            </h1>
            <p className="text-sm text-gray-600 font-medium max-w-2xl mx-auto">
              Update your property details and media
            </p>
          </div>

          {success && (
            <div className="bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-500 text-green-900 p-5 rounded-2xl mb-6 shadow-lg">
              <p className="font-bold text-lg mb-1">🎉 Success!</p>
              <p className="text-sm">
                Property updated successfully. Taking you back to your properties...
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
                  <Home className="text-matte" />
                  Property Details
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Home size={18} className="text-matte" />
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
                      <MapPin size={18} className="text-matte" />
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
                      <IndianRupee size={18} className="text-red-600" />
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
                      <MapPin size={18} className="text-matte" />
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

              {/* Builder & Owner Details */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="text-matte" />
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

              {/* Curated Property Section */}
              {/* Featured Location Section */}
              <div className="mb-8">
                <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="text-yellow-600" />
                  Featured Location
                </h2>

                {existingFeatured ? (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 rounded-lg overflow-hidden">
                        <img src={existingFeatured.image?.url} alt="featured" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{existingFeatured.title}</p>
                        <p className="text-xs text-gray-600">Existing featured tag</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={removeFeatured} onChange={(e) => setRemoveFeatured(e.target.checked)} />
                          <span className="text-sm">Remove featured tag</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">No featured tag assigned</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Existing Featured (optional)</label>
                    <select
                      value={selectedFeaturedLocation}
                      onChange={(e) => {
                        setSelectedFeaturedLocation(e.target.value);
                        setFeaturedPropertyFile(null);
                        setFeaturedPropertyPreview(null);
                        setExistingFeatured((prev) => ({ ...(prev||{}), title: e.target.value }));
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none"
                    >
                      <option value="">-- Choose existing --</option>
                      {existingFeaturedOptions.map((f) => (
                        <option key={f.title} value={f.title}>{f.title}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">Re-use an existing featured image/title without uploading a new image.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Or Upload New Featured Image</label>
                    <button
                      type="button"
                      onClick={() => document.getElementById('featuredLocationImage').click()}
                      className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl font-semibold"
                    >
                      Upload Image
                    </button>
                    <input id="featuredLocationImage" type="file" accept="image/*" onChange={handleFeaturedPropertyFile} className="hidden" />
                    {featuredPropertyPreview && (
                      <div className="mt-3 w-36 h-24 rounded-lg overflow-hidden shadow-md">
                        <img src={featuredPropertyPreview} alt="featured new" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">If you upload an image, the featured title will be set from the selected option or existing data.</p>
                    <div className="mt-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Title (optional)</label>
                      <input
                        type="text"
                        value={existingFeatured?.title || ''}
                        onChange={(e) => {
                          // Editing title means we're not using a pre-selected existing option
                          setSelectedFeaturedLocation("");
                          setExistingFeatured((prev) => ({ ...(prev||{}), title: e.target.value }));
                        }}
                        placeholder="e.g., Mumbai Central"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-2">If you upload an image, the title here will be used.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="text-yellow-600" />
                  Curated Property
                </h2>

                {existingCurated ? (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 rounded-lg overflow-hidden">
                        <img src={existingCurated.image?.url} alt="curated" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{existingCurated.title}</p>
                        <p className="text-xs text-gray-600">Existing curated tag</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={removeCurated} onChange={(e) => setRemoveCurated(e.target.checked)} />
                          <span className="text-sm">Remove curated tag</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">No curated tag assigned</p>
                )}

                {/* Title field appears here (under Curated header) */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Curated Title (optional)</label>
                  <input
                    type="text"
                    value={existingCurated?.title || ''}
                    onChange={(e) => {
                      // Editing title means we're not using a pre-selected existing option
                      setSelectedCuratedProperty("");
                      setExistingCurated((prev) => ({ ...(prev||{}), title: e.target.value }));
                    }}
                    placeholder="e.g., Editor's Pick - South Rohtak"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">Type a title to set/update the curated title, or choose an existing option below.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Existing Curated (optional)</label>
                    <select
                      value={selectedCuratedProperty}
                      onChange={(e) => {
                        setSelectedCuratedProperty(e.target.value);
                        // clear any new upload/preview when choosing existing
                        setCuratedPropertyFile(null);
                        setCuratedPropertyPreview(null);
                        setExistingCurated((prev) => ({ ...(prev||{}), title: e.target.value }));
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none"
                    >
                      <option value="">-- Choose existing --</option>
                      {existingCuratedOptions.map((c) => (
                        <option key={c.title} value={c.title}>{c.title}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">Re-use an existing curated image/title without uploading a new image.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Or Upload New Curated Image</label>
                    <button
                      type="button"
                      onClick={() => document.getElementById('curatedPropertyImage').click()}
                      className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl font-semibold"
                    >
                      Upload Image
                    </button>
                    <input id="curatedPropertyImage" type="file" accept="image/*" onChange={handleCuratedPropertyFile} className="hidden" />
                    {curatedPropertyPreview && (
                      <div className="mt-3 w-36 h-24 rounded-lg overflow-hidden shadow-md">
                        <img src={curatedPropertyPreview} alt="curated new" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">If you upload an image, the title above will be used (if provided).</p>
                  </div>
                </div>
              </div>

              {/* Specifications Section */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bed className="text-matte" />
                  Specifications
                </h2>

                {/* Developer — same field and list as the Add Property form */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Building2 size={18} className="text-gold-dark" />
                    Developer (optional)
                  </label>
                  <select
                    value={developer}
                    onChange={(e) => setDeveloper(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                  >
                    <option value="">-- No Developer --</option>
                    {developers.map((dev) => (
                      <option key={dev._id} value={dev._id}>
                        {dev.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Create new developers from the Developers admin page.
                  </p>
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

                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Bed size={18} className="text-matte" />
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
                      <Bath size={18} className="text-matte" />
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
                      <Maximize size={18} className="text-matte" />
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

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="sold">Sold</option>
                    </select>
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
                    placeholder="Describe your property in detail..."
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
                    placeholder="Swimming Pool, Gym, Parking, 24/7 Security"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-4 focus:ring-black/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Media Upload Section */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="text-matte" />
                  Media Management
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {/* Images Management */}
                  <div>
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Current Images ({existingImages.length})
                      </h3>
                      {existingImages.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {existingImages.map((image, index) => (
                            <div
                              key={image.url || index}
                              {...imageDrag.dragProps(index)}
                              className={`group relative w-24 h-24 rounded-xl overflow-hidden shadow-md cursor-grab active:cursor-grabbing ${dragClass(
                                index,
                                imageDrag.draggingIndex,
                                imageDrag.overIndex
                              )}`}
                            >
                              <img
                                src={image.url}
                                alt={`Existing ${index + 1}`}
                                draggable={false}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute top-1 right-1 bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <X size={14} />
                              </button>
                              <OrderBadge index={index} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No images yet</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Add New Images (Max {15 - existingImages.length} more)
                      </label>
                      <button
                        type="button"
                        onClick={() => document.getElementById("images").click()}
                        disabled={existingImages.length >= 15}
                        className={`w-full px-4 py-2.5 ${
                          existingImages.length >= 15
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-matte hover:from-matte hover:to-matte"
                        } text-white rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
                      >
                        <ImageIcon size={16} />
                        Upload New Images
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
                              className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md border-2 border-green-400"
                            >
                              <img
                                src={preview}
                                alt={`New Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="absolute top-1 right-1 bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Management */}
                  <div>
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Current Video(s){" "}
                        <span className="font-normal text-gray-500">
                          ({existingVideos.length + videoFiles.length} of 2 used)
                        </span>
                      </h3>
                      {existingVideos && existingVideos.length > 0 ? (
                        <div className="space-y-3">
                          {existingVideos.map((v, idx) => (
                            <div key={idx} className="p-3 bg-gray-100 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <video src={v.url || v} className="w-40 h-24 object-cover rounded-md" controls />
                                <span className="text-sm text-gray-700 font-medium">Video {idx + 1}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeExistingVideo(idx)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No video yet</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Upload New Video (Optional)
                      </label>
                      <button
                        type="button"
                        disabled={existingVideos.length + videoFiles.length >= 2}
                        onClick={() => document.getElementById("video").click()}
                        className={`w-full px-4 py-2.5 ${
                          existingVideos.length + videoFiles.length >= 2
                            ? "bg-gray-300 cursor-not-allowed"
                            : videoFiles.length > 0
                              ? "bg-matte hover:bg-gold hover:text-matte"
                              : "bg-gradient-to-r from-red-400 to-red-400 hover:from-red-400 hover:to-red-700"
                        } text-white rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
                      >
                        <Video size={16} />
                        {existingVideos.length + videoFiles.length >= 2
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
                                <span className="text-sm text-gray-700 font-medium">New Video {idx + 1}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeNewVideo(idx)}
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
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-5 py-2.5 ${
                    loading
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                      : "bg-matte hover:from-matte hover:to-matte hover:shadow-lg"
                  } text-white rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating Property...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Update Property
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage("add-property")}
                  className="px-5 py-2.5 bg-white text-gray-700 rounded-lg font-bold text-sm border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;

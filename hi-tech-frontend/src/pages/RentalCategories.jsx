import React, { useContext, useEffect, useState } from "react";
import { Tags, Pencil, Trash2, X, Home, Image as ImageIcon, Video, Plus } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminBackButton from "../components/admin/AdminBackButton";
import Loader from "../components/Loader";
import { CategoryContext } from "../context/CategoryContext";
import { PropertyContext } from "../context/PropertyContext";
import { PROPERTY_TYPE_OPTIONS } from "../utils/propertyType";
import {
  useDragReorder,
  dragClass,
  DragHandle,
  OrderBadge,
  move,
} from "../components/admin/ReorderControls";
import api from "../utils/api";

const emptyPropertyForm = {
  title: "",
  description: "",
  price: "",
  city: "",
  address: "",
  bhk: "",
  area: "",
  bathrooms: "",
  propertyType: "rent",
  amenities: "",
  ownerName: "",
  ownerDetails: "",
};

const inputClass =
  "w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all";

const RentalCategories = ({ setCurrentPage }) => {
  const { categories, loading, fetchCategories } = useContext(CategoryContext);
  const { properties, fetchProperties } = useContext(PropertyContext);

  // ---- Edit modal — category fields + its one linked property, unified ----
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  const [editCategoryImageFile, setEditCategoryImageFile] = useState(null);
  const [editCategoryImagePreview, setEditCategoryImagePreview] = useState(null);
  const [editCategoryRemoveImage, setEditCategoryRemoveImage] = useState(false);

  const [editLinkedProperty, setEditLinkedProperty] = useState(null);
  const [editLinkedCount, setEditLinkedCount] = useState(0);
  const [editPropertyForm, setEditPropertyForm] = useState(emptyPropertyForm);
  const [editPropertyExistingImages, setEditPropertyExistingImages] = useState([]);
  const [editPropertyNewImageFiles, setEditPropertyNewImageFiles] = useState([]);
  const [editPropertyNewImagePreviews, setEditPropertyNewImagePreviews] = useState([]);
  const [editPropertyExistingVideos, setEditPropertyExistingVideos] = useState([]);
  const [editPropertyNewVideoFiles, setEditPropertyNewVideoFiles] = useState([]);
  const [editPropertyNewVideoPreviews, setEditPropertyNewVideoPreviews] = useState([]);

  const [editFormError, setEditFormError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteResultMessage, setDeleteResultMessage] = useState("");
  const [reorderingCategory, setReorderingCategory] = useState(false);

  // ---- Unified "Add Rental Property" modal — category is optional, and can
  // either be picked from existing categories or created inline.
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showNewCategoryFields, setShowNewCategoryFields] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryImageFile, setNewCategoryImageFile] = useState(null);
  const [newCategoryImagePreview, setNewCategoryImagePreview] = useState(null);
  const [propertyFormData, setPropertyFormData] = useState(emptyPropertyForm);
  const [propertyImageFiles, setPropertyImageFiles] = useState([]);
  const [propertyImagePreviews, setPropertyImagePreviews] = useState([]);
  const [propertyVideoFiles, setPropertyVideoFiles] = useState([]);
  const [propertyVideoPreviews, setPropertyVideoPreviews] = useState([]);
  const [propertyFormError, setPropertyFormError] = useState("");
  const [propertySubmitting, setPropertySubmitting] = useState(false);
  const [propertySuccess, setPropertySuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) {
      setCurrentPage("admin-login");
    }
  }, [setCurrentPage]);

  // ---- Edit category + linked property ----
  const openEditForm = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description || "");
    setEditCategoryImageFile(null);
    setEditCategoryImagePreview(category.image || null);
    setEditCategoryRemoveImage(false);

    const linked = properties.filter(
      (p) => (p.rentalCategory?._id || p.rentalCategory) === category._id
    );
    setEditLinkedCount(linked.length);
    const primary = linked[0] || null;
    setEditLinkedProperty(primary);

    if (primary) {
      setEditPropertyForm({
        title: primary.title || "",
        description: primary.description || "",
        price: primary.price ?? "",
        city: primary.city || "",
        address: primary.address || "",
        bhk: primary.bhk ?? "",
        area: primary.area ?? "",
        bathrooms: primary.bathrooms ?? "",
        propertyType: primary.propertyType || "rent",
        amenities: Array.isArray(primary.amenities) ? primary.amenities.join(", ") : primary.amenities || "",
        ownerName: primary.ownerName || "",
        ownerDetails: primary.ownerDetails || "",
      });
      setEditPropertyExistingImages(primary.images || []);
      const vids =
        primary.videos && primary.videos.length ? primary.videos : primary.video ? [primary.video] : [];
      setEditPropertyExistingVideos(vids);
    } else {
      setEditPropertyForm(emptyPropertyForm);
      setEditPropertyExistingImages([]);
      setEditPropertyExistingVideos([]);
    }
    setEditPropertyNewImageFiles([]);
    setEditPropertyNewImagePreviews([]);
    setEditPropertyNewVideoFiles([]);
    setEditPropertyNewVideoPreviews([]);
    setEditFormError("");
    setEditSuccess(false);
  };

  const closeEditForm = () => {
    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryDescription("");
    setEditCategoryImageFile(null);
    setEditCategoryImagePreview(null);
    setEditCategoryRemoveImage(false);
    setEditLinkedProperty(null);
    setEditLinkedCount(0);
    setEditPropertyForm(emptyPropertyForm);
    setEditPropertyExistingImages([]);
    setEditPropertyNewImageFiles([]);
    setEditPropertyNewImagePreviews([]);
    setEditPropertyExistingVideos([]);
    setEditPropertyNewVideoFiles([]);
    setEditPropertyNewVideoPreviews([]);
    setEditFormError("");
    setEditSubmitting(false);
    setEditSuccess(false);
  };

  const imageDrag = useDragReorder((a, b) =>
    setEditPropertyExistingImages((p) => move(p, a, b))
  );

  // Reordering rewrites `order` across the list so it stays a clean 0..n run.
  const moveCategory = async (from, to) => {
    if (to < 0 || to >= categories.length || reorderingCategory) return;
    setReorderingCategory(true);
    try {
      const next = move(categories, from, to);
      await Promise.all(
        next.map((c, i) => {
          if (c.order === i) return null;
          const fd = new FormData();
          fd.append("order", String(i));
          return api.put(`/categories/${c._id}`, fd);
        })
      );
      await fetchCategories();
    } catch (err) {
      console.error("Category reorder error:", err);
      alert(err.response?.data?.message || "Could not reorder. Please try again.");
    } finally {
      setReorderingCategory(false);
    }
  };

  const categoryDrag = useDragReorder((a, b) => moveCategory(a, b), {
    disabled: reorderingCategory,
  });

  const handleEditCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setEditFormError("Category image must be less than 5MB");
      return;
    }
    setEditCategoryImageFile(file);
    setEditCategoryRemoveImage(false);
    const reader = new FileReader();
    reader.onloadend = () => setEditCategoryImagePreview(reader.result);
    reader.readAsDataURL(file);
    setEditFormError("");
  };

  const handleEditPropertyImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (editPropertyExistingImages.length + editPropertyNewImageFiles.length + files.length > 15) {
      setEditFormError("Maximum 15 images allowed");
      return;
    }
    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setEditFormError("Each image must be less than 5MB");
      return;
    }
    setEditPropertyNewImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setEditPropertyNewImagePreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    setEditFormError("");
  };

  const removeEditPropertyNewImage = (index) => {
    setEditPropertyNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setEditPropertyNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditPropertyVideoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (editPropertyExistingVideos.length + editPropertyNewVideoFiles.length + files.length > 2) {
      setEditFormError("Maximum 2 videos allowed");
      return;
    }
    const invalidFiles = files.filter((file) => file.size > 50 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setEditFormError("Each video must be less than 50MB");
      return;
    }
    setEditPropertyNewVideoFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setEditPropertyNewVideoPreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    setEditFormError("");
  };

  const removeEditPropertyNewVideo = (index) => {
    setEditPropertyNewVideoFiles((prev) => prev.filter((_, i) => i !== index));
    setEditPropertyNewVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEditPropertyExistingVideo = (index) => {
    setEditPropertyExistingVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditInvalidField = (e) => {
    const label =
      e.target.labels?.[0]?.innerText?.replace(/\s*\*\s*$/, "").trim() ||
      e.target.placeholder ||
      "A required field";
    const msg = `${label}: ${e.target.validationMessage}`;
    setEditFormError(msg);
    alert(msg);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormError("");
    setEditSubmitting(true);
    setEditSuccess(false);

    try {
      const categoryFormData = new FormData();
      categoryFormData.append("name", editCategoryName);
      categoryFormData.append("description", editCategoryDescription);
      if (editCategoryRemoveImage) {
        categoryFormData.append("removeImage", "true");
      } else if (editCategoryImageFile) {
        categoryFormData.append("categoryImage", editCategoryImageFile);
      }
      await api.put(`/categories/${editingCategory._id}`, categoryFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (editLinkedProperty) {
        const propertyFormDataToSend = new FormData();
        propertyFormDataToSend.append("title", editPropertyForm.title);
        propertyFormDataToSend.append("description", editPropertyForm.description);
        propertyFormDataToSend.append("price", editPropertyForm.price);
        propertyFormDataToSend.append("city", editPropertyForm.city);
        propertyFormDataToSend.append("address", editPropertyForm.address);
        propertyFormDataToSend.append("bhk", editPropertyForm.bhk);
        propertyFormDataToSend.append("bathrooms", editPropertyForm.bathrooms);
        propertyFormDataToSend.append("propertyType", editPropertyForm.propertyType);
        if (editPropertyForm.area) propertyFormDataToSend.append("area", editPropertyForm.area);
        if (editPropertyForm.amenities) propertyFormDataToSend.append("amenities", editPropertyForm.amenities);
        if (editPropertyForm.ownerName) propertyFormDataToSend.append("ownerName", editPropertyForm.ownerName);
        if (editPropertyForm.ownerDetails) propertyFormDataToSend.append("ownerDetails", editPropertyForm.ownerDetails);
        
        propertyFormDataToSend.append("existingImages", JSON.stringify(editPropertyExistingImages));

        editPropertyNewImageFiles.forEach((file) => propertyFormDataToSend.append("images", file));
        editPropertyNewVideoFiles.forEach((file) => propertyFormDataToSend.append("videos", file));
        propertyFormDataToSend.append("existingVideos", JSON.stringify(editPropertyExistingVideos));

        await api.put(`/properties/${editLinkedProperty._id}`, propertyFormDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await fetchCategories();
      await fetchProperties();
      setEditSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => closeEditForm(), 1200);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save changes. Please try again.";
      setEditFormError(msg);
      alert(msg);
    }

    setEditSubmitting(false);
  };

  const handleDelete = async (category) => {
    setDeletingId(category._id);
    try {
      // Delete the rental listings too — leaving them behind made them
      // resurface in the Add Property list as ordinary listings.
      const response = await api.delete(
        `/categories/${category._id}?deleteProperties=true`
      );
      const deletedCount = response.data?.deletedCount || 0;
      setDeleteResultMessage(
        deletedCount > 0
          ? `Deleted "${category.name}" and ${deletedCount} rental propert${
              deletedCount === 1 ? "y" : "ies"
            }.`
          : `Deleted "${category.name}".`
      );
      await fetchCategories();
      await fetchProperties("?limit=200");
      setTimeout(() => setDeleteResultMessage(""), 5000);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  // ---- Add rental property (category optional / create-inline) ----
  const openPropertyForm = () => {
    setShowPropertyForm(true);
    setSelectedCategoryId("");
    setShowNewCategoryFields(false);
    setNewCategoryName("");
    setNewCategoryDescription("");
    setNewCategoryImageFile(null);
    setNewCategoryImagePreview(null);
    setPropertyFormData(emptyPropertyForm);
    setPropertyImageFiles([]);
    setPropertyImagePreviews([]);
    setPropertyVideoFiles([]);
    setPropertyVideoPreviews([]);
    setPropertyFormError("");
    setPropertySuccess(false);
  };

  const closePropertyForm = () => {
    setShowPropertyForm(false);
    setSelectedCategoryId("");
    setShowNewCategoryFields(false);
    setNewCategoryName("");
    setNewCategoryDescription("");
    setNewCategoryImageFile(null);
    setNewCategoryImagePreview(null);
    setPropertyFormData(emptyPropertyForm);
    setPropertyImageFiles([]);
    setPropertyImagePreviews([]);
    setPropertyVideoFiles([]);
    setPropertyVideoPreviews([]);
    setPropertyFormError("");
    setPropertySuccess(false);
  };

  const handleNewCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPropertyFormError("Category image must be less than 5MB");
      return;
    }
    setNewCategoryImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setNewCategoryImagePreview(reader.result);
    reader.readAsDataURL(file);
    setPropertyFormError("");
  };

  const handlePropertyImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (propertyImageFiles.length + files.length > 15) {
      setPropertyFormError("Maximum 15 images allowed");
      return;
    }
    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setPropertyFormError("Each image must be less than 5MB");
      return;
    }
    setPropertyImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPropertyImagePreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    setPropertyFormError("");
  };

  const handlePropertyVideoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (propertyVideoFiles.length + files.length > 2) {
      setPropertyFormError("Maximum 2 videos allowed");
      return;
    }
    const invalidFiles = files.filter((file) => file.size > 50 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setPropertyFormError("Each video must be less than 50MB");
      return;
    }
    setPropertyVideoFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPropertyVideoPreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    setPropertyFormError("");
  };

  const removePropertyImage = (index) => {
    setPropertyImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPropertyImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removePropertyVideo = (index) => {
    setPropertyVideoFiles((prev) => prev.filter((_, i) => i !== index));
    setPropertyVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePropertyInvalidField = (e) => {
    const label =
      e.target.labels?.[0]?.innerText?.replace(/\s*\*\s*$/, "").trim() ||
      e.target.placeholder ||
      "A required field";
    const msg = `${label}: ${e.target.validationMessage}`;
    setPropertyFormError(msg);
    alert(msg);
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    setPropertySubmitting(true);
    setPropertyFormError("");
    setPropertySuccess(false);

    try {
      // Category is entirely optional. If the admin typed a new category
      // name, create it first and use the resulting id; otherwise fall back
      // to whichever existing category (if any) they picked from the list.
      let rentalCategoryId = "";
      if (showNewCategoryFields && newCategoryName.trim()) {
        const categoryFormData = new FormData();
        categoryFormData.append("name", newCategoryName.trim());
        // Stays on the rental side — Add Property has its own category list.
        categoryFormData.append("scope", "rental");
        if (newCategoryDescription.trim()) {
          categoryFormData.append("description", newCategoryDescription.trim());
        }
        if (newCategoryImageFile) categoryFormData.append("categoryImage", newCategoryImageFile);
        const categoryRes = await api.post("/categories", categoryFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        rentalCategoryId = categoryRes.data?.data?._id || "";
      } else if (selectedCategoryId) {
        rentalCategoryId = selectedCategoryId;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("title", propertyFormData.title);
      formDataToSend.append("description", propertyFormData.description);
      formDataToSend.append("price", propertyFormData.price);
      formDataToSend.append("city", propertyFormData.city);
      formDataToSend.append("address", propertyFormData.address);
      formDataToSend.append("bhk", propertyFormData.bhk);
      formDataToSend.append("propertyType", propertyFormData.propertyType);
      formDataToSend.append("bathrooms", propertyFormData.bathrooms);
      if (propertyFormData.area) formDataToSend.append("area", propertyFormData.area);
      if (propertyFormData.amenities) formDataToSend.append("amenities", propertyFormData.amenities);
      if (propertyFormData.ownerName) formDataToSend.append("ownerName", propertyFormData.ownerName);
      if (propertyFormData.ownerDetails) formDataToSend.append("ownerDetails", propertyFormData.ownerDetails);
      if (rentalCategoryId) formDataToSend.append("rentalCategory", rentalCategoryId);

      propertyImageFiles.forEach((file) => formDataToSend.append("images", file));
      propertyVideoFiles.forEach((file) => formDataToSend.append("videos", file));

      const response = await api.post("/properties", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setPropertySuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        await fetchProperties();
        await fetchCategories();
        setTimeout(() => closePropertyForm(), 1500);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to add rental property. Please try again.";
      setPropertyFormError(msg);
      alert(msg);
    }

    setPropertySubmitting(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-ivory/50 flex-col md:flex-row">
      <AdminSidebar currentPage="admin-rental-categories" setCurrentPage={setCurrentPage} />

      <div className="flex-1 p-4 md:p-6 pt-20 md:pt-24 overflow-x-hidden">
        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <AdminBackButton setCurrentPage={setCurrentPage} to="admin-dashboard" label="Back" />
            <h1 className="text-xl md:text-2xl font-black bg-matte bg-clip-text text-transparent mb-1">
              Rental Property
            </h1>
            <p className="text-gray-600 text-xs md:text-sm">
              Manage rental categories and the properties assigned to each
            </p>
          </div>
          <button
            onClick={openPropertyForm}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-matte hover:bg-gold hover:text-matte text-white rounded-lg font-bold text-sm shadow-sm hover:shadow-md transition-all"
          >
            <Home size={16} />
            Add Rental Property
          </button>
        </div>

        {deleteResultMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6 text-sm font-medium">
            {deleteResultMessage}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10">
            <Loader />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12 text-gray-500 text-sm">
            <Tags size={32} className="mx-auto mb-3 text-gray-300" />
            No rental categories yet. Click "Add Rental Property" to create one along with a property.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, cardIndex) => (
              <div
                key={category._id}
                {...categoryDrag.dragProps(cardIndex)}
                className={`relative bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center hover:shadow-md hover:border-black/10 transition-all cursor-grab active:cursor-grabbing ${dragClass(
                  cardIndex,
                  categoryDrag.draggingIndex,
                  categoryDrag.overIndex
                )}`}
              >
                <span className="absolute left-2 top-2">
                  <DragHandle label="Drag to reorder category" />
                </span>
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-ivory shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3 border-4 border-gray-50">
                    <Tags size={22} className="text-gray-400" />
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-sm">{category.name}</h3>
                <p className="text-[11px] text-gray-400 font-mono mb-2">{category.slug}</p>
                {category.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-ivory text-matte mb-4 mt-auto">
                  {category.propertyCount ?? 0} propert{(category.propertyCount ?? 0) === 1 ? "y" : "ies"}
                </span>
                <div className="flex gap-2 w-full pt-3 border-t border-gray-100 justify-center">
                  <button
                    onClick={() => openEditForm(category)}
                    className="flex items-center gap-1 text-xs font-semibold text-matte hover:bg-ivory px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(category)}
                    disabled={deletingId === category._id}
                    className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Category modal — category fields + its linked property, unified */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={closeEditForm}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 relative my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ivory rounded-lg">
                  <Pencil className="text-matte" size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Edit Rental Category</h2>
              </div>
              <button onClick={closeEditForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={22} className="text-gray-500" />
              </button>
            </div>

            {editSuccess && (
              <div className="bg-green-50 border border-green-300 text-green-800 rounded-lg p-3 mb-4 text-sm font-medium">
                Changes saved successfully.
              </div>
            )}
            {editFormError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                {editFormError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} onInvalid={handleEditInvalidField} className="space-y-4">
              {/* Category fields */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    placeholder="e.g., 1BHK Rental"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={editCategoryDescription}
                    onChange={(e) => setEditCategoryDescription(e.target.value)}
                    rows={2}
                    placeholder="Optional short description"
                    className={`${inputClass} resize-vertical`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Image</label>
                  {editCategoryImagePreview && !editCategoryRemoveImage ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={editCategoryImagePreview}
                        alt="Category"
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditCategoryRemoveImage(true);
                          setEditCategoryImageFile(null);
                          setEditCategoryImagePreview(null);
                        }}
                        className="text-red-600 text-xs font-semibold"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => document.getElementById("editCategoryImage").click()}
                        className="px-4 py-2 bg-matte text-white rounded-lg font-semibold text-xs flex items-center gap-2"
                      >
                        <ImageIcon size={14} />
                        Upload Image
                      </button>
                      <input
                        id="editCategoryImage"
                        type="file"
                        accept="image/*"
                        onChange={handleEditCategoryImageChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Linked property fields — only rendered when a property actually exists */}
              {editLinkedProperty ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Linked Property
                    </span>
                    {editLinkedCount > 1 && (
                      <span className="text-[11px] text-gray-400">
                        +{editLinkedCount - 1} more propert{editLinkedCount - 1 === 1 ? "y" : "ies"} in this category
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Title *</label>
                    <input
                      type="text"
                      required
                      value={editPropertyForm.title}
                      onChange={(e) => setEditPropertyForm({ ...editPropertyForm, title: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
                      <input
                        type="text"
                        required
                        value={editPropertyForm.city}
                        onChange={(e) => setEditPropertyForm({ ...editPropertyForm, city: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monthly Rent (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editPropertyForm.price}
                        onChange={(e) => setEditPropertyForm({ ...editPropertyForm, price: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address *</label>
                    <input
                      type="text"
                      required
                      value={editPropertyForm.address}
                      onChange={(e) => setEditPropertyForm({ ...editPropertyForm, address: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">BHK *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="10"
                        value={editPropertyForm.bhk}
                        onChange={(e) => setEditPropertyForm({ ...editPropertyForm, bhk: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bathrooms *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="10"
                        value={editPropertyForm.bathrooms}
                        onChange={(e) => setEditPropertyForm({ ...editPropertyForm, bathrooms: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Type *</label>
                      <select
                        value={editPropertyForm.propertyType}
                        onChange={(e) =>
                          setEditPropertyForm({ ...editPropertyForm, propertyType: e.target.value })
                        }
                        className={inputClass}
                      >
                        {PROPERTY_TYPE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area (sq.ft)</label>
                      <input
                        type="text"
                        value={editPropertyForm.area}
                        onChange={(e) => setEditPropertyForm({ ...editPropertyForm, area: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={editPropertyForm.description}
                      onChange={(e) => setEditPropertyForm({ ...editPropertyForm, description: e.target.value })}
                      className={`${inputClass} resize-vertical`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Amenities (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editPropertyForm.amenities}
                      onChange={(e) => setEditPropertyForm({ ...editPropertyForm, amenities: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  {/* Owner Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner Name</label>
                      <input
                        type="text"
                        value={editPropertyForm.ownerName}
                        onChange={(e) => setEditPropertyForm({ ...editPropertyForm, ownerName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner Details</label>
                      <input
                        type="text"
                        value={editPropertyForm.ownerDetails}
                        onChange={(e) => setEditPropertyForm({ ...editPropertyForm, ownerDetails: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Images</label>
                    {editPropertyExistingImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editPropertyExistingImages.map((img, index) => (
                          <div
                            key={img.url || index}
                            {...imageDrag.dragProps(index)}
                            className={`group relative w-24 h-24 rounded-lg overflow-hidden shadow-sm cursor-grab active:cursor-grabbing ${dragClass(
                              index,
                              imageDrag.draggingIndex,
                              imageDrag.overIndex
                            )}`}
                          >
                            <img
                              src={img.url}
                              alt={`Existing ${index + 1}`}
                              draggable={false}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditPropertyExistingImages(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            >
                              <X size={11} />
                            </button>
                            <OrderBadge index={index} />
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => document.getElementById("editPropertyImages").click()}
                      className="px-4 py-2 bg-matte text-white rounded-lg font-semibold text-xs flex items-center gap-2"
                    >
                      <ImageIcon size={14} />
                      Add More Images
                    </button>
                    <input
                      id="editPropertyImages"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleEditPropertyImageChange}
                      className="hidden"
                    />
                    {editPropertyNewImagePreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editPropertyNewImagePreviews.map((preview, index) => (
                          <div key={index} className="relative w-14 h-14 rounded-lg overflow-hidden shadow-sm">
                            <img src={preview} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeEditPropertyNewImage(index)}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Video</label>
                    {editPropertyExistingVideos.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {editPropertyExistingVideos.map((v, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                            <video src={v.url} className="w-20 h-12 object-cover rounded" controls />
                            <button
                              type="button"
                              onClick={() => removeEditPropertyExistingVideo(idx)}
                              className="text-red-600 text-xs font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => document.getElementById("editPropertyVideo").click()}
                      className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-400 text-white rounded-lg font-semibold text-xs flex items-center gap-2"
                    >
                      <Video size={14} />
                      Add Video
                    </button>
                    <input
                      id="editPropertyVideo"
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleEditPropertyVideoChange}
                      className="hidden"
                    />
                    {editPropertyNewVideoPreviews.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {editPropertyNewVideoPreviews.map((preview, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                            <video src={preview} className="w-20 h-12 object-cover rounded" controls />
                            <button
                              type="button"
                              onClick={() => removeEditPropertyNewVideo(idx)}
                              className="text-red-600 text-xs font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-lg py-4">
                  No property is linked to this category yet. Use "Add Rental Property" to create one.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 px-5 py-2.5 bg-matte hover:from-matte hover:to-matte disabled:opacity-60 text-white rounded-lg font-bold text-sm transition-all shadow-sm"
                >
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeEditForm}
                  className="px-5 py-2.5 bg-white text-gray-700 rounded-lg font-bold text-sm border border-gray-300 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Rental Property modal — category optional / create-inline */}
      {showPropertyForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={closePropertyForm}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 relative my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Home className="text-green-600" size={22} />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Add Rental Property</h2>
              </div>
              <button onClick={closePropertyForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={22} className="text-gray-500" />
              </button>
            </div>

            {propertySuccess && (
              <div className="bg-green-50 border border-green-300 text-green-800 rounded-lg p-3 mb-4 text-sm font-medium">
                Property added successfully.
              </div>
            )}
            {propertyFormError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                {propertyFormError}
              </div>
            )}

            <form onSubmit={handlePropertySubmit} onInvalid={handlePropertyInvalidField} className="space-y-4">
              {/* Category — entirely optional */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Rental Category (optional)
                </label>
                {!showNewCategoryFields ? (
                  <>
                    <div className="flex gap-2">
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                      >
                        <option value="">-- No category --</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryFields(true);
                          setSelectedCategoryId("");
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                      >
                        <Plus size={14} /> New Category
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Leave as "No category" if this doesn't need one.</p>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">Creating a new category</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryFields(false);
                          setNewCategoryName("");
                          setNewCategoryDescription("");
                          setNewCategoryImageFile(null);
                          setNewCategoryImagePreview(null);
                        }}
                        className="text-xs font-semibold text-matte"
                      >
                        Choose existing instead
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g., 1BHK Rental"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                    />
                    <textarea
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      rows={2}
                      placeholder="Optional short description for this category"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all resize-vertical"
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => document.getElementById("newCategoryImage").click()}
                        className="px-4 py-2 bg-matte text-white rounded-lg font-semibold text-xs flex items-center gap-2"
                      >
                        <ImageIcon size={14} />
                        Upload Category Image (optional)
                      </button>
                      <input
                        id="newCategoryImage"
                        type="file"
                        accept="image/*"
                        onChange={handleNewCategoryImageChange}
                        className="hidden"
                      />
                      {newCategoryImagePreview && (
                        <img
                          src={newCategoryImagePreview}
                          alt="New category"
                          className="w-14 h-14 rounded-lg object-cover mt-2"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Title *</label>
                <input
                  type="text"
                  required
                  value={propertyFormData.title}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, title: e.target.value })}
                  placeholder="e.g., Cozy 2BHK for Rent in Sector 14"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={propertyFormData.city}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, city: e.target.value })}
                    placeholder="Rohtak"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monthly Rent (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={propertyFormData.price}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, price: e.target.value })}
                    placeholder="15000"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address *</label>
                <input
                  type="text"
                  required
                  value={propertyFormData.address}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, address: e.target.value })}
                  placeholder="House/Flat number, street, locality, city - PIN"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">BHK *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={propertyFormData.bhk}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, bhk: e.target.value })}
                    placeholder="2"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bathrooms *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={propertyFormData.bathrooms}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, bathrooms: e.target.value })}
                    placeholder="2"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Type *</label>
                  <select
                    value={propertyFormData.propertyType}
                    onChange={(e) =>
                      setPropertyFormData({ ...propertyFormData, propertyType: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                  >
                    {PROPERTY_TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area (sq.ft)</label>
                  <input
                    type="text"
                    value={propertyFormData.area}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, area: e.target.value })}
                    placeholder="900"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={propertyFormData.description}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, description: e.target.value })}
                  placeholder="Describe the rental property..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all resize-vertical"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amenities (comma-separated)</label>
                <input
                  type="text"
                  value={propertyFormData.amenities}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, amenities: e.target.value })}
                  placeholder="Parking, Power Backup, Security"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                />
              </div>

              {/* Owner Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner Name</label>
                  <input
                    type="text"
                    value={propertyFormData.ownerName}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, ownerName: e.target.value })}
                    placeholder="Enter owner name"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner Details</label>
                  <input
                    type="text"
                    value={propertyFormData.ownerDetails}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, ownerDetails: e.target.value })}
                    placeholder="Contact info, notes, etc."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Images</label>
                  <button
                    type="button"
                    onClick={() => document.getElementById("rentalPropertyImages").click()}
                    className="w-full px-4 py-2.5 bg-matte text-white rounded-lg font-semibold text-sm hover:from-matte hover:to-matte transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ImageIcon size={16} />
                    Upload Images
                  </button>
                  <input
                    id="rentalPropertyImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePropertyImageChange}
                    className="hidden"
                  />
                  {propertyImagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {propertyImagePreviews.map((preview, index) => (
                        <div key={index} className="relative w-14 h-14 rounded-lg overflow-hidden shadow-sm">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePropertyImage(index)}
                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Video (Optional)</label>
                  <button
                    type="button"
                    onClick={() => document.getElementById("rentalPropertyVideo").click()}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-red-400 to-red-400 text-white rounded-lg font-semibold text-sm hover:from-red-500 hover:to-red-500 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Video size={16} />
                    {propertyVideoFiles.length > 0 ? `${propertyVideoFiles.length} video(s) ready` : "Upload Video(s)"}
                  </button>
                  <input
                    id="rentalPropertyVideo"
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handlePropertyVideoChange}
                    className="hidden"
                  />
                  {propertyVideoPreviews.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {propertyVideoPreviews.map((preview, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                          <video src={preview} className="w-20 h-12 object-cover rounded" controls />
                          <button
                            type="button"
                            onClick={() => removePropertyVideo(idx)}
                            className="text-red-600 text-xs font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={propertySubmitting}
                  className="flex-1 px-5 py-2.5 bg-matte hover:bg-gold hover:text-matte disabled:opacity-60 text-white rounded-lg font-bold text-sm transition-all shadow-sm"
                >
                  {propertySubmitting ? "Adding..." : "Add Rental Property"}
                </button>
                <button
                  type="button"
                  onClick={closePropertyForm}
                  className="px-5 py-2.5 bg-white text-gray-700 rounded-lg font-bold text-sm border border-gray-300 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="text-red-600" size={22} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Delete "{confirmDelete.name}"?</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              {confirmDelete.propertyCount > 0
                ? `This will permanently delete the category and its ${
                    confirmDelete.propertyCount
                  } rental propert${
                    confirmDelete.propertyCount === 1 ? "y" : "ies"
                  }, along with their images. This cannot be undone.`
                : "This category has no rental properties. It will be permanently deleted."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete._id}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-bold transition-all"
              >
                {deletingId === confirmDelete._id ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-bold border-2 border-gray-300 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalCategories;

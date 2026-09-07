import React, { useContext, useEffect, useState } from "react";
import { Building2, Pencil, Trash2, X, Image as ImageIcon, Plus, ExternalLink } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminBackButton from "../components/admin/AdminBackButton";
import Loader from "../components/Loader";
import { DeveloperContext } from "../context/DeveloperContext";
import {
  useDragReorder,
  dragClass,
  DragHandle,
} from "../components/admin/ReorderControls";
import api from "../utils/api";

const inputClass =
  "w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all";

// Keeps the bio short enough to read well as a card teaser and inside the
// capped-height "About the Developer" block on a project page.
const BIO_MAX_LENGTH = 300;

const emptyForm = { name: "", bio: "", website: "", status: "active" };

const AdminDevelopers = ({ setCurrentPage }) => {
  const { developers, loading, fetchDevelopers } = useContext(DeveloperContext);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [reordering, setReordering] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [resultMessage, setResultMessage] = useState("");
  const [viewingBio, setViewingBio] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) setCurrentPage("admin-login");
  }, [setCurrentPage]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(false);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (dev) => {
    setEditing(dev);
    setForm({
      name: dev.name || "",
      bio: dev.bio || "",
      website: dev.website || "",
      status: dev.status || "active",
    });
    setLogoFile(null);
    setLogoPreview(dev.logo?.url || null);
    setRemoveLogo(false);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(false);
    setFormError("");
    setSubmitting(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Logo must be less than 5MB");
      return;
    }
    setLogoFile(file);
    setRemoveLogo(false);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Please enter a developer name");
      return;
    }
    setSubmitting(true);
    setFormError("");

    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("bio", form.bio.trim());
      fd.append("website", form.website.trim());
      if (editing) fd.append("status", form.status);
      if (removeLogo) {
        fd.append("removeLogo", "true");
      } else if (logoFile) {
        fd.append("developerLogo", logoFile);
      }

      if (editing) {
        await api.put(`/developers/${editing._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/developers", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await fetchDevelopers();
      closeForm();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save developer. Please try again.";
      setFormError(msg);
    }
    setSubmitting(false);
  };

  const moveDeveloper = async (from, to) => {
    if (to < 0 || to >= developers.length || reordering) return;
    setReordering(true);
    try {
      const next = [...developers];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      await Promise.all(
        next.map((d, i) => {
          if (d.order === i) return null;
          const fd = new FormData();
          fd.append("order", String(i));
          return api.put(`/developers/${d._id}`, fd);
        })
      );
      await fetchDevelopers();
    } catch (err) {
      console.error("Developer reorder error:", err);
      alert(err.response?.data?.message || "Could not reorder. Please try again.");
    } finally {
      setReordering(false);
    }
  };

  const drag = useDragReorder((a, b) => moveDeveloper(a, b), { disabled: reordering });

  const handleDelete = async (dev) => {
    setDeletingId(dev._id);
    try {
      const response = await api.delete(`/developers/${dev._id}`);
      const unassigned = response.data?.unassignedCount || 0;
      setResultMessage(
        unassigned > 0
          ? `Deleted "${dev.name}" and unlinked it from ${unassigned} project${unassigned === 1 ? "" : "s"}.`
          : `Deleted "${dev.name}".`
      );
      await fetchDevelopers();
      setTimeout(() => setResultMessage(""), 5000);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete developer");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-ivory/50 flex-col md:flex-row">
      <AdminSidebar currentPage="admin-developers" setCurrentPage={setCurrentPage} />

      <div className="flex-1 p-4 md:p-6 pt-20 md:pt-24 overflow-x-hidden">
        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <AdminBackButton setCurrentPage={setCurrentPage} to="admin-dashboard" label="Back" />
            <h1 className="text-xl md:text-2xl font-black bg-matte bg-clip-text text-transparent mb-1">
              Developer Partners
            </h1>
            <p className="text-gray-600 text-xs md:text-sm">
              Manage developer profiles shown on the homepage and linked to projects
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-matte hover:bg-gold hover:text-matte text-white rounded-lg font-bold text-sm shadow-sm hover:shadow-md transition-all"
          >
            <Plus size={16} />
            Add Developer
          </button>
        </div>

        {resultMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6 text-sm font-medium">
            {resultMessage}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10">
            <Loader />
          </div>
        ) : developers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12 text-gray-500 text-sm">
            <Building2 size={32} className="mx-auto mb-3 text-gray-300" />
            No developers yet. Click "Add Developer" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {developers.map((dev, index) => (
              <div
                key={dev._id}
                {...drag.dragProps(index)}
                className={`relative bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center hover:shadow-md hover:border-black/10 transition-all cursor-grab active:cursor-grabbing ${dragClass(
                  index,
                  drag.draggingIndex,
                  drag.overIndex
                )}`}
              >
                <span className="absolute left-2 top-2">
                  <DragHandle label="Drag to reorder" />
                </span>
                {dev.status === "inactive" && (
                  <span className="absolute right-2 top-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                    Hidden
                  </span>
                )}
                {dev.logo?.url ? (
                  <img
                    src={dev.logo.url}
                    alt={dev.name}
                    className="w-20 h-20 rounded-full object-contain mb-3 border-4 border-ivory shadow-sm bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3 border-4 border-gray-50">
                    <Building2 size={22} className="text-gray-400" />
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-sm">{dev.name}</h3>
                {dev.website && (
                  <a
                    href={dev.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-matte flex items-center gap-1 mt-0.5"
                  >
                    Website <ExternalLink size={10} />
                  </a>
                )}
                {dev.bio && (
                  <button
                    type="button"
                    onClick={() => setViewingBio(dev)}
                    className="mt-2 mb-3 text-[11px] font-semibold text-gold-dark hover:text-gold underline underline-offset-2"
                  >
                    Bio
                  </button>
                )}
                <div className="flex gap-2 w-full pt-3 mt-auto border-t border-gray-100 justify-center">
                  <button
                    onClick={() => openEdit(dev)}
                    className="flex items-center gap-1 text-xs font-semibold text-matte hover:bg-ivory px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(dev)}
                    disabled={deletingId === dev._id}
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

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={closeForm}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ivory rounded-lg">
                  <Building2 className="text-matte" size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editing ? "Edit Developer" : "Add Developer"}
                </h2>
              </div>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={22} className="text-gray-500" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., DLF"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Bio (shown in "About the Developer" on project pages)
                </label>
                <textarea
                  rows={3}
                  maxLength={BIO_MAX_LENGTH}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, BIO_MAX_LENGTH) })}
                  placeholder="A short intro — a sentence or two reads best."
                  className={`${inputClass} resize-vertical`}
                />
                <p className="mt-1 text-right text-[11px] text-gray-400">
                  {form.bio.length}/{BIO_MAX_LENGTH}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Logo</label>
                {logoPreview && !removeLogo ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-14 h-14 rounded-lg object-contain bg-gray-50 border border-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveLogo(true);
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="text-red-600 text-xs font-semibold"
                    >
                      Remove Logo
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => document.getElementById("developerLogoInput").click()}
                      className="px-4 py-2 bg-matte text-white rounded-lg font-semibold text-xs flex items-center gap-2"
                    >
                      <ImageIcon size={14} />
                      Upload Logo
                    </button>
                    <input
                      id="developerLogoInput"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              {editing && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className={inputClass}
                  >
                    <option value="active">Active (visible on site)</option>
                    <option value="inactive">Inactive (hidden)</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-5 py-2.5 bg-matte hover:bg-gold hover:text-matte disabled:opacity-60 text-white rounded-lg font-bold text-sm transition-all shadow-sm"
                >
                  {submitting ? "Saving..." : editing ? "Save Changes" : "Add Developer"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 bg-white text-gray-700 rounded-lg font-bold text-sm border border-gray-300 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              Any projects linked to this developer will be unlinked, not deleted. This cannot be undone.
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

      {viewingBio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setViewingBio(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              {viewingBio.logo?.url ? (
                <img
                  src={viewingBio.logo.url}
                  alt={viewingBio.name}
                  className="w-12 h-12 rounded-full object-contain border border-gray-100 bg-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-ivory flex items-center justify-center">
                  <Building2 size={20} className="text-gold-dark" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900">{viewingBio.name}</h2>
                {viewingBio.website && (
                  <a
                    href={viewingBio.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-matte flex items-center gap-1"
                  >
                    Website <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
            <p className="no-scrollbar max-h-64 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-600">
              {viewingBio.bio}
            </p>
            <button
              onClick={() => setViewingBio(null)}
              className="mt-6 w-full px-6 py-2.5 bg-matte text-white rounded-xl font-bold text-sm hover:bg-gold hover:text-matte transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDevelopers;

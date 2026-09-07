import { useContext, useEffect, useState } from "react";
import {
  Star,
  Pencil,
  Trash2,
  X,
  Plus,
  Image as ImageIcon,
  Youtube,
  AlertCircle,
  CheckCircle2,
  Building2,
  MapPin,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminBackButton from "../components/admin/AdminBackButton";
import Loader from "../components/Loader";
import { FeaturedProjectContext } from "../context/FeaturedProjectContext";
import { DeveloperContext } from "../context/DeveloperContext";
import { PROPERTY_TYPE_OPTIONS } from "../utils/propertyType";
import {
  useDragReorder,
  dragClass,
  DragHandle,
  OrderBadge,
  move,
} from "../components/admin/ReorderControls";
import api from "../utils/api";

const emptyForm = {
  title: "",
  city: "",
  address: "",
  price: "",
  configuration: "",
  bhk: "",
  bathrooms: "",
  area: "",
  propertyType: "residential",
  possession: "under-construction",
  reraNumber: "",
  description: "",
  videoUrl: "",
  highlights: "",
  amenities: "",
  order: "",
  status: "active",
  developer: "",
};

const CONNECTIVITY_KINDS = [
  { value: "school", label: "School" },
  { value: "hospital", label: "Hospital" },
  { value: "metro", label: "Metro" },
  { value: "highway", label: "Highway" },
  { value: "landmark", label: "Landmark" },
];

const inputClass =
  "w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5";

const inr = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return "—";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${v.toLocaleString("en-IN")}`;
};

/**
 * Admin CRUD for the Featured Listing showcase projects. These live in their
 * own collection and never appear on the Listings or Rental pages.
 */
const AdminFeaturedListing = ({ setCurrentPage }) => {
  const { featuredProjects, loading, fetchFeaturedProjects } =
    useContext(FeaturedProjectContext);
  const { developers } = useContext(DeveloperContext);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [connectivity, setConnectivity] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [reordering, setReordering] = useState(false);

  const existingDrag = useDragReorder((a, b) => setExistingImages((p) => move(p, a, b)));
  const newDrag = useDragReorder((a, b) => {
    setNewFiles((p) => move(p, a, b));
    setNewPreviews((p) => move(p, a, b));
  });
  const rowDrag = useDragReorder((a, b) => moveProject(a, b), { disabled: reordering });

  // The admin table needs inactive projects too, unlike the public grid.
  useEffect(() => {
    fetchFeaturedProjects("?all=true");
  }, [fetchFeaturedProjects]);

  useEffect(() => {
    return () => newPreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [newPreviews]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setConnectivity([]);
    setExistingImages([]);
    setNewFiles([]);
    newPreviews.forEach((u) => URL.revokeObjectURL(u));
    setNewPreviews([]);
    setError("");
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (p) => {
    resetForm();
    setEditing(p);
    setForm({
      title: p.title || "",
      city: p.city || "",
      address: p.address || "",
      price: p.price ?? "",
      configuration: p.configuration || "",
      bhk: p.bhk ?? "",
      bathrooms: p.bathrooms ?? "",
      area: p.area || "",
      propertyType: p.propertyType || "residential",
      possession: p.possession || "under-construction",
      reraNumber: p.reraNumber || "",
      description: p.description || "",
      videoUrl: p.videoUrl || "",
      highlights: (p.highlights || []).join("\n"),
      amenities: (p.amenities || []).join(", "),
      order: p.order ?? "",
      status: p.status || "active",
      developer: p.developer?._id || p.developer || "",
    });
    setConnectivity(
      (p.connectivity || []).map((c) => ({
        kinds: c.kinds || [],
        label: c.label,
        mapLink: c.mapLink || "",
      }))
    );
    setExistingImages(p.images || []);
    setShowForm(true);
  };

  const onField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addConnectivityRow = () =>
    setConnectivity((c) => [...c, { kinds: [], label: "", mapLink: "" }]);
  const updateConnectivityRow = (i, field, value) =>
    setConnectivity((c) => c.map((row, x) => (x === i ? { ...row, [field]: value } : row)));
  const toggleConnectivityKind = (i, kind) =>
    setConnectivity((c) =>
      c.map((row, x) =>
        x === i
          ? {
              ...row,
              kinds: row.kinds.includes(kind)
                ? row.kinds.filter((k) => k !== kind)
                : [...row.kinds, kind],
            }
          : row
      )
    );
  const removeConnectivityRow = (i) =>
    setConnectivity((c) => c.filter((_, x) => x !== i));

  const onPickImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeNewImage = (i) => {
    URL.revokeObjectURL(newPreviews[i]);
    setNewFiles((p) => p.filter((_, x) => x !== i));
    setNewPreviews((p) => p.filter((_, x) => x !== i));
  };

  const removeExistingImage = (url) =>
    setExistingImages((p) => p.filter((img) => img.url !== url));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const showError = (msg) => {
      alert(msg);
      setError(msg);
    };

    if (!form.title.trim()) return showError("Project title is required");
    if (!form.city.trim()) return showError("City is required");
    if (!form.address.trim()) return showError("Address is required");
    if (!form.description.trim()) return showError("Description is required");
    if (!String(form.price).trim() || Number(form.price) <= 0)
      return showError("Please enter a valid price");
    if (!editing && newFiles.length === 0)
      return showError("Please add at least one gallery image");
    const badRow = connectivity.find((c) => c.label.trim() && c.kinds.length === 0);
    if (badRow) return showError(`Pick at least one type for "${badRow.label}"`);

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("city", form.city.trim());
      fd.append("address", form.address.trim());
      fd.append("price", String(form.price));
      fd.append("configuration", form.configuration.trim());
      fd.append("bhk", String(form.bhk || ""));
      fd.append("bathrooms", String(form.bathrooms || ""));
      fd.append("area", form.area.trim());
      fd.append("propertyType", form.propertyType);
      fd.append("possession", form.possession);
      fd.append("reraNumber", form.reraNumber.trim());
      fd.append("description", form.description.trim());
      fd.append("videoUrl", form.videoUrl.trim());
      fd.append("order", String(form.order || 0));
      fd.append("status", form.status);
      // Both lists travel pipe-delimited, matching the API's parser.
      fd.append(
        "highlights",
        form.highlights.split("\n").map((s) => s.trim()).filter(Boolean).join("|")
      );
      fd.append(
        "amenities",
        form.amenities.split(",").map((s) => s.trim()).filter(Boolean).join("|")
      );
      fd.append("developer", form.developer);
      fd.append(
        "connectivity",
        JSON.stringify(
          connectivity
            .filter((c) => c.label.trim() && c.kinds.length > 0)
            .map((c) => ({
              kinds: c.kinds,
              label: c.label.trim(),
              mapLink: c.mapLink?.trim() || undefined,
            }))
        )
      );

      if (editing) {
        fd.append("existingImages", existingImages.map((i) => i.url).join("|"));
      }
      newFiles.forEach((f) => fd.append("images", f));

      const res = editing
        ? await api.put(`/featured-projects/${editing._id}`, fd)
        : await api.post("/featured-projects", fd);

      if (res.data?.success) {
        setNotice(editing ? "Featured project updated" : "Featured project added");
        setTimeout(() => setNotice(""), 4000);
        setShowForm(false);
        resetForm();
        await fetchFeaturedProjects("?all=true");
      }
    } catch (err) {
      console.error("Featured project save error:", err);
      const msg = err.response?.data?.message || "Could not save. Please try again.";
      alert(msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Reordering rewrites the `order` field for every row so the list keeps a
  // clean 0..n sequence, then refetches.
  const moveProject = async (from, to) => {
    if (to < 0 || to >= featuredProjects.length || reordering) return;
    setReordering(true);
    try {
      const next = move(featuredProjects, from, to);
      await Promise.all(
        next.map((p, i) => {
          if (p.order === i) return null;
          const fd = new FormData();
          fd.append("order", String(i));
          return api.put(`/featured-projects/${p._id}`, fd);
        })
      );
      await fetchFeaturedProjects("?all=true");
    } catch (err) {
      console.error("Reorder error:", err);
      setError("Could not reorder. Please try again.");
    } finally {
      setReordering(false);
    }
  };

  const doDelete = async (p) => {
    setDeletingId(p._id);
    try {
      const res = await api.delete(`/featured-projects/${p._id}`);
      if (res.data?.success) {
        setNotice(`"${p.title}" deleted`);
        setTimeout(() => setNotice(""), 4000);
        await fetchFeaturedProjects("?all=true");
      }
    } catch (err) {
      console.error("Featured project delete error:", err);
      setError(err.response?.data?.message || "Could not delete. Please try again.");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="admin-featured-listing" setCurrentPage={setCurrentPage} />

      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* ---------- header ---------- */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <AdminBackButton setCurrentPage={setCurrentPage} to="admin-dashboard" label="Back" />
              <h1 className="flex items-center gap-2.5 text-2xl font-bold text-gray-900">
                <Star size={24} className="text-gold" />
                Featured Listing
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Showcase projects for the homepage Featured Listing grid and their brochure
                pages. Separate from Listings and Rental properties.
              </p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-matte px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-matte"
            >
              <Plus size={17} />
              Add Featured Project
            </button>
          </div>

          {notice && (
            <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 size={17} />
              {notice}
            </div>
          )}
          {error && !showForm && (
            <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          {/* ---------- table ---------- */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader />
              </div>
            ) : featuredProjects.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <Star size={34} className="mx-auto text-gray-300" />
                <p className="mt-4 text-sm text-gray-500">
                  No featured projects yet. Add one to fill the Featured Listing grid.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Project</th>
                      <th className="px-5 py-3.5 font-semibold">Configuration</th>
                      <th className="px-5 py-3.5 font-semibold">Price</th>
                      <th className="px-5 py-3.5 font-semibold">Media</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {featuredProjects.map((p, rowIndex) => (
                      <tr
                        key={p._id}
                        {...rowDrag.dragProps(rowIndex)}
                        className={`transition-colors hover:bg-gray-50/70 ${
                          rowDrag.draggingIndex === rowIndex ? "opacity-40" : ""
                        } ${
                          rowDrag.overIndex === rowIndex && rowDrag.draggingIndex !== rowIndex
                            ? "border-t-2 border-gold"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <DragHandle label="Drag to reorder project" />
                            {p.images?.[0]?.url ? (
                              <img
                                src={p.images[0].url}
                                alt=""
                                className="h-11 w-14 shrink-0 rounded object-cover"
                              />
                            ) : (
                              <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded bg-gray-100">
                                <ImageIcon size={16} className="text-gray-400" />
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">{p.title}</p>
                              <p className="truncate text-xs text-gray-500">{p.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {p.configuration || (p.bhk ? `${p.bhk} BHK` : "—")}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-900">{inr(p.price)}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                            <ImageIcon size={13} /> {p.images?.length || 0}
                            {p.videoUrl && (
                              <Youtube size={14} className="ml-1.5 text-red-600" />
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              p.status === "inactive"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {p.status === "inactive" ? "Hidden" : "Live"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              aria-label={`Edit ${p.title}`}
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:border-matte hover:text-matte"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(p)}
                              disabled={deletingId === p._id}
                              aria-label={`Delete ${p.title}`}
                              className="rounded-lg border border-gray-200 p-2 text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 size={15} />
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
        </div>
      </main>

      {/* ---------- add / edit modal ---------- */}
      {showForm && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-[2px]">
          <div className="my-8 w-full max-w-3xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? "Edit Featured Project" : "Add Featured Project"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                aria-label="Close"
                className="text-gray-400 transition-colors hover:text-gray-900"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={submit} className="px-6 py-5" noValidate>
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-px shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Project Title *</label>
                  <input
                    className={inputClass}
                    value={form.title}
                    onChange={onField("title")}
                    placeholder="e.g. Oberoi 360 North"
                  />
                </div>

                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    className={inputClass}
                    value={form.city}
                    onChange={onField("city")}
                    placeholder="Gurugram"
                  />
                </div>
                <div>
                  <label className={labelClass}>Price (₹) *</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.price}
                    onChange={onField("price")}
                    placeholder="220000000"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Address *</label>
                  <input
                    className={inputClass}
                    value={form.address}
                    onChange={onField("address")}
                    placeholder="Sector 58, Golf Course Extension Road, Gurugram, Haryana"
                  />
                </div>

                <div>
                  <label className={labelClass}>Configuration</label>
                  <input
                    className={inputClass}
                    value={form.configuration}
                    onChange={onField("configuration")}
                    placeholder="4 & 5 BHK"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Drives the Floor Plan and Price List cards — use "&" for multiple types.
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Area (sq.ft.)</label>
                  <input
                    className={inputClass}
                    value={form.area}
                    onChange={onField("area")}
                    placeholder="4200"
                  />
                </div>

                <div>
                  <label className={labelClass}>Beds</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.bhk}
                    onChange={onField("bhk")}
                    placeholder="4"
                  />
                </div>
                <div>
                  <label className={labelClass}>Baths</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.bathrooms}
                    onChange={onField("bathrooms")}
                    placeholder="4"
                  />
                </div>

                <div>
                  <label className={labelClass}>Property Type *</label>
                  <select
                    className={inputClass}
                    value={form.propertyType}
                    onChange={onField("propertyType")}
                  >
                    {PROPERTY_TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Possession</label>
                  <select
                    className={inputClass}
                    value={form.possession}
                    onChange={onField("possession")}
                  >
                    <option value="under-construction">Under Construction</option>
                    <option value="ready">Ready to Move</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>RERA Number</label>
                  <input
                    className={inputClass}
                    value={form.reraNumber}
                    onChange={onField("reraNumber")}
                    placeholder="GGM/482/2024/58"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Description *</label>
                  <textarea
                    rows={3}
                    className={`${inputClass} resize-y`}
                    value={form.description}
                    onChange={onField("description")}
                    placeholder="Shown under 'About the Project'."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Highlights (one per line)</label>
                  <textarea
                    rows={4}
                    className={`${inputClass} resize-y`}
                    value={form.highlights}
                    onChange={onField("highlights")}
                    placeholder={"Landmark towers with skyline views.\nResort-grade clubhouse."}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Amenities (comma separated)</label>
                  <textarea
                    rows={2}
                    className={`${inputClass} resize-y`}
                    value={form.amenities}
                    onChange={onField("amenities")}
                    placeholder="Swimming Pool, Club House, Gymnasium, Power Backup"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <Youtube size={14} className="text-red-600" />
                      YouTube Video Link
                    </span>
                  </label>
                  <input
                    className={inputClass}
                    value={form.videoUrl}
                    onChange={onField("videoUrl")}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Leave blank to hide the Video Gallery section on this project's page.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Display Order</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.order}
                    onChange={onField("order")}
                    placeholder="0"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">Lower numbers show first.</p>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select className={inputClass} value={form.status} onChange={onField("status")}>
                    <option value="active">Live on site</option>
                    <option value="inactive">Hidden</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={14} />
                      Developer
                    </span>
                  </label>
                  <select className={inputClass} value={form.developer} onChange={onField("developer")}>
                    <option value="">-- No Developer --</option>
                    {developers.map((dev) => (
                      <option key={dev._id} value={dev._id}>
                        {dev.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Drives the "About the Developer" section on this project's page.
                  </p>
                </div>
              </div>

              {/* ---- location & connectivity ---- */}
              <div className="mt-6 border-t border-gray-200 pt-5">
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} />
                    Location &amp; Connectivity
                  </span>
                </label>
                <div className="space-y-3">
                  {connectivity.map((row, i) => (
                    <div key={i} className="rounded-lg border border-gray-200 p-3.5">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2.5">
                          <input
                            className={inputClass}
                            value={row.label}
                            onChange={(e) => updateConnectivityRow(i, "label", e.target.value)}
                            placeholder="e.g. DLF Cyber City — 10 mins"
                          />
                          <input
                            className={inputClass}
                            value={row.mapLink}
                            onChange={(e) => updateConnectivityRow(i, "mapLink", e.target.value)}
                            placeholder="Map link (optional) — https://maps.google.com/..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeConnectivityRow(i)}
                          aria-label="Remove"
                          className="shrink-0 rounded-lg border border-gray-200 p-2.5 text-gray-500 transition-colors hover:border-red-300 hover:text-red-600"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                        {CONNECTIVITY_KINDS.map((k) => (
                          <label
                            key={k.value}
                            className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-gray-600"
                          >
                            <input
                              type="checkbox"
                              checked={row.kinds.includes(k.value)}
                              onChange={() => toggleConnectivityKind(i, k.value)}
                              className="h-3.5 w-3.5 rounded border-gray-300 text-matte focus:ring-matte"
                            />
                            {k.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addConnectivityRow}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-matte transition-colors hover:border-matte hover:bg-ivory"
                >
                  <Plus size={13} />
                  Add Location
                </button>
              </div>

              {/* ---- images ---- */}
              <div className="mt-6 border-t border-gray-200 pt-5">
                <label className={labelClass}>
                  Gallery Images {editing ? "" : "*"} (max 15)
                </label>

                {existingImages.length > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                    {existingImages.map((img, i) => (
                      <div
                        key={img.url}
                        {...existingDrag.dragProps(i)}
                        className={`group relative aspect-[4/3] cursor-grab active:cursor-grabbing ${dragClass(
                          i,
                          existingDrag.draggingIndex,
                          existingDrag.overIndex
                        )}`}
                      >
                        <img
                          src={img.url}
                          alt=""
                          draggable={false}
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.url)}
                          aria-label="Remove image"
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                        <OrderBadge index={i} />
                      </div>
                    ))}
                  </div>
                )}

                {newPreviews.length > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                    {newPreviews.map((src, i) => (
                      <div
                        key={src}
                        {...newDrag.dragProps(i)}
                        className={`group relative aspect-[4/3] cursor-grab active:cursor-grabbing ${dragClass(
                          i,
                          newDrag.draggingIndex,
                          newDrag.overIndex
                        )}`}
                      >
                        <img
                          src={src}
                          alt=""
                          draggable={false}
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <span className="absolute left-1 top-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          NEW
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          aria-label="Remove image"
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                        <OrderBadge index={i} />
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-5 text-sm text-gray-500 transition-colors hover:border-matte hover:text-matte">
                  <ImageIcon size={17} />
                  Click to add images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onPickImages}
                    className="hidden"
                  />
                </label>
                <p className="mt-1.5 text-[11px] text-gray-500">
                  The first image becomes the card thumbnail and the brochure hero.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-matte px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-matte disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Add Featured Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- delete confirm ---------- */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Delete featured project?</h3>
            <p className="mt-2.5 text-sm text-gray-600">
              "{confirmDelete.title}" and its {confirmDelete.images?.length || 0} image(s) will be
              permanently removed. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => doDelete(confirmDelete)}
                disabled={deletingId === confirmDelete._id}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deletingId === confirmDelete._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeaturedListing;

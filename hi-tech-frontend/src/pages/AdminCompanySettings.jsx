import { useContext, useEffect, useState } from "react";
import { Settings, Save, CheckCircle2, AlertCircle } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminBackButton from "../components/admin/AdminBackButton";
import { CompanySettingsContext } from "../context/CompanySettingsContext";
import api from "../utils/api";

const inputClass =
  "w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-matte focus:ring-2 focus:ring-black/10 outline-none transition-all";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5";

// Bare 10-digit mobile numbers only — no country code, spaces, or dashes.
// Formatted with +91 wherever they're actually shown/linked on the site.
const FIELD_GROUPS = [
  {
    title: "Contact",
    fields: [
      { key: "phone", label: "Phone Number", placeholder: "1234567899", digitsOnly: true },
      { key: "whatsapp", label: "WhatsApp Number", placeholder: "1234567899", digitsOnly: true },
      { key: "email", label: "Email Address", placeholder: "info@brothersestate.com" },
      { key: "address", label: "Office Address", placeholder: "Full office address" },
    ],
  },
  {
    title: "RERA",
    fields: [
      {
        key: "rera",
        label: "Company RERA Number",
        placeholder: "Leave blank to hide it on the public site",
      },
    ],
  },
  {
    title: "Social Links",
    fields: [
      { key: "facebookUrl", label: "Facebook URL", placeholder: "https://facebook.com/..." },
      { key: "instagramUrl", label: "Instagram URL", placeholder: "https://instagram.com/..." },
      { key: "linkedinUrl", label: "LinkedIn URL", placeholder: "https://linkedin.com/..." },
      { key: "youtubeUrl", label: "YouTube URL", placeholder: "https://youtube.com/..." },
      {
        key: "googleMapsUrl",
        label: "Google Maps URL",
        placeholder: "https://maps.google.com/... or a share link",
        hint: "Opens as a \"View on Google Maps\" link. The embedded map on the site is generated from the Office Address above.",
      },
    ],
  },
];

const AdminCompanySettings = ({ setCurrentPage }) => {
  const { settings, loading, fetchSettings } = useContext(CompanySettingsContext);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) setCurrentPage("admin-login");
  }, [setCurrentPage]);

  useEffect(() => {
    if (!loading) setForm(settings || {});
  }, [loading, settings]);

  const onField = (key, digitsOnly) => (e) => {
    const value = digitsOnly ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    for (const group of FIELD_GROUPS) {
      for (const f of group.fields) {
        const value = form[f.key];
        if (f.digitsOnly && value && value.length !== 10) {
          setError(`${f.label} must be exactly 10 digits.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      await api.put("/company-settings", form);
      await fetchSettings();
      setNotice("Company settings saved.");
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="admin-company-settings" setCurrentPage={setCurrentPage} />

      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <AdminBackButton setCurrentPage={setCurrentPage} to="admin-dashboard" label="Back" />
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-gray-900">
            <Settings size={24} className="text-gold" />
            Company Settings
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Contact details, RERA number, and social links used across the public site.
          </p>

          {notice && (
            <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 size={17} />
              {notice}
            </div>
          )}
          {error && (
            <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-6 rounded-xl border border-gray-200 bg-white p-6">
            {FIELD_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
                  {group.title}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {group.fields.map((f) => (
                    <div key={f.key} className={f.key === "address" ? "sm:col-span-2" : ""}>
                      <label className={labelClass}>{f.label}</label>
                      <input
                        className={inputClass}
                        value={form[f.key] || ""}
                        onChange={onField(f.key, f.digitsOnly)}
                        placeholder={f.placeholder}
                        inputMode={f.digitsOnly ? "numeric" : undefined}
                        maxLength={f.digitsOnly ? 10 : undefined}
                      />
                      {f.digitsOnly && (
                        <p className="mt-1 text-right text-[11px] text-gray-400">
                          {(form[f.key] || "").length}/10 digits
                        </p>
                      )}
                      {f.hint && <p className="mt-1 text-[11px] text-gray-400">{f.hint}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-2 rounded-lg bg-matte px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-matte disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminCompanySettings;

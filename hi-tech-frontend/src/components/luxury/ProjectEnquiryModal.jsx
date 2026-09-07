import { useState, useEffect, useRef } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../../utils/api";
import trackEvent from "../../utils/trackEvent";

const line =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2.5 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-gold";

const BUDGET_OPTIONS = [
  "Under ₹50 L",
  "₹50 L – 1 Cr",
  "₹1 – 2 Cr",
  "₹2 – 5 Cr",
  "Above ₹5 Cr",
];

/**
 * Contact gate shown before a brochure, floor plan or price breakup is released.
 * Posts to the same `/enquiries` API as the page's main form.
 */
const ProjectEnquiryModal = ({
  open,
  onClose,
  projectName,
  context,
  propertyId,
  featuredProjectId,
  source = "brochure-gate",
}) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", budget: "", purpose: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const firstField = useRef(null);

  useEffect(() => {
    if (!open) return;
    setDone(false);
    setErrors({});
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => firstField.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone.replace(/\s/g, "")))
      next.phone = "Enter a valid 10-digit number";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/enquiries", {
        ...form,
        budget: form.budget || undefined,
        purpose: form.purpose || undefined,
        propertyId,
        featuredProjectId,
        message: `${context} request for ${projectName}`,
        source,
        sourceLabel: `${context} request — ${projectName}`,
      });
      if (res.data.success) {
        setDone(true);
        trackEvent("enquiry_submit", { source, project: projectName, context });
        if (/brochure/i.test(context)) {
          trackEvent("brochure_request", { project: projectName });
        }
        setForm({ name: "", email: "", phone: "", budget: "", purpose: "" });
        setTimeout(() => onClose(), 2200);
      }
    } catch (err) {
      console.error("Project enquiry error:", err);
      setErrors({
        form: err.response?.data?.message || "Could not submit. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const change = (key) => (e) => {
    const v = key === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value;
    setForm((f) => ({ ...f, [key]: v }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  return (
    <div
      className="ce-backdrop-in fixed inset-0 z-[120] flex items-center justify-center bg-matte/55 px-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${context} — ${projectName}`}
        onClick={(e) => e.stopPropagation()}
        className="ce-modal-in relative w-full max-w-[420px] rounded-md bg-white px-8 py-9 shadow-2xl sm:px-10"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-slate-900"
        >
          <X size={18} />
        </button>

        <h2 className="text-center text-[26px] font-bold leading-tight text-slate-900">
          {projectName}
        </h2>
        <p className="mt-1.5 text-center text-[17px] font-semibold text-slate-900">
          Share your <span className="text-gold-dark">Contact Details</span>
        </p>
        <p className="mt-1.5 text-center text-[12px] font-medium uppercase tracking-wide text-slate-500">
          To get <span className="text-red-600">best price</span> on property
        </p>

        {done ? (
          <div className="mt-8 flex items-start gap-2.5 rounded border border-emerald-200 bg-emerald-50 px-4 py-4">
            <CheckCircle2 size={18} className="mt-px shrink-0 text-emerald-600" />
            <p className="text-[14px] text-emerald-800">
              Thank you — our team will share the details shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            {[
              { key: "name", type: "text", label: "Full Name" },
              { key: "email", type: "email", label: "Email Address" },
              { key: "phone", type: "tel", label: "Phone" },
            ].map((f, i) => (
              <div key={f.key}>
                <input
                  ref={i === 0 ? firstField : null}
                  type={f.type}
                  value={form[f.key]}
                  onChange={change(f.key)}
                  placeholder={f.label}
                  aria-label={f.label}
                  aria-invalid={Boolean(errors[f.key])}
                  className={`${line} ${errors[f.key] ? "border-red-400" : ""}`}
                />
                {errors[f.key] && (
                  <p className="mt-1.5 text-[11px] text-red-600">{errors[f.key]}</p>
                )}
              </div>
            ))}

            <div>
              <select
                value={form.budget}
                onChange={change("budget")}
                aria-label="Budget"
                className={`${line} ${form.budget ? "text-slate-900" : "text-slate-400"}`}
              >
                <option value="">Budget (optional)</option>
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {[
                { value: "investment", label: "Investment" },
                { value: "self-use", label: "Self-Use" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, purpose: f.purpose === opt.value ? "" : opt.value }))
                  }
                  className={`flex-1 rounded border px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                    form.purpose === opt.value
                      ? "border-gold bg-gold/10 text-gold-dark"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {errors.form && (
              <p className="flex items-start gap-2 text-[12px] text-red-600">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                {errors.form}
              </p>
            )}

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[42px] rounded border border-slate-300 px-7 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="min-h-[42px] rounded bg-gold px-8 text-[14px] font-semibold text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProjectEnquiryModal;

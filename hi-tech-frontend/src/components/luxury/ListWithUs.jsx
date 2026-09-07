import { useState } from "react";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import GoldDivider from "./GoldDivider";
import Reveal from "../home/Reveal";
import api from "../../utils/api";

const fieldBase =
  "w-full border bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/35 focus:bg-white/[0.07]";

const Err = ({ children }) =>
  children ? (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-300">
      <AlertCircle size={12} className="shrink-0" />
      {children}
    </p>
  ) : null;

/**
 * "List With Us" — for owners who want Brothers Realestate to market their property.
 * Submits through the existing /enquiries endpoint (no new backend surface),
 * tagged in the message so the admin can tell it apart from a buyer enquiry.
 */
const ListWithUs = () => {
  const [form, setForm] = useState({ name: "", phone: "", details: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone.replace(/\s/g, "")))
      next.phone = "Please enter a valid 10-digit phone number";
    if (!form.details.trim()) next.details = "Please describe your property";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/enquiries", {
        name: form.name,
        phone: form.phone,
        // The endpoint requires an email; owners only give a phone here.
        email: "not-provided@brothersrealestate.com",
        message: `[LIST WITH US] ${form.details}`,
        source: "list-with-us",
        sourceLabel: "List With Us — owner wants us to market a property",
      });
      setSubmitted(true);
      setForm({ name: "", phone: "", details: "" });
      setErrors({});
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting listing request:", error);
      setErrors({
        form: error.response?.data?.message || "Failed to submit. Please try again.",
      });
    }
    setLoading(false);
  };

  return (
    <section className="bg-matte py-16 sm:py-20">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          {/* Pitch */}
          <Reveal variant="left">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
                Share Your Details To
              </p>
              <h2 className="mt-4 font-serif text-[22px] font-semibold uppercase leading-[1.1] tracking-[0.02em] text-white sm:text-4xl sm:leading-[1.02] lg:text-[3rem]">
                List <span className="text-gold">With Us</span>
              </h2>
              <GoldDivider className="mt-6" tone="light" />
              <p className="mt-6 max-w-md text-sm leading-[1.9] text-white/55">
                Have a property to sell or lease? Our advisory team will value it,
                position it and bring it to the right buyers across Gurugram and
                Delhi NCR.
              </p>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal variant="right" delay={100}>
            <div>
              {submitted && (
                <div
                  role="status"
                  className="mb-5 flex items-start gap-2.5 border border-gold/40 bg-gold/10 p-3.5 text-[13px] text-gold-light"
                >
                  <CheckCircle2 size={16} className="mt-px shrink-0" />
                  <span>Received. Our team will contact you shortly.</span>
                </div>
              )}
              {errors.form && (
                <div className="mb-5 flex items-start gap-2.5 border border-red-400/50 bg-red-500/10 p-3.5 text-[13px] text-red-200">
                  <AlertCircle size={16} className="mt-px shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    aria-label="Full name"
                    value={form.name}
                    aria-invalid={Boolean(errors.name)}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`${fieldBase} ${
                      errors.name ? "border-red-400/70" : "border-white/15 focus:border-gold"
                    }`}
                  />
                  <Err>{errors.name}</Err>
                </div>

                <div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Phone Number (10 digits)"
                    aria-label="Phone number"
                    value={form.phone}
                    aria-invalid={Boolean(errors.phone)}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                    }
                    className={`${fieldBase} ${
                      errors.phone ? "border-red-400/70" : "border-white/15 focus:border-gold"
                    }`}
                  />
                  <Err>{errors.phone}</Err>
                </div>

                <div>
                  <textarea
                    rows={4}
                    placeholder="Details of your property"
                    aria-label="Details of your property"
                    value={form.details}
                    aria-invalid={Boolean(errors.details)}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    className={`${fieldBase} resize-y ${
                      errors.details ? "border-red-400/70" : "border-white/15 focus:border-gold"
                    }`}
                  />
                  <Err>{errors.details}</Err>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`group inline-flex min-h-[52px] w-full items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    loading
                      ? "cursor-not-allowed bg-gold/50 text-matte/70"
                      : "bg-gold text-matte hover:bg-gold-light"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-matte/30 border-t-matte" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-500 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default ListWithUs;

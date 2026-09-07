import { ArrowRight, BedDouble, IndianRupee, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import GoldDivider from "./GoldDivider";
import Reveal from "../home/Reveal";
import useEnquiryForm from "../../hooks/useEnquiryForm";
import useSiteInfo from "../../hooks/useSiteInfo";

const BUDGET_OPTIONS = [
  "Under ₹50 L",
  "₹50 L – 1 Cr",
  "₹1 – 2 Cr",
  "₹2 – 5 Cr",
  "Above ₹5 Cr",
];

const heading =
  "font-serif text-lg font-semibold uppercase tracking-[0.16em] text-gold";

const inputBase =
  "w-full border bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/35 focus:bg-white/[0.07]";
const inputOk = "border-white/15 focus:border-gold";
const inputErr = "border-red-400/70 focus:border-red-400";

const Err = ({ children }) =>
  children ? (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-300">
      <AlertCircle size={12} className="shrink-0" />
      {children}
    </p>
  ) : null;

/**
 * Dark three-column closing section: quick facts, the live enquiry form
 * and the existing Google Maps embed.
 */
// The Contact page reuses this block, so it passes its own source labels —
// otherwise every contact-page lead would read as a homepage one in the admin.
const LuxContact = ({
  setCurrentPage,
  quickFacts = [],
  source = "homepage-contact",
  sourceLabel = "Homepage — Get In Touch form",
}) => {
  const site = useSiteInfo();
  const {
    formData,
    setField,
    consent,
    setConsent,
    errors,
    loading,
    submitted,
    handleSubmit,
  } = useEnquiryForm({ source, sourceLabel });

  const facts =
    quickFacts.length > 0
      ? quickFacts
      : [
          { icon: BedDouble, label: "Typology", value: "1, 2, 3 & 4 BHK" },
          { icon: IndianRupee, label: "Price", value: "On Request" },
          { icon: MapPin, label: "Location", value: "Gurugram, Haryana" },
        ];

  return (
    <section className="bg-matte py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
          {/* ---- Quick facts ---- */}
          <Reveal variant="up" duration={700}>
            <div>
              <h2 className={heading}>Quick Facts</h2>
              <GoldDivider className="mt-4" tone="light" />

              <ul className="mt-7 space-y-6">
                {facts.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-start gap-3.5">
                    <Icon size={18} strokeWidth={1.3} className="mt-0.5 shrink-0 text-gold" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/70">
                        {label}
                      </p>
                      <p className="mt-1 text-sm text-white/75">{value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* ---- Enquiry form (live API) ---- */}
          <Reveal variant="up" delay={100} duration={700}>
            <div>
              <h2 className={heading}>Get In Touch</h2>
              <GoldDivider className="mt-4" tone="light" />

              {submitted && (
                <div
                  role="status"
                  className="mt-6 flex items-start gap-2.5 border border-gold/40 bg-gold/10 p-3.5 text-[13px] text-gold-light"
                >
                  <CheckCircle2 size={16} className="mt-px shrink-0" />
                  <span>Message sent. Our team will reach out shortly.</span>
                </div>
              )}

              <div className="mt-6 space-y-3.5">
                <div>
                  <input
                    type="text"
                    placeholder="Enter Your Name"
                    aria-label="Your name"
                    value={formData.name}
                    aria-invalid={Boolean(errors.name)}
                    onChange={(e) => setField("name", e.target.value)}
                    className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                  />
                  <Err>{errors.name}</Err>
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Enter Your Email"
                    aria-label="Your email"
                    value={formData.email}
                    aria-invalid={Boolean(errors.email)}
                    onChange={(e) => setField("email", e.target.value)}
                    className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
                  />
                  <Err>{errors.email}</Err>
                </div>

                <div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter Your Phone Number"
                    aria-label="Your phone number"
                    value={formData.phone}
                    aria-invalid={Boolean(errors.phone)}
                    onChange={(e) =>
                      setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className={`${inputBase} ${errors.phone ? inputErr : inputOk}`}
                  />
                  <Err>{errors.phone}</Err>
                </div>

                <div>
                  <select
                    value={formData.budget}
                    onChange={(e) => setField("budget", e.target.value)}
                    aria-label="Budget"
                    className={`${inputBase} ${inputOk} ${formData.budget ? "text-white" : "text-white/35"}`}
                  >
                    <option value="" className="text-matte">Budget (optional)</option>
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b} value={b} className="text-matte">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2.5">
                  {[
                    { value: "investment", label: "Investment" },
                    { value: "self-use", label: "Self-Use" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setField("purpose", formData.purpose === opt.value ? "" : opt.value)
                      }
                      className={`flex-1 border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                        formData.purpose === opt.value
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-white/15 text-white/55 hover:border-white/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div>
                  <textarea
                    rows={3}
                    placeholder="Your Message"
                    aria-label="Your message"
                    value={formData.message}
                    aria-invalid={Boolean(errors.message)}
                    onChange={(e) => setField("message", e.target.value)}
                    className={`${inputBase} resize-y ${errors.message ? inputErr : inputOk}`}
                  />
                  <Err>{errors.message}</Err>
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="lux-consent"
                    checked={consent}
                    aria-invalid={Boolean(errors.consent)}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-gold"
                  />
                  <label
                    htmlFor="lux-consent"
                    className="cursor-pointer text-[11px] leading-relaxed text-white/45"
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setCurrentPage("terms-conditions")}
                      className="text-gold underline underline-offset-2 transition hover:text-gold-light"
                    >
                      Terms &amp; Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => setCurrentPage("privacy-policy")}
                      className="text-gold underline underline-offset-2 transition hover:text-gold-light"
                    >
                      Privacy Policy
                    </button>
                    . You may contact me via Email, WhatsApp, SMS, RCS, or Call.
                  </label>
                </div>
                <Err>{errors.consent}</Err>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`group inline-flex min-h-[50px] w-full items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    loading
                      ? "cursor-not-allowed bg-gold/50 text-matte/70"
                      : "bg-gold text-matte hover:bg-gold-light"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-matte/30 border-t-matte" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Submit Now
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-500 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </div>
            </div>
          </Reveal>

          {/* ---- Location (existing embed) ---- */}
          <Reveal variant="up" delay={200} duration={700}>
            <div>
              <h2 className={heading}>Our Location</h2>
              <GoldDivider className="mt-4" tone="light" />

              <div className="mt-6 overflow-hidden border border-white/12">
                <iframe
                  src={site.mapEmbedSrc}
                  width="100%"
                  height="230"
                  style={{ border: 0, filter: "grayscale(0.35) contrast(1.05)" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Brothers Real Estate office location"
                />
              </div>

              <p className="mt-4 flex items-start gap-2.5 text-[13px] leading-relaxed text-white/55">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
                {site.address}
              </p>
              <a
                href={site.googleMapsViewUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light"
              >
                View on Google Maps ↗
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default LuxContact;

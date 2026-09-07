import { useState, useEffect, useMemo, useContext, useRef } from "react";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Download,
  BadgeIndianRupee,
  Handshake,
  UserCheck,
  ShieldCheck,
  Navigation,
  Gem,
  Headset,
  Waves,
  Dumbbell,
  Trees,
  Zap,
  Car,
  Wifi,
  Utensils,
  Building2,
  Users,
} from "lucide-react";
import api from "../utils/api";
import trackEvent from "../utils/trackEvent";
import { PropertyContext } from "../context/PropertyContext";
import { FeaturedProjectContext } from "../context/FeaturedProjectContext";
import ProjectEnquiryModal from "../components/luxury/ProjectEnquiryModal";
import Reveal from "../components/home/Reveal";
import useSiteInfo from "../hooks/useSiteInfo";

const FALLBACK =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80";

/** ₹19200000 → "₹ 1,92,00,000" */
const fullPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  return `₹ ${n.toLocaleString("en-IN")}`;
};

/** Compact form used on the similar-properties cards. */
const shortPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr*`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(2).replace(/\.?0+$/, "")} L*`;
  return `₹ ${n.toLocaleString("en-IN")}`;
};

const AMENITY_ICONS = [
  [/pool|swim/i, Waves],
  [/gym|fitness/i, Dumbbell],
  [/garden|park|green|landscap/i, Trees],
  [/secur|cctv|guard/i, ShieldCheck],
  [/power|backup|electric/i, Zap],
  [/park(ing)?|car/i, Car],
  [/wifi|internet|smart/i, Wifi],
  [/kitchen|modular|dining/i, Utensils],
  [/club|hall|lounge|community/i, Building2],
  [/play|kids|children|yoga/i, Users],
];
const iconFor = (label) =>
  (AMENITY_ICONS.find(([re]) => re.test(label)) || [null, Sparkles])[1];

const ASSURANCES = [
  { icon: BadgeIndianRupee, label: "Best price guarantee" },
  { icon: Handshake, label: "Zero brokerage" },
  { icon: UserCheck, label: "Expert property consultants" },
  { icon: ShieldCheck, label: "100% transparency" },
];

const TRUST = [
  { icon: Navigation, title: "Prime Locations", desc: "Strategic locations across Gurugram" },
  { icon: Gem, title: "Premium Properties", desc: "Curated luxury residences that inspire" },
  { icon: ShieldCheck, title: "Trust & Transparency", desc: "100% transparent process from start to finish" },
  { icon: Headset, title: "Expert Assistance", desc: "Personalized support at every step" },
];

const field =
  "w-full rounded-lg border border-black/10 bg-ivory/60 px-4 py-3 text-[14px] text-matte outline-none transition-colors placeholder:text-matte/40 focus:border-gold focus:bg-white";

/** Section heading with the short gold rule running off to the right. */
const Head = ({ children }) => (
  <h2 className="flex items-center gap-4 font-serif text-[19px] font-semibold uppercase tracking-[0.08em] text-matte sm:text-[21px]">
    {children}
    <span aria-hidden="true" className="h-px w-10 bg-gold" />
  </h2>
);

/**
 * The standard property brochure used everywhere except the Featured Listing
 * flow, which keeps its own layout in `PropertyDetails.jsx`.
 */
const ClassicPropertyDetails = ({
  property,
  setCurrentPage,
  setSelectedProperty,
  backTo = "listings",
}) => {
  const site = useSiteInfo();
  const { properties = [] } = useContext(PropertyContext);
  const { findFeatured } = useContext(FeaturedProjectContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    budget: "",
    purpose: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [slide, setSlide] = useState(0);
  const [gate, setGate] = useState(false);
  const railRef = useRef(null);

  useEffect(() => {
    if (!property?._id) return;
    const trackView = async () => {
      try {
        let sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
          sessionId = Date.now().toString() + Math.random().toString(36).substring(2);
          localStorage.setItem("sessionId", sessionId);
        }
        await api.post("/analytics/view", { propertyId: property._id, sessionId });
      } catch (error) {
        console.error("Analytics tracking error:", error);
      }
    };
    trackView();
  }, [property?._id]);

  useEffect(() => {
    setSlide(0);
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (e) {
      /* ignore */
    }
  }, [property?._id]);

  const images = useMemo(
    () => (property?.images || []).map((i) => i?.url || i).filter(Boolean),
    [property]
  );

  const videos = useMemo(() => {
    if (!property) return [];
    const list = property.videos?.length
      ? property.videos
      : property.video
        ? [property.video]
        : [];
    // Empty video subdocuments carry no `url` and must not render a black player.
    return list.filter((v) => (typeof v === "string" ? v : v?.url));
  }, [property]);

  const highlights = useMemo(() => {
    const raw = property?.highlights;
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === "string") return raw.split("|").map((h) => h.trim()).filter(Boolean);
    return [];
  }, [property]);

  const amenities = useMemo(() => {
    const raw = property?.amenities;
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === "string") return raw.split(",").map((a) => a.trim()).filter(Boolean);
    return [];
  }, [property]);

  // Same-city listings first, then anything else — never the current property,
  // and never a Featured Listing project (those have their own section).
  const similar = useMemo(() => {
    if (!property) return [];
    const pool = properties.filter(
      (p) =>
        p._id !== property._id &&
        !p.rentalCategory === !property.rentalCategory &&
        !findFeatured(p)
    );
    const sameCity = pool.filter((p) => p.city === property.city);
    const rest = pool.filter((p) => p.city !== property.city);
    return [...sameCity, ...rest].slice(0, 8);
  }, [properties, property, findFeatured]);

  if (!property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-4 text-center">
        <p className="font-serif text-xl font-semibold text-matte">Property not found</p>
        <button
          onClick={() => setCurrentPage(backTo)}
          className="mt-5 rounded-lg bg-matte px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-matte"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const isRental = Boolean(property.rentalCategory);
  const shown = images.length ? images : [FALLBACK];
  const go = (dir) => setSlide((s) => (s + dir + shown.length) % shown.length);

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) next.email = "Enter a valid email";
    if (!formData.phone.trim()) next.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone)) next.phone = "Please enter a valid 10-digit phone number";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await api.post("/enquiries", {
        ...formData,
        budget: formData.budget || undefined,
        purpose: formData.purpose || undefined,
        propertyId: property._id,
        source: "property-detail",
        sourceLabel: `Property enquiry — ${property.title}`,
      });
      if (response.data.success) {
        setSubmitted(true);
        trackEvent("enquiry_submit", { source: "property-detail", project: property.title });
        setFormData({ name: "", email: "", phone: "", message: "", budget: "", purpose: "" });
        setErrors({});
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Enquiry submit error:", error);
      setErrors({
        form: error.response?.data?.message || "Failed to submit enquiry. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (key) => (e) => {
    // Phone is digits-only, capped at 10 — matches every other enquiry form
    // on the site (LuxContact, ProjectEnquiryModal, ListWithUs, etc.).
    const value = key === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value;
    setFormData((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const stats = [
    property.bhk ? { icon: BedDouble, value: property.bhk, label: "Bedrooms" } : null,
    property.bathrooms ? { icon: Bath, value: property.bathrooms, label: "Bathrooms" } : null,
    property.area ? { icon: Maximize, value: property.area, label: "Sq.ft" } : null,
  ].filter(Boolean);

  // Only fields the record actually carries — nothing is invented here.
  const details = [
    property.configuration && ["Configuration", property.configuration],
    property.possession && [
      "Possession",
      property.possession === "ready" ? "Ready to Move" : "Under Construction",
    ],
    property.reraNumber && ["RERA No.", property.reraNumber],
    property.propertyType && [
      "Project Type",
      property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1),
    ],
    property.area && ["Area", `${property.area} Sq.ft`],
    property.price > 0 && [
      isRental ? "Monthly Rent" : "Starting Price",
      `${fullPrice(property.price)}${isRental ? "" : " Onwards"}`,
    ],
  ].filter(Boolean);

  const scrollRail = (dir) =>
    railRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <div className="bg-white">
      {/* ==================== BREADCRUMB ==================== */}
      <div className="sticky top-0 z-30 border-b border-black/[0.07] bg-white/95 backdrop-blur sm:static sm:bg-white sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-[82rem] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-1.5 sm:px-6 sm:py-4 lg:px-8">
          {/* Full-height tap target on phones — as plain inline text it was a
              21px-tall link that was easy to miss and hard to hit. */}
          <button
            onClick={() => setCurrentPage(backTo)}
            className="group inline-flex min-h-[44px] items-center gap-2 text-[13px] font-semibold text-matte transition-colors sm:min-h-0 sm:font-medium sm:text-matte/55 sm:hover:text-matte"
          >
            <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-0.5" />
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to Listings</span>
          </button>
          <span className="hidden h-4 w-px bg-black/10 sm:block" />
          <nav className="hidden flex-wrap items-center gap-1.5 text-[13px] text-matte/50 sm:flex">
            <button onClick={() => setCurrentPage("home")} className="hover:text-matte">
              Home
            </button>
            <ChevronRight size={13} className="text-matte/25" />
            <button onClick={() => setCurrentPage(backTo)} className="hover:text-matte">
              Properties
            </button>
            <ChevronRight size={13} className="text-matte/25" />
            <span className="font-semibold text-matte">{property.title}</span>
          </nav>
        </div>
      </div>

      {/* ==================== GALLERY MOSAIC ==================== */}
      <div className="mx-auto max-w-[82rem] px-4 pt-6 sm:px-6 lg:px-8">
        {/* Stage and rail carry the same explicit height so they line up — a
            percentage height would collapse against the grid's auto row. */}
        <div className="grid gap-2.5 lg:grid-cols-[minmax(0,2.05fr)_minmax(0,1fr)]">
          {/* Stage */}
          <div className="relative h-[260px] overflow-hidden rounded-xl bg-matte sm:h-[380px] lg:h-[520px]">
            <img
              key={shown[slide]}
              src={shown[slide]}
              alt={`${property.title} — image ${slide + 1}`}
              onError={(e) => {
                if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK;
              }}
              className="h-full w-full object-cover"
            />

            {property.featured && (
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-matte shadow-sm backdrop-blur">
                <Sparkles size={13} className="text-gold" />
                Featured
              </span>
            )}

            {shown.length > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-matte/70 text-white backdrop-blur-sm transition-colors hover:bg-gold hover:text-matte"
                >
                  <ChevronLeft size={19} />
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-matte/70 text-white backdrop-blur-sm transition-colors hover:bg-gold hover:text-matte"
                >
                  <ChevronRight size={19} />
                </button>
                <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-1.5">
                  {shown.slice(0, 6).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      aria-label={`Go to image ${i + 1}`}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === slide ? "w-7 bg-gold" : "w-3.5 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Side rail — three peeks, the last one carrying the photo count */}
          {shown.length > 1 && (
            <div className="hidden grid-rows-3 gap-2.5 lg:grid lg:h-[520px]">
              {[1, 2, 3].map((offset) => {
                const idx = (slide + offset) % shown.length;
                const isLast = offset === 3 && shown.length > 4;
                return (
                  <button
                    key={offset}
                    onClick={() => setSlide(idx)}
                    aria-label={`Show image ${idx + 1}`}
                    className="group relative overflow-hidden rounded-xl bg-matte"
                  >
                    <img
                      src={shown[idx]}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                    />
                    {isLast && (
                      <span className="absolute inset-0 flex flex-col items-center justify-center bg-matte/65 text-white backdrop-blur-[1px]">
                        <span className="font-serif text-[22px] font-semibold leading-none">
                          +{shown.length - 4}
                        </span>
                        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">
                          More Photos
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==================== BODY ==================== */}
      <div className="mx-auto max-w-[82rem] px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_368px] lg:gap-12">
          {/* ---------- LEFT ---------- */}
          <div>
            <span className="inline-flex rounded border border-gold/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-dark">
              {isRental ? "For Rent" : "For Sale"}
            </span>

            <h1 className="mt-4 font-serif text-[23px] font-semibold leading-[1.12] tracking-[0.01em] text-matte sm:text-[40px]">
              {property.title}
            </h1>

            {(property.address || property.city) && (
              <p className="mt-3 flex items-start gap-2 text-[15px] text-matte/60">
                <MapPin size={17} className="mt-0.5 shrink-0 text-gold" />
                {/* The address usually already carries the city — don't repeat it. */}
                <span>
                  {[
                    property.address,
                    property.address
                      ?.toLowerCase()
                      .includes(String(property.city || "").toLowerCase())
                      ? null
                      : property.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </p>
            )}

            {stats.length > 0 && (
              <>
                <div className="mt-7 border-t border-black/[0.08]" />
                <div className="flex flex-wrap items-center gap-y-5 py-6">
                  {stats.map(({ icon: Icon, value, label }, i) => (
                    <div
                      key={label}
                      className={`flex items-center gap-3 pr-8 sm:pr-11 ${
                        i > 0 ? "border-l border-black/[0.08] pl-8 sm:pl-11" : ""
                      }`}
                    >
                      <Icon size={22} strokeWidth={1.3} className="shrink-0 text-gold" />
                      <div>
                        <p className="font-serif text-[23px] font-semibold leading-none text-matte">
                          {value}
                        </p>
                        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-matte/45">
                          {label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-black/[0.08]" />
              </>
            )}

            {property.description && (
              <section className="pt-8">
                <Head>About this property</Head>
                <p className="mt-4 whitespace-pre-line text-[15px] leading-[1.9] text-matte/65">
                  {property.description}
                </p>
              </section>
            )}

            {highlights.length > 0 && (
              <section className="pt-9">
                <Head>Project Highlights</Head>
                <ul className="mt-4 space-y-3">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-[15px] text-matte/65">
                      <CheckCircle2
                        size={17}
                        strokeWidth={1.7}
                        className="mt-0.5 shrink-0 text-gold"
                      />
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {amenities.length > 0 && (
              <section className="pt-9">
                <Head>Amenities</Head>
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                  {amenities.map((a) => {
                    const Icon = iconFor(a);
                    return (
                      <div
                        key={a}
                        className="group flex flex-col items-center gap-2.5 rounded-lg border border-black/[0.09] px-3 py-4 text-center transition-colors hover:border-gold/50"
                      >
                        <Icon
                          size={21}
                          strokeWidth={1.2}
                          className="text-gold transition-transform duration-500 group-hover:-translate-y-0.5 motion-reduce:group-hover:transform-none"
                        />
                        <span className="text-[12px] leading-snug text-matte/70">{a}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {details.length > 0 && (
              <section className="pt-9">
                <Head>Project Details</Head>
                <div className="mt-4 overflow-hidden rounded-lg border border-black/[0.09]">
                  <dl className="grid grid-cols-1 sm:grid-cols-2">
                    {details.map(([k, v], i) => (
                      <div
                        key={k}
                        className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
                          i % 2 === 0 ? "sm:border-r sm:border-black/[0.09]" : ""
                        } ${i >= 2 ? "border-t border-black/[0.09]" : "border-t border-black/[0.09] sm:border-t-0"}`}
                      >
                        <dt className="text-[13px] text-matte/55">{k}</dt>
                        <dd className="text-right text-[13px] font-semibold text-matte">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
            )}

            {(property.ownerName || property.ownerDetails) && (
              <section className="pt-9">
                <Head>Owner Details</Head>
                <div className="mt-4 overflow-hidden rounded-lg border border-black/[0.09]">
                  <dl className="grid grid-cols-1 sm:grid-cols-2">
                    {property.ownerName && (
                      <div className="flex items-center justify-between gap-4 border-b border-black/[0.09] px-4 py-3.5 sm:border-r">
                        <dt className="text-[13px] text-matte/55">Owner Name</dt>
                        <dd className="text-right text-[13px] font-semibold text-matte">
                          {property.ownerName}
                        </dd>
                      </div>
                    )}
                    {property.ownerDetails && (
                      <div className="flex items-center justify-between gap-4 border-b border-black/[0.09] px-4 py-3.5">
                        <dt className="text-[13px] text-matte/55">Contact / Details</dt>
                        <dd className="text-right text-[13px] font-semibold text-matte">
                          {property.ownerDetails}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </section>
            )}

            {videos.length > 0 && (
              <section className="pt-9">
                <Head>Video Tour</Head>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {videos.map((v, i) => (
                    <video
                      key={typeof v === "string" ? v : v.url || i}
                      src={typeof v === "string" ? v : v.url}
                      controls
                      preload="metadata"
                      className="w-full rounded-lg bg-matte"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ---------- RIGHT: sticky enquiry card ---------- */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-xl border border-black/[0.09] bg-white shadow-[0_2px_16px_rgba(12,12,13,0.06)]">
              {/* Price header */}
              <div className="bg-matte px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
                  {isRental ? "Monthly Rent" : "Asking Price"}
                </p>
                <p className="mt-2 font-serif text-[23px] font-semibold leading-none text-white sm:text-[29px]">
                  {fullPrice(property.price)}
                </p>
                <p className="mt-1.5 text-[12px] text-white/45">
                  {isRental ? "Per month" : "Onwards"}
                </p>
              </div>

              <div className="px-6 py-6">
                <Head>Interested?</Head>

                {submitted ? (
                  <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-gold/40 bg-gold/10 px-4 py-4">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-gold-dark" />
                    <p className="text-[14px] text-matte/75">
                      Thank you — our team will contact you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
                    {[
                      { key: "name", type: "text", placeholder: "Your Name" },
                      { key: "email", type: "email", placeholder: "Email Address" },
                      { key: "phone", type: "tel", placeholder: "Phone Number", maxLength: 10 },
                    ].map(({ key, type, placeholder, maxLength }) => (
                      <div key={key}>
                        <input
                          type={type}
                          value={formData[key]}
                          onChange={onChange(key)}
                          placeholder={placeholder}
                          maxLength={maxLength}
                          inputMode={key === "phone" ? "numeric" : undefined}
                          aria-label={placeholder}
                          aria-invalid={Boolean(errors[key])}
                          className={`${field} ${errors[key] ? "border-red-300 bg-red-50/40" : ""}`}
                        />
                        {errors[key] && (
                          <p className="mt-1.5 text-[12px] text-red-600">{errors[key]}</p>
                        )}
                      </div>
                    ))}

                    <select
                      value={formData.budget}
                      onChange={onChange("budget")}
                      aria-label="Budget"
                      className={`${field} ${formData.budget ? "" : "text-matte/40"}`}
                    >
                      <option value="">Budget (optional)</option>
                      {["Under ₹50 L", "₹50 L – 1 Cr", "₹1 – 2 Cr", "₹2 – 5 Cr", "Above ₹5 Cr"].map(
                        (b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        )
                      )}
                    </select>

                    <div className="flex items-center gap-2.5">
                      {[
                        { value: "investment", label: "Investment" },
                        { value: "self-use", label: "Self-Use" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setFormData((f) => ({
                              ...f,
                              purpose: f.purpose === opt.value ? "" : opt.value,
                            }))
                          }
                          className={`flex-1 rounded-lg border px-3 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                            formData.purpose === opt.value
                              ? "border-gold bg-gold/10 text-gold-dark"
                              : "border-black/10 text-matte/55 hover:border-black/20"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={onChange("message")}
                      placeholder="Hi, I am interested in this property..."
                      aria-label="Message"
                      className={`${field} resize-none`}
                    />

                    {errors.form && (
                      <p className="flex items-start gap-2 text-[12px] text-red-600">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        {errors.form}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-matte px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-gold hover:text-matte disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send size={15} />
                      {loading ? "Sending..." : "Request Details"}
                    </button>
                  </form>
                )}

                <div className="mt-6 space-y-3.5 border-t border-black/[0.08] pt-5">
                  <a
                    href={site.phoneHref}
                    className="flex items-center gap-3 text-matte/65 transition-colors hover:text-matte"
                  >
                    <Phone size={17} strokeWidth={1.5} className="shrink-0 text-gold" />
                    <span className="text-[14px]">{site.phoneDisplay}</span>
                  </a>
                  <a
                    href={`mailto:${site.email}`}
                    className="flex items-center gap-3 text-matte/65 transition-colors hover:text-matte"
                  >
                    <Mail size={17} strokeWidth={1.5} className="shrink-0 text-gold" />
                    <span className="text-[14px]">{site.email}</span>
                  </a>
                </div>

                <ul className="mt-5 space-y-3 border-t border-black/[0.08] pt-5">
                  {ASSURANCES.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-3 text-[13px] text-matte/60">
                      <Icon size={16} strokeWidth={1.5} className="shrink-0 text-gold" />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ==================== BROCHURE BANNER ==================== */}
      <div className="mx-auto max-w-[82rem] px-4 pb-12 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <div className="relative overflow-hidden rounded-xl bg-matte">
            <img
              src={shown[1] || shown[0]}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-matte via-matte/90 to-matte/35" />

            <div className="relative flex flex-wrap items-center gap-6 px-7 py-8 sm:px-10">
              <Download size={30} strokeWidth={1.1} className="shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[19px] font-semibold text-white">
                  Download Brochure
                </p>
                <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-white/55">
                  Get detailed project information, floor plans, price list &amp; payment plan.
                </p>
                <button
                  onClick={() => setGate(true)}
                  className="group mt-4 inline-flex min-h-[44px] items-center gap-2.5 border border-gold px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-matte"
                >
                  Download Now
                  <Download size={14} />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ==================== SIMILAR PROPERTIES ==================== */}
      {similar.length > 0 && (
        <div className="mx-auto max-w-[82rem] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            <Head>Similar properties you may like</Head>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => scrollRail(-1)}
                aria-label="Scroll left"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/12 text-matte/60 transition-colors hover:border-gold hover:text-gold"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                onClick={() => scrollRail(1)}
                aria-label="Scroll right"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/12 text-matte/60 transition-colors hover:border-gold hover:text-gold"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <div
            ref={railRef}
            className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {similar.map((s) => {
              const img = s.images?.[0]?.url || s.images?.[0] || FALLBACK;
              const cfg = s.configuration || (s.bhk ? `${s.bhk} BHK` : null);
              return (
                <article
                  key={s._id}
                  onClick={() => {
                    setSelectedProperty?.(s);
                    setCurrentPage("property-details-classic");
                    try {
                      window.scrollTo({ top: 0, behavior: "auto" });
                    } catch (e) {
                      /* ignore */
                    }
                  }}
                  className="group w-[262px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-xl border border-black/[0.09] bg-white transition-shadow hover:shadow-[0_6px_22px_rgba(12,12,13,0.09)]"
                >
                  <div className="relative h-[160px] overflow-hidden bg-matte">
                    <img
                      src={img}
                      alt={s.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                    />
                    {s.possession === "under-construction" && (
                      <span className="absolute left-3 top-3 rounded bg-matte/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-gold-light backdrop-blur-sm">
                        New Launch
                      </span>
                    )}
                  </div>

                  <div className="px-4 py-4">
                    <p className="truncate font-serif text-[15px] font-semibold text-matte">
                      {s.title}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 truncate text-[11px] text-matte/50">
                      <MapPin size={11} className="shrink-0 text-gold" />
                      {[
                        s.address,
                        s.address?.toLowerCase().includes(String(s.city || "").toLowerCase())
                          ? null
                          : s.city,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {cfg && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-matte/50">
                        <BedDouble size={11} className="shrink-0 text-gold" />
                        {cfg}
                      </p>
                    )}
                    <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-black/[0.07] pt-3.5">
                      <span className="font-serif text-[14px] font-semibold text-matte">
                        {shortPrice(s.price)}
                        <span className="ml-1 font-sans text-[10px] font-medium text-matte/45">
                          {s.rentalCategory ? "/ month" : "Onwards"}
                        </span>
                      </span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/45 text-gold transition-colors group-hover:bg-gold group-hover:text-matte">
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TRUST STRIP ==================== */}
      <div className="bg-matte">
        <div className="mx-auto grid max-w-[82rem] grid-cols-1 gap-y-7 px-4 py-9 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-y-0 lg:px-8">
          {TRUST.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 80} variant="up">
              <div
                className={`group flex items-start gap-3.5 lg:px-6 ${
                  i > 0 ? "lg:border-l lg:border-white/[0.12]" : ""
                }`}
              >
                <Icon
                  size={24}
                  strokeWidth={1.1}
                  className="mt-0.5 shrink-0 text-gold transition-transform duration-500 group-hover:scale-110 motion-reduce:group-hover:scale-100"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-light">
                    {title}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/45">{desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Contact gate for the brochure */}
      <ProjectEnquiryModal
        open={gate}
        onClose={() => setGate(false)}
        projectName={property.title}
        context="Brochure"
        propertyId={property._id}
        source="property-brochure"
      />
    </div>
  );
};

export default ClassicPropertyDetails;

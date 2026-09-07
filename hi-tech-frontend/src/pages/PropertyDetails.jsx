import { useState, useEffect, useMemo, useRef } from "react";
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
  Send,
  CheckCircle2,
  AlertCircle,
  Home,
  Waves,
  Dumbbell,
  Trees,
  ShieldCheck,
  Zap,
  Car,
  Wifi,
  Utensils,
  Building2,
  Users,
  Sparkles,
  MessageCircle,
  Download,
  GraduationCap,
  Stethoscope,
  TrainFront,
  Route,
  Landmark as LandmarkIcon,
  ExternalLink,
  X,
} from "lucide-react";
import api from "../utils/api";
import trackEvent from "../utils/trackEvent";
import GoldDivider from "../components/luxury/GoldDivider";
import Reveal from "../components/home/Reveal";
import ProjectEnquiryModal from "../components/luxury/ProjectEnquiryModal";
import useSiteInfo, { buildWhatsAppUrl } from "../hooks/useSiteInfo";

const FALLBACK =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80";

// Each project embeds its own location — built from its own address/city
// rather than one hardcoded spot every project used to share.
const mapSrcFor = (property) => {
  const query = [property?.address, property?.city].filter(Boolean).join(", ") || property?.title;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
};

const BUDGET_OPTIONS = ["Under ₹50 L", "₹50 L – 1 Cr", "₹1 – 2 Cr", "₹2 – 5 Cr", "Above ₹5 Cr"];

const CONNECTIVITY_META = {
  school: { icon: GraduationCap, label: "Schools" },
  hospital: { icon: Stethoscope, label: "Hospitals" },
  metro: { icon: TrainFront, label: "Metro" },
  highway: { icon: Route, label: "Highways" },
  landmark: { icon: LandmarkIcon, label: "Landmarks" },
};

/** ₹220000000 → "₹22 Cr" */
const luxePrice = (value, isRental = false) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  if (isRental) return `₹${n.toLocaleString("en-IN")}`;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

/** Splits the price into the parts the hero medallion renders separately. */
const priceBadge = (value, isRental = false) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (isRental)
    return { num: n.toLocaleString("en-IN"), unit: "", tail: "Per Month" };
  if (n >= 10000000)
    return { num: (n / 10000000).toFixed(2).replace(/\.?0+$/, ""), unit: "Cr", tail: "Onwards" };
  if (n >= 100000)
    return { num: (n / 100000).toFixed(2).replace(/\.?0+$/, ""), unit: "L", tail: "Onwards" };
  return { num: n.toLocaleString("en-IN"), unit: "", tail: "Onwards" };
};

// Amenity label → thin-line icon. Unmatched amenities fall back to a sparkle.
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

const fieldBase =
  "w-full border bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/35 focus:bg-white/[0.07]";

/** youtube.com/watch?v=ID · youtu.be/ID · /embed/ID · /shorts/ID → ID */
const youtubeId = (url) => {
  const m = String(url).match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
};

/**
 * Cinematic player: the reel sits centred on a dark stage with a YouTube-style
 * play button, so portrait project films letterbox instead of being cropped.
 */
const VideoStage = ({ src, poster, title }) => {
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  const ytId = youtubeId(src);

  const start = () => {
    setPlaying(true);
    if (!ytId) requestAnimationFrame(() => ref.current?.play?.());
  };

  return (
    <div className="relative mx-auto flex h-[520px] w-full items-center justify-center overflow-hidden bg-[#3f4448] sm:h-[660px] lg:h-[820px]">
      {ytId ? (
        playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full max-w-[min(100%,46rem)]"
          />
        ) : (
          <img
            src={`https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`}
            alt={title}
            className="h-full w-auto max-w-full object-contain"
          />
        )
      ) : (
        <video
          ref={ref}
          src={src}
          poster={poster}
          controls={playing}
          preload="metadata"
          playsInline
          onPlay={() => setPlaying(true)}
          className="h-full w-auto max-w-full object-contain"
        />
      )}

      {!playing && (
        <button
          onClick={start}
          aria-label={`Play ${title}`}
          className="group absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-[46px] w-[68px] items-center justify-center rounded-[12px] bg-[#f00] shadow-lg transition-all duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-white" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
};

/** Centred title with the gold rule that runs in from the left margin. */
const SectionHead = ({ title, subtitle, tone = "light" }) => (
  <div className="relative">
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 top-6 hidden h-px w-[40%] lg:block ${
        tone === "dark" ? "bg-gold/45" : "bg-gold/55"
      }`}
    />
    <div className="relative text-center">
      <h2
        className={`inline-block font-serif text-[22px] font-semibold uppercase tracking-[0.05em] sm:text-[38px] ${
          tone === "dark" ? "text-white" : "text-matte"
        }`}
      >
        {title}
      </h2>
      <span aria-hidden="true" className="mx-auto mt-2.5 block h-[3px] w-16 bg-gold" />
      {subtitle && (
        <p
          className={`mx-auto mt-5 max-w-2xl text-[15px] sm:text-[17px] ${
            tone === "dark" ? "text-white/60" : "text-matte/60"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

/**
 * Featured Listing brochure. Backed by the `featured-projects` collection,
 * managed from the admin panel's Featured Listing page.
 */
const PropertyDetails = ({ property: clickedCard, setCurrentPage }) => {
  const site = useSiteInfo();
  const property = clickedCard;
  const whatsappDigits = site.whatsappHref?.match(/wa\.me\/(\d+)/)?.[1] || "91000000";
  const propertyWhatsappHref = buildWhatsAppUrl(whatsappDigits, property?.title);
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Contact gate for brochure / floor plan / price breakup
  const [gate, setGate] = useState(null);
  const touchStartX = useRef(null);

  // Analytics: property view (best-effort)
  useEffect(() => {
    if (!clickedCard?._id) return;
    const trackView = async () => {
      try {
        let sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
          sessionId = Date.now().toString() + Math.random().toString(36).substring(2);
          localStorage.setItem("sessionId", sessionId);
        }
        await api.post("/analytics/view", { propertyId: clickedCard._id, sessionId });
      } catch (error) {
        console.error("Analytics tracking error:", error);
      }
    };
    trackView();
  }, [clickedCard?._id]);

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

  // A single YouTube link per project; blank means no film uploaded yet.
  const videos = useMemo(
    () => (property?.videoUrl ? [property.videoUrl] : []),
    [property]
  );

  const highlights = useMemo(() => (property?.highlights || []).filter(Boolean), [property]);
  const amenities = useMemo(() => (property?.amenities || []).filter(Boolean), [property]);
  const developer =
    property?.developer && typeof property.developer === "object" ? property.developer : null;
  const connectivity = useMemo(
    () => (property?.connectivity || []).filter((c) => c?.label),
    [property]
  );

  // Swipe left/right through the gallery — used by both the inline stage and
  // the fullscreen lightbox.
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null || images.length < 2) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      setSlide((s) => (delta < 0 ? (s + 1) % images.length : (s - 1 + images.length) % images.length));
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setSlide((s) => (s + 1) % images.length);
      if (e.key === "ArrowLeft") setSlide((s) => (s - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, images.length]);

  // "4 & 5 BHK" → ["4 BHK", "5 BHK"] so the plan/price grids get one card each.
  const variants = useMemo(() => {
    const cfg = property?.configuration;
    if (cfg) {
      const parts = cfg.split(/&|,|\//).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        const unit = /bhk/i.test(cfg) ? "BHK" : "";
        return parts.map((p) => {
          const bare = p.replace(/bhk/i, "").trim();
          return unit && /^\d+$/.test(bare) ? `${bare} ${unit}` : p;
        });
      }
      return [cfg];
    }
    return property?.bhk ? [`${property.bhk} BHK`] : [];
  }, [property]);

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      next.email = "Please enter a valid email";
    if (!formData.phone.trim()) next.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, "")))
      next.phone = "Please enter a valid 10-digit phone number";
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
        // This page is backed by the Featured Listing collection, not Property.
        featuredProjectId: property?._id,
        source: "featured-listing-detail",
        sourceLabel: `Featured Listing enquiry — ${property?.title || ""}`,
      });
      if (response.data.success) {
        setSubmitted(true);
        trackEvent("enquiry_submit", { source: "featured-listing-detail", project: property?.title });
        setFormData({ name: "", email: "", phone: "", message: "", budget: "", purpose: "" });
        setErrors({});
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      setErrors({ form: error.response?.data?.message || "Failed to submit enquiry. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ---- not found ----
  if (!property) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-ivory px-4">
        <div className="max-w-md border border-black/10 bg-white p-10 text-center">
          <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <span className="absolute h-16 w-16 rotate-45 border border-gold/35" />
            <Home size={24} strokeWidth={1.2} className="text-gold" />
          </span>
          <h2 className="font-serif text-2xl font-semibold uppercase tracking-[0.06em] text-matte">
            Property Not Found
          </h2>
          <GoldDivider align="center" className="mt-4" />
          <p className="mt-5 text-sm leading-relaxed text-matte/55">
            This property doesn't exist or has been removed.
          </p>
          <button
            onClick={() => setCurrentPage("listings")}
            className="mt-7 inline-flex min-h-[48px] items-center gap-3 bg-matte px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors duration-500 hover:bg-gold hover:text-matte"
          >
            View All Properties
          </button>
        </div>
      </div>
    );
  }

  // Featured projects are sale-only showcases.
  const isRental = false;
  const hero = images[0] || FALLBACK;
  const config = property.configuration || (property.bhk ? `${property.bhk} BHK` : "—");
  const badge = priceBadge(property.price, isRental);

  const FACTS = [
    { icon: BedDouble, label: "Typology", value: config },
    { icon: MapPin, label: "Location", value: property.city || "—" },
    { icon: Maximize, label: "Size", value: property.area ? `${property.area} sq.ft.` : "—" },
    {
      icon: Bath,
      label: "Bathrooms",
      value: property.bathrooms ? `${property.bathrooms}` : "—",
    },
  ];

  return (
    <div className="bg-ivory">
      {/* Phones get a real back bar of their own: the link laid over the hero
          below is a thin, low-contrast tap target on a small screen. */}
      <div className="sticky top-0 z-30 border-b border-black/[0.07] bg-white/95 backdrop-blur sm:hidden">
        <button
          onClick={() => setCurrentPage("featured-listing")}
          className="inline-flex min-h-[44px] items-center gap-2 px-4 text-[13px] font-semibold text-matte"
        >
          <ArrowLeft size={17} />
          Back
        </button>
      </div>

      {/* ==================== 1 · HERO ==================== */}
      {/* The sharp shot sits in normal flow, so the section is exactly as tall
          as the photo — no bands of dead black above and below it, whatever
          shape the project image happens to be. */}
      <section className="relative overflow-hidden bg-matte">
        <img
          src={hero}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl saturate-[0.8]"
        />
        <img
          src={hero}
          alt={property.title}
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK;
          }}
          className="relative mx-auto block max-h-[78vh] min-h-[300px] w-full object-contain sm:min-h-[420px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-matte/55 via-matte/15 to-matte/60" />

        {/* This brochure is only ever reached from Featured Listing, so back
            belongs there — not on the general listings page. */}
        <button
          onClick={() => setCurrentPage("featured-listing")}
          className="group absolute left-4 top-6 z-10 hidden items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75 transition-colors hover:text-gold sm:inline-flex sm:left-8"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to Featured Listing
        </button>

        {/* Project name, set across the skyline like the reference.
            Held to a narrow column and sat on its own scrim: at full width the
            title ran past the edges of the contained photo and trailed off into
            the blurred backdrop. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <div className="w-full max-w-[46rem] rounded-2xl bg-matte/35 px-5 py-6 backdrop-blur-[2px] sm:px-8 sm:py-8">
            <h1 className="font-serif text-[24px] font-semibold uppercase leading-[1.08] tracking-[0.05em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] sm:text-[44px] lg:text-[58px]">
              {property.title}
            </h1>
            <p className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11.5px] uppercase leading-[1.5] tracking-[0.16em] text-white/85 drop-shadow sm:mt-5 sm:text-[13px]">
              <MapPin size={15} className="shrink-0 text-gold" />
              {property.address || property.city}
            </p>
          </div>
        </div>

        {/* Price medallion */}
        {badge && (
          <div className="absolute bottom-8 right-4 flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark text-center shadow-[0_10px_40px_rgba(0,0,0,0.45)] sm:right-8 lg:bottom-auto lg:top-1/2 lg:h-[210px] lg:w-[210px] lg:-translate-y-1/2 lg:right-[7%]">
            <span className="font-serif text-[30px] font-bold leading-none text-white sm:text-[40px] lg:text-[64px]">
              {badge.num}
              {badge.unit && (
                <span className="ml-1 align-top text-[16px] font-bold uppercase lg:text-[24px]">
                  {badge.unit}
                </span>
              )}
            </span>
            <span className="mt-1 text-[12px] font-bold uppercase tracking-[0.08em] text-white lg:mt-2 lg:text-[19px]">
              {badge.tail}
            </span>
          </div>
        )}
      </section>

      {/* ==================== 2 · ABOUT THE PROJECT ==================== */}
      <section className="bg-white py-9 sm:py-20">
        <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <Reveal variant="left">
              <div>
                <p className="font-serif text-[23px] font-semibold uppercase tracking-[0.05em] text-matte sm:text-[34px]">
                  {property.title}
                </p>
                <span aria-hidden="true" className="mt-3 block h-[3px] w-16 bg-gold" />

                <h2 className="mt-8 text-[19px] font-bold text-matte">About the Project</h2>
                <p className="mt-1.5 text-[13px] font-bold uppercase tracking-[0.04em] text-matte/75">
                  {/* The address usually already carries the city — don't repeat it. */}
                  {[
                    property.title,
                    property.address,
                    property.address
                      ?.toLowerCase()
                      .includes(String(property.city || "").toLowerCase())
                      ? null
                      : property.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                {property.description && (
                  <p className="mt-6 text-justify text-[14px] leading-[2] text-matte/65">
                    {property.description}
                  </p>
                )}

                <p className="mt-7 text-[15px] font-bold text-matte">
                  RERA Registration No. :{" "}
                  <span className="font-semibold text-matte/80">
                    {property.reraNumber || "Coming Soon"}
                  </span>
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <a
                    href={propertyWhatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent("whatsapp_click", { project: property.title })}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2.5 bg-[#1e9e57] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#178048]"
                  >
                    <MessageCircle size={17} />
                    Connect on WhatsApp
                  </a>
                  <button
                    onClick={() => setGate({ context: "Brochure" })}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2.5 border border-matte/25 px-6 text-[14px] font-semibold text-matte transition-colors hover:border-gold hover:text-gold-dark"
                  >
                    <Download size={16} />
                    Download Brochure
                  </button>
                </div>
              </div>
            </Reveal>

            <Reveal variant="right" delay={120}>
              <div className="group relative aspect-[4/5] overflow-hidden bg-matte">
                <img
                  src={images[1] || hero}
                  alt={`${property.title} — elevation`}
                  loading="lazy"
                  onError={(e) => {
                    if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK;
                  }}
                  className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-105 motion-reduce:group-hover:scale-100"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================== 2b · ABOUT THE DEVELOPER ==================== */}
      {developer && (
        <section className="bg-ivory py-9 sm:py-20">
          <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
            <Reveal variant="up">
              <SectionHead title="About the Developer" />
            </Reveal>

            <Reveal variant="up" delay={100}>
              <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-gold/25 bg-white p-3">
                  {developer.logo?.url ? (
                    <img
                      src={developer.logo.url}
                      alt={`${developer.name} logo`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2 size={32} strokeWidth={1.2} className="text-gold" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-[20px] font-semibold uppercase tracking-[0.04em] text-matte">
                    {developer.name}
                  </h3>
                  {developer.bio && (
                    <div className="no-scrollbar mt-3 max-h-[9.5rem] overflow-y-auto pr-1">
                      <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.9] text-matte/65">
                        {developer.bio}
                      </p>
                    </div>
                  )}
                  {developer.website && (
                    <a
                      href={developer.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-dark hover:text-gold"
                    >
                      Visit Website <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ==================== LOCATION & CONNECTIVITY ==================== */}
      {connectivity.length > 0 && (
        <section className="bg-white py-9 sm:py-20">
          <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
            <Reveal variant="up">
              <SectionHead
                title="Location & Connectivity"
                subtitle="Everything within easy reach"
              />
            </Reveal>

            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(CONNECTIVITY_META).map(([kind, { icon: Icon, label }]) => {
                // An entry can be tagged with more than one type, so it
                // renders under every group it belongs to.
                const items = connectivity.filter((c) => c.kinds?.includes(kind));
                if (items.length === 0) return null;
                return (
                  <Reveal key={kind} variant="up">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <Icon size={20} strokeWidth={1.3} className="text-gold" />
                        <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-matte">
                          {label}
                        </h3>
                      </div>
                      <ul className="mt-4 space-y-2.5 border-l border-gold/25 pl-4">
                        {items.map((item, i) =>
                          item.mapLink ? (
                            <li key={item.label + i}>
                              <a
                                href={item.mapLink}
                                target="_blank"
                                rel="noreferrer"
                                className="group inline-flex items-center gap-1.5 text-[13.5px] leading-relaxed text-matte/65 transition-colors hover:text-gold-dark"
                              >
                                {item.label}
                                <ExternalLink
                                  size={12}
                                  className="shrink-0 text-gold/70 transition-colors group-hover:text-gold-dark"
                                />
                              </a>
                            </li>
                          ) : (
                            <li
                              key={item.label + i}
                              className="text-[13.5px] leading-relaxed text-matte/65"
                            >
                              {item.label}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ==================== 3a · FLOOR PLAN ==================== */}
      {variants.length > 0 && (
        <section className="bg-ivory py-9 sm:py-20">
          <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
            <Reveal variant="up">
              <SectionHead
                title="Floor Plan"
                subtitle="Choose your perfect floor plan and step into a world of comfort and style"
              />
            </Reveal>

            <div className="mt-12 flex flex-wrap justify-center gap-7">
              {variants.map((v, i) => (
                <Reveal key={v + i} delay={i * 90} variant="up">
                  <div className="w-[280px] sm:w-[300px]">
                    <div className="group relative aspect-[4/3] overflow-hidden border border-gold/25 bg-white">
                      <img
                        src={images[i + 2] || images[i] || hero}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="h-full w-full object-cover blur-[5px] saturate-[0.55]"
                      />
                      <span className="absolute inset-0 bg-white/45" />
                      <button
                        onClick={() => setGate({ context: `${v} Floor Plan` })}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="bg-matte px-5 py-2.5 text-[12px] font-semibold text-white transition-colors group-hover:bg-gold group-hover:text-matte">
                          View Plan
                        </span>
                      </button>
                    </div>
                    <p className="bg-matte py-3 text-center text-[13px] font-bold uppercase tracking-[0.14em] text-white">
                      {v}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== 3b · PRICE LIST ==================== */}
      {variants.length > 0 && (
        <section className="bg-white py-9 sm:py-20">
          <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
            <Reveal variant="up">
              <SectionHead title="Price List" subtitle="Unlock the Door to Luxury Living" />
            </Reveal>

            <div className="mt-12 flex flex-wrap justify-center gap-7">
              {variants.map((v, i) => (
                <Reveal key={v + i} delay={i * 90} variant="up">
                  <div className="w-[280px] bg-gold-pale p-4 sm:w-[300px]">
                    <p className="bg-white py-3 text-center text-[13px] font-bold uppercase tracking-[0.16em] text-matte">
                      {v}
                    </p>

                    <p className="py-5 text-center text-[13px] text-matte/75">
                      Price: {luxePrice(property.price, isRental)}
                      {isRental ? " / month" : " Onwards"}
                    </p>

                    <span
                      aria-hidden="true"
                      className="block border-t border-dashed border-matte/25"
                    />

                    <p className="py-5 text-center text-[13px] text-matte/75">
                      Size : {property.area ? `${property.area} Sq.ft.` : "On Request"}
                    </p>

                    <button
                      onClick={() => setGate({ context: `${v} Price Breakup` })}
                      className="group inline-flex min-h-[46px] w-full items-center justify-center gap-2.5 bg-matte text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-gold hover:text-matte"
                    >
                      Price Breakup
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-500 group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== 4 · GALLERY ==================== */}
      {images.length > 0 && (
        <section className="bg-ivory py-9 sm:py-20">
          <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
            <Reveal variant="up">
              <SectionHead title="Gallery" />
            </Reveal>

            {/* Stage — tap/click to open fullscreen, swipe on mobile */}
            <Reveal variant="up" delay={100}>
              <div
                className="relative mt-12 aspect-[16/9] w-full cursor-zoom-in overflow-hidden bg-matte"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                {/* contain, not cover — the gallery is there to show the whole
                    photo, and cropping it to 16/9 cut the shot in half. */}
                <img
                  src={images[slide] || FALLBACK}
                  alt={`${property.title} — view ${slide + 1}`}
                  onClick={() => setLightboxOpen(true)}
                  className="h-full w-full object-contain"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSlide((s) => (s - 1 + images.length) % images.length)}
                      aria-label="Previous image"
                      className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-matte/50 text-white backdrop-blur-sm transition-all hover:border-gold hover:text-gold"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setSlide((s) => (s + 1) % images.length)}
                      aria-label="Next image"
                      className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-matte/50 text-white backdrop-blur-sm transition-all hover:border-gold hover:text-gold"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <span className="absolute bottom-4 right-4 bg-matte/70 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-gold-light backdrop-blur-sm">
                      {slide + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>
            </Reveal>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setSlide(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-current={i === slide}
                    className={`aspect-[4/3] overflow-hidden transition-all duration-300 ${
                      i === slide
                        ? "ring-2 ring-gold"
                        : "opacity-60 ring-1 ring-black/10 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==================== QUICK FACTS STRIP ==================== */}
      <section className="border-y border-black/[0.07] bg-white">
        <div className="mx-auto grid max-w-[88rem] grid-cols-2 gap-y-7 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:gap-y-0 lg:px-10">
          {FACTS.map(({ icon: Icon, label, value }, i) => (
            <Reveal key={label} delay={i * 80} variant="up">
              <div className={`flex items-center gap-3.5 lg:px-7 ${i > 0 ? "lg:border-l lg:border-black/[0.08]" : ""}`}>
                <Icon size={24} strokeWidth={1.1} className="shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-matte/45">
                    {label}
                  </p>
                  <p className="mt-1 truncate font-serif text-base font-semibold text-matte">
                    {value}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ==================== HIGHLIGHTS ==================== */}
      {highlights.length > 0 && (
        <section className="relative overflow-hidden bg-matte py-9 sm:py-20">
          <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
            <Reveal variant="up">
              <SectionHead title="Highlights" tone="dark" />
            </Reveal>

            <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
              <Reveal variant="left">
                <ul className="space-y-5">
                  {highlights.map((point, i) => (
                    <Reveal key={point + i} as="li" variant="left" delay={i * 80}>
                      <span className="flex items-start gap-3.5">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold"
                        />
                        <span className="text-sm leading-[1.9] text-white/65">{point}</span>
                      </span>
                    </Reveal>
                  ))}
                </ul>
              </Reveal>

              {images[1] && (
                <Reveal variant="right" delay={120}>
                  <div className="group relative aspect-[4/3] overflow-hidden">
                    <img
                      src={images[1]}
                      alt={`${property.title} — highlight`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-105 motion-reduce:group-hover:scale-100"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-matte/60 to-transparent" />
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ==================== AMENITIES ==================== */}
      {amenities.length > 0 && (
        <section className="bg-ivory py-9 sm:py-20">
          <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
            <Reveal variant="up">
              <SectionHead title="Amenities" />
            </Reveal>

            <div className="mt-12 grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
              {amenities.map((label, i) => {
                const Icon = iconFor(label);
                return (
                  <Reveal key={label + i} delay={(i % 5) * 80} variant="up">
                    <div className="group flex cursor-default flex-col items-center px-3 text-center">
                      <Icon
                        size={32}
                        strokeWidth={1}
                        className="text-gold transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110 motion-reduce:group-hover:transform-none"
                      />
                      <span className="mt-4 text-[11px] font-semibold uppercase leading-snug tracking-[0.12em] text-matte/70">
                        {label}
                      </span>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ==================== VIDEO ==================== */}
      {videos.length > 0 && (
        <section className="bg-white py-9 sm:py-20">
          <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
            <Reveal variant="up">
              <SectionHead title="Video Gallery" />
            </Reveal>
          </div>

          <div className="mt-12 space-y-6">
            {videos.map((v, i) => (
              <Reveal key={(v.url || v || i) + i} delay={i * 100} variant="up">
                <VideoStage
                  src={typeof v === "string" ? v : v.url}
                  poster={images[i] || images[0]}
                  title={`${property.title} — film ${i + 1}`}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ============ QUICK FACTS · ENQUIRY · LOCATION ============ */}
      <section className="bg-matte py-10 sm:py-20">
        <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
            {/* Quick facts */}
            <Reveal variant="up">
              <div>
                <h2 className="font-serif text-lg font-semibold uppercase tracking-[0.16em] text-gold">
                  Quick Facts
                </h2>
                <GoldDivider className="mt-4" tone="light" />
                <ul className="mt-7 space-y-6">
                  {FACTS.map(({ icon: Icon, label, value }) => (
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
                  <li className="flex items-start gap-3.5">
                    <Sparkles size={18} strokeWidth={1.3} className="mt-0.5 shrink-0 text-gold" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/70">
                        Price
                      </p>
                      <p className="mt-1 text-sm text-white/75">
                        {luxePrice(property.price, isRental)}
                        {isRental ? " / month" : " Onwards"}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </Reveal>

            {/* Enquiry — posts to the existing /enquiries API with propertyId */}
            <Reveal variant="up" delay={100}>
              <div>
                <h2 className="font-serif text-lg font-semibold uppercase tracking-[0.16em] text-gold">
                  Enquire Now
                </h2>
                <GoldDivider className="mt-4" tone="light" />

                {submitted && (
                  <div
                    role="status"
                    className="mt-6 flex items-start gap-2.5 border border-gold/40 bg-gold/10 p-3.5 text-[13px] text-gold-light"
                  >
                    <CheckCircle2 size={16} className="mt-px shrink-0" />
                    <span>Enquiry sent. Our team will contact you shortly.</span>
                  </div>
                )}
                {errors.form && (
                  <div className="mt-6 flex items-start gap-2.5 border border-red-400/50 bg-red-500/10 p-3.5 text-[13px] text-red-200">
                    <AlertCircle size={16} className="mt-px shrink-0" />
                    <span>{errors.form}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
                  {[
                    { key: "name", type: "text", placeholder: "Your Name" },
                    { key: "email", type: "email", placeholder: "Your Email" },
                    { key: "phone", type: "tel", placeholder: "Your Phone Number" },
                  ].map((f) => (
                    <div key={f.key}>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        aria-label={f.placeholder}
                        value={formData[f.key]}
                        aria-invalid={Boolean(errors[f.key])}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [f.key]:
                              f.key === "phone"
                                ? e.target.value.replace(/\D/g, "").slice(0, 10)
                                : e.target.value,
                          })
                        }
                        className={`${fieldBase} ${
                          errors[f.key] ? "border-red-400/70" : "border-white/15 focus:border-gold"
                        }`}
                      />
                      {errors[f.key] && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-300">
                          <AlertCircle size={12} /> {errors[f.key]}
                        </p>
                      )}
                    </div>
                  ))}

                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    aria-label="Budget"
                    className={`${fieldBase} border-white/15 focus:border-gold ${
                      formData.budget ? "text-white" : "text-white/35"
                    }`}
                  >
                    <option value="" className="text-matte">Budget (optional)</option>
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b} value={b} className="text-matte">
                        {b}
                      </option>
                    ))}
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
                          setFormData({
                            ...formData,
                            purpose: formData.purpose === opt.value ? "" : opt.value,
                          })
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

                  <textarea
                    rows={3}
                    placeholder="Your Message"
                    aria-label="Your message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`${fieldBase} resize-y border-white/15 focus:border-gold`}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className={`group inline-flex min-h-[50px] w-full items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-500 ${
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
                        <Send size={14} />
                        Submit Enquiry
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-500 group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  <a
                    href={site.phoneHref}
                    onClick={() => trackEvent("call_click", { project: property.title })}
                    className="inline-flex min-h-[50px] w-full items-center justify-center gap-2.5 border border-white/20 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-all duration-500 hover:border-gold hover:text-gold"
                  >
                    <Phone size={14} />
                    {site.phoneDisplay}
                  </a>
                </form>
              </div>
            </Reveal>

            {/* Location */}
            <Reveal variant="up" delay={200}>
              <div>
                <h2 className="font-serif text-lg font-semibold uppercase tracking-[0.16em] text-gold">
                  Location
                </h2>
                <GoldDivider className="mt-4" tone="light" />
                <div className="mt-6 overflow-hidden border border-white/12">
                  <iframe
                    src={mapSrcFor(property)}
                    width="100%"
                    height="230"
                    style={{ border: 0, filter: "grayscale(0.35) contrast(1.05)" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${property.title} location`}
                  />
                </div>
                <p className="mt-4 flex items-start gap-2.5 text-[13px] leading-relaxed text-white/55">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
                  {property.address || property.city}
                </p>

                <button
                  onClick={() => setCurrentPage("listings")}
                  className="group mt-7 inline-flex min-h-[50px] w-full items-center justify-center gap-3 border border-gold/50 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold transition-all duration-500 hover:bg-gold hover:text-matte"
                >
                  View All Properties
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-500 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Contact gate for brochure / floor plan / price breakup */}
      <ProjectEnquiryModal
        open={Boolean(gate)}
        onClose={() => setGate(null)}
        projectName={property.title}
        context={gate?.context || ""}
        featuredProjectId={property?._id}
        source="featured-listing-brochure"
      />

      {/* Gallery fullscreen lightbox — swipe on mobile, arrow keys on desktop */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${property.title} gallery`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close gallery"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:text-gold"
          >
            <X size={20} />
          </button>

          <img
            src={images[slide] || FALLBACK}
            alt={`${property.title} — view ${slide + 1}`}
            className="max-h-[88vh] max-w-full object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() => setSlide((s) => (s - 1 + images.length) % images.length)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-all hover:border-gold hover:text-gold sm:left-6"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setSlide((s) => (s + 1) % images.length)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-all hover:border-gold hover:text-gold sm:right-6"
              >
                <ChevronRight size={20} />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-gold-light backdrop-blur-sm">
                {slide + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;

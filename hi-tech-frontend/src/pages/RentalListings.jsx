import { useContext, useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Home,
  Sparkles,
  X,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Handshake,
  Headset,
  Building2,
  LayoutGrid,
  List,
  Users,
  Award,
} from "lucide-react";
import { PropertyContext } from "../context/PropertyContext";
import { CategoryContext } from "../context/CategoryContext";
import Loader from "../components/Loader";
import CuteLoader from "../components/CuteLoader";
import Reveal from "../components/home/Reveal";
import ProjectCard from "../components/home/ProjectCard";
import { PROPERTY_TYPE_OPTIONS, matchesPropertyType } from "../utils/propertyType";
import api from "../utils/api";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80";

const FALLBACK =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=75";

const HERO_POINTS = [
  { icon: ShieldCheck, title: "Verified Properties", desc: "100% verified listings" },
  { icon: Sparkles, title: "Easy Booking", desc: "Hassle-free process" },
  { icon: MapPin, title: "Top Locations", desc: "Prime neighborhoods" },
  { icon: Headset, title: "Trusted Support", desc: "Here to help you" },
];

const WHY_RENT = [
  {
    icon: ShieldCheck,
    title: "Verified & Trusted",
    desc: "All properties are verified for your peace of mind.",
  },
  {
    icon: Handshake,
    title: "Transparent Deals",
    desc: "No hidden charges. What you see is what you get.",
  },
  {
    icon: Headset,
    title: "Dedicated Support",
    desc: "Our team is available whenever you need us.",
  },
  {
    icon: Building2,
    title: "Prime Locations",
    desc: "Carefully selected properties in the best neighborhoods.",
  },
];

const BUDGETS = [
  { value: "", label: "Budget" },
  { value: "0-15000", label: "Under ₹15,000" },
  { value: "15000-30000", label: "₹15,000 - ₹30,000" },
  { value: "30000-60000", label: "₹30,000 - ₹60,000" },
  { value: "60000-9999999", label: "Above ₹60,000" },
];

const SORTS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const selectClass =
  "w-full appearance-none rounded-lg border border-black/[0.09] bg-white py-3 pl-10 pr-8 text-[13px] font-medium text-matte outline-none transition-colors focus:border-gold";

const RentalListings = ({ setCurrentPage, setSelectedProperty }) => {
  const { properties = [], loading, error, fetchProperties } = useContext(PropertyContext);
  const { categories: rentalCategories = [] } = useContext(CategoryContext);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");
  const [filters, setFilters] = useState({
    location: "",
    priceRange: "",
    bhk: "",
    rentalCategory: "",
    propertyType: "",
  });

  // Only properties that have been assigned a rental category
  const rentalProperties = useMemo(
    () => properties.filter((p) => p.rentalCategory),
    [properties]
  );

  useEffect(() => {
    fetchProperties("?limit=200");
    // Apply any initial category filter set by Home (localStorage handshake)
    try {
      const raw = localStorage.getItem("listingsFilter");
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj?.type === "rentalCategory" && obj.id) {
          setFilters((prev) => ({ ...prev, rentalCategory: obj.id }));
        } else if (obj?.type === "search") {
          // Home page search box (Rent tab): location / budget
          setFilters((prev) => ({
            ...prev,
            location: obj.location || "",
            priceRange: obj.priceRange || "",
          }));
        }
        localStorage.removeItem("listingsFilter");
      }
    } catch (e) {
      console.error("Failed to apply listingsFilter:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePropertyClick = (property) => {
    try {
      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = Date.now().toString() + Math.random().toString(36).substring(2);
        localStorage.setItem("sessionId", sessionId);
      }
      // Non-blocking analytics
      api.post("/analytics/click", { propertyId: property._id, sessionId }).catch(e => console.error("Analytics click tracking error:", e));
    } catch (error) {
      console.error("Analytics setup error:", error);
    }

    setSelectedProperty(property);
    setCurrentPage("property-details-classic");
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (e) {
      /* ignore */
    }
  };

  const uniqueCities = useMemo(
    () => [...new Set(rentalProperties.map((p) => p.city))].filter(Boolean).sort(),
    [rentalProperties]
  );

  const bhkOptions = useMemo(
    () =>
      [...new Set(rentalProperties.map((p) => p.bhk))]
        .filter((b) => Number.isFinite(Number(b)) && Number(b) > 0)
        .sort((a, b) => a - b),
    [rentalProperties]
  );

  const displayedProperties = useMemo(() => {
    let result = rentalProperties;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q)
      );
    }

    if (filters.location) {
      result = result.filter(
        (p) => p.city?.toLowerCase() === filters.location.toLowerCase()
      );
    }

    if (filters.rentalCategory) {
      result = result.filter(
        (p) => (p.rentalCategory?._id || p.rentalCategory) === filters.rentalCategory
      );
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      result = result.filter((p) =>
        max ? p.price >= min && p.price <= max : p.price >= min
      );
    }

    if (filters.propertyType) {
      result = result.filter((p) => matchesPropertyType(p, filters.propertyType));
    }

    if (filters.bhk) {
      result = result.filter((p) => p.bhk?.toString() === filters.bhk);
    }

    const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    const sorted = [...result];
    if (sort === "price-low") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") sorted.sort((a, b) => b.price - a.price);
    else sorted.sort(byNewest);

    return sorted;
  }, [rentalProperties, searchQuery, filters, sort]);

  const clearFilters = () => {
    setFilters({ location: "", priceRange: "", bhk: "", rentalCategory: "", propertyType: "" });
    setSearchQuery("");
    setShowFilters(false);
  };

  const activeFilterCount = [
    filters.location,
    filters.priceRange,
    filters.bhk,
    filters.rentalCategory,
    filters.propertyType,
    searchQuery,
  ].filter(Boolean).length;

  // The first and third are counted from the live listings, so they carry the
  // exact figure rather than a "+". The other two are the firm's own published
  // numbers, matching the About page.
  const STATS = [
    {
      icon: Home,
      value: String(rentalProperties.length),
      label: rentalProperties.length === 1 ? "Property Listed" : "Properties Listed",
    },
    { icon: Users, value: "5000+", label: "Happy Clients" },
    {
      icon: MapPin,
      value: String(uniqueCities.length),
      label: uniqueCities.length === 1 ? "Prime Location" : "Prime Locations",
    },
    { icon: Award, value: "15+", label: "Years of Trust" },
  ];

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-ivory px-4">
        <div className="max-w-md rounded-xl border border-black/10 bg-white p-8 text-center">
          <p className="text-sm text-matte/65">{error}</p>
          <button
            onClick={() => fetchProperties("?limit=200")}
            className="mt-5 rounded-lg bg-matte px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-gold hover:text-matte"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden bg-white font-sans text-matte">
      {/* ==================== HERO ==================== */}
      <section className="relative bg-ivory/60">
        <div className="grid items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="flex items-center px-4 pb-10 pt-10 sm:px-6 lg:pb-24 lg:pl-[max(2rem,calc((100vw-84rem)/2))] lg:pr-10 lg:pt-14">
            <Reveal variant="up" duration={700}>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 shadow-sm">
                  <Sparkles size={13} className="text-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-dark">
                    Rental Collection
                  </span>
                </span>

                <h1 className="mt-5 font-serif text-[27px] font-semibold leading-[1.12] text-matte sm:text-[46px] lg:text-[52px]">
                  Find Your Next
                  <br />
                  <span className="text-gold-dark">Rental</span> Home
                </h1>

                <p className="mt-5 max-w-md text-[14px] leading-[1.85] text-matte/60">
                  Browse our handpicked rental properties across prime locations. Quality homes,
                  trusted listings.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {HERO_POINTS.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-2">
                      <Icon size={15} className="mt-0.5 shrink-0 text-gold" />
                      <div className="min-w-0">
                        <p className="text-[10.5px] font-bold leading-tight text-matte">{title}</p>
                        <p className="mt-0.5 text-[9.5px] leading-tight text-matte/50">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <div className="relative min-h-[220px] lg:min-h-[400px]">
            <img
              src={HERO_IMAGE}
              alt="Rental home interior"
              onError={(e) => {
                if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK;
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 hidden w-28 bg-gradient-to-r from-ivory/70 to-transparent lg:block"
            />
          </div>
        </div>
      </section>

      {/* ==================== SEARCH / FILTER BAR ==================== */}
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 -mt-6 rounded-xl border border-black/[0.07] bg-white p-3.5 shadow-[0_4px_24px_rgba(12,12,13,0.08)] lg:-mt-10">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto]">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-matte/35"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rental properties, locations..."
                aria-label="Search rental properties"
                className="w-full rounded-lg border border-black/[0.09] bg-white py-3 pl-10 pr-4 text-[13px] text-matte outline-none transition-colors placeholder:text-matte/40 focus:border-gold"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <MapPin
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-matte/40"
              />
              <select
                value={filters.location}
                onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
                aria-label="Location"
                className={`${selectClass} ${filters.location ? "" : "text-matte/50"}`}
              >
                <option value="">Location</option>
                {uniqueCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-matte/35"
              />
            </div>

            {/* Property type (rental category) */}
            <div className="relative">
              <Home
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-matte/40"
              />
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters((f) => ({ ...f, propertyType: e.target.value }))}
                aria-label="Property Type"
                className={`${selectClass} ${filters.propertyType ? "" : "text-matte/50"}`}
              >
                <option value="">Property Type</option>
                {PROPERTY_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-matte/35"
              />
            </div>

            {/* Budget */}
            <div className="relative">
              <Sparkles
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-matte/40"
              />
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters((f) => ({ ...f, priceRange: e.target.value }))}
                aria-label="Budget"
                className={`${selectClass} ${filters.priceRange ? "" : "text-matte/50"}`}
              >
                {BUDGETS.map((b) => (
                  <option key={b.label} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-matte/35"
              />
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters((s) => !s)}
              aria-expanded={showFilters}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-gold px-6 text-[13px] font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-white/25 px-1.5 text-[11px]">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded panel — BHK + clear */}
          {showFilters && (
            <div className="mt-3.5 flex flex-wrap items-center gap-3 border-t border-black/[0.07] pt-3.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-matte/45">
                Bedrooms
              </span>
              {bhkOptions.map((b) => (
                <button
                  key={b}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      bhk: f.bhk === String(b) ? "" : String(b),
                    }))
                  }
                  className={`rounded-lg border px-4 py-2 text-[12px] font-semibold transition-colors ${
                    filters.bhk === String(b)
                      ? "border-gold bg-gold text-white"
                      : "border-black/[0.1] text-matte/70 hover:border-gold"
                  }`}
                >
                  {b} BHK
                </button>
              ))}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-gold-dark hover:text-matte"
                >
                  <X size={13} />
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================== RESULTS ==================== */}
      <section className="mx-auto max-w-[84rem] px-4 py-9 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[13px] font-medium text-matte/60">
            Showing {displayedProperties.length} of {rentalProperties.length} rental properties
          </p>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[12px] text-matte/50">
              Sort by:
              <span className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort by"
                  className="appearance-none rounded-lg border border-black/[0.09] bg-white py-2 pl-3 pr-8 text-[12.5px] font-medium text-matte outline-none focus:border-gold"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-matte/35"
                />
              </span>
            </label>

            <div className="flex overflow-hidden rounded-lg border border-black/[0.09]">
              {[
                { id: "grid", icon: LayoutGrid, label: "Grid view" },
                { id: "list", icon: List, label: "List view" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  aria-label={label}
                  aria-pressed={view === id}
                  className={`p-2.5 transition-colors ${
                    view === id ? "bg-gold text-white" : "bg-white text-matte/45 hover:text-matte"
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {displayedProperties.length === 0 ? (
          <div className="mt-8">
            <CuteLoader text="No rental properties match these filters. Try widening your search.">
              <button
                onClick={clearFilters}
                className="inline-flex min-h-[44px] items-center rounded-lg bg-matte px-6 text-[13px] font-semibold text-white transition-colors hover:bg-gold hover:text-matte"
              >
                Clear Filters
              </button>
            </CuteLoader>
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "mt-6 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "mt-6 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2"
            }
          >
            {displayedProperties.map((p, i) => (
              <Reveal key={p._id} delay={(i % 4) * 80} variant="up" className="h-full">
                <ProjectCard
                  property={p}
                  onClick={() => handlePropertyClick(p)}
                  badge={{ label: "For Rent", tone: "accent" }}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ==================== WHY RENT WITH US ==================== */}
      <section className="mx-auto max-w-[84rem] px-4 pb-10 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <div className="rounded-xl bg-gold-pale/60 px-6 py-10 sm:px-10">
            <p className="text-center text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold-dark">
              Why Rent With Brothers Real Estate?
            </p>
            <h2 className="mt-3 text-center font-serif text-[20px] font-semibold text-matte sm:text-[28px]">
              Better Rentals. <span className="text-gold-dark">Better Living.</span>
            </h2>

            <div className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-matte/10">
              {WHY_RENT.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="group px-4 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-gold-dark transition-colors duration-500 group-hover:bg-gold group-hover:text-white">
                    <Icon size={22} strokeWidth={1.4} />
                  </span>
                  <p className="mt-4 text-[13px] font-bold text-matte">{title}</p>
                  <p className="mx-auto mt-2 max-w-[190px] text-[11.5px] leading-relaxed text-matte/55">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="mx-auto max-w-[84rem] px-4 pb-10 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <div className="relative overflow-hidden rounded-xl bg-gold-pale/70">
            <div className="relative flex flex-wrap items-center justify-between gap-6 px-7 py-8 sm:px-10">
              <div className="min-w-0">
                <h2 className="font-serif text-[20px] font-semibold text-matte sm:text-[23px]">
                  Can't find what you're looking for?
                </h2>
                <p className="mt-2 text-[13px] text-matte/60">
                  Let our experts help you find the perfect rental home.
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentPage("contact");
                  try {
                    window.scrollTo({ top: 0, behavior: "auto" });
                  } catch (e) {
                    /* ignore */
                  }
                }}
                className="group inline-flex min-h-[46px] shrink-0 items-center gap-2.5 rounded-lg bg-matte px-7 text-[13px] font-semibold text-white transition-colors hover:bg-gold hover:text-matte"
              >
                Contact Our Experts
                <ArrowRight
                  size={15}
                  className="transition-transform duration-500 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ==================== STATS ==================== */}
      <section className="mx-auto max-w-[84rem] px-4 pb-14 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <div className="rounded-xl bg-matte px-6 py-7 sm:px-10">
            <div className="grid grid-cols-2 gap-7 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/10">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3.5 lg:justify-center lg:px-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold/40">
                    <Icon size={18} className="text-gold" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-[20px] font-semibold leading-none text-white">
                      {value}
                    </p>
                    <p className="mt-1.5 text-[10.5px] text-white/45">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default RentalListings;

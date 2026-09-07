import { useContext, useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  KeyRound,
  Sparkles,
  ShieldCheck,
  FileText,
  MapPin,
  CalendarDays,
  Headset,
  Star,
  ArrowLeft,
} from "lucide-react";
import { PropertyContext } from "../context/PropertyContext";
import { FeaturedProjectContext } from "../context/FeaturedProjectContext";
import Loader from "../components/Loader";
import CuteLoader from "../components/CuteLoader";
import ListWithUs from "../components/luxury/ListWithUs";
import api from "../utils/api";
import Reveal from "../components/home/Reveal";
import ProjectCard from "../components/home/ProjectCard";
import { PROPERTY_TYPE_OPTIONS, matchesPropertyType } from "../utils/propertyType";

const selectClass =
  "w-full appearance-none rounded-lg border border-black/[0.09] bg-white py-3 pl-10 pr-8 text-[13px] font-medium text-matte outline-none transition-colors focus:border-gold";

const HERO =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80";

const FALLBACK = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=75";

const STATUSES = [
  { value: "under-construction", label: "Under Construction" },
  { value: "ready", label: "Pre-Rented / Ready to Move" },
];

// Mirrors the Rental Properties hero's four-point strip.
const FEATURED_HERO_POINTS = [
  { icon: ShieldCheck, title: "RERA Verified", desc: "Documented projects" },
  { icon: FileText, title: "Full Brochure", desc: "Plans & price list" },
  { icon: MapPin, title: "Prime Locations", desc: "Gurugram & Delhi NCR" },
  { icon: Sparkles, title: "Handpicked", desc: "Curated by our team" },
];

/** Gold square checkbox matching the luxury system. */
const Check = ({ checked, onChange, label }) => (
  <label className="flex cursor-pointer items-center gap-3 select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="peer sr-only"
    />
    <span
      aria-hidden="true"
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center border transition-all duration-200 ${
        checked ? "border-[#d3a950] bg-[#d3a950]" : "border-white/35 bg-transparent"
      } peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#d3a950]`}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="h-3 w-3 text-matte" fill="none">
          <path
            d="M2 6.2 4.6 8.8 10 3.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
    <span className="text-[13px] text-white/80 transition-colors hover:text-white sm:text-sm">
      {label}
    </span>
  </label>
);

const ListingCard = ({ property, index, onOpen }) => {
  const image = property.images?.[0]?.url || property.images?.[0] || FALLBACK;

  return (
    <Reveal delay={(index % 2) * 110} variant="up" className="h-full">
      <article
        onClick={() => onOpen?.(property)}
        // Aspect-based, not a fixed 450px: at three across the old height made
        // a tall portrait frame that cropped most of the shot away.
        className="group relative aspect-[4/3] w-full overflow-hidden bg-black cursor-pointer shadow-sm"
      >
        <img
          src={image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />

        {/* Default State Text (Title left, More Details right) */}
        <div className="absolute bottom-3 sm:bottom-6 left-2.5 sm:left-6 right-2.5 sm:right-6 flex items-end justify-between gap-1 sm:gap-4 pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
          <div className="text-white font-bold uppercase tracking-wider text-[8px] sm:text-[15px] lg:text-[22px] font-poppins shrink-0 max-w-[60%] sm:max-w-[70%] leading-tight sm:leading-snug drop-shadow-md">
            {property.title}
          </div>
          <div className="text-white/90 text-[6.5px] sm:text-[10px] lg:text-[11px] font-semibold uppercase tracking-widest sm:tracking-[0.15em] text-right shrink-0">
            More Details +
          </div>
        </div>
        
        {/* Hover State Solid Black Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black px-2.5 sm:px-6 py-2.5 sm:py-5 translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0 flex items-center justify-between">
          <div className="text-white text-[8px] sm:text-[14px] lg:text-[16px] font-semibold uppercase tracking-widest truncate max-w-[60%] sm:max-w-[65%]">
            {property.title}
          </div>
          <div className="text-white/80 text-[6.5px] sm:text-[10px] lg:text-[11px] font-semibold uppercase tracking-widest shrink-0 hover:text-white">
            More Details +
          </div>
        </div>
      </article>
    </Reveal>
  );
};

// `featured` pins the page to the Featured Listing collection — used by the
// navbar's Featured Listing entry, so it survives a refresh.
// `propertyType` pre-selects the Property Type filter — used by the navbar's
// Land entry (and could back Residential/Commercial entries the same way).
const Listings = ({ setCurrentPage, setSelectedProperty, featured = false, propertyType = "" }) => {
  const { filteredProperties = [], loading, error, fetchProperties } =
    useContext(PropertyContext);
  const { featuredProjects = [], loading: featuredLoading, findFeatured } =
    useContext(FeaturedProjectContext);

  const [search, setSearch] = useState("");
  const [types, setTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  // Set by the home page handshake — a curated collection or featured location.
  const [curated, setCurated] = useState({ title: "", key: "" });
  const [featuredLocation, setFeaturedLocation] = useState("");
  // Arrived from "View All Featured Listing" — this page then shows the
  // Featured Listing projects instead of the sale listings.
  const [featuredMode, setFeaturedMode] = useState(featured);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFeaturedMode(featured);
  }, [featured]);

  useEffect(() => {
    if (propertyType) setTypes([propertyType]);
  }, [propertyType]);

  useEffect(() => {
    // The API paginates at 10 by default — this page must show everything.
    fetchProperties("?limit=200");

    // Handshake from the home page (curated / featured / search)
    try {
      const raw = localStorage.getItem("listingsFilter");
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj?.type === "search") {
          if (obj.location) setSearch(obj.location);
          if (obj.propertyType) setTypes([obj.propertyType]);
        }
        else if (obj?.type === "curated" && obj.title)
          setCurated({ title: obj.title, key: obj.key || "" });
        else if (obj?.type === "featured" && obj.title) setFeaturedLocation(obj.title);
        else if (obj?.type === "featuredListing") setFeaturedMode(true);
        localStorage.removeItem("listingsFilter");
      }
    } catch (e) {
      console.error("Failed to apply listingsFilter:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Analytics: filter usage (debounced)
  useEffect(() => {
    const track = async () => {
      if (!types.length && !statuses.length) return;
      try {
        let sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
          sessionId = Date.now().toString() + Math.random().toString(36).substring(2);
          localStorage.setItem("sessionId", sessionId);
        }
        await api.post("/analytics/filter", {
          city: null,
          priceRange: null,
          bhk: null,
          sessionId,
        });
      } catch (e) {
        console.error("Analytics filter tracking error:", e);
      }
    };
    const id = setTimeout(track, 500);
    return () => clearTimeout(id);
  }, [types, statuses]);

  const handlePropertyClick = (property) => {
    try {
      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = Date.now().toString() + Math.random().toString(36).substring(2);
        localStorage.setItem("sessionId", sessionId);
      }
      // Non-blocking analytics
      api.post("/analytics/click", { propertyId: property._id, sessionId }).catch(e => console.error("Analytics click tracking error:", e));
    } catch (e) {
      console.error("Analytics setup error:", e);
    }
    // A Featured Listing project always opens its own brochure, even when the
    // card came from the ordinary sale listings.
    const featured = featuredMode ? property : findFeatured(property);
    setSelectedProperty(featured || property);
    setCurrentPage(featured ? "property-details" : "property-details-classic");
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (e) {
      /* ignore */
    }
  };

  // Rentals live on their own page, and Featured Listing projects have their
  // own page too — All Properties shows everything else added via Add Property,
  // whatever it is tagged with (curated, featured, featured location).
  const saleProperties = useMemo(
    () =>
      featuredMode
        ? featuredProjects
        : filteredProperties.filter((p) => !p.rentalCategory && !findFeatured(p)),
    [featuredMode, featuredProjects, filteredProperties, findFeatured]
  );

  const results = useMemo(() => {
    let out = saleProperties;

    // Featured projects are a fixed showcase — only the free-text search applies.
    if (featuredMode) {
      if (!search.trim()) return out;
      const q = search.toLowerCase();
      return out.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q)
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q)
      );
    }

    if (types.length) out = out.filter((p) => matchesPropertyType(p, types[0]));
    if (statuses.length) out = out.filter((p) => statuses.includes(p.possession || "ready"));

    // Curated collection — matches a manual `curatedProperty.title` or the
    // legacy `collections` key, since the home page surfaces both.
    if (curated.title || curated.key) {
      const wantTitle = curated.title.toLowerCase().trim();
      const wantKey = curated.key.toLowerCase().trim();
      out = out.filter((p) => {
        const byTitle =
          wantTitle &&
          String(p.curatedProperty?.title || "").toLowerCase().trim() === wantTitle;
        const inCollections = (p.collections || []).some((c) => {
          const v = String(c).toLowerCase().trim();
          return (wantKey && v === wantKey) || (wantTitle && v === wantTitle);
        });
        return Boolean(byTitle || inCollections);
      });
    }

    // Featured location — honour the tagged set the home-page card counted, and
    // only widen to the city when nothing carries the manual tag.
    if (featuredLocation) {
      const want = featuredLocation.toLowerCase().trim();
      const tagged = out.filter(
        (p) => String(p.featuredLocation?.title || "").toLowerCase().trim() === want
      );
      out = tagged.length
        ? tagged
        : out.filter((p) => String(p.city || "").toLowerCase().trim() === want);
    }

    return out;
  }, [featuredMode, saleProperties, search, types, statuses, curated, featuredLocation]);

  const clearAll = () => {
    setSearch("");
    setTypes([]);
    setStatuses([]);
    setCurated({ title: "", key: "" });
    setFeaturedLocation("");
  };

  const activeCount =
    types.length +
    statuses.length +
    (search ? 1 : 0) +
    (curated.title || curated.key ? 1 : 0) +
    (featuredLocation ? 1 : 0);

  /**
   * The site-wide search bar, matching the one on the Rent page. In featured
   * mode only the search applies, so the dropdowns are left out.
   * Held as JSX rather than a nested component so typing doesn't remount it.
   */
  const searchBar = (
    <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
      <div className="rounded-xl border border-black/[0.07] bg-white p-3.5 shadow-[0_4px_24px_rgba(12,12,13,0.08)]">
        <div
          className={`grid gap-3 ${
            featuredMode
              ? "lg:grid-cols-[minmax(0,1fr)_auto]"
              : "lg:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))_auto]"
          }`}
        >
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-matte/35"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                featuredMode
                  ? "Search featured projects, locations..."
                  : "Search properties, sectors, locations..."
              }
              aria-label="Search properties"
              className="w-full rounded-lg border border-black/[0.09] bg-white py-3 pl-10 pr-4 text-[13px] text-matte outline-none transition-colors placeholder:text-matte/40 focus:border-gold"
            />
          </div>

          {!featuredMode && (
            <>
              <div className="relative">
                <Building2
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-matte/40"
                />
                <select
                  value={types[0] || ""}
                  onChange={(e) => setTypes(e.target.value ? [e.target.value] : [])}
                  aria-label="Property Type"
                  className={`${selectClass} ${types.length ? "" : "text-matte/50"}`}
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

              <div className="relative">
                <KeyRound
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-matte/40"
                />
                <select
                  value={statuses[0] || ""}
                  onChange={(e) => setStatuses(e.target.value ? [e.target.value] : [])}
                  aria-label="Property Status"
                  className={`${selectClass} ${statuses.length ? "" : "text-matte/50"}`}
                >
                  <option value="">Property Status</option>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-matte/35"
                />
              </div>
            </>
          )}

          <button
            onClick={() => (featuredMode ? setSearch("") : setShowFilters((s) => !s))}
            aria-expanded={featuredMode ? undefined : showFilters}
            disabled={featuredMode && !search}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-gold px-6 text-[13px] font-semibold text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {featuredMode ? <X size={15} /> : <SlidersHorizontal size={15} />}
            {featuredMode ? "Clear" : "Filters"}
            {!featuredMode && activeCount > 0 && (
              <span className="ml-1 rounded-full bg-white/25 px-1.5 text-[11px]">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {!featuredMode && showFilters && activeCount > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-black/[0.07] pt-3.5">
            <button
              onClick={clearAll}
              className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-gold-dark hover:text-matte"
            >
              <X size={13} />
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-ivory">
      {/* ============ ALL PROPERTIES — dark hero + inline filter bar ============ */}
      {!featuredMode && (
        <>
          <section className="relative bg-[#0c0c0d] overflow-hidden">
            {/* Subtle radial gradient for luxury feel matching the screenshot */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent pointer-events-none" />

            <button
              type="button"
              onClick={() => {
                setCurrentPage("home");
                try {
                  window.scrollTo({ top: 0, behavior: "auto" });
                } catch (e) {
                  /* ignore */
                }
              }}
              className="group relative z-10 inline-flex min-h-[44px] items-center gap-2 px-4 pt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors hover:text-gold sm:px-6 lg:pl-[max(2rem,calc((100vw-88rem)/2))]"
            >
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
              Back to Home
            </button>

            <div className="grid items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] relative z-10">
              <div className="flex items-center px-4 pb-12 pt-6 sm:px-6 lg:pb-28 lg:pl-[max(2rem,calc((100vw-88rem)/2))] lg:pr-10 lg:pt-8">
                <Reveal variant="up" duration={700}>
                  <div>
                    <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gold-dark">
                      <span className="h-[1.5px] w-12 bg-gold" />
                      Our Inventory
                    </p>

                    <h1 className="mt-5 font-serif text-[32px] font-semibold leading-[1.12] text-white sm:text-[46px] lg:text-[52px]">
                      All <span className="text-gold-dark">Properties</span>
                    </h1>

                    <p className="mt-5 max-w-md text-[14px] leading-[1.85] text-white/70">
                      Every listing added by our team — curated collections, featured picks and
                      prime locations, all in one place.
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-y-7 gap-x-4 sm:grid-cols-4">
                      {[
                        { icon: ShieldCheck, title: "Verified Properties", desc: "100% verified listings" },
                        { icon: CalendarDays, title: "Easy Booking", desc: "Hassle-free process" },
                        { icon: MapPin, title: "Top Locations", desc: "Prime neighborhood" },
                        { icon: Headset, title: "Trusted Support", desc: "Here to help you" },
                      ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex gap-2.5">
                          <Icon size={18} className="shrink-0 text-gold" />
                          <div className="min-w-0">
                            <p className="text-[10.5px] font-bold leading-tight text-white">
                              {title}
                            </p>
                            <p className="mt-0.5 text-[9px] leading-tight text-white/50">
                              {desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>

              <div className="relative min-h-[220px] lg:min-h-[400px]">
                <img
                  src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80"
                  alt="Luxury living room"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-[#0c0c0d] to-transparent lg:block"
                />
              </div>
            </div>
          </section>

          <div className="relative z-20 -mt-6 lg:-mt-10">{searchBar}</div>
        </>
      )}

      {/* ============ FEATURED LISTING — editorial hero + dark panel ============ */}
      {featuredMode && (
        <>
          <section className="relative bg-[#0a0a0a] overflow-hidden">
            {/* Subtle radial gradient and gold curved lines effect */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#d3a950]/15 via-transparent to-transparent pointer-events-none" />
            
            {/* SVG curves from top left (optional detail for luxury) */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <path d="M0,200 C300,200 400,600 0,800" stroke="#d3a950" strokeWidth="1" fill="none" />
              <path d="M0,250 C350,250 450,650 0,850" stroke="#d3a950" strokeWidth="0.5" fill="none" />
              <path d="M0,150 C250,150 350,550 0,750" stroke="#d3a950" strokeWidth="0.5" fill="none" />
            </svg>

            <div className="grid items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] relative z-10">
              <div className="flex items-center px-4 pb-12 pt-12 sm:px-6 lg:pb-28 lg:pl-[max(2rem,calc((100vw-88rem)/2))] lg:pr-10 lg:pt-16">
                <Reveal variant="up" duration={700}>
                  <div>
                    <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#d3a950]">
                      <span className="flex items-center">
                        <span className="h-[1.5px] w-6 bg-[#d3a950]" />
                        <span className="h-1.5 w-1.5 rotate-45 bg-[#d3a950] mx-1" />
                      </span>
                      Showcase Projects
                    </p>

                    <h1 className="mt-5 font-serif text-[32px] font-semibold leading-[1.12] text-white sm:text-[46px] lg:text-[56px]">
                      Our Handpicked
                      <br />
                      <span className="text-[#d3a950]">Featured</span> Listing
                    </h1>

                    <p className="mt-5 max-w-md text-[14px] leading-[1.85] text-white/70">
                      Every showcase project with its own detailed brochure — floor plans,
                      price list and gallery, all in one place.
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-y-7 gap-x-4 sm:grid-cols-4">
                      {[
                        { icon: ShieldCheck, title: "RERA Verified", desc: "Documented projects" },
                        { icon: FileText, title: "Full Brochure", desc: "Plans & price list" },
                        { icon: MapPin, title: "Prime Locations", desc: "Gurugram & Delhi NCR" },
                        { icon: Star, title: "Handpicked", desc: "Curated by our team" },
                      ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex gap-2.5">
                          <Icon size={20} strokeWidth={1.5} className="shrink-0 text-[#d3a950]" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold leading-tight text-white">
                              {title}
                            </p>
                            <p className="mt-0.5 text-[9.5px] leading-tight text-white/50">
                              {desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>

              <div className="relative min-h-[250px] lg:min-h-[450px]">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80"
                  alt="Featured project"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent lg:block"
                />
              </div>
            </div>
          </section>

          <div className="relative z-20 -mt-6 lg:-mt-10">{searchBar}</div>
        </>
      )}

      {/* ==================== RESULTS ==================== */}
      <section className="py-9 sm:py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[120rem] px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-matte/45">
            {(featuredMode ? featuredLoading : loading)
              ? "Loading properties"
              : featuredMode
                ? `Showing all ${results.length} featured listings`
                : `Showing ${results.length} of ${saleProperties.length} properties`}
            {(curated.title || featuredLocation) && (
              <span className="text-[#d3a950]">
                {" "}
                &mdash; {curated.title || featuredLocation}
              </span>
            )}
          </p>

          {(featuredMode ? featuredLoading : loading) ? (
            <Loader />
          ) : error ? (
            <div className="border border-dashed border-black/10 py-16 text-center">
              <p className="text-sm text-matte/60">{error}</p>
              <button
                onClick={() => fetchProperties("?limit=200")}
                className="mt-5 inline-flex min-h-[46px] items-center bg-matte px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold hover:text-matte"
              >
                Try Again
              </button>
            </div>
          ) : results.length === 0 ? (
            <CuteLoader text="No properties match these filters. Try widening your search.">
              <button
                onClick={clearAll}
                className="inline-flex min-h-[46px] items-center bg-matte px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold hover:text-matte"
              >
                Clear Filters
              </button>
            </CuteLoader>
          ) : featuredMode ? (
            // Featured Listing keeps its image-led plates: two up on a phone,
            // three across from the large breakpoint.
            <div className="grid grid-cols-2 gap-[10px] md:gap-[20px] lg:grid-cols-3">
              {results.map((property, i) => (
                <ListingCard
                  key={property._id}
                  property={property}
                  index={i}
                  onOpen={handlePropertyClick}
                />
              ))}
            </div>
          ) : (
            // All Properties uses the compact detail card.
            <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((property, i) => (
                <Reveal key={property._id} delay={(i % 4) * 80} variant="up" className="h-full">
                  <ProjectCard
                    property={property}
                    onClick={() => handlePropertyClick(property)}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Owners who want us to market their property */}
      <ListWithUs />
    </div>
  );
};

export default Listings;

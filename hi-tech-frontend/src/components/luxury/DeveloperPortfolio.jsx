import { useContext, useState } from "react";
import { Award, Building2, ExternalLink, Handshake, MapPin, X } from "lucide-react";
import GoldDivider from "./GoldDivider";
import Reveal from "../home/Reveal";
import { DeveloperContext } from "../../context/DeveloperContext";

// Shown only until the admin adds real developers from the Developers admin
// page — keeps this section from going blank on a fresh install.
const FALLBACK_PARTNERS = [
  { brand: "DLF", project: "DLF Arbour 2", logo: "https://logo.clearbit.com/dlf.in" },
  { brand: "Sobha", project: "Shobha Crescent", logo: "https://logo.clearbit.com/sobha.com" },
  { brand: "Max Estates", project: "Max 361", logo: "https://logo.clearbit.com/maxestates.in" },
  { brand: "Landmark", project: "Landmark One", logo: "https://logo.clearbit.com/landmarkgroup.in" },
  { brand: "SPJ", project: "SPJ Vedatam", logo: "" }, // Keep monogram for SPJ if clearbit fails
  { brand: "Emaar", project: "Emaar 62", logo: "https://logo.clearbit.com/emaar.com" },
  { brand: "Adani Realty", project: "Adani Ivana 2", logo: "https://logo.clearbit.com/adanirealty.com" },
  { brand: "Birla Estates", project: "Birla Estates", logo: "https://logo.clearbit.com/birlaestates.com" },
  { brand: "Smartworld", project: "Smartworld Developers", logo: "https://logo.clearbit.com/smartworlddevelopers.com" },
  { brand: "M3M", project: "M3M", logo: "https://logo.clearbit.com/m3mindia.com" },
];

/** First letters of the brand, e.g. "Smartworld" → "S", "SPJ" → "SPJ". */
const monogram = (brand) =>
  brand === brand.toUpperCase() ? brand.slice(0, 3) : brand.slice(0, 1).toUpperCase();

const ASSURANCES = [
  { icon: Award, title: "Trusted Partnerships", desc: "Collaborating with leading developers known for quality and reliability." },
  { icon: Building2, title: "Quality Assurance", desc: "Every project is backed by a commitment to superior construction and design." },
  { icon: Handshake, title: "Value You Can Trust", desc: "Delivering long-term value through transparent and ethical relationships." },
];

const STATS = [
  { icon: Building2, value: "10+", title: "Top Developers", desc: "Our trusted network" },
  { icon: Building2, value: "50+", title: "Projects Delivered", desc: "Across prime locations" },
  { icon: Handshake, value: "10000+", title: "Happy Customers", desc: "And growing" },
  { icon: Award, value: "15+", title: "Years of Trust", desc: "And partnerships" },
  { icon: MapPin, value: "Gurugram", title: "Primary Focus", desc: "Prime real estate hub" },
];

const BACKDROP =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80";

const DeveloperPortfolio = () => {
  const { developers, loading } = useContext(DeveloperContext);
  const [viewingBio, setViewingBio] = useState(null);

  const active = developers.filter((d) => d.status !== "inactive");
  // Only fall back to the hardcoded roster once the fetch has actually
  // finished and genuinely found nothing — otherwise the brief moment before
  // the first fetch resolves flashes stale placeholder data before the real
  // one replaces it.
  const partners = loading
    ? null
    : active.length > 0
      ? active.map((d) => ({
          key: d._id,
          brand: d.name,
          logo: d.logo?.url || "",
          bio: d.bio || "",
          website: d.website || "",
        }))
      : FALLBACK_PARTNERS.map((p) => ({ ...p, key: p.project, bio: "", website: "" }));

  return (
  <>
  <section className="bg-white">
    {/* Dark Portfolio Section */}
    <div className="relative overflow-hidden bg-[#0d0d0f]">
      {/* Architectural backdrop, heavily veiled */}
      <img
        src={BACKDROP}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.07]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0f] via-[#0d0d0f]/95 to-[#0d0d0f]/70" />

      <div className="relative mx-auto max-w-[86rem] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.8fr] lg:gap-16">
          {/* ---- Editorial column ---- */}
          <Reveal variant="left" duration={800} className="lg:pr-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
                Our
              </p>
              <h2 className="mt-3 font-serif text-[24px] font-semibold uppercase leading-[1.05] tracking-[0.02em] text-white sm:text-5xl sm:leading-[0.98] lg:text-[3.5rem]">
                Developer
                <span className="mt-1 block text-gold">Portfolio</span>
              </h2>

              <GoldDivider className="mt-6" tone="light" />

              <p className="mt-6 text-[14.5px] leading-[1.8] text-white/70">
                Partnering with the most trusted names in real estate to deliver
                excellence at every address.
              </p>

              {/* Assurances below text */}
              <div className="mt-12 space-y-8">
                {ASSURANCES.map(({ icon: Icon, title, desc }, i) => (
                  <Reveal key={title} delay={i * 90} variant="up">
                    <div className="group flex items-start gap-4">
                      <Icon
                        size={28}
                        strokeWidth={1.2}
                        className="mt-0.5 shrink-0 text-gold transition-transform duration-500 group-hover:scale-110 motion-reduce:group-hover:scale-100"
                      />
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-white">
                          {title}
                        </p>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">
                          {desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ---- Wordmark showcase Grid ---- */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
            {partners === null
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-36 w-[calc(50%-8px)] animate-pulse rounded-lg border border-black/10 bg-ivory sm:h-40 sm:w-[calc(33.333%-14px)] lg:h-32 lg:w-[calc(25%-15px)]"
                  />
                ))
              : partners.map((partner, i) => (
              <Reveal
                key={partner.key}
                delay={(i % 3) * 90} 
                variant="fade" 
                duration={700}
                className="w-[calc(50%-8px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)]"
              >
                <div className="group relative flex h-36 cursor-default flex-col items-center justify-center gap-2 rounded-lg border border-black/10 bg-ivory px-2 text-center transition-all duration-500 hover:border-gold/50 hover:bg-[#f5f0e8] hover:shadow-lg sm:gap-3 sm:h-40 sm:px-4 lg:gap-1.5 lg:h-32 lg:px-2">

                  {/* Logo (if available) — always shown on top */}
                  {partner.logo && (
                    <img
                      src={partner.logo}
                      alt={`${partner.brand} logo`}
                      className="max-h-[56px] max-w-[120px] lg:max-h-[52px] lg:max-w-[110px] object-contain transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}

                  {/* Monogram — shown only when there is NO logo */}
                  {!partner.logo && (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/45 font-serif text-[15px] font-semibold tracking-[0.02em] text-gold transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-matte sm:h-12 sm:w-12 sm:text-[17px] lg:h-10 lg:w-10 lg:text-[14px]">
                      {monogram(partner.brand)}
                    </span>
                  )}

                  {/* Company name — ALWAYS visible */}
                  <span className="font-serif text-[13px] font-semibold uppercase leading-tight tracking-[0.07em] text-matte transition-colors duration-500 group-hover:text-gold-dark sm:text-[15px] lg:text-[13px] xl:text-[14px]">
                    {partner.brand}
                  </span>

                  <div className="flex w-full flex-col items-center gap-1">
                    {(partner.website || partner.bio) && (
                      <div className="flex items-center gap-2">
                        {partner.website && (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9px] font-bold uppercase tracking-[0.1em] text-gold transition-colors hover:text-gold-light lg:text-[7px] xl:text-[8px]"
                          >
                            Website
                          </a>
                        )}
                        {partner.website && partner.bio && (
                          <span className="text-[9px] text-matte/25 lg:text-[7px] xl:text-[8px]">•</span>
                        )}
                        {partner.bio && (
                          <button
                            type="button"
                            onClick={() => setViewingBio(partner)}
                            className="text-[9px] font-bold uppercase tracking-[0.1em] text-matte/60 underline underline-offset-2 transition-colors hover:text-gold lg:text-[7px] xl:text-[8px]"
                          >
                            Bio
                          </button>
                        )}
                      </div>
                    )}
                    <span className="h-[2px] w-6 bg-gold transition-all duration-500 group-hover:w-10" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* White Stats Bar */}
    <div className="relative z-10 mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
      <div className="my-8 rounded-2xl bg-white px-6 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 lg:py-12 lg:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-0 lg:divide-x lg:divide-black/[0.08]">
          {STATS.map(({ icon: Icon, value, title, desc }, i) => (
            <Reveal key={title} delay={i * 90} variant="up">
              <div className="flex items-center gap-4 lg:justify-center lg:px-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ivory text-gold-dark">
                  <Icon size={22} strokeWidth={1.3} />
                </span>
                <div className="min-w-0">
                  <p className="font-serif text-[20px] font-bold leading-none text-matte">
                    {value}
                  </p>
                  <p className="mt-1 text-[12px] font-bold text-matte/80">
                    {title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-matte/50">
                    {desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>

  {viewingBio && (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-matte/55 px-4 backdrop-blur-[2px]"
      onClick={() => setViewingBio(null)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`About ${viewingBio.brand}`}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] rounded-md bg-white px-8 py-9 shadow-2xl sm:px-10"
      >
        <button
          onClick={() => setViewingBio(null)}
          aria-label="Close"
          className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-slate-900"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          {viewingBio.logo ? (
            <img
              src={viewingBio.logo}
              alt={`${viewingBio.brand} logo`}
              className="h-12 w-12 shrink-0 rounded-full border border-black/10 bg-white object-contain p-1.5"
            />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/45 font-serif text-[14px] font-semibold text-gold-dark">
              {monogram(viewingBio.brand)}
            </span>
          )}
          <h2 className="font-serif text-[19px] font-semibold text-slate-900">
            {viewingBio.brand}
          </h2>
        </div>

        <GoldDivider className="mt-5" />

        <p className="no-scrollbar mt-5 max-h-64 overflow-y-auto whitespace-pre-wrap break-words text-[14px] leading-[1.8] text-slate-600">
          {viewingBio.bio}
        </p>

        {viewingBio.website && (
          <a
            href={viewingBio.website}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-gold-dark hover:text-gold"
          >
            Visit Website <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  )}
  </>
  );
};

export default DeveloperPortfolio;

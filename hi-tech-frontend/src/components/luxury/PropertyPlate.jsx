import { MapPin, BedDouble, ArrowUpRight } from "lucide-react";
import Reveal from "../home/Reveal";

const FALLBACK =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=75";

const luxePrice = (value, isRental = false) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  if (isRental) return `₹${n.toLocaleString("en-IN")}`;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

/**
 * Large image-led plate used on the listings grid — the photograph carries the
 * project name, with supporting facts revealed on hover.
 */
const PropertyPlate = ({ property, index = 0, onOpen }) => {
  const image = property.images?.[0]?.url || property.images?.[0] || FALLBACK;
  const isRental = Boolean(property.rentalCategory);
  const config = property.configuration || (property.bhk ? `${property.bhk} BHK` : null);
  const isCommercial = property.propertyType === "commercial";
  const isUC = property.possession === "under-construction";

  const open = () => onOpen?.(property);

  return (
    <Reveal delay={(index % 2) * 110} variant="up">
      <article
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        aria-label={`View ${property.title}`}
        className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-matte ring-1 ring-black/[0.06] transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] hover:ring-gold/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:aspect-[16/11]"
      >
        <img
          src={image}
          alt={property.title}
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK;
          }}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
        />

        {/* Scrim deepens on hover so the revealed facts stay readable */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-matte via-matte/25 to-transparent transition-opacity duration-500 group-hover:from-matte group-hover:via-matte/45" />

        {/* Status / type tags */}
        <span className="absolute left-0 top-5 flex flex-col gap-px">
          {isUC && (
            <span className="bg-gold px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-matte">
              Under Construction
            </span>
          )}
          {isCommercial && (
            <span className="bg-matte/85 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-gold-light backdrop-blur-sm">
              Commercial
            </span>
          )}
        </span>

        <span className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white opacity-0 transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-matte group-hover:opacity-100">
          <ArrowUpRight size={15} />
        </span>

        {/* Caption */}
        <span className="absolute inset-x-6 bottom-6">
          <span className="block font-serif text-xl font-semibold uppercase leading-tight tracking-[0.05em] text-white sm:text-2xl">
            {property.title}
          </span>

          <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} strokeWidth={1.6} className="shrink-0 text-gold" />
              {property.city || "—"}
            </span>
            {config && (
              <>
                <span className="h-3 w-px bg-white/25" />
                <span className="inline-flex items-center gap-1.5">
                  <BedDouble size={12} strokeWidth={1.6} className="shrink-0 text-gold" />
                  {config}
                </span>
              </>
            )}
          </span>

          {/* Price slides in on hover */}
          <span className="mt-0 block max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:mt-3 group-hover:max-h-16 group-hover:opacity-100 motion-reduce:mt-3 motion-reduce:max-h-16 motion-reduce:opacity-100">
            <span className="font-serif text-lg font-semibold text-gold-light">
              {luxePrice(property.price, isRental)}
              <span className="ml-1.5 font-sans text-[10px] uppercase tracking-[0.16em] text-white/50">
                {isRental ? "/ month" : "Onwards"}
              </span>
            </span>
          </span>

          <span className="mt-3 block h-px w-0 bg-gold transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:w-14" />
        </span>
      </article>
    </Reveal>
  );
};

export default PropertyPlate;

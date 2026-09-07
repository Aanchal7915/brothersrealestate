import { MapPin, BedDouble, ArrowUpRight } from "lucide-react";

const FALLBACK =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=75";

/** ₹135000000 → "₹13.50 Cr" — refined, never a raw digit wall. */
export const luxePrice = (value, isRental = false) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  if (isRental) return `₹${n.toLocaleString("en-IN")}`;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.00$/, "")} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

/** Badge is derived from the real record — never invented. */
const badgeFor = (property, index) => {
  if (property.rentalCategory) return "For Rent";
  if (property.featured) return "Featured";
  if (index === 0) return "New Launch";
  return null;
};

const ShowcaseTile = ({ property, index = 0, active = false, onSelect, onOpen }) => {
  const image = property.images?.[0]?.url || property.images?.[0] || FALLBACK;
  const isRental = Boolean(property.rentalCategory);
  const badge = badgeFor(property, index);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(property)}
      onDoubleClick={() => onOpen?.(property)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(property);
        }
      }}
      className={`group relative cursor-pointer overflow-hidden bg-white transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
        active
          ? "ring-1 ring-gold shadow-[0_18px_50px_-24px_rgba(12,12,13,0.45)]"
          : "ring-1 ring-black/[0.07] hover:ring-gold/50 hover:shadow-[0_18px_50px_-24px_rgba(12,12,13,0.35)]"
      }`}
    >
      {/* Imagery leads — large, with the price plated over it */}
      <div className="relative h-52 overflow-hidden sm:h-56">
        <img
          src={image}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.07] motion-reduce:group-hover:scale-100"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-matte/75 via-matte/10 to-transparent" />

        {badge && (
          <span className="absolute left-0 top-4 bg-gold px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-matte shadow-sm">
            {badge}
          </span>
        )}

        <span className="absolute bottom-0 left-0 bg-matte/85 px-4 py-2 backdrop-blur-sm">
          <span className="font-serif text-lg font-semibold tracking-wide text-gold-light sm:text-xl">
            {luxePrice(property.price, isRental)}
            {isRental && (
              <span className="ml-1 font-sans text-[10px] uppercase tracking-widest text-white/60">
                / mo
              </span>
            )}
          </span>
        </span>
      </div>

      {/* Details */}
      <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h3
            title={property.title}
            className="line-clamp-2 font-serif text-[15px] font-semibold uppercase leading-[1.25] tracking-[0.05em] text-matte transition-colors duration-300 group-hover:text-gold-dark sm:text-base"
          >
            {property.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-matte/55 sm:text-xs">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} className="text-gold" />
              <span className="truncate">{property.city || "—"}</span>
            </span>
            <span className="h-3 w-px bg-black/10" />
            <span className="inline-flex items-center gap-1.5">
              <BedDouble size={12} className="text-gold" />
              {property.configuration || (property.bhk ? `${property.bhk} BHK` : "—")}
            </span>
          </div>
        </div>

        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-matte/60 transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-matte">
          <ArrowUpRight size={15} />
        </span>
      </div>
    </article>
  );
};

export default ShowcaseTile;

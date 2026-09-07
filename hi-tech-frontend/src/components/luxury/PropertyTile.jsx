import { MapPin, BedDouble, ChevronRight, Heart } from "lucide-react";

const FALLBACK =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=75";

/** ₹220000000 → "₹22Cr*" — brochure formatting, never a raw digit wall. */
export const luxePrice = (value, isRental = false) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  if (isRental) return `₹${n.toLocaleString("en-IN")}`;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, "")}Cr*`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, "")}L*`;
  return `₹${n.toLocaleString("en-IN")}`;
};

// The data model has no dedicated `isNewLaunch` field, so the badge is driven
// by the admin-controlled `featured` toggle — the existing per-property switch
// used to spotlight inventory. That keeps it selective rather than showing on
// every card. Swap this for a real field if one is added to the Property model.
export const isNewLaunch = (property) => Boolean(property?.featured);

const PropertyTile = ({ property, onOpen, isFavourite, onToggleFavourite }) => {
  const image = property.images?.[0]?.url || property.images?.[0] || FALLBACK;
  const isRental = Boolean(property.rentalCategory);
  const showNewLaunch = isNewLaunch(property);
  const favourite = Boolean(isFavourite);

  const open = () => onOpen?.(property);

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-sm bg-white ring-1 ring-black/[0.06] transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1 hover:ring-gold/45 hover:shadow-[0_20px_48px_-26px_rgba(12,12,13,0.4)] motion-reduce:hover:translate-y-0"
    >
      {/* ---- Photograph (≈2/3 of the card) ---- */}
      <div
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
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <img
          src={image}
          alt={property.title}
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK;
          }}
          className="h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        />

        {/* Bottom scrim carries the price */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-matte via-matte/60 to-transparent" />

        {showNewLaunch && (
          <span className="absolute left-0 top-4 bg-gold px-3 py-1.5 text-[9px] font-bold uppercase leading-[1.25] tracking-[0.12em] text-matte shadow-sm">
            New
            <br />
            Launch
          </span>
        )}

        <span className="pointer-events-none absolute bottom-4 left-4">
          <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/70">
            Starting From
          </span>
          <span className="mt-0.5 block font-serif text-xl font-semibold tracking-wide text-gold-light sm:text-[1.4rem]">
            {luxePrice(property.price, isRental)}
          </span>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">
            {isRental ? "Per Month" : "Onwards"}
          </span>
        </span>
      </div>

      {/* Save — real, device-local favourite */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavourite?.(property._id);
        }}
        aria-pressed={favourite}
        aria-label={favourite ? `Remove ${property.title} from saved` : `Save ${property.title}`}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-all duration-300 hover:scale-110 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:hover:scale-100"
      >
        <Heart
          size={15}
          className={`transition-colors duration-300 ${
            favourite ? "fill-gold text-gold" : "text-matte/55 hover:text-gold"
          }`}
        />
      </button>

      {/* ---- Details ---- */}
      <div className="flex flex-1 items-start justify-between gap-1.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4">
        <div className="min-w-0 flex-1">
          <h3
            onClick={open}
            title={property.title}
            className="line-clamp-2 cursor-pointer font-serif text-[13px] font-semibold uppercase leading-[1.25] tracking-[0.04em] text-matte transition-colors duration-300 group-hover:text-gold-dark sm:text-base"
          >
            {property.title}
          </h3>

          <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[9px] sm:text-[11px] text-matte/55">
            <span className="inline-flex items-center gap-1 sm:gap-1.5">
              <MapPin size={10} strokeWidth={1.6} className="shrink-0 text-gold sm:w-[12px]" />
              <span className="truncate">{property.city || "—"}</span>
            </span>
            <span className="h-2 sm:h-3 w-px bg-black/10" />
            <span className="inline-flex items-center gap-1 sm:gap-1.5">
              <BedDouble size={10} strokeWidth={1.6} className="shrink-0 text-gold sm:w-[12px]" />
              {property.configuration || (property.bhk ? `${property.bhk} BHK` : "—")}
            </span>
          </div>
        </div>

        <button
          onClick={open}
          aria-label={`View ${property.title}`}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold transition-all duration-300 group-hover:border-matte group-hover:bg-matte group-hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <ChevronRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </article>
  );
};

export default PropertyTile;

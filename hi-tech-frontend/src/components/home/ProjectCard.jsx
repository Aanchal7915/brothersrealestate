import { MapPin, Bed, Maximize, CalendarClock, ArrowRight, Tag } from "lucide-react";
import { propertyTypeLabel } from "../../utils/propertyType";
import { optimizedImageUrl } from "../../utils/cloudinaryUrl";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=70";

/** ₹1,35,00,000 → "₹1.35 Cr"; keeps rent readable as "₹65,000" */
export const formatPrice = (value, { isRental = false } = {}) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  if (isRental) return `₹${n.toLocaleString("en-IN")}`;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.00$/, "")} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

/** Derives a badge from the real property record — never invented. */
const deriveBadge = (property) => {
  if (property.featured) return { label: "Featured", tone: "accent" };
  if (property.rentalCategory) return { label: "For Rent", tone: "royal" };
  if (Number(property.price) >= 20000000) return { label: "Luxury", tone: "navy" };
  return { label: "For Sale", tone: "royal" };
};

const TONES = {
  accent: "bg-gold text-white",
  royal: "bg-matte text-white",
  navy: "bg-matte text-white",
};

/** `badge` lets a page force its own label (the rent page always says "For Rent"). */
const ProjectCard = ({ property, onClick, badge: badgeOverride }) => {
  const image = optimizedImageUrl(
    property.images?.[0]?.url || property.images?.[0] || FALLBACK_IMAGE
  );
  const isRental = Boolean(property.rentalCategory);
  const badge = badgeOverride || deriveBadge(property);

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-card transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1.5 hover:border-gold hover:shadow-card-hover active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:hover:translate-y-0"
    >
      <div className="relative h-36 overflow-hidden sm:h-52">
        <img
          src={image}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.08] motion-reduce:group-hover:scale-100"
        />
        {/* Scrim deepens slightly on hover for a sense of depth */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-matte/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span
          className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[9px] sm:text-[11px] font-bold shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 ${
            TONES[badge.tone]
          }`}
        >
          {badge.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <h3 className="line-clamp-2 font-display text-[13px] font-bold leading-snug text-matte transition-colors duration-300 group-hover:text-matte sm:text-base">
          {property.title}
        </h3>

        {/* Property Type pill — value comes from the admin-set `propertyType` field */}
        {property.propertyType && (
          <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] text-gold-dark">
            <Tag size={9} className="shrink-0" />
            {propertyTypeLabel(property.propertyType) || property.propertyType}
          </span>
        )}

        <p className="mt-1 sm:mt-1.5 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-matte/55">
          <MapPin size={11} className="shrink-0 text-gold-dark sm:w-[13px] sm:h-[13px]" />
          <span className="truncate">{property.city || "—"}</span>
        </p>

        <p className="mt-2 sm:mt-3 font-display text-base font-extrabold text-matte sm:text-xl">
          {formatPrice(property.price, { isRental })}
          {isRental && (
            <span className="ml-1 text-[10px] sm:text-xs font-semibold text-matte/55">/month</span>
          )}
        </p>

        <div className="mt-auto grid grid-cols-3 gap-1 sm:gap-2 border-t border-black/10 pt-2 sm:pt-3 text-[9px] text-matte/55 sm:text-xs">
          <span className="flex flex-col items-center gap-0.5 sm:gap-1 text-center">
            <Bed size={13} className="text-matte sm:w-[15px] sm:h-[15px]" />
            {property.bhk ? `${property.bhk} BHK` : "—"}
          </span>
          <span className="flex flex-col items-center gap-0.5 sm:gap-1 border-x border-black/10 text-center">
            <Maximize size={13} className="text-matte sm:w-[15px] sm:h-[15px]" />
            {property.area ? `${property.area} sq.ft.` : "—"}
          </span>
          <span className="flex flex-col items-center gap-0.5 sm:gap-1 text-center">
            <CalendarClock size={13} className="text-matte sm:w-[15px] sm:h-[15px]" />
            {property.status === "active" ? "Available" : property.status || "—"}
          </span>
        </div>

        <span className="mt-3 sm:mt-4 inline-flex min-h-[32px] sm:min-h-[40px] items-center justify-center gap-1 sm:gap-1.5 rounded-xl bg-ivory px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-matte transition-all duration-300 group-hover:bg-matte group-hover:text-white">
          View Details
          <ArrowRight
            size={12}
            className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:w-[14px] sm:h-[14px]"
          />
        </span>
      </div>
    </article>
  );
};

export default ProjectCard;

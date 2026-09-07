import { ArrowUpRight, ArrowRight } from "lucide-react";
import GoldDivider from "../luxury/GoldDivider";
import Reveal from "./Reveal";
import Loader from "../Loader";
import CuteLoader from "../CuteLoader";

const FALLBACK =
  "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=800&q=70";

/**
 * Reusable image-tile grid used by Curated Collections, Rental Properties
 * and Featured Locations. Each item: { key, title, meta, image, onClick }.
 * `tone: "dark"` renders the matte-black variant.
 */
const CollectionStrip = ({
  eyebrow,
  title,
  subtitle,
  items = [],
  loading = false,
  emptyText = "Nothing to show here yet.",
  tone = "light",
  onViewAll,
  viewAllLabel = "View All Properties",
}) => {
  const isDark = tone === "dark";

  return (
    <section
      className={`${isDark ? "bg-matte" : "bg-ivory"} py-10 sm:py-20 lg:py-24`}
    >
      <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        <Reveal variant="up" duration={700}>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-5 sm:mb-12 sm:gap-6">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              <span className="h-px w-8 bg-gold" />
              {eyebrow}
            </p>
            <h2
              className={`mt-4 font-serif text-[22px] font-semibold uppercase tracking-[0.03em] sm:text-4xl lg:text-[2.75rem] ${
                isDark ? "text-white" : "text-matte"
              }`}
            >
              {title}
            </h2>
            <GoldDivider className="mt-5" tone={isDark ? "light" : "gold"} />
            {subtitle && (
              <p
                className={`mt-5 text-sm leading-[1.9] sm:text-[15px] ${
                  isDark ? "text-white/55" : "text-matte/55"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Every strip's View All lands on the All Properties page */}
          {onViewAll && (
            <button
              onClick={onViewAll}
              className={`group inline-flex min-h-[46px] shrink-0 items-center gap-2.5 rounded-lg border px-6 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-500 ${
                isDark
                  ? "border-gold/50 text-gold hover:bg-gold hover:text-matte"
                  : "border-matte/25 text-matte hover:bg-matte hover:text-white"
              }`}
            >
              {viewAllLabel}
              <ArrowRight
                size={14}
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            </button>
          )}
          </div>
        </Reveal>

        {loading ? (
          <div className="flex justify-center py-14">
            <Loader />
          </div>
        ) : items.length === 0 ? (
          <CuteLoader title="Nothing here just yet" text={emptyText} tone={tone} />
        ) : (
          // One column on phones: at two columns a lone tile sat in the left half
          // with dead space beside it, and every tile read as a narrow sliver.
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {items.map((item, i) => (
              <Reveal key={item.key ?? i} delay={(i % 4) * 90} variant="up" className="h-full">
                <button
                  onClick={item.onClick}
                  className="group relative block h-56 w-full overflow-hidden text-left ring-1 ring-black/[0.07] transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1.5 hover:ring-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:hover:translate-y-0 sm:h-64"
                >
                  <img
                    src={item.image || FALLBACK}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.08] motion-reduce:group-hover:scale-100"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-matte via-matte/35 to-transparent" />

                  <span className="absolute inset-x-5 bottom-5 transition-transform duration-500 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:-translate-y-1 motion-reduce:group-hover:translate-y-0">
                    <span className="block font-serif text-lg font-semibold uppercase leading-tight tracking-[0.05em] text-white">
                      {item.title}
                    </span>
                    {item.meta && (
                      <span className="mt-1.5 block text-[11px] uppercase tracking-[0.16em] text-gold-light">
                        {item.meta}
                      </span>
                    )}
                    <span className="mt-3 block h-px w-0 bg-gold transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:w-12" />
                  </span>

                  <span className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-white/80 opacity-0 transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-matte group-hover:opacity-100">
                    <ArrowUpRight size={14} />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionStrip;

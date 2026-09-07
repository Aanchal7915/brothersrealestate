import { useEffect, useState } from "react";
import {
  ArrowRight,
  MapPin,
  BedDouble,
  Maximize,
} from "lucide-react";
import GoldDivider from "./GoldDivider";
import ShowcaseTile, { luxePrice } from "./ShowcaseTile";
import Reveal from "../home/Reveal";
import Loader from "../Loader";

const FALLBACK =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80";

/**
 * Luxury Featured Listings — editorial column, property grid, and an
 * expanded brochure-style preview for the selected residence.
 * All data comes from the live property API via props.
 */
const FeaturedShowcase = ({
  properties = [],
  loading,
  onOpen,
  setCurrentPage,
}) => {
  const [selected, setSelected] = useState(null);

  // Keep the preview pinned to the first listing until the visitor picks one.
  useEffect(() => {
    if (properties.length && !properties.some((p) => p._id === selected?._id)) {
      setSelected(properties[0]);
    }
  }, [properties, selected]);

  const goTo = (page) => {
    setCurrentPage(page);
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (e) {
      /* ignore */
    }
  };

  const previewImage =
    selected?.images?.[0]?.url || selected?.images?.[0] || FALLBACK;
  const previewRental = Boolean(selected?.rentalCategory);

  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-[86rem] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.6fr)] lg:gap-14">
          {/* ---------- Editorial column ---------- */}
          <Reveal variant="left" duration={800}>
            <div className="lg:sticky lg:top-28">
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
                <span className="h-px w-8 bg-gold" />
                Our Finest Selection
              </p>

              <h2 className="mt-6 font-serif text-5xl font-semibold uppercase leading-[0.95] tracking-[0.02em] text-matte sm:text-6xl lg:text-[4.25rem]">
                Premium
                <span className="mt-1 block text-gold">Property</span>
              </h2>

              <GoldDivider className="mt-6" />

              <p className="mt-6 max-w-sm text-sm leading-[1.9] text-matte/60 sm:text-[15px]">
                Explore our handpicked collection of exceptional residences
                across prime locations in Gurugram and Delhi NCR.
              </p>

              <button
                onClick={() => goTo("listings")}
                className="group mt-8 inline-flex min-h-[52px] items-center gap-3 border border-matte px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-matte transition-all duration-500 hover:bg-matte hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                View All Properties
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current transition-transform duration-500 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </button>
            </div>
          </Reveal>

          {/* ---------- Property grid ---------- */}
          <div>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader />
              </div>
            ) : properties.length === 0 ? (
              <p className="border border-dashed border-black/10 py-20 text-center text-sm text-matte/50">
                No properties available at the moment.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:gap-6">
                {properties.map((property, i) => (
                  <Reveal key={property._id} delay={(i % 2) * 110} variant="up">
                    <ShowcaseTile
                      property={property}
                      index={i}
                      active={selected?._id === property._id}
                      onSelect={setSelected}
                      onOpen={onOpen}
                    />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---------- Expanded brochure preview ---------- */}
        {selected && (
          <Reveal variant="up" duration={800} className="mt-12 lg:mt-16">
            <div className="grid overflow-hidden bg-white ring-1 ring-black/[0.07] lg:grid-cols-2">
              {/* Photograph */}
              <div className="group relative h-64 overflow-hidden sm:h-80 lg:h-auto lg:min-h-[26rem]">
                <img
                  src={previewImage}
                  alt={selected.title}
                  className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-105 motion-reduce:group-hover:scale-100"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-matte/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-matte/20" />
                <span className="absolute left-5 top-5 border border-gold/60 bg-matte/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-light backdrop-blur-sm">
                  Featured Residence
                </span>
              </div>

              {/* Brochure copy */}
              <div className="flex flex-col justify-center gap-5 p-7 sm:p-10 lg:p-12">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-dark">
                    Brothers Real Estate
                  </p>
                  <h3 className="mt-3 font-serif text-3xl font-semibold uppercase leading-tight tracking-[0.03em] text-matte sm:text-4xl">
                    {selected.title}
                  </h3>
                </div>

                <GoldDivider />

                {/* Facts drawn from the real record */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                  <div>
                    <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-matte/45">
                      <MapPin size={11} className="text-gold" /> Location
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-matte">
                      {selected.city || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-matte/45">
                      <BedDouble size={11} className="text-gold" /> Typology
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-matte">
                      {selected.bhk ? `${selected.bhk} BHK` : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-matte/45">
                      <Maximize size={11} className="text-gold" /> Size
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-matte">
                      {selected.area ? `${selected.area} sq.ft.` : "—"}
                    </dd>
                  </div>
                </dl>

                <div className="border-t border-black/[0.07] pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-matte/45">
                    Price
                  </p>
                  <p className="mt-1 font-serif text-[22px] font-semibold text-gold-dark sm:text-3xl">
                    {luxePrice(selected.price, previewRental)}
                    <span className="ml-1.5 font-sans text-[11px] uppercase tracking-[0.14em] text-matte/45">
                      {previewRental ? "/ month" : "Onwards"}
                    </span>
                  </p>
                </div>

                {selected.description && (
                  <p className="line-clamp-3 border-l-2 border-gold pl-4 text-sm italic leading-relaxed text-matte/60">
                    {selected.description}
                  </p>
                )}

                <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                  <button
                    onClick={() => onOpen?.(selected)}
                    className="group inline-flex min-h-[52px] flex-1 items-center justify-center gap-3 bg-matte px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory transition-all duration-500 hover:bg-gold hover:text-matte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    View Project
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-500 group-hover:translate-x-1"
                    />
                  </button>
                  <button
                    onClick={() => goTo("contact")}
                    className="inline-flex min-h-[52px] flex-1 items-center justify-center border border-matte/25 px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-matte transition-all duration-500 hover:border-gold hover:text-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    Enquire Now
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </div>

      {/* The trust strip lives on the Featured Listings grid below, so it
          isn't repeated here. */}
    </section>
  );
};

export default FeaturedShowcase;

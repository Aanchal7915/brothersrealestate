import { useState } from "react";
import { Star, Quote } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

const initials = (name) =>
  name
    .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|CA)\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Testimonials = ({ testimonials = [] }) => {
  const [showAll, setShowAll] = useState(false);
  // Three reads as a clean row on desktop; mobile gets a "View more" toggle.
  const visible = showAll ? testimonials : testimonials.slice(0, 3);

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-ivory py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our Clients Say"
          subtitle="Real experiences from buyers, families and investors we've worked with."
          align="center"
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {visible.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 110} variant="up" className="h-full">
              <figure className="group relative flex h-full flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-card transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1.5 hover:border-gold hover:shadow-card-hover motion-reduce:hover:translate-y-0">
                <Quote
                  size={30}
                  className="absolute right-5 top-5 text-gold-dark-soft transition-all duration-300 group-hover:scale-110 group-hover:text-gold-dark/40"
                  aria-hidden="true"
                />

                <div
                  className="flex gap-0.5"
                  role="img"
                  aria-label="Rated 5 out of 5"
                >
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={15}
                      className="fill-amber-400 text-amber-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-matte/55">
                  “{t.quote}”
                </blockquote>

                <figcaption className="mt-5 flex items-center gap-3 border-t border-black/10 pt-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-matte text-sm font-bold text-white transition-all duration-300 group-hover:scale-105 group-hover:bg-gold">
                    {initials(t.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-matte">
                      {t.name}
                    </span>
                    <span className="block truncate text-xs text-matte/55">
                      {t.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {testimonials.length > 3 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-black/10 bg-white px-6 text-sm font-bold text-matte transition-all duration-300 hover:-translate-y-0.5 hover:border-matte hover:bg-matte hover:text-white hover:shadow-[0_12px_26px_-10px_rgba(12,12,13,0.55)] active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:hover:translate-y-0"
            >
              {showAll ? "Show Less" : `View All ${testimonials.length} Reviews`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;

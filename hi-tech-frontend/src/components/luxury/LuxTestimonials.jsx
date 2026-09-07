import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import GoldDivider from "./GoldDivider";
import Reveal from "../home/Reveal";

const BACKDROP =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=80";

/**
 * Dark editorial testimonial carousel.
 * `testimonials` comes from the caller so the real published reviews are used.
 */
const LuxTestimonials = ({ testimonials = [] }) => {
  const [page, setPage] = useState(0);
  const perPage = 2;
  const pages = Math.max(1, Math.ceil(testimonials.length / perPage));
  const safePage = Math.min(page, pages - 1);
  const shown = testimonials.slice(safePage * perPage, safePage * perPage + perPage);

  if (testimonials.length === 0) return null;

  const go = (dir) => setPage((p) => (p + dir + pages) % pages);

  return (
    <section className="relative overflow-hidden bg-matte py-16 sm:py-20 lg:py-24">
      <img
        src={BACKDROP}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.16]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-matte via-matte/90 to-matte" />

      <div className="relative mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        <Reveal variant="up" duration={700}>
          <div className="text-center">
            <h2 className="flex items-center justify-center gap-5 font-serif text-3xl font-semibold uppercase tracking-[0.06em] text-white sm:text-4xl lg:text-[2.75rem]">
              <span aria-hidden="true" className="hidden h-px w-14 bg-gold/50 sm:block" />
              What Our Clients Say
              <span aria-hidden="true" className="hidden h-px w-14 bg-gold/50 sm:block" />
            </h2>
            <GoldDivider align="center" className="mt-5" tone="light" />
          </div>
        </Reveal>

        <div className="mt-12 flex items-center gap-4 sm:gap-6 lg:mt-14">
          <button
            onClick={() => go(-1)}
            aria-label="Previous testimonials"
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-300 hover:border-gold hover:text-gold sm:flex"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="grid flex-1 gap-5 md:grid-cols-2 lg:gap-6">
            {shown.map((t, i) => (
              <Reveal key={`${safePage}-${t.name}`} delay={i * 100} variant="fade" duration={600}>
                <figure className="flex h-full flex-col border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors duration-500 hover:border-gold/30 sm:p-8">
                  <div className="flex gap-1" role="img" aria-label="Rated 5 out of 5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={14} className="fill-gold text-gold" aria-hidden="true" />
                    ))}
                  </div>

                  <blockquote className="mt-5 flex-1 text-sm leading-[1.9] text-white/70">
                    “{t.quote}”
                  </blockquote>

                  <figcaption className="mt-6 border-t border-white/10 pt-4">
                    <p className="font-serif text-base font-semibold uppercase tracking-[0.08em] text-gold-light">
                      — {t.name}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/40">
                      {t.role}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <button
            onClick={() => go(1)}
            aria-label="Next testimonials"
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-300 hover:border-gold hover:text-gold sm:flex"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Mobile controls + pagination */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => go(-1)}
            aria-label="Previous testimonials"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-gold hover:text-gold sm:hidden"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Go to testimonial page ${i + 1}`}
                aria-current={i === safePage}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === safePage ? "w-7 bg-gold" : "w-1.5 bg-white/25 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            aria-label="Next testimonials"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-gold hover:text-gold sm:hidden"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default LuxTestimonials;

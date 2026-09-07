import { CheckCircle2, Users, Home, Building2, Award, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import CountUp from "./CountUp";
import { STATS } from "../../config/site";

const POINTS = [
  "15+ years of industry experience",
  "5000+ happy clients served",
  "Wide range of property options",
  "Trusted by families & investors",
];

const STAT_ICONS = [Users, Home, Building2, Award];

const AboutSection = ({ setCurrentPage }) => (
  <section className="bg-ivory py-10 sm:py-20 lg:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left — copy */}
        <Reveal>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              About Brothers Realestate
            </p>
            <h2 className="mt-4 font-serif text-[22px] font-semibold uppercase leading-tight tracking-[0.03em] text-matte sm:text-4xl lg:text-[2.75rem]">
              Building Trust,{" "}
              <span className="block text-gold sm:inline">Delivering Dreams</span>
            </h2>
            <span className="mt-5 block h-px w-14 bg-gold" />

            <p className="mt-6 text-sm leading-[1.9] text-matte/60 sm:text-[15px]">
              Brothers Realestate is a real estate consultancy committed to helping
              clients find residential and commercial properties that genuinely
              match their lifestyle, goals and budget — from first homes to
              long-term investments across Gurgaon and Delhi NCR.
            </p>

            <ul className="mt-6 space-y-3">
              {POINTS.map((point, i) => (
                <Reveal key={point} as="li" variant="left" delay={120 + i * 90}>
                  <span className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-gold"
                    />
                    <span className="text-sm text-matte/75 sm:text-[15px]">{point}</span>
                  </span>
                </Reveal>
              ))}
            </ul>

            <button
              onClick={() => {
                setCurrentPage("about");
                try {
                  window.scrollTo({ top: 0, behavior: "auto" });
                } catch (e) {
                  /* ignore */
                }
              }}
              className="group mt-8 inline-flex min-h-[48px] items-center gap-2 border border-matte px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-matte transition-all duration-300 hover:bg-matte hover:text-ivory active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Learn More
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </Reveal>

        {/* Right — stats panel */}
        <Reveal delay={120}>
          <div className="relative overflow-hidden bg-matte p-7 sm:p-10">
            {/* soft accent glow, kept subtle */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/15 blur-3xl"
            />
            <div className="relative grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-10">
              {STATS.map((stat, i) => {
                const Icon = STAT_ICONS[i] || Users;
                return (
                  <Reveal key={stat.label} delay={200 + i * 110} variant="up">
                    <div className="group">
                      <span className="flex h-11 w-11 items-center justify-center border border-gold/30 text-gold transition-all duration-300 group-hover:scale-110 group-hover:bg-gold group-hover:text-matte">
                        <Icon size={20} strokeWidth={2} />
                      </span>
                      <p className="mt-4 font-serif text-[22px] font-semibold tabular-nums text-gold sm:text-[2.25rem]">
                        <CountUp value={stat.value} duration={1900} />
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                        {stat.label}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default AboutSection;

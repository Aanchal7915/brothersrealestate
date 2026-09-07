import {
  UserCheck,
  ShieldCheck,
  BadgePercent,
  Handshake,
  FileCheck2,
  Headset,
  ArrowRight,
} from "lucide-react";
import Reveal from "./Reveal";

const FEATURES = [
  {
    icon: UserCheck,
    title: "Expert Guidance",
    desc: "Professional advice from real estate experts.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Properties",
    desc: "All properties are legally verified & authentic.",
  },
  {
    icon: BadgePercent,
    title: "Best Deals",
    desc: "We negotiate the best price for you.",
  },
  {
    icon: Handshake,
    title: "End-to-End Support",
    desc: "From property search to possession.",
  },
  {
    icon: FileCheck2,
    title: "Transparent Process",
    desc: "Clear communication and honest dealings.",
  },
  {
    icon: Headset,
    title: "After Sales Service",
    desc: "We're with you even after possession.",
  },
];

const WhyChooseUs = ({ setCurrentPage }) => (
  <section id="services" className="scroll-mt-24 bg-white py-14 sm:py-16 lg:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
        {/* Left — pitch */}
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-dark sm:text-xs">
              Why Choose Us
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-matte sm:text-3xl lg:text-[2rem]">
              We Make Real Estate
              <br className="hidden sm:block" /> Simple &amp; Reliable
            </h2>
            <span className="mt-4 block h-1 w-14 rounded-full bg-gold" />

            <p className="mt-5 max-w-md text-sm leading-relaxed text-matte/55 sm:text-[15px]">
              With deep market knowledge and a client-first approach, we make sure
              you get the right property at the right value — every single time.
              No pressure, no hidden charges, just straight answers.
            </p>

            <button
              onClick={() => {
                setCurrentPage("about");
                try {
                  window.scrollTo({ top: 0, behavior: "auto" });
                } catch (e) {
                  /* ignore */
                }
              }}
              className="group mt-7 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-matte px-6 text-sm font-bold text-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-matte hover:shadow-[0_14px_30px_-10px_rgba(12,12,13,0.6)] active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:hover:translate-y-0"
            >
              Know More About Us
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </Reveal>

        {/* Right — feature grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 90} variant="up" className="h-full">
              <div className="group h-full cursor-default rounded-2xl border border-black/10 bg-white p-5 shadow-card transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1.5 hover:border-gold hover:shadow-card-hover motion-reduce:hover:translate-y-0">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold-dark transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-110 group-hover:bg-gold group-hover:text-white group-hover:shadow-[0_10px_22px_-8px_rgba(193,162,101,0.65)] motion-reduce:group-hover:transform-none">
                  <Icon size={20} strokeWidth={2} />
                </span>
                <h3 className="mt-4 font-display text-[15px] font-bold text-matte transition-colors duration-300 group-hover:text-matte">
                  {title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-matte/55 sm:text-[13px]">
                  {desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;

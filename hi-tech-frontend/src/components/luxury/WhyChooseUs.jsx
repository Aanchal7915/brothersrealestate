import {
  ShieldCheck,
  MapPin,
  Gem,
  Headset,
  FileCheck2,
  BadgeIndianRupee,
} from "lucide-react";
import GoldDivider from "./GoldDivider";
import Reveal from "../home/Reveal";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    desc: "100% transparency in every transaction and commitment.",
  },
  {
    icon: MapPin,
    title: "Prime Locations",
    desc: "Carefully selected locations for better connectivity and growth.",
  },
  {
    icon: Gem,
    title: "Premium Properties",
    desc: "Curated luxury residences crafted for modern living.",
  },
  {
    icon: Headset,
    title: "Expert Assistance",
    desc: "Personalized guidance from property experts at every step.",
  },
  {
    icon: FileCheck2,
    title: "RERA Registered",
    desc: "All our projects are RERA registered for complete peace of mind.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Best Value Guarantee",
    desc: "Exceptional value with the best prices in the market.",
  },
];

const WhyChooseUs = () => (
  <section id="services" className="scroll-mt-24 bg-ivory py-16 sm:py-20 lg:py-24">
    <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
      {/* Centred editorial heading flanked by gold rules */}
      <Reveal variant="up" duration={700}>
        <div className="text-center">
          <h2 className="flex items-center justify-center gap-3 font-serif text-[22px] font-semibold uppercase tracking-[0.06em] text-matte sm:gap-5 sm:text-4xl lg:text-[2.75rem]">
            <span aria-hidden="true" className="hidden h-px w-14 bg-gold/60 sm:block" />
            Why Choose Us
            <span aria-hidden="true" className="hidden h-px w-14 bg-gold/60 sm:block" />
          </h2>
          <GoldDivider align="center" className="mt-5" />
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-6 lg:gap-y-0">
        {REASONS.map(({ icon: Icon, title, desc }, i) => (
          <Reveal key={title} delay={(i % 3) * 100} variant="up">
            <div
              className={`group flex h-full cursor-default flex-col items-center px-5 text-center lg:px-4 ${
                i > 0 ? "lg:border-l lg:border-black/[0.08]" : ""
              }`}
            >
              <Icon
                size={34}
                strokeWidth={1}
                className="text-gold transition-transform duration-500 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:-translate-y-1 group-hover:scale-110 motion-reduce:group-hover:transform-none"
              />
              <h3 className="mt-5 text-[11px] font-semibold uppercase leading-snug tracking-[0.14em] text-matte transition-colors duration-300 group-hover:text-gold-dark">
                {title}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-matte/50">{desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;

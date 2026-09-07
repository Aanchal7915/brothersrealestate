import { Users, MapPin, BadgeIndianRupee, LifeBuoy } from "lucide-react";
import Reveal from "./Reveal";

const ITEMS = [
  {
    icon: Users,
    title: "Trusted by 1000+ Clients",
    desc: "For our dedicated service",
  },
  {
    icon: MapPin,
    title: "Premium Locations",
    desc: "Handpicked for you",
  },
  {
    icon: BadgeIndianRupee,
    title: "Best Price Guarantee",
    desc: "Get the best deals",
  },
  {
    icon: LifeBuoy,
    title: "Complete Support",
    desc: "From start to finish",
  },
];

const TrustFeatures = () => (
  <section className="bg-ivory py-12 sm:py-14">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 lg:grid-cols-4 lg:gap-8">
        {ITEMS.map(({ icon: Icon, title, desc }, i) => (
          <Reveal key={title} delay={i * 90} variant="up">
            <div className="group flex cursor-default items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-gold/30 bg-transparent text-gold transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:border-gold group-hover:bg-gold group-hover:text-matte motion-reduce:group-hover:transform-none">
                <Icon size={19} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] leading-snug text-matte transition-colors duration-300 group-hover:text-gold-dark sm:text-xs">
                  {title}
                </p>
                <p className="mt-1 text-xs text-matte/50">{desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default TrustFeatures;

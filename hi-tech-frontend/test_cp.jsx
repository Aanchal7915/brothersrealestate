import {
  Building2,
  Sparkles,
  ChevronRight,
  Users,
  Handshake,
  ShieldCheck,
  Star,
} from "lucide-react";
import Reveal from "./home/Reveal";

const PARTNERS = [
  "DLF Arbour 2",
  "Shobha Crescent",
  "Max 361",
  "Landmark One",
  "SPJ Vedatam",
  "Emaar 62",
  "Adani Ivana 2",
  "Birla",
  "Smartworld",
];

const PARTNER_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-rose-500 to-orange-500",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-cyan-500",
  "from-amber-500 to-rose-500",
  "from-violet-500 to-fuchsia-600",
  "from-teal-500 to-emerald-600",
  "from-pink-500 to-rose-600",
  "from-sky-500 to-indigo-600",
];

const ASSURANCES = [
  { icon: Users, title: "Trusted Collaborations", desc: "Partnered with industry leaders" },
  { icon: Handshake, title: "Quality Assured", desc: "Verified & approved partners" },
  { icon: ShieldCheck, title: "Reliable Network", desc: "Built on trust & transparency" },
  { icon: Star, title: "Better Experiences", desc: "For your real estate journey" },
];

const ChannelPartners = ({ theme = "light" }) => {
  const isDark = theme === "dark";

  return (
    <section className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 ${isDark ? "bg-[#0B1021]" : "bg-gradient-to-b from-white via-surface to-white"}`}>
      
      {/* Background decorations */}
      {isDark ? (
        <>
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #2e1065 0%, transparent 60%)" }}></div>
          {/* Subtle bottom map/skyline effect using CSS gradients */}
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#1e1b4b] to-transparent opacity-30 z-0"></div>
          {/* Abstract geometric shapes */}
          <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full border border-indigo-500/20 opacity-50 z-0 blur-[1px]"></div>
          <div className="absolute top-40 right-[5%] w-32 h-32 rounded-full border border-rose-500/20 opacity-40 z-0"></div>
        </>
      ) : (
        <>
          <div aria-hidden="true" className="ce-float pointer-events-none absolute -right-24 top-8 h-80 w-80 rounded-full bg-accent/10 blur-3xl z-0" />
          <div aria-hidden="true" className="ce-float pointer-events-none absolute -left-28 bottom-4 h-72 w-72 rounded-full bg-royal/10 blur-3xl z-0" style={{ "--d": "1400ms" }} />
          <div aria-hidden="true" className="pointer-events-none absolute left-6 top-16 hidden h-24 w-32 opacity-60 lg:block z-0" style={{ backgroundImage: "radial-gradient(circle, rgba(18,59,140,0.28) 1.2px, transparent 1.2px)", backgroundSize: "15px 15px" }} />
        </>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        {/* ---- Header ---- */}
        <div className="mb-12 text-center sm:mb-14">
          <Reveal variant="up" duration={600}>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 ${isDark ? "bg-indigo-900/40 border-indigo-500/30 text-indigo-200" : "bg-accent-soft border-accent/20 text-accent"}`}>
              <Sparkles size={14} className={isDark ? "text-indigo-400" : "text-accent"} />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">
                Trusted Network
              </span>
            </span>
          </Reveal>

          <Reveal variant="up" delay={90} duration={700}>
            <h2 className={`mt-4 font-display text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[2.5rem] ${isDark ? "text-white" : "text-ink"}`}>
              Our Premium{" "}
              <span className={isDark ? "text-rose-500" : "bg-gradient-to-r from-accent to-royal bg-clip-text text-transparent"}>
                Channel Partners
              </span>
            </h2>
          </Reveal>

          <Reveal variant="fade" delay={170} duration={600}>
            <span className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
              <span className={`h-0.5 w-7 rounded-full ${isDark ? "bg-indigo-500/50" : "bg-accent/70"}`} />
              <span className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-rose-500" : "bg-accent"}`} />
              <span className={`h-0.5 w-7 rounded-full ${isDark ? "bg-indigo-500/50" : "bg-accent/70"}`} />
            </span>
          </Reveal>

          <Reveal variant="up" delay={230} duration={700}>
            <p className={`mx-auto mt-4 max-w-2xl text-sm leading-relaxed sm:text-[15px] ${isDark ? "text-indigo-200" : "text-muted"}`}>
              Collaborating with the most prestigious names in real estate to bring
              you unmatched luxury, trust and exclusivity.
            </p>
          </Reveal>
        </div>

        {/* ---- Partner grid ---- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 mb-8 lg:mb-12">
          {PARTNERS.map((partner, index) => {
            const initial = partner.charAt(0).toUpperCase();
            const gradient = PARTNER_GRADIENTS[index % PARTNER_GRADIENTS.length];

            return (
              <Reveal key={partner} delay={(index % 3) * 90} variant="scale" className="h-full">
                <div className="group flex h-full cursor-default items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm hover:shadow-md transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1 sm:px-5">
                  <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white shadow-sm sm:h-14 sm:w-14`}>
                    <span className="font-display text-base font-extrabold sm:text-lg">{initial}</span>
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
                      <Building2 size={10} className="text-gray-700" />
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-bold leading-tight text-gray-900 transition-colors duration-300 group-hover:text-indigo-600 sm:text-[15px]">
                      {partner}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 sm:text-[11px]">
                      Channel Partner
                    </span>
                  </span>

                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                    <ChevronRight size={15} />
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* ---- Assurance strip ---- */}
        <Reveal variant="up" delay={120} duration={700}>
          <div className="mt-6 grid grid-cols-1 gap-y-6 rounded-3xl border border-gray-100 bg-white px-5 py-6 shadow-xl sm:grid-cols-2 sm:gap-x-4 lg:mt-8 lg:grid-cols-4 lg:gap-x-0 lg:px-8 relative z-20">
            {ASSURANCES.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className={`group flex items-center gap-4 lg:justify-center lg:px-4 ${i > 0 ? "lg:border-l lg:border-gray-100" : ""}`}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white motion-reduce:group-hover:scale-100">
                  <Icon size={20} strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-snug text-gray-900">{title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-gray-500">{desc}</span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ChannelPartners;


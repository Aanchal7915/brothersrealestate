import { useState } from "react";
import {
  Target,
  Eye,
  ShieldCheck,
  Gem,
  Users,
  Trophy,
  Home,
  Heart,
  Quote,
  Building2,
  Award,
  Download,
} from "lucide-react";
import chiragImage from "../assets/chirag_sharma.jpg";
import rajeevImage from "../assets/rajeev_bharadwaj.jpg";
import Reveal from "../components/home/Reveal";
import CountUp from "../components/home/CountUp";
import ProjectEnquiryModal from "../components/luxury/ProjectEnquiryModal";
import DeveloperPortfolio from "../components/luxury/DeveloperPortfolio";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";
const BROCHURE_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80";

const STATS = [
  { icon: Users, value: "15+", label: "Years of Experience" },
  { icon: Award, value: "5000+", label: "Happy Clients" },
  { icon: Building2, value: "1000Cr+", label: "Worth of Properties Sold" },
  { icon: ShieldCheck, value: "100%", label: "Commitment to Our Clients" },
];

const LEADERS = [
  {
    name: "Mr. Mayank Sharma",
    role: "Founder",
    image: chiragImage,
    bio: "Visionary leader with deep market knowledge and a passion for creating value-driven real estate solutions.",
  },
  {
    name: "Mr. Pulkit",
    role: "Founder",
    image: rajeevImage,
    bio: "Strategic thinker with expertise in investments and client relations, ensuring trust and long-term partnerships.",
  },
];

const PRINCIPLES = [
  {
    icon: Target,
    title: "Our Mission",
    desc: "To deliver exceptional real estate experiences with honesty, transparency and dedication.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    desc: "To be the most trusted real estate brand known for results and lasting relationships.",
  },
  {
    icon: Gem,
    title: "Our Values",
    desc: "Integrity, transparency, excellence and client-first approach drive everything we do.",
  },
  {
    icon: Users,
    title: "Why Choose Us",
    desc: "Expert guidance, wide network and commitment to help you achieve your property goals.",
  },
];

const PROMISES = [
  { icon: Trophy, title: "Trusted Expertise", desc: "Years of market experience" },
  { icon: Home, title: "Wider Property Choices", desc: "Residential & Commercial" },
  { icon: ShieldCheck, title: "100% Transparency", desc: "Honest & clear dealings" },
  { icon: Heart, title: "Long-term Relationships", desc: "Your trust is our biggest reward" },
];



/** Eyebrow + heading + optional subtitle, with the gold diamond ornament. */
const SectionHead = ({ eyebrow, children, subtitle, ornament = true }) => (
  <div className="text-center">
    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-dark">{eyebrow}</p>
    <h2 className="mt-3 font-serif text-[23px] font-semibold text-matte sm:text-[38px]">
      {children}
    </h2>
    {subtitle && (
      <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-matte/55 sm:text-[15px]">
        {subtitle}
      </p>
    )}
    {ornament && (
      <span aria-hidden="true" className="mt-5 flex items-center justify-center gap-2">
        <span className="h-px w-12 bg-gold/40" />
        <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
        <span className="h-px w-12 bg-gold/40" />
      </span>
    )}
  </div>
);

/** Rounded white strip carrying four icon + label pairs. */
const PillStrip = ({ items }) => (
  <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-black/[0.07] bg-white px-6 py-6 shadow-[0_2px_18px_rgba(12,12,13,0.05)] sm:px-10 md:py-7">
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-black/[0.07]">
      {items.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="group flex items-center gap-3.5 lg:justify-center lg:px-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ivory text-gold-dark transition-colors duration-300 group-hover:bg-gold group-hover:text-white">
            <Icon size={19} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-matte">{title}</p>
            <p className="mt-0.5 text-[11px] text-matte/50">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const About = ({ setCurrentPage }) => {
  const [gate, setGate] = useState(false);

  return (
    <div className="overflow-x-hidden bg-white font-sans text-matte">
      {/* ==================== HERO ==================== */}
      <section className="bg-ivory/60">
        <div className="mx-auto max-w-[84rem] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Left */}
            <Reveal variant="up" duration={700}>
              <div>
                {/* Eyebrow with the gold diamond centred beneath it */}
                <span className="inline-flex flex-col items-center">
                  <span className="flex items-center gap-2.5">
                    <span aria-hidden="true" className="h-px w-9 bg-gold/50" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-dark">
                      About Brothers Realestate
                    </span>
                    <span aria-hidden="true" className="h-px w-9 bg-gold/50" />
                  </span>
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rotate-45 bg-gold" />
                </span>

                <h1 className="mt-5 font-serif text-[27px] font-semibold leading-[1.14] text-matte sm:text-[46px] lg:text-[52px]">
                  Building Trust.
                  <br />
                  Delivering <span className="text-gold-dark">Dreams.</span>
                </h1>

                <span aria-hidden="true" className="mt-5 block h-[3px] w-16 bg-gold/70" />

                <p className="mt-6 max-w-lg text-[14px] leading-[1.9] text-matte/60 sm:text-[15px]">
                  Brothers Realestate is a real estate advisory firm bringing transparency, trust and
                  results to every real estate journey. We help you find the right property, make
                  informed decisions and create lasting value.
                </p>

                <div className="mt-7 flex max-w-lg gap-4 border border-black/[0.07] border-l-[3px] border-l-gold bg-white p-5">
                  <Quote size={20} className="shrink-0 text-gold" />
                  <p className="text-[14px] italic leading-relaxed text-matte/70">
                    "Our goal is simple – to place our client's interest above all else and be a
                    partner in their real estate success story."
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Right — image with the dark stats bar */}
            <Reveal variant="left" delay={140} duration={800}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl">
                <img
                  src={HERO_IMAGE}
                  alt="Brothers Realestate luxury residence"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105 motion-reduce:group-hover:scale-100"
                />

                <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/10 bg-matte/85 px-4 py-4 backdrop-blur-md sm:px-5">
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/10">
                    {STATS.map(({ icon: Icon, value, label }) => (
                      <div key={label} className="flex items-center gap-2.5 lg:px-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/35">
                          <Icon size={15} className="text-gold" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-serif text-[17px] font-semibold leading-none text-white">
                            <CountUp value={value} />
                          </p>
                          <p className="mt-1 text-[8.5px] font-semibold uppercase leading-tight tracking-[0.1em] text-gold-light/80">
                            {label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================== LEADERSHIP ==================== */}
      <section className="bg-white py-9 sm:py-18 lg:py-20">
        <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <SectionHead
              eyebrow="Our Leadership"
              subtitle="Our leadership team brings decades of combined experience in luxury real estate, dedicated to delivering exceptional value and fostering long-term client relationships."
            >
              Meet <span className="text-gold-dark">Our</span> Leaders
            </SectionHead>
          </Reveal>

          <div className="mt-11 grid gap-6 md:grid-cols-2">
            {LEADERS.map((l, i) => (
              <Reveal key={l.name} delay={i * 110} variant="up">
                <div className="flex h-full gap-5 rounded-xl border border-black/[0.07] bg-white p-5 shadow-[0_2px_16px_rgba(12,12,13,0.05)] transition-shadow hover:shadow-[0_6px_26px_rgba(12,12,13,0.09)] sm:p-6">
                  <div className="h-[150px] w-[120px] shrink-0 overflow-hidden rounded-lg bg-ivory sm:h-[168px] sm:w-[134px]">
                    <img src={l.image} alt={l.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 self-center">
                    <h3 className="font-serif text-[21px] font-semibold text-matte sm:text-[23px]">
                      {l.name}
                    </h3>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-gold-dark">
                      {l.role}
                    </p>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-matte/60">{l.bio}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== GUIDING PRINCIPLES ==================== */}
      <section className="bg-ivory/60 py-9 sm:py-18 lg:py-20">
        <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <SectionHead
              eyebrow="Our Values"
              subtitle="The foundation of trust, transparency and long-term relationships."
            >
              Our Guiding <span className="text-gold-dark">Principles</span>
            </SectionHead>
          </Reveal>

          <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 90} variant="up">
                <div className="group h-full rounded-xl border border-black/[0.07] bg-white px-6 py-8 text-center transition-all duration-500 hover:border-gold/40 hover:shadow-[0_6px_26px_rgba(12,12,13,0.07)]">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ivory text-gold-dark transition-colors duration-500 group-hover:bg-gold group-hover:text-white">
                    <Icon size={24} strokeWidth={1.3} />
                  </span>
                  <h3 className="mt-5 font-serif text-[19px] font-semibold text-matte">{title}</h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-matte/55">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal variant="up" delay={120}>
            <div className="mt-9">
              <PillStrip items={PROMISES} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================== DEVELOPER PORTFOLIO ==================== */}
      <DeveloperPortfolio setCurrentPage={setCurrentPage} />

      {/* ==================== BROCHURE BANNER ==================== */}
      <section className="relative overflow-hidden bg-matte">
        <img
          src={BROCHURE_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-matte via-matte/92 to-matte/30" />

        <div className="relative mx-auto flex max-w-[84rem] flex-wrap items-center gap-6 px-4 py-11 sm:px-6 lg:px-8">
          <Download size={34} strokeWidth={1} className="shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-[21px] font-semibold text-gold-light sm:text-[24px]">
              Get Detailed Property Information
            </h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/55">
              Download our brochure and explore floor plans, price list &amp; all project details.
            </p>
            <button
              onClick={() => setGate(true)}
              className="group mt-5 inline-flex min-h-[46px] items-center gap-2.5 border border-gold px-6 text-[11px] font-bold uppercase tracking-[0.16em] text-gold transition-colors duration-500 hover:bg-gold hover:text-matte"
            >
              Download Brochure
              <Download size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Contact gate for the brochure */}
      <ProjectEnquiryModal
        open={gate}
        onClose={() => setGate(false)}
        projectName="Brothers Realestate"
        context="Company Brochure"
        source="about-page"
      />
    </div>
  );
};

export default About;

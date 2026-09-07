import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  UserCheck,
  Zap,
  ShieldCheck,
  BadgeIndianRupee,
  Headset,
  MessageCircle,
  Plus,
  Minus,
} from "lucide-react";
import Reveal from "../components/home/Reveal";
import LuxContact from "../components/luxury/LuxContact";
import useSiteInfo from "../hooks/useSiteInfo";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80";

const MAP_SRC =
  "https://www.google.com/maps?q=alt.f+MPD+Tower,+Sector+43,+Gurugram,+Haryana+122009&output=embed";

const HERO_POINTS = [
  { icon: UserCheck, title: "Expert Guidance", desc: "Get advice from our real estate experts." },
  { icon: Zap, title: "Quick Response", desc: "We respond quickly to all your inquiries." },
  { icon: ShieldCheck, title: "Trusted Support", desc: "Reliable support before, during & after your deal." },
];

const WHY_US = [
  { icon: UserCheck, title: "Personalized Assistance", desc: "Tailored solutions for your needs" },
  { icon: ShieldCheck, title: "Verified Properties", desc: "100% verified and legal properties" },
  { icon: BadgeIndianRupee, title: "Best Price Guarantee", desc: "Transparent deals, no hidden costs" },
  { icon: Headset, title: "End-to-End Support", desc: "From search to possession" },
];

const INTERESTS = [
  "Buying a property",
  "Renting a property",
  "Selling my property",
  "Investment advisory",
  "Commercial space",
  "Something else",
];

const LOCATIONS = [
  "Golf Course Road",
  "Golf Course Extension Road",
  "Dwarka Expressway",
  "Sohna Road",
  "MG Road",
  "New Gurugram",
  "Delhi NCR — other",
];

const FAQS = [
  {
    q: "How can I schedule a site visit?",
    a: "You can schedule a site visit by calling us, filling out the contact form, or whatsapp us. Our team will get in touch to confirm the details.",
  },
  {
    q: "Are your properties RERA registered?",
    a: "Yes. Every project we represent carries a valid RERA registration, and we share the registration number with you before you commit to anything.",
  },
  {
    q: "Do you charge any brokerage?",
    a: "No. We work directly with the developers on all our listed projects, so you pay zero brokerage on those transactions.",
  },
  {
    q: "Can I get a home loan assistance?",
    a: "Absolutely. We work with leading banks and NBFCs and can help you compare offers, prepare documents and track your application to disbursal.",
  },
  {
    q: "What are the payment options available?",
    a: "Most projects offer construction-linked, possession-linked and down-payment plans. We'll walk you through the exact plans available for the project you choose.",
  },
];

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-4 py-3.5 text-[14px] text-matte outline-none transition-colors placeholder:text-matte/40 focus:border-gold focus:ring-2 focus:ring-gold/15";

const Contact = ({ setCurrentPage, showMap = true }) => {
  const site = useSiteInfo();
  const [openFaq, setOpenFaq] = useState(0);

  const contactFacts = [
    { icon: Phone, label: "Support Team", value: site.phoneDisplay },
    { icon: Mail, label: "Email Us", value: site.email },
    { icon: MapPin, label: "Our Office", value: "Gurugram, Haryana" },
    { icon: Clock, label: "Hours", value: "Mon-Sat: 9AM-7PM" },
  ];

  return (
    <div className="overflow-x-hidden bg-white font-sans text-matte">
      {/* ==================== HERO ==================== */}
      <section className="bg-ivory/60">
        <div className="grid items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex items-center px-4 py-8 sm:px-6 sm:py-12 lg:py-16 lg:pl-[max(2rem,calc((100vw-84rem)/2))] lg:pr-10">
            <Reveal variant="up" duration={700}>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-dark">
                  Get in Touch
                </p>

                <h1 className="mt-4 font-serif text-[27px] font-semibold leading-[1.14] text-matte sm:text-[46px] lg:text-[50px]">
                  Let's Find Your
                  <br />
                  <span className="text-gold-dark">Perfect Property</span>
                </h1>

                <span aria-hidden="true" className="mt-5 block h-[3px] w-16 bg-gold/70" />

                <p className="mt-6 max-w-md text-[14px] leading-[1.9] text-matte/60 sm:text-[15px]">
                  We're here to help you find the right property, answer your questions, and guide
                  you every step of the way.
                </p>

                <div className="mt-8 grid gap-5 sm:grid-cols-3">
                  {HERO_POINTS.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-gold-dark shadow-sm">
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-matte">{title}</p>
                        <p className="mt-0.5 text-[10.5px] leading-snug text-matte/50">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <div className="relative min-h-[240px] lg:min-h-[420px]">
            <img
              src={HERO_IMAGE}
              alt="Brothers Real Estate residence"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-ivory/60 to-transparent lg:block"
            />
          </div>
        </div>
      </section>

      {/* ==================== INFO + FORM (LUX CONTACT) ==================== */}
      <LuxContact
        setCurrentPage={setCurrentPage}
        quickFacts={contactFacts}
        source="contact-page"
        sourceLabel="Contact page — Send Us a Message"
      />

      {/* ==================== WHY CONTACT US ==================== */}
      <section className="bg-white pb-12 sm:pb-14">
        <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-gold-dark">
              Why Contact Brothers Real Estate?
            </p>
            <span aria-hidden="true" className="mx-auto mt-2.5 block h-[3px] w-12 bg-gold" />

            <div className="mt-7 rounded-xl border border-black/[0.07] bg-white px-6 py-5 shadow-[0_2px_16px_rgba(12,12,13,0.05)] sm:px-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-black/[0.07]">
                {WHY_US.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="group flex items-center gap-3 lg:justify-center lg:px-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory text-gold-dark transition-colors duration-300 group-hover:bg-gold group-hover:text-white">
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold text-matte">{title}</p>
                      <p className="mt-0.5 text-[11px] text-matte/50">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================== FAQ + ASSISTANCE ==================== */}
      <section className="bg-white pb-12 sm:pb-14">
        <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            {/* FAQ */}
            <Reveal variant="up">
              <div>
                <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-matte/45 lg:text-left">
                  Frequently Asked{" "}
                  <span className="text-gold-dark">Questions</span>
                </p>
                <span
                  aria-hidden="true"
                  className="mx-auto mt-2.5 block h-[3px] w-12 bg-gold lg:mx-0"
                />

                <div className="mt-6 space-y-2.5">
                  {FAQS.map((f, i) => {
                    const open = openFaq === i;
                    return (
                      <div
                        key={f.q}
                        className={`overflow-hidden rounded-lg border transition-colors ${
                          open ? "border-gold/35 bg-ivory/50" : "border-black/[0.08] bg-white"
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaq(open ? -1 : i)}
                          aria-expanded={open}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                        >
                          <span className="text-[14px] font-semibold text-matte">{f.q}</span>
                          <span className="shrink-0 text-gold-dark">
                            {open ? <Minus size={17} /> : <Plus size={17} />}
                          </span>
                        </button>
                        {open && (
                          <p className="px-5 pb-5 text-[13px] leading-relaxed text-matte/60">
                            {f.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* Immediate assistance */}
            <Reveal variant="up" delay={110}>
              <div className="rounded-xl bg-ivory/70 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold text-white">
                    <Headset size={24} strokeWidth={1.4} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-serif text-[19px] font-semibold text-matte">
                      Need Immediate Assistance?
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-matte/55">
                      Our relationship managers are ready to assist you with any query.
                    </p>
                  </div>
                </div>

                <a
                  href={site.phoneHref}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-gold-dark"
                >
                  <Phone size={15} />
                  Call Now: {site.phoneDisplay}
                </a>

                <div className="mt-6 border-t border-black/[0.07] pt-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1e9e57] text-white">
                      <MessageCircle size={19} />
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-serif text-[16px] font-semibold text-matte">
                        Chat on WhatsApp
                      </h4>
                      <p className="mt-1 text-[12.5px] text-matte/55">
                        Get quick answers to your queries
                      </p>
                      <a
                        href={site.whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex min-h-[38px] items-center rounded-lg border border-gold/50 px-5 text-[12px] font-semibold text-gold-dark transition-colors hover:bg-gold hover:text-white"
                      >
                        Chat Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* (Map removed because LuxContact includes it) */}
    </div>
  );
};

export default Contact;

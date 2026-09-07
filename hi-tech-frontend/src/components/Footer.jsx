import { Facebook, Instagram, Linkedin, Youtube, MapPin, Phone, Mail } from "lucide-react";
import logo from "../assets/logo1.png";
import { SITE, FOOTER_LINKS } from "../config/site";
import useSiteInfo from "../hooks/useSiteInfo";

const PATH_MAP = {
  home: "/",
  listings: "/listings",
  about: "/about",
  contact: "/contact",
  "privacy-policy": "/privacy-policy",
  "terms-conditions": "/terms-conditions",
};

const colHeading =
  "font-serif text-sm font-semibold uppercase tracking-[0.18em] text-gold";
const linkClass =
  "text-[13px] text-white/50 transition-colors duration-300 hover:text-gold";

export default function Footer({ setCurrentPage }) {
  const currentYear = new Date().getFullYear();
  const site = useSiteInfo();

  // Shows only the platforms an admin has actually filled in from Company
  // Settings — no more all-or-nothing static placeholder links.
  const socials = [
    { Icon: Facebook, href: site.facebookUrl, label: "Facebook" },
    { Icon: Instagram, href: site.instagramUrl, label: "Instagram" },
    { Icon: Linkedin, href: site.linkedinUrl, label: "LinkedIn" },
    { Icon: Youtube, href: site.youtubeUrl, label: "YouTube" },
  ].filter((s) => s.href);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    try {
      window.history.pushState({}, "", PATH_MAP[page] || "/");
    } catch (e) {
      /* ignore */
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-gold/25 bg-matte text-white">
      <div className="mx-auto max-w-[86rem] px-4 py-9 sm:px-6 sm:py-16 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1.5fr] lg:gap-12">
          {/* Brand */}
          <div>
            <button
              onClick={() => handleNavigate("home")}
              className="inline-flex items-center gap-3"
              aria-label="Brothers Realestate — home"
            >
              <img
                src={logo}
                alt="Brothers Realestate"
                className="h-16 sm:h-20 w-auto object-contain"
              />
              <span className="text-left leading-tight">
                <span className="block font-serif text-base font-semibold uppercase tracking-[0.16em] text-white">
                  Brothers <span className="text-gold">Estate</span>
                </span>
              </span>
            </button>

            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/80">
              Choose Extraordinary
            </p>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/45">
              {site.servingSince}. Helping families and investors find premium
              properties across Gurugram and Delhi NCR.
            </p>

            {socials.length > 0 && (
              <div className="mt-6 flex gap-2">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/60 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-matte"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <h3 className={colHeading}>Quick Links</h3>
            <ul className="mt-5 space-y-3">
              {FOOTER_LINKS.quick.map((link) => (
                <li key={link.name}>
                  <button onClick={() => handleNavigate(link.page)} className={linkClass}>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>



          {/* Contact */}
          <div>
            <h3 className={colHeading}>Contact Us</h3>
            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3">
                <Phone size={15} className="mt-0.5 shrink-0 text-gold" />
                <a href={site.phoneHref} className={linkClass}>
                  {site.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={15} className="mt-0.5 shrink-0 text-gold" />
                <a href={`mailto:${site.email}`} className={`${linkClass} break-all`}>
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
                <span className="text-[13px] leading-relaxed text-white/50">
                  {site.address}
                </span>
              </li>
            </ul>
            
            <div className="mt-6 overflow-hidden border border-white/12 rounded-lg">
              <iframe
                src={site.mapEmbedSrc}
                width="100%"
                height="140"
                style={{ border: 0, filter: "grayscale(0.35) contrast(1.05)" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Brothers Realestate office location"
              />
            </div>
            <a
              href={site.googleMapsViewUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-light"
            >
              View on Google Maps ↗
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[86rem] flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:px-6 lg:flex-row lg:px-10 lg:text-left">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">
            © {currentYear} {SITE.name}. All Rights Reserved.
            {site.rera && <span className="ml-2 text-white/25">· RERA: {site.rera}</span>}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.legal.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigate(link.page)}
                className="text-[11px] uppercase tracking-[0.14em] text-white/35 transition-colors hover:text-gold"
              >
                {link.name}
              </button>
            ))}
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
              Disclaimer
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useContext, useEffect, useState } from "react";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { UserAuthContext } from "../context/UserAuthContext";
import logo from "../assets/logo1.png";
import AuthModal from "./AuthModal";
import { SITE, NAV_LINKS } from "../config/site";
import useSiteInfo from "../hooks/useSiteInfo";

// Pages that own a real URL — kept in sync with App.jsx's pathToPage map.
const PATH_MAP = {
  home: "/",
  listings: "/listings",
  about: "/about",
  contact: "/contact",
  "privacy-policy": "/privacy-policy",
  "terms-conditions": "/terms-conditions",
};

const Navbar = ({ currentPage, setCurrentPage }) => {
  const site = useSiteInfo();
  const { user, logout } = useContext(AuthContext);
  const { user: regularUser, logout: userLogout } = useContext(UserAuthContext);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);

  const handleNavigate = (link) => {
    setMobileMenu(false);
    setCurrentPage(link.page);
    try {
      window.history.pushState({}, "", PATH_MAP[link.page] || "/");
    } catch (e) {
      /* ignore */
    }

    if (link.scrollTo) {
      // Let the page render before scrolling to the section.
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          document
            .getElementById(link.scrollTo)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    if (user) logout();
    else if (regularUser) userLogout();
    handleNavigate({ page: "home" });
  };

  const isActive = (link) => currentPage === link.page && !link.scrollTo;

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${
          scrolled
            ? "border-gold/25 bg-[#0d0d0f]/95 shadow-card backdrop-blur-md"
            : "border-transparent bg-[#0d0d0f] shadow-none"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between gap-4 transition-[height] duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${
              scrolled ? "h-[62px] lg:h-[68px]" : "h-[68px] lg:h-[76px]"
            }`}
          >
            {/* Logo */}
            <button
              onClick={() => handleNavigate({ page: "home" })}
              className="group flex shrink-0 items-center gap-2.5 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              aria-label="Brothers Realestate — home"
            >
              <img
                src={logo}
                alt="Brothers Realestate"
                className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100 lg:h-16"
              />
              <span className="block text-left leading-tight">
                <span className="block whitespace-nowrap font-serif text-[15px] font-semibold uppercase tracking-[0.1em] text-white sm:text-base sm:tracking-[0.14em]">
                  Brothers <span className="text-gold">Estate</span>
                </span>
                <span className="hidden whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50 lg:block">
                  {SITE.tagline}
                </span>
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 xl:flex" aria-label="Main">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigate(link)}
                  className={`ce-navlink relative whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors duration-200 2xl:px-3 2xl:text-sm ${
                    isActive(link)
                      ? "text-gold"
                      : "text-white/70 hover:text-gold"
                  }`}
                >
                  {link.name}
                  {/* Active state gets a persistent bar; hover uses ::after */}
                  {isActive(link) && (
                    <span className="absolute inset-x-3 bottom-0.5 h-px bg-gold" />
                  )}
                </button>
              ))}
            </nav>

            {/* Right — phone + CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={site.phoneHref}
                className="hidden items-center gap-2 whitespace-nowrap rounded-none px-2 py-2 text-[13px] font-semibold text-white transition hover:text-gold lg:inline-flex 2xl:text-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <Phone size={15} />
                </span>
                {site.phoneDisplay}
              </a>

              {user || regularUser ? (
                <>
                  <button
                    onClick={() => handleNavigate({ page: "admin-dashboard" })}
                    className="hidden rounded-xl px-3 py-2 text-[13px] font-semibold text-white/70 transition hover:text-gold sm:block"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="inline-flex min-h-[40px] items-center bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-matte transition hover:bg-gold hover:text-matte"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href={site.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-matte shadow-sm transition hover:bg-gold hover:text-matte sm:inline-flex 2xl:text-sm"
                >
                  <MessageCircle size={16} className="shrink-0" />
                  <span className="hidden md:inline">Talk to an Expert</span>
                  <span className="md:hidden">Enquire</span>
                </a>
              )}

              {/* Mobile: quick call + menu */}
              <a
                href={site.phoneHref}
                aria-label="Call Brothers Realestate"
                className="inline-flex h-10 w-10 items-center justify-center border border-gold/40 text-gold sm:hidden"
              >
                <Phone size={17} />
              </a>

              <button
                onClick={() => setMobileMenu((v) => !v)}
                aria-label={mobileMenu ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenu}
                className="inline-flex h-10 w-10 items-center justify-center text-white transition hover:text-gold xl:hidden"
              >
                {mobileMenu ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer — slides down, links cascade in */}
        {mobileMenu && (
          <div className="ce-drawer border-t border-gold/20 bg-[#0d0d0f] shadow-card xl:hidden">
            <nav
              className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6"
              aria-label="Mobile"
            >
              {NAV_LINKS.map((link, i) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigate(link)}
                  style={{ "--d": `${i * 45}ms` }}
                  className={`ce-drawer-item block min-h-[48px] w-full rounded-xl px-4 text-left text-[15px] font-semibold transition-colors duration-200 active:scale-[0.99] ${
                    isActive(link)
                      ? "bg-gold/20 text-gold"
                      : "text-white/75 hover:bg-white/10 hover:text-gold"
                  }`}
                >
                  {link.name}
                </button>
              ))}

              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noreferrer"
                style={{ "--d": `${NAV_LINKS.length * 45}ms` }}
                className="ce-drawer-item mt-3 flex min-h-[50px] items-center justify-center gap-2 bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-matte transition-transform duration-200 active:scale-[0.98]"
              >
                <MessageCircle size={17} />
                Talk to an Expert
              </a>

              <a
                href={site.phoneHref}
                style={{ "--d": `${(NAV_LINKS.length + 1) * 45}ms` }}
                className="ce-drawer-item flex min-h-[50px] items-center justify-center gap-2 border border-white/25 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-transform duration-200 active:scale-[0.98]"
              >
                <Phone size={16} />
                {site.phoneDisplay}
              </a>
            </nav>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default Navbar;

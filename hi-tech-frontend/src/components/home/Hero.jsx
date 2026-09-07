import { useEffect, useRef, useState } from "react";
import { ArrowRight, Phone } from "lucide-react";
import useSiteInfo from "../../hooks/useSiteInfo";
import GoldDivider from "../luxury/GoldDivider";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80";

const Hero = ({ setCurrentPage }) => {
  const site = useSiteInfo();
  const sectionRef = useRef(null);
  const [offset, setOffset] = useState(0);

  // Light parallax on the backdrop; skipped entirely for reduced motion.
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = null;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const el = sectionRef.current;
        if (!el) return;
        if (el.getBoundingClientRect().bottom < 0) return;
        setOffset(window.scrollY * 0.16);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const goToListings = () => {
    setCurrentPage("listings");
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (e) {
      /* ignore */
    }
  };

  return (
    <section
      ref={sectionRef}
      // svh, not vh: on a phone the browser's collapsing address bar makes vh
      // taller than what's actually on screen, which crops the hero.
      className="relative flex min-h-[calc(100svh-72px)] items-center justify-center overflow-hidden bg-matte sm:min-h-[calc(100vh-76px)] lg:min-h-[calc(100vh-85px)]"
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
      >
        <video
          src="/hero-video.mp4"
          poster={HERO_IMAGE}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-[115%] w-full object-cover opacity-55"
        />
      </div>

      {/* Copy sits over the film so the hero isn't a silent block of video */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold sm:text-xs">
          Brothers Real Estate
        </p>
        <h1 className="mt-4 font-serif text-[28px] font-semibold uppercase leading-[1.15] tracking-[0.03em] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] sm:text-[44px] lg:text-[58px]">
          Find, Invest &amp; Live Better
        </h1>
        <GoldDivider className="mt-5" tone="light" align="center" />
        <p className="mt-5 max-w-xl text-[13.5px] leading-[1.85] text-white/80 drop-shadow sm:text-[16px]">
          Handpicked homes, plots and commercial spaces across Gurugram and Delhi NCR
          — verified listings, honest advice, no runaround.
        </p>

        <div className="mt-7 flex w-full flex-row items-stretch justify-center gap-2 sm:w-auto sm:items-center sm:gap-4">
          <a
            href={site.phoneHref}
            className="group flex flex-1 min-h-[48px] items-center justify-center gap-2 bg-gold px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-matte transition-colors duration-500 hover:bg-white sm:flex-none sm:px-7 sm:text-[12px] sm:tracking-[0.16em]"
          >
            <Phone size={14} className="sm:h-[15px] sm:w-[15px]" />
            Call Now
          </a>
          <button
            type="button"
            onClick={goToListings}
            className="group flex flex-1 min-h-[48px] items-center justify-center gap-2 border border-white/55 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition-colors duration-500 hover:bg-white hover:text-matte sm:flex-none sm:px-7 sm:text-[12px] sm:tracking-[0.16em]"
          >
            View All Properties
            <ArrowRight
              size={14}
              className="transition-transform duration-500 group-hover:translate-x-1 sm:h-[15px] sm:w-[15px]"
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

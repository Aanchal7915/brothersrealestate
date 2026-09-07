import { ArrowRight } from "lucide-react";
import GoldDivider from "./GoldDivider";
import Reveal from "../home/Reveal";
import logo from "../../assets/logo1.png";

const IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80";

const JoinTeam = ({ setCurrentPage }) => (
  <section className="bg-ivory">
    <div className="mx-auto grid max-w-[86rem] grid-cols-1 items-stretch lg:grid-cols-2">
      {/* ---- Copy ---- */}
      <Reveal variant="left" duration={800}>
        <div className="flex h-full flex-col justify-center px-4 py-14 sm:px-8 sm:py-16 lg:py-24 lg:pl-10 lg:pr-16">
          <span
            aria-hidden="true"
            className="mb-6 block h-8 w-px bg-gold"
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-matte/50">
            Join Our
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold uppercase leading-[0.98] tracking-[0.02em] text-matte sm:text-5xl lg:text-[3.5rem]">
            <span className="text-gold">Team</span>
          </h2>

          <GoldDivider className="mt-6" />

          <p className="mt-6 max-w-md text-sm leading-[1.9] text-matte/60 sm:text-[15px]">
            Be a part of a dynamic team that's shaping the future of real estate
            across Gurugram and Delhi NCR.
          </p>

          <button
            onClick={() => {
              setCurrentPage("contact");
              try {
                window.scrollTo({ top: 0, behavior: "auto" });
              } catch (e) {
                /* ignore */
              }
            }}
            className="group mt-9 inline-flex min-h-[52px] w-fit items-center gap-3 border border-matte px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-matte transition-all duration-500 hover:bg-matte hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Explore Careers
            <ArrowRight
              size={14}
              className="transition-transform duration-500 group-hover:translate-x-1"
            />
          </button>
        </div>
      </Reveal>

      {/* ---- Imagery with the wordmark plated over it ---- */}
      <Reveal variant="right" duration={800}>
        <div className="group relative h-64 overflow-hidden sm:h-80 lg:h-full lg:min-h-[30rem]">
          <img
            src={IMAGE}
            alt="Brothers Realestate workspace"
            className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-matte/70 via-matte/25 to-transparent" />

          <span className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-right">
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="h-10 w-auto object-contain opacity-90 drop-shadow-lg"
            />
            <span className="font-serif text-sm font-semibold uppercase tracking-[0.22em] text-white drop-shadow">
              Brothers Realestate
            </span>
          </span>
        </div>
      </Reveal>
    </div>
  </section>
);

export default JoinTeam;

import { MessageCircle } from "lucide-react";
import Reveal from "./Reveal";
import useSiteInfo from "../../hooks/useSiteInfo";

const CTASection = () => {
  const site = useSiteInfo();

  return (
  <section className="bg-white py-12 sm:py-14 lg:py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal variant="scale" duration={800}>
        <div className="group relative overflow-hidden rounded-3xl bg-ivory px-6 py-10 shadow-float transition-shadow duration-500 hover:shadow-[0_30px_70px_-20px_rgba(12,12,13,0.45)] sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="ce-float pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="ce-float pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-gold/20 blur-3xl"
            style={{ "--d": "1500ms" }}
          />

          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-xl font-extrabold leading-tight text-white sm:text-2xl lg:text-[1.75rem]">
                Ready to Find Your Dream Property?
              </h2>
              <p className="mt-2 text-sm text-white/80 sm:text-[15px]">
                Let our experts help you find the perfect space.
              </p>
            </div>

            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="group/btn inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-matte shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gold/10 hover:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.45)] active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:hover:translate-y-0 sm:text-base"
            >
              <MessageCircle
                size={18}
                className="transition-transform duration-300 group-hover/btn:scale-110"
              />
              Talk to an Expert
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
  );
};

export default CTASection;

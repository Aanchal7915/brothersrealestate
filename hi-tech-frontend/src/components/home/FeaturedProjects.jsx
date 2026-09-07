import { ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";
import Loader from "../Loader";
import CuteLoader from "../CuteLoader";

/**
 * "Handpicked Premium Projects" — renders real properties from PropertyContext.
 * `properties` is already sliced/sorted by the caller.
 */
const FeaturedProjects = ({ properties = [], loading, onSelect, setCurrentPage }) => {
  const goToListings = () => {
    setCurrentPage("listings");
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (e) {
      /* ignore */
    }
  };

  return (
    <section className="bg-ivory py-10 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured Projects"
          title="Handpicked Premium Projects"
          subtitle="A curated selection from our current inventory across Gurgaon and Delhi NCR."
          action={
            <button
              onClick={goToListings}
              className="group inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-black/10 bg-white px-5 text-sm font-bold text-matte shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-matte hover:bg-matte hover:text-white hover:shadow-[0_12px_26px_-10px_rgba(12,12,13,0.55)] active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:hover:translate-y-0"
            >
              View All Projects
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          }
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : properties.length === 0 ? (
          <CuteLoader text="No properties listed yet. New projects will show up here as soon as they are added." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {properties.map((property, i) => (
              <Reveal key={property._id} delay={i * 80} className="h-full">
                <ProjectCard property={property} onClick={() => onSelect(property)} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;

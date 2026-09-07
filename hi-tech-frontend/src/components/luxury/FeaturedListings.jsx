import { ArrowRight, Gem, Navigation, ShieldCheck, Headset } from "lucide-react";
import Reveal from "../home/Reveal";
import Loader from "../Loader";
import CuteLoader from "../CuteLoader";
import useFavourites from "../../hooks/useFavourites";
import { luxePrice, isNewLaunch } from "./PropertyTile";

const TRUST = [
  { icon: Gem, title: "Premium Properties", desc: "Curated luxury residences" },
  { icon: Navigation, title: "Prime Locations", desc: "Strategic locations across Gurugram" },
  { icon: ShieldCheck, title: "Trust & Transparency", desc: "100% transparent process" },
  { icon: Headset, title: "Expert Assistance", desc: "Personalized property support" },
];

const FALLBACK = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=75";

export const GridPropertyTile = ({ property, onOpen }) => {
  const image = property.images?.[0]?.url || property.images?.[0] || FALLBACK;
  const isRental = Boolean(property.rentalCategory);
  const showNewLaunch = isNewLaunch(property);

  return (
    <article
      onClick={() => onOpen?.(property)}
      className="group relative w-full h-[320px] sm:h-[350px] lg:h-[380px] overflow-hidden bg-black cursor-pointer"
    >
      <img
        src={image}
        alt={property.title}
        className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
      />
      {/* Dark gradient overlay for text readability (Default State) */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />

      {/* New Launch Badge - Fixed to top left with a slight offset */}
      {showNewLaunch && (
        <div className="absolute top-0 left-0 w-[85px] h-[85px] rounded-full bg-[#d3a950] flex flex-col items-center justify-center text-center z-10 transform -translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <div className="mt-4 ml-3">
             <span className="block text-[11px] font-black text-black uppercase leading-[1.1] tracking-wide">New</span>
             <span className="block text-[11px] font-black text-black uppercase leading-[1.1] tracking-wide">Launch!</span>
          </div>
        </div>
      )}

      {/* Default State Text (Price left, Title right) */}
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
        <div className="text-white font-medium tracking-wide text-lg sm:text-xl font-poppins shrink-0">
          {luxePrice(property.price, isRental)}/-
        </div>
        <div className="text-white text-[12px] sm:text-[13px] font-medium uppercase tracking-wider text-right drop-shadow-md">
          {property.title}
        </div>
      </div>

      {/* Hover State Solid Black Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black px-5 py-4 translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0 flex items-center justify-between">
        <div className="text-white text-[13px] sm:text-[14px] font-medium uppercase tracking-widest truncate max-w-[60%]">
          {property.title}
        </div>
        <div className="text-white/80 text-[10px] sm:text-[11px] font-medium uppercase tracking-widest shrink-0 hover:text-white">
          More Details +
        </div>
      </div>
    </article>
  );
};

const FeaturedListings = ({ properties = [], loading, onOpen, setCurrentPage }) => {
  const { isFavourite, toggle } = useFavourites();

  const goToFeaturedListing = () => {
    // The listings page reads this on mount and switches to featured mode.
    try {
      localStorage.setItem("listingsFilter", JSON.stringify({ type: "featuredListing" }));
    } catch (e) {
      /* ignore */
    }
    setCurrentPage("listings");
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (e) {
      /* ignore */
    }
  };

  // Show every project added from the admin's Featured Listing page — the grid
  // simply grows another row rather than capping.
  const displayProperties = properties;

  return (
    <section className="bg-white">
      {/* Full width container for the grid */}
      <div className="w-full px-2 sm:px-4 lg:px-8 py-10 sm:py-16 max-w-[120rem] mx-auto">
        
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader />
          </div>
        ) : properties.length === 0 ? (
          /* The section title lives inside the grid, so keep it visible here
             too — otherwise the whole section vanishes when it's empty. */
          <div className="py-6 text-center">
            <h2 className="text-[28px] sm:text-[50px] lg:text-[55px] font-black text-[#111] uppercase tracking-tighter font-poppins leading-[1]">
              Featured
              <span
                className="block text-transparent uppercase tracking-wider text-[24px] sm:text-[42px] lg:text-[48px] mt-2 font-semibold"
                style={{ WebkitTextStroke: "1.5px #d3a950" }}
              >
                Listing
              </span>
            </h2>
            <CuteLoader text="No featured projects yet. Add one from the admin panel and it will appear here." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px] md:gap-[15px] lg:gap-[20px]">
            
            {/* Cell 1: Editorial Title Block */}
            <Reveal variant="left" duration={800} className="h-full">
              <div className="bg-white flex flex-col justify-center items-center text-center h-full min-h-[320px] md:min-h-[350px] lg:min-h-[380px] p-6 relative overflow-hidden">
                
                <h2 className="text-[28px] sm:text-[50px] lg:text-[55px] font-black text-[#111] uppercase tracking-tighter font-poppins leading-[1]">
                  Featured<br/>
                  <span 
                    className="block text-transparent uppercase tracking-wider text-[24px] sm:text-[42px] lg:text-[48px] mt-2 font-semibold"
                    style={{ WebkitTextStroke: '1.5px #d3a950' }}
                  >
                    Listing
                  </span>
                </h2>
                
                {/* Button with horizontal line */}
                <div className="mt-14 flex items-center relative group cursor-pointer" onClick={goToFeaturedListing}>
                  {/* Horizontal Line cutting into button */}
                  <div className="pointer-events-none h-[1px] w-12 sm:w-16 bg-black mr-[-10px] z-10 relative transition-all duration-300 group-hover:bg-[#d3a950]"></div>
                  <button
                    className="pl-14 pr-6 py-[14px] border border-black text-black text-[12px] font-medium uppercase tracking-[0.15em] transition-colors duration-300 relative bg-white group-hover:bg-black group-hover:text-white group-hover:border-black pointer-events-none"
                  >
                    View All Featured Listing +
                  </button>
                </div>
              </div>
            </Reveal>

            {/* Remaining cells: one tile per featured project */}
            {displayProperties.map((property, idx) => (
              <Reveal key={property._id} delay={(idx + 1) * 100} variant="up" className="h-full">
                <GridPropertyTile property={property} onOpen={onOpen} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- Trust strip ---------------- */}
      <div className="bg-matte">
        <div className="mx-auto grid max-w-[88rem] grid-cols-1 gap-y-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-y-0 lg:px-10">
          {TRUST.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 90} variant="up">
              <div
                className={`group flex items-center gap-4 lg:px-7 ${
                  i > 0 ? "lg:border-l lg:border-white/[0.12]" : ""
                }`}
              >
                <Icon
                  size={30}
                  strokeWidth={1}
                  className="shrink-0 text-[#d3a950] transition-transform duration-500 group-hover:scale-110 motion-reduce:group-hover:scale-100"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d3a950]">
                    {title}
                  </p>
                  <p className="mt-1 text-xs text-white/45">{desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;

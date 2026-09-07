// import { useContext, useEffect, useState, useRef } from "react";
// import {
//   ChevronRight,
//   MapPin,
//   Bed,
//   Bath,
//   Square,
//   Home as HomeIcon,
//   Sparkles,
//   TrendingUp,
//   Award,
//   Users,
//   ShieldCheck,
//   Building2,
//   PiggyBank,
//   ClipboardList,
//   Handshake,
//   Star,
//   Quote,
//   MessageCircle,
// } from "lucide-react";
// import { PropertyContext } from "../context/PropertyContext";
// import { CategoryContext } from "../context/CategoryContext";
// import Loader from "../components/Loader";
// import CuteLoader from "../components/CuteLoader";
// import Counter from "../components/Counter";
// import Contact from "./Contact";
// import ChannelPartners from "../components/ChannelPartners";



// const Home = ({ setCurrentPage, setSelectedProperty, setSelectedCollectionKey }) => {
//   const { properties, loading, fetchProperties } = useContext(PropertyContext);
//   const { categories: rentalCategoriesList = [], loading: rentalCategoriesLoading } = useContext(CategoryContext);
//   const [showStats, setShowStats] = useState(false);
//   const [currentImage, setCurrentImage] = useState(0);
//   const [animateCards, setAnimateCards] = useState(false);
//   const [showAllTestimonials, setShowAllTestimonials] = useState(false);

//   // curated slider index
//   const [curatedIndex, setCuratedIndex] = useState(0);
//   const [curatedCollections, setCuratedCollections] = useState([]);
//   const [curatedLoading, setCuratedLoading] = useState(true);
//   const curatedRef = useRef(null); // ← Yeh line add kar dena baaki useState ke saath
//   const locationsRef = useRef(null);
// const propertiesRef = useRef(null);
  
//   // Dynamic Featured Locations State
//   const [featuredLocations, setFeaturedLocations] = useState([]);
//   const [locationsLoading, setLocationsLoading] = useState(true);
//   const { setFilters } = useContext(PropertyContext);

//   const heroImages = [
//     "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920",
//     "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920",
//     "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920",
//   ];

//   // Zero brokerage style benefits
//   const zeroBenefits = [
//     {
//       title: "Maximum Value",
//       desc: "Maximum Value — Pay Only for What Matters.",
//       icon: <ShieldCheck className="w-5 h-5" />,
//     },
//     {
//       title: "Best Price",
//       desc: "We help secure competitive developer pricing.",
//       icon: <PiggyBank className="w-5 h-5" />,
//     },
//     {
//       title: "Market Insights",
//       desc: "Short, data-backed recommendations.",
//       icon: <ClipboardList className="w-5 h-5" />,
//     },
//     {
//       title: "Exclusive Listings",
//       desc: "Handpicked inventory for fast decisions.",
//       icon: <Building2 className="w-5 h-5" />,
//     },
//     {
//       title: "Guided Visits",
//       desc: "Co-ordinated site visits with agents.",
//       icon: <MapPin className="w-5 h-5" />,
//     },
//     {
//       title: "After-Sales Help",
//       desc: "Support through docs and handover.",
//       icon: <Handshake className="w-5 h-5" />,
//     },
//   ];

//   // REMOVED: hardcoded featuredLocations to use dynamic data below
//   // const featuredLocations = [ ... ] 
  
//   // Testimonials – “What customers say”
//   const testimonials = [
//     {
//       name: "Mr. Bhuvneshwar Yadav",
//       role: "Long-term Investor",
//       quote:
//         "They focus genuinely on my investment goals instead of just closing a deal. It felt like having a real partner on the investment side.",
//     },
//     {
//       name: "Mr. Manoj Juneja",
//       role: "Regional Manager, Adidas",
//       quote:
//         "The team is quick, transparent and very responsive. Every query was handled with patience, and the entire experience stayed completely hassle-free.",
//     },
//     {
//       name: "CA Surender Sharma",
//       role: "Home Buyer",
//       quote:
//         "From shortlisting projects to negotiation and paperwork, they stayed involved at every step. I happily recommend them to family and friends.",
//     },
//     {
//       name: "Mr. Ramesh Thakur",
//       role: "Business Owner",
//       quote:
//         "Professional, approachable and proactive. I always felt updated on site visits, pricing and offers, which built a lot of trust.",
//     },
//     {
//       name: "Dr. Anjali Malhotra",
//       role: "Medical Professional",
//       quote:
//         "As a doctor with a busy schedule, I appreciated their curated approach. They only showed me properties that matched my exact criteria, saving me immense time.",
//     },
//     {
//       name: "Mr. Vikram Sethi",
//       role: "Software Architect",
//       quote:
//         "Their technical understanding of project layouts and construction quality is impressive. They helped me find a home that was both functional and aesthetically superior.",
//     },
//     {
//       name: "Mrs. Kavita Rao",
//       role: "Entrepreneur",
//       quote:
//         "Transparent dealings and honest advice. They didn't just highlight the pros but also pointed out potential concerns, which helped me make a balanced decision.",
//     },
//     {
//       name: "Mr. Sanjay Khanna",
//       role: "Senior Vice President",
//       quote:
//         "The level of professionalism at Brothers Realestate is top-notch. They handled the entire documentation and legal process seamlessly, making it a stress-free experience.",
//     },
//     {
//       name: "Ms. Priya Sharma",
//       role: "IT Consultant",
//       quote:
//         "I was looking for my first home and was quite lost. Their team guided me like family, explaining everything from home loans to possession timelines clearly.",
//     },
//     {
//       name: "Mr. Rajesh Gupta",
//       role: "Retired Army Officer",
//       quote:
//         "Discipline and integrity are what I value most, and I found both in my dealings with them. Their commitment to their word is truly commendable.",
//     },
//   ];

//   useEffect(() => {
//     fetchProperties();

//     // Fetch curated collections from backend.
//     // Prefer manual `curatedProperty` titles (returned by /curated/titles)
//     // so that properties added as Curated Property appear on the home page.
//     const fetchCuratedCollections = async () => {
//       try {
//         // 1) Try the curated titles endpoint (based on `curatedProperty.title`)
//         const titlesRes = await fetch(`${import.meta.env.VITE_API_URL}/properties/curated/titles`);
//         const titlesJson = await titlesRes.json();
//         if (titlesJson.success && Array.isArray(titlesJson.data) && titlesJson.data.length > 0) {
//           // Map the API shape { title, count, image } to the curatedCollections format
//           setCuratedCollections(
//             titlesJson.data.map((t) => {
//               const titleVal = (t.title || "").toString();
//               const countVal =
//                 typeof t.count === "number"
//                   ? `${t.count} Properties`
//                   : t.count || "0 Properties";
//               return {
//                 title: titleVal,
//                 count: countVal,
//                 image: t.image || "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200",
//                 key: titleVal.toLowerCase().replace(/\s+/g, "-"),
//               };
//             })
//           );
//           return;
//         }

//         // 2) Fallback: legacy curated collections by collection keys
//         const response = await fetch(`${import.meta.env.VITE_API_URL}/properties/collections/curated`);
//         const result = await response.json();
//         if (result.success) {
//           setCuratedCollections(result.data);
//           return;
//         }

//         // 3) Final fallback to hardcoded defaults
//         setCuratedCollections([
//           {
//             title: "New Projects",
//             count: "61 Properties",
//             image:
//               "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200",
//           },
//           {
//             title: "Ready to Move",
//             count: "42 Properties",
//             image:
//               "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
//           },
//           {
//             title: "Luxury Homes",
//             count: "27 Properties",
//             image:
//               "https://images.unsplash.com/photo-1512914890250-353c97c9e7e2?w=1200",
//           },
//           {
//             title: "Budget Friendly",
//             count: "88 Properties",
//             image:
//               "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200",
//           },
//         ]);
//       } catch (error) {
//         console.error('Failed to fetch curated collections:', error);
//         setCuratedCollections([
//           {
//             title: "New Projects",
//             count: "61 Properties",
//             image:
//               "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200",
//           },
//           {
//             title: "Ready to Move",
//             count: "42 Properties",
//             image:
//               "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
//           },
//           {
//             title: "Luxury Homes",
//             count: "27 Properties",
//             image:
//               "https://images.unsplash.com/photo-1512914890250-353c97c9e7e2?w=1200",
//           },
//           {
//             title: "Budget Friendly",
//             count: "88 Properties",
//             image:
//               "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200",
//           },
//         ]);
//       } finally {
//         setCuratedLoading(false);
//       }
//     };

//     // NEW: Fetch featured locations from backend
//     const fetchFeaturedLocations = async () => {
//       try {
//         const response = await fetch(`${import.meta.env.VITE_API_URL}/properties/locations/featured`);
//         const result = await response.json();
//         if (result.success) {
//           // New backend returns { manual: [...], cities: [...] }
//           const manual = result.data?.manual || [];
//           const cities = result.data?.cities || [];

//           const mappedManual = manual.map((m) => ({
//             name: m.title,
//             tagline: m.title,
//             image: m.image,
//             count: m.count || 0,
//             source: 'manual'
//           }));

//           const mappedCities = cities.map((c) => ({
//             name: c.name,
//             tagline: c.tagline,
//             image: c.image,
//             count: c.count || 0,
//             source: 'city'
//           }));

//           setFeaturedLocations([...mappedManual, ...mappedCities]);
//         }
//       } catch (error) {
//         console.error('Failed to fetch featured locations:', error);
//         // Fallback to a useful default array if API fails
//         setFeaturedLocations([
//           {
//             name: "Rohtak",
//             tagline: "Top property hub with over 100 active projects.",
//             image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
//             count: 100,
//             source: 'city'
//           },
//           {
//             name: "Sohna Road",
//             tagline: "Growing residential corridor.",
//             image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
//             count: 20,
//             source: 'city'
//           },
//         ]);
//       } finally {
//         setLocationsLoading(false);
//       }
//     };


//     fetchCuratedCollections();
//     fetchFeaturedLocations(); // Call the new fetch function

//     const interval = setInterval(() => {
//       setCurrentImage((prev) => (prev + 1) % heroImages.length);
//     }, 5000);

//     const timeout = setTimeout(() => setShowStats(true), 500);
//     const cardsTimeout = setTimeout(() => setAnimateCards(true), 800);

//     return () => {
//       clearInterval(interval);
//       clearTimeout(timeout);
//       clearTimeout(cardsTimeout);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Get only the most recently uploaded properties (sorted by creation date)
//   const featuredProperties = (properties || [])
//     .filter((property) => property.featured)

// // Purana (bug wala)
// // const residentialProjects = (properties || []).filter((property) => !property.featured).slice(0, 3);

// // Naya (sahi wala)
// const residentialProjects = (properties || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  
//   const handlePrevCurated = () => {
//     setCuratedIndex((prev) =>
//       prev === 0 ? curatedCollections.length - 1 : prev - 1
//     );
//   };

//   const handleNextCurated = () => {
//     setCuratedIndex((prev) =>
//       prev === curatedCollections.length - 1 ? 0 : prev + 1
//     );
//   };

//   const titleToCollectionKey = (title) => {
//     const keyMap = {
//       "New Projects": "new-projects",
//       "Ready to Move": "ready-to-move",
//       "Luxury Homes": "luxury",
//       "Budget Friendly": "budget-friendly",
//     };
//     return keyMap[title] || title.toLowerCase().replace(/\s+/g, "-");
//   };

//   const handleCuratedCardClick = (title) => {
//     const key = titleToCollectionKey(title);
//     // setSelectedCollectionKey is optional (App may not pass it). Call only if provided.
//     try {
//       if (typeof setSelectedCollectionKey === 'function') setSelectedCollectionKey(key);
//     } catch (e) {
//       /* ignore */
//     }
//     // Handshake: tell Listings which curated collection to auto-apply
//     try {
//       localStorage.setItem(
//         "listingsFilter",
//         JSON.stringify({ type: "curated", title })
//       );
//     } catch (e) {
//       /* ignore */
//     }
//     setCurrentPage("listings");
//     try {
//       window.scrollTo({ top: 0, behavior: 'auto' });
//     } catch (e) {}
//   };

//   const handleRentalCategoryClick = (category) => {
//     // Handshake: tell the Rental Listings page which category to auto-apply
//     try {
//       localStorage.setItem(
//         "listingsFilter",
//         JSON.stringify({ type: "rentalCategory", id: category._id })
//       );
//     } catch (e) {
//       /* ignore */
//     }
//     setCurrentPage("rental-listings");
//     try {
//       window.scrollTo({ top: 0, behavior: 'auto' });
//     } catch (e) {}
//   };

//   const getCuratedSlideClasses = (idx) => {
//     if (idx === curatedIndex)
//       return "scale-100 opacity-100 z-20 shadow-2xl";
//     if (
//       idx === (curatedIndex + 1) % curatedCollections.length ||
//       idx ===
//         (curatedIndex - 1 + curatedCollections.length) %
//           curatedCollections.length
//     )
//       return "scale-95 opacity-80 z-10";
//     return "scale-90 opacity-40 hidden sm:block";
//   };

//   return (
//     <div
//       className="overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-purple-50"
//       style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
//     >
//       {/* ===== HERO SECTION (No Change) ===== */}
//       <section className="relative min-h-screen md:min-h-[90vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-8 md:py-0">
//         {/* Background Slideshow */}
//         {heroImages.map((img, idx) => (
//           <div
//             key={idx}
//             className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
//               currentImage === idx ? "opacity-100" : "opacity-0"
//             }`}
//             style={{
//               backgroundImage: `url(${img})`,
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//               filter: "brightness(0.5) saturate(1.1)",
//             }}
//           ></div>
//         ))}

//         {/* Gradient Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-rose-500/25"></div>

//         {/* Animated Particles */}
//         <div className="absolute inset-0 overflow-hidden">
//           {[...Array(20)].map((_, i) => (
//             <div
//               key={i}
//               className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
//               style={{
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//                 animationDelay: `${Math.random() * 3}s`,
//                 animationDuration: `${2 + Math.random() * 3}s`,
//               }}
//             ></div>
//           ))}
//         </div>

//         {/* Hero Content */}
//         <div className="relative z-10 max-w-6xl mx-auto text-center text-white space-y-4 sm:space-y-6">
//           <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-white/15 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full mb-1 sm:mb-2 animate-bounce">
//             <Sparkles size={16} className="text-yellow-300 sm:w-[18px]" />
//             <span className="text-xs sm:text-sm font-semibold">
//               Prime Homes · Elite Locations · Curated Exclusively for You
//             </span>
//           </div>

//           <h1
//             className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold drop-shadow-2xl leading-tight animate-fade-in"
//             style={{
//               fontFamily: "'Poppins', 'Inter', sans-serif",
//               animation: "slideUp 0.8s ease-out",
//             }}
//           >
//             Gurgaon’s finest homes{" "}
//             <span className="text-rose-300">from new launches to luxury ready-to-move </span>
//             <br className="hidden sm:block" />
//             guided by trusted experts.
//           </h1>

//           <p className="text-xs sm:text-sm md:text-lg text-white/95 max-w-3xl mx-auto drop-shadow-lg font-normal leading-relaxed px-2">
// Apartments, penthouses, or private builder floors — we deal in all
//           </p>

//           {/* Quick toggles like Residential / Commercial */}
//           <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2">
//             <button
//               onClick={() => { setCurrentPage("listings"); try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (e) {} }}
//               className="group w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold rounded-full shadow-2xl hover:shadow-rose-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center sm:justify-start gap-2"
//             >
//               Explore Residential Projects
//               <ChevronRight
//                 size={20}
//                 className="group-hover:translate-x-1 transition-transform"
//               />
//             </button>
//             {/* <button
//               onClick={() => { setCurrentPage("listings"); try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (e) {} }}
//               className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 border-2 sm:border-3 border-white/90 text-white font-bold rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300 backdrop-blur-sm"
//             >
//               Browse Commercial & More
//             </button> */}
//             <a
export default function Dummy(){}
const PropertyCard = ({ property, featured = false, onClick }) => (
  <article
    onClick={onClick}
    className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
  >
    <div className="relative h-44 overflow-hidden sm:h-52">
      <img
        src={property.images?.[0]?.url || property.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600"}
        alt={property.title}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {featured && (
        <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold text-white">
          Featured
        </span>
      )}

      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-indigo-700 backdrop-blur">
        <MapPin size={11} /> {property.city}
      </span>
    </div>

    <div className="p-4 sm:p-5">
      <h3 className="line-clamp-2 min-h-[2.5rem] text-xs font-extrabold leading-5 text-gray-900 transition group-hover:text-indigo-600 sm:text-base">
        {property.title}
      </h3>
      <p className="mt-2 text-sm font-black text-indigo-700">
        ₹{property.price?.toLocaleString("en-IN")}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-indigo-50 p-2 text-[9px] font-semibold text-gray-600 sm:text-[11px]">
        <span className="flex items-center justify-center gap-1"><Bed size={12} /> {property.bhk} BHK</span>
        <span className="flex items-center justify-center gap-1"><Bath size={12} /> {property.bathrooms || 2}</span>
        <span className="flex items-center justify-center gap-1"><Square size={12} /> {property.area || 1200}</span>
      </div>
    </div>
  </article>
);

const CollectionCard = ({ title, count, image, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="group relative h-52 w-full overflow-hidden rounded-3xl text-left shadow-lg transition duration-500 hover:-translate-y-1 hover:shadow-2xl sm:h-60"
  >
    <img
      src={image}
      alt={title}
      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#070d2d]/95 via-[#070d2d]/20 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 p-5">
      <div className="mb-2 h-1 w-8 rounded-full bg-rose-400 transition-all group-hover:w-14" />
      <h3 className="text-base font-black text-white sm:text-xl">{title}</h3>
      <p className="mt-1 text-[10px] font-medium text-white/65 sm:text-xs">
        {subtitle || count}
      </p>
      <span className="mt-3 inline-flex rounded-full bg-rose-500 px-3 py-1.5 text-[10px] font-bold text-white">
        Explore →
      </span>
    </div>
  </button>
);

export default Home;

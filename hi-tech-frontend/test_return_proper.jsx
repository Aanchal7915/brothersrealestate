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
//               href="tel:+911234567899"
//               className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 border border-white/40 text-sm sm:text-base font-semibold rounded-full hover:bg-white hover:text-indigo-700 transition-all duration-300 backdrop-blur-md inline-flex items-center justify-center"
//             >
//               Talk to an Expert
//             </a>
//           </div>

//           {/* Hero bottom mini-features */}
//           {/* <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
//             {[
//               "5000+ Happy Customers",
//               "30+ Developers · 100+ Projects",
//               "Exclusive Deals & Inventory",
//               "Zero Brokerage Promise",
//             ].map((item, idx) => (
//               <div
//                 key={idx}
//                 className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-2 rounded-full text-xs sm:text-sm border border-white/20"
//               >
//                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
//                 <span>{item}</span>
//               </div>
//             ))}
//           </div> */}
//         </div>
//       </section>


//  <section className="py-8 md:py-8 bg-white relative overflow-hidden">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-10">
//             <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-indigo-100 px-4 py-2 rounded-full mb-4">
//               <Sparkles size={16} className="text-rose-600" />
//               <p className="text-rose-700 font-bold uppercase tracking-wider text-sm">
//                 Premium Selection
//               </p>
//             </div>
//             <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent" style={{ fontFamily: "'Poppins', sans-serif" }}>
//               Featured Properties
//             </h2>
//             <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
//              Check out our newest properties.
//             </p>
//           </div>

//           {loading ? (
//             <div className="flex justify-center py-8"><Loader /></div>
//           ) : featuredProperties.length === 0 ? (
//             <p className="text-center text-gray-500 py-8">No featured properties available</p>
//           ) : (
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
//                 {featuredProperties.map((property, idx) => (
//                   <article
//                     key={property._id}
//                     onClick={() => {
//                       setSelectedProperty(property);
//                       setCurrentPage("property-details");
//                       try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (e) {}
//                     }}
//                     className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-indigo-100"
//                     style={typeof animateCards !== 'undefined' && animateCards ? { animationDelay: `${idx * 120}ms` } : {}}
//                   >
//                     <div className="relative h-48 overflow-hidden">
//                       <img
//                         src={
//                           property.images?.[0]?.url ||
//                           property.images?.[0] ||
//                           "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600"
//                         }
//                         alt={property.title}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
//                       <div className="absolute top-3 right-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full font-bold text-[10px] sm:text-xs shadow-2xl flex items-center gap-1 animate-pulse">
//                         <Sparkles size={10} className="sm:w-3 sm:h-3" />
//                         Featured
//                       </div>
//                       <div className="absolute bottom-3 left-3">
//                         <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-indigo-700 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full">
//                           <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
//                           {property.city}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="p-4 sm:p-5 text-left space-y-2">
//                       <h3
//                         className="text-xs sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors"
//                         style={{ fontFamily: "'Poppins', sans-serif" }}
//                       >
//                         {property.title}
//                       </h3>
//                       <p className="text-[11px] sm:text-sm font-semibold text-indigo-700">
//                         ₹{property.price?.toLocaleString("en-IN")}
//                       </p>
//                       <div className="flex flex-wrap sm:flex-nowrap items-center justify-between text-[10px] sm:text-sm text-gray-600 bg-indigo-50 rounded-xl px-2 sm:px-3 py-2 mt-1 gap-1">
//                         <span className="flex items-center gap-0.5 sm:gap-1">
//                           <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {property.bhk} BHK
//                         </span>
//                         <span className="flex items-center gap-0.5 sm:gap-1">
//                           <Bath className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {property.bathrooms || 2}
//                         </span>
//                         <span className="flex items-center gap-0.5 sm:gap-1">
//                           <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {property.area || 1200} sqft
//                         </span>
//                       </div>
//                     </div>
//                   </article>
//                 ))}
//               </div>
//           )}

//           <div className="text-center mt-8">
//             <button
//               onClick={() => { setCurrentPage("listings"); window.scrollTo({ top: 0 }); }}
//               className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-rose-600 text-white font-bold text-lg rounded-full shadow-xl hover:scale-105 transition-all"
//             >
//               View All Properties
//             </button>
//           </div>
//         </div>
//       </section>
















//       {/* ===== RESIDENTIAL PROJECTS (No Change) ===== */}
     

//       {/* ===== CURATED COLLECTIONS – 4 SLIDE CAROUSEL LIKE IMAGE (No Change) ===== */}
//           {/* ===== CURATED COLLECTIONS – MOBILE SNAP + DESKTOP SCROLLABLE WITH ARROWS ===== */}
//       {/* ===== ZERO BROKERAGE & BENEFITS (No Change) ===== */}
//       <section className="py-8 md:py-8 bg-white relative overflow-hidden">
//         <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
//         <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-100 rounded-full blur-3xl opacity-60"></div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <div className="text-center mb-8 md:mb-8">
//             <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-indigo-100 px-3 sm:px-4 py-2 rounded-full mb-3">
//               <ShieldCheck size={14} className="text-emerald-600 sm:w-4" />
//               <p className="text-emerald-700 font-bold uppercase tracking-wider text-xs sm:text-sm">
//                Maximum Value, Maximum Returns.
//               </p>
//             </div>
//                   <h2
//                     className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-600 to-rose-600 bg-clip-text text-transparent"
//                     style={{ fontFamily: "'Poppins', sans-serif" }}
//                   >
//                    Turning transactions into relationships
//                   </h2>
//             <p className="text-sm sm:text-base md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
//               Your money works fully for you, helping you get the best home without unnecessary charges.
//             </p>
//           </div>

//               <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
//             {zeroBenefits.map((item, idx) => (
//               <div
//                 key={idx}
//                 className="group bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//               >
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 text-white shadow-lg group-hover:scale-110 transition-transform">
//                     {item.icon}
//                   </div>
//                   <h3 className="text-sm sm:text-base font-bold text-gray-900">
//                     {item.title}
//                   </h3>
//                 </div>
//                 <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
//                   {item.desc}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>




//       <section className="py-8 md:py-8 bg-white relative overflow-hidden">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-10">
//             <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent" style={{ fontFamily: "'Poppins', sans-serif" }}>
//               Curated Collections
//             </h2>
//             <p className="text-gray-600 mt-2">Explore prime properties based on your recommendation.</p>
//           </div>

//           {curatedLoading ? (
//             <div className="flex justify-center py-8"><Loader /></div>
//           ) : curatedCollections.filter(item => item.count && parseInt(item.count.replace(" Properties", "").trim()) > 0).length === 0 ? (
//             <p className="text-center text-gray-500 py-8">No collections available at the moment.</p>
//           ) : (
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
//               {curatedCollections
//                 .filter(item => item.count && parseInt(item.count.replace(" Properties", "").trim()) > 0)
//                 .map((item, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => handleCuratedCardClick(item.title)}
//                     className="w-full h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//                   >
//                     <img 
//                       src={item.image} 
//                       alt={item.title}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
//                     <div className="absolute bottom-4 left-4 text-left text-white">
//                       <h3 className="text-sm sm:text-lg font-bold mb-1 line-clamp-1">{item.title}</h3>
//                       <p className="text-[10px] sm:text-xs font-medium opacity-90">{item.count}</p>
//                     </div>
//                   </button>
//                 ))}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* ===== RENTAL CATEGORIES – SAME CARD STYLE AS CURATED COLLECTIONS ===== */}
//       <section className="py-8 md:py-8 bg-white relative overflow-hidden">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-10">
//             <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent" style={{ fontFamily: "'Poppins', sans-serif" }}>
//               Rental Properties
//             </h2>
//             <p className="text-gray-600 mt-2">Browse rental homes by category.</p>
//           </div>

//           {rentalCategoriesLoading ? (
//             <div className="flex justify-center py-8"><Loader /></div>
//           ) : rentalCategoriesList.filter((c) => c.propertyCount > 0).length === 0 ? (
//             <CuteLoader text="No rental categories available at the moment. Please check back later!" />
//           ) : (
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
//               {rentalCategoriesList
//                 .filter((c) => c.propertyCount > 0)
//                 .map((category) => (
//                   <button
//                     key={category._id}
//                     onClick={() => handleRentalCategoryClick(category)}
//                     className="w-full h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//                   >
//                     <img
//                       src={category.image || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200"}
//                       alt={category.name}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
//                     <div className="absolute bottom-4 left-4 text-left text-white">
//                       <h3 className="text-sm sm:text-lg font-bold mb-1 line-clamp-1">{category.name}</h3>
//                       <p className="text-[10px] sm:text-xs font-medium opacity-90">{category.propertyCount} Properties</p>
//                     </div>
//                   </button>
//                 ))}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* ===== FEATURED LOCATIONS (MODIFIED) ===== */}
//            {/* ===== FEATURED LOCATIONS – SLIDER ON DESKTOP + MOBILE SNAP ===== */}
//       <section className="py-8 md:py-8 bg-gradient-to-b from-indigo-50 via-white to-purple-50 relative overflow-hidden">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-10">
//             <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-rose-100 px-4 py-2 rounded-full mb-4">
//               <MapPin size={16} className="text-rose-600" />
//               <p className="text-rose-700 font-bold uppercase tracking-wider text-sm">
//                 Featured Locations
//               </p>
//             </div>
//             <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-rose-600 bg-clip-text text-transparent" style={{ fontFamily: "'Poppins', sans-serif" }}>
//               Find your home in the right corridor.
//             </h2>
//           </div>

//           {locationsLoading ? (
//             <div className="flex justify-center py-8"><Loader /></div>
//           ) : featuredLocations.length === 0 ? (
//             <p className="text-center text-gray-500 py-8">No featured locations available</p>
//           ) : (
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
//               {featuredLocations.map((loc, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => {
//                     localStorage.setItem("listingsFilter", JSON.stringify({ type: "featured", title: loc.name }));
//                     setCurrentPage("listings");
//                     window.scrollTo({ top: 0 });
//                   }}
//                   className="w-full h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//                 >
//                   <img 
//                     src={loc.image || "https://images.unsplash.com/photo-1529420705456-8b5ad0c6d49e?w=800"} 
//                     alt={loc.name}
//                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
//                   <div className="absolute bottom-4 left-4 text-left text-white">
//                     <h3 className="text-sm sm:text-lg font-bold mb-1 line-clamp-1">{loc.name}</h3>
//                     <p className="text-[10px] sm:text-xs font-medium opacity-90">{loc.count} properties</p>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* ===== FEATURED PROPERTIES (No Change) ===== */}
//             {/* ===== FEATURED PROPERTIES – SLIDER ON DESKTOP + MOBILE SNAP ===== */}
//           {/* ===== FEATURED PROPERTIES – ONLY SLIDER CHANGE, DESIGN SAME AS BEFORE ===== */}


//  {residentialProjects.length > 0 && (
//         <section className="py-8 md:py-8 bg-gradient-to-b from-indigo-50 via-white to-purple-50 relative overflow-hidden">
//           <div className="absolute top-10 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-rose-200 rounded-full blur-3xl opacity-50"></div>

//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
// <div className="mb-8 md:mb-8">
//                 <div>
//                 <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
//                   <HomeIcon size={16} />
//                   Residential Projects
//                 </p>
//                 <h2
//                   className="mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900"
//                   style={{ fontFamily: "'Poppins', sans-serif" }}
//                 >
//                  Check out our newest properties.
//                 </h2>
//                 <p className="text-gray-600 text-sm sm:text-base max-w-xl mt-1">
//                   Explore a snapshot of our latest residential projects. View
//                   all listings for more options across Rohtak.
//                 </p>
//               </div>
//               {/* <button
//                 onClick={() => { setCurrentPage("listings"); try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (e) {} }}
//                 className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm sm:text-base font-semibold rounded-full shadow-lg hover:shadow-indigo-400/60 hover:scale-105 transition-all duration-300"
//               >
//                 View All Residential
//                 <ChevronRight size={18} />
//               </button> */}
//             </div>

//               {loading ? (
//                 <div className="flex justify-center py-8"><Loader /></div>
//               ) : residentialProjects.length === 0 ? (
//                 <p className="text-center text-gray-500 py-8">No residential properties available</p>
//               ) : (
//                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
//                   {residentialProjects.map((property, idx) => (
//                 <article
//                   key={property._id}
//                   onClick={() => {
//                     setSelectedProperty(property);
//                     setCurrentPage("property-details");
//                     try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (e) {}
//                   }}
//                   className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-indigo-100"
//                   style={animateCards ? { animationDelay: `${idx * 120}ms` } : {}}
//                 >
//                   <div className="relative h-48 overflow-hidden">
//                     <img
//                       src={
//                         property.images?.[0]?.url ||
//                         property.images?.[0] ||
//                         "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600"
//                       }
//                       alt={property.title}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
//                     <div className="absolute bottom-3 left-3">
//                       <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-indigo-700 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full">
//                         <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
//                         {property.city}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="p-4 sm:p-5 text-left space-y-2">
//                     <h3
//                       className="text-xs sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors"
//                       style={{ fontFamily: "'Poppins', sans-serif" }}
//                     >
//                       {property.title}
//                     </h3>
//                     <p className="text-[11px] sm:text-sm font-semibold text-indigo-700">
//                       ₹{property.price?.toLocaleString("en-IN")}
//                     </p>
//                     <div className="flex flex-wrap sm:flex-nowrap items-center justify-between text-[10px] sm:text-sm text-gray-600 bg-indigo-50 rounded-xl px-2 sm:px-3 py-2 mt-1 gap-1">
//                       <span className="flex items-center gap-0.5 sm:gap-1">
//                         <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {property.bhk} BHK
//                       </span>
//                       <span className="flex items-center gap-0.5 sm:gap-1">
//                         <Bath className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {property.bathrooms || 2}
//                       </span>
//                       <span className="flex items-center gap-0.5 sm:gap-1">
//                         <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {property.area || 1200} sqft
//                       </span>
//                     </div>
//                   </div>
//                   </article>
//                 ))}
//               </div>
//               )}
//           </div>
//           <div className="text-center mt-10">
//       <button
//         onClick={() => { setCurrentPage("listings"); window.scrollTo({ top: 0 }); }}
//         className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
//       >
//         View All Residential
//         <ChevronRight size={20} />
//       </button>
//     </div>

//         </section>
//       )}








     

//       {/* ===== CHANNEL PARTNERS ===== */}
//       <ChannelPartners />

//       {/* ===== WHAT CUSTOMERS SAY (TESTIMONIALS) (No Change) ===== */}
//       <section className="py-8 md:py-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden px-4 sm:px-6 lg:px-8">
//         <div className="absolute top-0 left-0 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
//         <div className="absolute bottom-0 right-0 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

//         <div className="max-w-7xl mx-auto relative z-10">
//           <div className="text-center mb-8 md:mb-8">
//             <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-rose-100 px-3 sm:px-4 py-2 rounded-full mb-3">
//               <Star size={14} className="text-yellow-500 sm:w-4" />
//               <p className="text-indigo-700 font-bold uppercase tracking-wider text-xs sm:text-sm">
//                 What Customers Say
//               </p>
//             </div>
//             <h2
//               className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-600 to-rose-600 bg-clip-text text-transparent"
//               style={{ fontFamily: "'Poppins', sans-serif" }}
//             >
//               Real stories from real clients.
//             </h2>
//             <p className="text-sm sm:text-base md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
//               Hear from investors and homebuyers who trusted us with one of
//               their biggest decisions.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//             {testimonials.map((t, idx) => (
//               <div
//                 key={idx}
//                 className={`bg-white rounded-2xl shadow-lg border border-indigo-100 p-5 sm:p-6 ${
//                   idx >= 3 && !showAllTestimonials ? "hidden md:flex" : "flex"
//                 } flex-col gap-3 hover:shadow-2xl transition-shadow duration-300`}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 text-white font-semibold text-sm">
//                       {t.name
//                         .split(" ")
//                         .filter(Boolean)
//                         .map((w) => w[0])
//                         .slice(0, 2)
//                         .join("")}
//                     </div>
//                     <div>
//                       <p className="text-sm sm:text-base font-bold text-gray-900">
//                         {t.name}
//                       </p>
//                       <p className="text-[11px] sm:text-xs text-gray-500">
//                         {t.role}
//                       </p>
//                     </div>
//                   </div>
//                   <Quote className="w-6 h-6 text-indigo-300" />
//                 </div>
//                 <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
//                   {t.quote}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {testimonials.length > 3 && (
//             <div className="text-center mt-6 md:hidden">
//               <button
//                 onClick={() => setShowAllTestimonials((prev) => !prev)}
//                 className="px-6 py-2.5 rounded-full border-2 border-indigo-200 text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition-colors"
//               >
//                 {showAllTestimonials ? "View Less" : "View More"}
//               </button>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* ===== CTA SECTION (No Change) ===== */}
//       <section className="py-8 md:py-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden px-4 sm:px-6 lg:px-8">
//         <div className="absolute top-0 left-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
//         <div
//           className="absolute bottom-0 right-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
//           style={{ animationDelay: "2s" }}
//         ></div>

//         <div className="max-w-7xl mx-auto relative z-10">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
//             {/* Left Side - Card */}
//             <div className="relative group">
//               <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-rose-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
//               <div className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-rose-600 rounded-3xl shadow-2xl p-8 md:p-10 text-white">
//                 <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-8 sm:-mt-10"></div>
//                 <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -ml-12 sm:-ml-16 -mb-8 sm:-mb-8"></div>

//                 <div className="relative z-10">
//                   <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full mb-4">
//                     <Sparkles size={14} className="text-yellow-300 sm:w-4" />
//                     <span className="text-xs sm:text-sm font-bold">
//                       Limited Time Offer
//                     </span>
//                   </div>

//                   <h2
//                     className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-3 leading-tight"
//                     style={{ fontFamily: "'Poppins', sans-serif" }}
//                   >
//                     Ready to Find Your Perfect Home?
//                   </h2>

//                   <p className="text-sm sm:text-base md:text-base mb-4 md:mb-6 text-white/95 leading-relaxed">
//                     Let our expert team guide you through every step of your
//                     real estate journey. Your dream home is just a click away!
//                   </p>

//                   <button
//                     onClick={() => setCurrentPage("contact")}
//                     className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center gap-2"
//                   >
//                     Get Started Today
//                     <ChevronRight
//                       size={18}
//                       className="group-hover:translate-x-2 transition-transform sm:w-5"
//                     />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Right Side - Content */}
//             <div className="space-y-4 md:space-y-6">
//               <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
//                 <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//                   <Award className="text-indigo-500" size={22} />
//                   Decade of Excellence
//                 </h3>
//                 <p className="text-gray-600 leading-relaxed text-sm md:text-base">
//                   With over 15 years in the real estate industry, we&apos;ve
//                   helped thousands of families find their dream homes and
//                   investment properties.
//                 </p>
//               </div>

//               <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
//                 <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//                   <Users className="text-rose-500" size={22} />
//                   Expert Team
//                 </h3>
//                 <p className="text-gray-600 leading-relaxed text-sm md:text-base">
//                   Our dedicated professionals bring unparalleled expertise,
//                   market knowledge, and commitment to excellence that sets us
//                   apart.
//                 </p>
//               </div>

//               <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
//                 <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//                   <TrendingUp className="text-indigo-500" size={22} />
//                   More Than Transactions
//                 </h3>
//                 <p className="text-gray-600 leading-relaxed text-sm md:text-base">
//                   We understand that finding a home is about discovering a place
//                   where life&apos;s most precious moments will unfold.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Contact page inserted in place of the quick-contact section */}
//       <section className="bg-white border-t border-indigo-100 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <Contact setCurrentPage={setCurrentPage} showMap={false} />
//         </div>
//       </section>

//       {/* Floating WhatsApp anchor removed — using `FloatingWhatsApp` component instead */}

//       <style>{`
      
//         @keyframes slideUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes fade-in {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fade-in {
//           animation: fade-in 0.6s ease-out forwards;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Home;
































import { useContext, useEffect, useState, useRef } from "react";
import {
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Square,
  Home as HomeIcon,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  ShieldCheck,
  Building2,
  PiggyBank,
  ClipboardList,
  Handshake,
  Star,
  Quote,
  MessageCircle,
} from "lucide-react";
import { PropertyContext } from "../context/PropertyContext";
import { CategoryContext } from "../context/CategoryContext";
import Loader from "../components/Loader";
import CuteLoader from "../components/CuteLoader";
import Counter from "../components/Counter";
import Contact from "./Contact";
import ChannelPartners from "../components/ChannelPartners";



const Home = ({ setCurrentPage, setSelectedProperty, setSelectedCollectionKey }) => {
  const { properties, loading, fetchProperties } = useContext(PropertyContext);
  const { categories: rentalCategoriesList = [], loading: rentalCategoriesLoading } = useContext(CategoryContext);
  const [showStats, setShowStats] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [animateCards, setAnimateCards] = useState(false);
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);

  // curated slider index
  const [curatedIndex, setCuratedIndex] = useState(0);
  const [curatedCollections, setCuratedCollections] = useState([]);
  const [curatedLoading, setCuratedLoading] = useState(true);
  const curatedRef = useRef(null); // ← Yeh line add kar dena baaki useState ke saath
  const locationsRef = useRef(null);
const propertiesRef = useRef(null);
  
  // Dynamic Featured Locations State
  const [featuredLocations, setFeaturedLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const { setFilters } = useContext(PropertyContext);

  const heroImages = [
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920",
  ];

  // Zero brokerage style benefits
  const zeroBenefits = [
    {
      title: "Maximum Value",
      desc: "Maximum Value — Pay Only for What Matters.",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      title: "Best Price",
      desc: "We help secure competitive developer pricing.",
      icon: <PiggyBank className="w-5 h-5" />,
    },
    {
      title: "Market Insights",
      desc: "Short, data-backed recommendations.",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      title: "Exclusive Listings",
      desc: "Handpicked inventory for fast decisions.",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      title: "Guided Visits",
      desc: "Co-ordinated site visits with agents.",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      title: "After-Sales Help",
      desc: "Support through docs and handover.",
      icon: <Handshake className="w-5 h-5" />,
    },
  ];

  // REMOVED: hardcoded featuredLocations to use dynamic data below
  // const featuredLocations = [ ... ] 
  
  // Testimonials – “What customers say”
  const testimonials = [
    {
      name: "Mr. Bhuvneshwar Yadav",
      role: "Long-term Investor",
      quote:
        "They focus genuinely on my investment goals instead of just closing a deal. It felt like having a real partner on the investment side.",
    },
    {
      name: "Mr. Manoj Juneja",
      role: "Regional Manager, Adidas",
      quote:
        "The team is quick, transparent and very responsive. Every query was handled with patience, and the entire experience stayed completely hassle-free.",
    },
    {
      name: "CA Surender Sharma",
      role: "Home Buyer",
      quote:
        "From shortlisting projects to negotiation and paperwork, they stayed involved at every step. I happily recommend them to family and friends.",
    },
    {
      name: "Mr. Ramesh Thakur",
      role: "Business Owner",
      quote:
        "Professional, approachable and proactive. I always felt updated on site visits, pricing and offers, which built a lot of trust.",
    },
    {
      name: "Dr. Anjali Malhotra",
      role: "Medical Professional",
      quote:
        "As a doctor with a busy schedule, I appreciated their curated approach. They only showed me properties that matched my exact criteria, saving me immense time.",
    },
    {
      name: "Mr. Vikram Sethi",
      role: "Software Architect",
      quote:
        "Their technical understanding of project layouts and construction quality is impressive. They helped me find a home that was both functional and aesthetically superior.",
    },
    {
      name: "Mrs. Kavita Rao",
      role: "Entrepreneur",
      quote:
        "Transparent dealings and honest advice. They didn't just highlight the pros but also pointed out potential concerns, which helped me make a balanced decision.",
    },
    {
      name: "Mr. Sanjay Khanna",
      role: "Senior Vice President",
      quote:
        "The level of professionalism at Brothers Realestate is top-notch. They handled the entire documentation and legal process seamlessly, making it a stress-free experience.",
    },
    {
      name: "Ms. Priya Sharma",
      role: "IT Consultant",
      quote:
        "I was looking for my first home and was quite lost. Their team guided me like family, explaining everything from home loans to possession timelines clearly.",
    },
    {
      name: "Mr. Rajesh Gupta",
      role: "Retired Army Officer",
      quote:
        "Discipline and integrity are what I value most, and I found both in my dealings with them. Their commitment to their word is truly commendable.",
    },
  ];

  useEffect(() => {
    fetchProperties();

    // Fetch curated collections from backend.
    // Prefer manual `curatedProperty` titles (returned by /curated/titles)
    // so that properties added as Curated Property appear on the home page.
    const fetchCuratedCollections = async () => {
      try {
        // 1) Try the curated titles endpoint (based on `curatedProperty.title`)
        const titlesRes = await fetch(`${import.meta.env.VITE_API_URL}/properties/curated/titles`);
        const titlesJson = await titlesRes.json();
        if (titlesJson.success && Array.isArray(titlesJson.data) && titlesJson.data.length > 0) {
          // Map the API shape { title, count, image } to the curatedCollections format
          setCuratedCollections(
            titlesJson.data.map((t) => {
              const titleVal = (t.title || "").toString();
              const countVal =
                typeof t.count === "number"
                  ? `${t.count} Properties`
                  : t.count || "0 Properties";
              return {
                title: titleVal,
                count: countVal,
                image: t.image || "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200",
                key: titleVal.toLowerCase().replace(/\s+/g, "-"),
              };
            })
          );
          return;
        }

        // 2) Fallback: legacy curated collections by collection keys
        const response = await fetch(`${import.meta.env.VITE_API_URL}/properties/collections/curated`);
        const result = await response.json();
        if (result.success) {
          setCuratedCollections(result.data);
          return;
        }

        // 3) Final fallback to hardcoded defaults
        setCuratedCollections([
          {
            title: "New Projects",
            count: "61 Properties",
            image:
              "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200",
          },
          {
            title: "Ready to Move",
            count: "42 Properties",
            image:
              "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
          },
          {
            title: "Luxury Homes",
            count: "27 Properties",
            image:
              "https://images.unsplash.com/photo-1512914890250-353c97c9e7e2?w=1200",
          },
          {
            title: "Budget Friendly",
            count: "88 Properties",
            image:
              "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200",
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch curated collections:', error);
        setCuratedCollections([
          {
            title: "New Projects",
            count: "61 Properties",
            image:
              "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200",
          },
          {
            title: "Ready to Move",
            count: "42 Properties",
            image:
              "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
          },
          {
            title: "Luxury Homes",
            count: "27 Properties",
            image:
              "https://images.unsplash.com/photo-1512914890250-353c97c9e7e2?w=1200",
          },
          {
            title: "Budget Friendly",
            count: "88 Properties",
            image:
              "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200",
          },
        ]);
      } finally {
        setCuratedLoading(false);
      }
    };

    // NEW: Fetch featured locations from backend
    const fetchFeaturedLocations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/properties/locations/featured`);
        const result = await response.json();
        if (result.success) {
          // New backend returns { manual: [...], cities: [...] }
          const manual = result.data?.manual || [];
          const cities = result.data?.cities || [];

          const mappedManual = manual.map((m) => ({
            name: m.title,
            tagline: m.title,
            image: m.image,
            count: m.count || 0,
            source: 'manual'
          }));

          const mappedCities = cities.map((c) => ({
            name: c.name,
            tagline: c.tagline,
            image: c.image,
            count: c.count || 0,
            source: 'city'
          }));

          setFeaturedLocations([...mappedManual, ...mappedCities]);
        }
      } catch (error) {
        console.error('Failed to fetch featured locations:', error);
        // Fallback to a useful default array if API fails
        setFeaturedLocations([
          {
            name: "Rohtak",
            tagline: "Top property hub with over 100 active projects.",
            image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
            count: 100,
            source: 'city'
          },
          {
            name: "Sohna Road",
            tagline: "Growing residential corridor.",
            image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
            count: 20,
            source: 'city'
          },
        ]);
      } finally {
        setLocationsLoading(false);
      }
    };


    fetchCuratedCollections();
    fetchFeaturedLocations(); // Call the new fetch function

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    const timeout = setTimeout(() => setShowStats(true), 500);
    const cardsTimeout = setTimeout(() => setAnimateCards(true), 800);

    return (
return <div />;

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

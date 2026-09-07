// import { useContext, useEffect, useState } from "react";
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
// } from "lucide-react";
// import { PropertyContext } from "../context/PropertyContext";
// import Loader from "../components/Loader";

// const Home = ({ setCurrentPage, setSelectedProperty }) => {
//   const { properties, loading, fetchProperties } = useContext(PropertyContext);
//   const [showStats, setShowStats] = useState(false);
//   const [currentImage, setCurrentImage] = useState(0);
//   const [animateCards, setAnimateCards] = useState(false);

//   const heroImages = [
//     "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920",
//     "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920",
//     "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920",
//   ];

//   useEffect(() => {
//     fetchProperties();

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
//   }, []);

//   // Get only the most recently uploaded properties (sorted by creation date)
//   const featuredProperties = (properties || [])
//     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//     .slice(0, 6);

//   return (
//     <div
//       className="overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-purple-50"
//       style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
//     >
//       {/* ===== HERO SECTION ===== */}
//       <section className="relative min-h-screen md:min-h-[90vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-12 md:py-0">
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

//         {/* Gradient Overlay - Indigo to Purple */}
//         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-rose-500/20"></div>

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

//         {/* Hero Text */}
//         <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
//           <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full mb-4 sm:mb-6 animate-bounce">
//             <Sparkles size={16} className="text-yellow-300 sm:w-[18px]" />
//             <span className="text-xs sm:text-sm font-semibold">
//               Premium Properties Await
//             </span>
//           </div>

//           <h1
//             className="text-xl sm:text-2xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 drop-shadow-2xl leading-tight animate-fade-in"
//             style={{
//               fontFamily: "'Poppins', 'Inter', sans-serif",
//               animation: "slideUp 0.8s ease-out",
//             }}
//           >
//             Finding Your <span className="text-gold-light">Dream Home</span>
//             <br className="hidden sm:block" />
//             Made Simple
//           </h1>

//           <p className="text-xs sm:text-sm md:text-lg text-white/95 mb-4 sm:mb-6 max-w-3xl mx-auto drop-shadow-lg font-normal leading-relaxed px-2">
//             Experience luxury living with our curated collection of premium
//             properties. We transform real estate dreams into reality.
//           </p>

//           <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2">
//             <button
//               onClick={() => setCurrentPage("listings")}
//               className="group w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold rounded-full shadow-2xl hover:shadow-rose-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center sm:justify-start gap-2"
//             >
//               Explore Properties
//               <ChevronRight
//                 size={20}
//                 className="group-hover:translate-x-1 transition-transform"
//               />
//             </button>
//             <button
//               onClick={() => setCurrentPage("contact")}
//               className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 border-2 sm:border-3 border-white/90 text-white font-bold rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300 backdrop-blur-sm"
//             >
//               Contact Us
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* ===== STATS SECTION ===== */}
//       <section
//         className={`transition-all duration-1000 ease-out ${
//           showStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
//         } bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 md:py-20 relative overflow-hidden`}
//       >
//         {/* Animated Background */}
//         <div className="absolute inset-0 opacity-30">
//           <div className="absolute top-10 left-10 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-matte/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
//           <div
//             className="absolute bottom-10 right-10 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-gold/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
//             style={{ animationDelay: "1s" }}
//           ></div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <div className="flex flex-col items-center justify-center gap-8 md:gap-12">
//             {/* Main Image Container */}
//             <div className="w-full lg:w-3/4 max-w-4xl">
//               <div className="relative group">
//                 <img
//                   src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"
//                   alt="Luxury Property"
//                   className="rounded-3xl shadow-2xl w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 to-transparent rounded-3xl"></div>
//               </div>
//             </div>

//             {/* Stats Block - Single Row Layout */}
//             <div className="w-full bg-white rounded-2xl shadow-2xl p-4 md:p-6 border-2 border-black/10 backdrop-blur-sm">
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
//                 {[
//                   {
//                     value: "500+",
//                     label: "Properties Sold",
//                     icon: <HomeIcon size={18} />,
//                     gradient: "from-indigo-500 to-indigo-600",
//                   },
//                   {
//                     value: "1000+",
//                     label: "Happy Clients",
//                     icon: <Users size={18} />,
//                     gradient: "from-purple-500 to-purple-600",
//                   },
//                   {
//                     value: "50+",
//                     label: "Expert Agents",
//                     icon: <Award size={18} />,
//                     gradient: "from-rose-500 to-rose-600",
//                   },
//                   {
//                     value: "10+",
//                     label: "Years Experience",
//                     icon: <TrendingUp size={18} />,
//                     gradient: "from-indigo-600 to-purple-600",
//                   },
//                 ].map((stat, idx) => (
//                   <div
//                     key={idx}
//                     className="group hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 p-2 md:p-3 rounded-lg transition-all duration-300 text-center"
//                   >
//                     <div className="flex flex-col items-center justify-center gap-1">
//                       <div
//                         className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
//                         style={{ fontFamily: "'Poppins', sans-serif" }}
//                       >
//                         {stat.value}
//                       </div>
//                       <div
//                         className={`bg-gradient-to-br ${stat.gradient} p-1.5 rounded text-white transform group-hover:scale-110 transition-transform`}
//                       >
//                         {stat.icon}
//                       </div>
//                     </div>
//                     <div className="text-xs md:text-sm font-semibold text-gray-600 mt-1">
//                       {stat.label}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ===== FEATURED PROPERTIES ===== */}
//       <section className="py-12 md:py-20 bg-white relative overflow-hidden">
//         {/* Decorative Elements */}
//         <div className="absolute top-20 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-matte/20 rounded-full blur-3xl opacity-20"></div>
//         <div className="absolute bottom-20 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gold/30 rounded-full blur-3xl opacity-20"></div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
//           <div className="mb-8 md:mb-12">
//             <div className="inline-flex items-center gap-2 bg-gradient-to-r from-ivory to-ivory px-3 sm:px-4 py-2 rounded-full mb-3">
//               <Sparkles size={14} className="text-rose-600 sm:w-4" />
//               <p className="text-rose-600 font-bold uppercase tracking-wider text-xs sm:text-sm">
//                 Premium Selection
//               </p>
//             </div>

//             <h2
//               className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent"
//               style={{ fontFamily: "'Poppins', sans-serif" }}
//             >
//               Featured Properties
//             </h2>
//             <p className="text-sm sm:text-base md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
//               Discover our handpicked selection of premium homes that redefine
//               luxury living
//             </p>
//           </div>

//           {loading ? (
//             <Loader />
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
//               {featuredProperties.map((property, idx) => (
//                 <article
//                   key={property._id}
//                   onClick={() => {
//                     setSelectedProperty(property);
//                     setCurrentPage("property-details");
//                   }}
//                   className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-3 cursor-pointer border-2 border-transparent hover:border-black/10 animate-fade-in"
//                   style={{ animationDelay: `${idx * 150}ms` }}
//                 >
//                   <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
//                     <img
//                       src={
//                         property.images?.[0]?.url ||
//                         property.images?.[0] ||
//                         "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600"
//                       }
//                       alt={property.title}
//                       className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

//                     {/* Featured Badge */}
//                     <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs shadow-2xl flex items-center gap-1 animate-pulse">
//                       <Sparkles size={12} />
//                       Featured
//                     </div>

//                     {/* Price on Hover */}
//                     <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
//                       <div className="bg-white/95 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
//                         <span className="text-indigo-600 font-bold text-sm sm:text-base md:text-lg">
//                           ₹{property.price?.toLocaleString("en-IN")}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="p-4 sm:p-6 text-left">
//                     <div
//                       className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-rose-600 bg-clip-text text-transparent mb-2"
//                       style={{ fontFamily: "'Poppins', sans-serif" }}
//                     >
//                       ₹{property.price?.toLocaleString("en-IN")}
//                     </div>

//                     <h3
//                       className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors"
//                       style={{ fontFamily: "'Poppins', sans-serif" }}
//                     >
//                       {property.title}
//                     </h3>

//                     <div className="flex items-center text-gray-500 mb-3 sm:mb-4 text-xs sm:text-sm">
//                       <MapPin size={14} className="mr-1 text-rose-500 sm:w-4" />
//                       <span className="font-semibold">{property.city}</span>
//                     </div>

//                     <div className="flex justify-between items-center gap-2 sm:gap-3 text-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-black/10">
//                       <div className="flex flex-col items-center">
//                         <div className="bg-ivory p-1.5 sm:p-2 rounded-lg mb-1">
//                           <Bed
//                             size={16}
//                             className="text-indigo-600 sm:w-[18px]"
//                           />
//                         </div>
//                         <span className="text-xs font-bold text-gray-700">
//                           {property.bhk} BHK
//                         </span>
//                       </div>

//                       <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-ivory to-ivory"></div>

//                       <div className="flex flex-col items-center">
//                         <div className="bg-ivory p-1.5 sm:p-2 rounded-lg mb-1">
//                           <Bath
//                             size={16}
//                             className="text-indigo-600 sm:w-[18px]"
//                           />
//                         </div>
//                         <span className="text-xs font-bold text-gray-700">
//                           {property.bathrooms || 2}
//                         </span>
//                       </div>

//                       <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-ivory to-ivory"></div>

//                       <div className="flex flex-col items-center">
//                         <div className="bg-ivory p-1.5 sm:p-2 rounded-lg mb-1">
//                           <Square
//                             size={16}
//                             className="text-indigo-600 sm:w-[18px]"
//                           />
//                         </div>
//                         <span className="text-xs font-bold text-gray-700">
//                           {property.area || 1200} sqft
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           )}

//           <div className="mt-8 md:mt-12">
//             <button
//               onClick={() => setCurrentPage("listings")}
//               className="group inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold rounded-full shadow-2xl hover:shadow-indigo-500/50 hover:scale-110 transition-all duration-300"
//             >
//               View All Properties
//               <ChevronRight
//                 size={20}
//                 className="group-hover:translate-x-2 transition-transform sm:w-[22px]"
//               />
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* ===== CTA SECTION ===== */}
//       <section className="py-12 md:py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden px-4 sm:px-6 lg:px-8">
//         {/* Animated Background Blobs */}
//         <div className="absolute top-0 left-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-matte/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
//         <div
//           className="absolute bottom-0 right-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-gold/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
//           style={{ animationDelay: "2s" }}
//         ></div>

//         <div className="max-w-7xl mx-auto relative z-10">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
//             {/* Left Side - Card */}
//             <div className="relative group">
//               <div className="absolute -inset-1 bg-gradient-to-r from-ivory to-rose-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
//               <div className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-rose-600 rounded-3xl shadow-2xl p-8 md:p-10 text-white">
//                 <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20"></div>
//                 <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -ml-12 sm:-ml-16 -mb-12 sm:-mb-16"></div>

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
//                   With over 10 years in the real estate industry, we've helped
//                   thousands of families find their dream homes and investment
//                   properties.
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
//                   where life's most precious moments will unfold.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

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































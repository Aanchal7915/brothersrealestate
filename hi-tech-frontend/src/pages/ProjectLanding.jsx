import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Phone, ArrowLeft } from "lucide-react";
import api from '../utils/api';
const logo = "/logo-img.png";

const ProjectLanding = ({ setCurrentPage }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState({
    type: 'cloudinary',
    src: 'https://player.cloudinary.com/embed/?cloud_name=dn0j5mkmb&public_id=hitech-landing-page_sfmk0g'
  });
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  // Hero form refs
  const heroNameRef = useRef(null);
  const heroEmailRef = useRef(null);
  const heroPhoneRef = useRef(null);
  const heroSpecialEnquiryRef = useRef(null);

  const footerNameRef = useRef(null);
  const footerEmailRef = useRef(null);
  const footerPhoneRef = useRef(null);
  const footerSpecialEnquiryRef = useRef(null);

  const whatsappNumber = "+91000000";

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    const name = (heroNameRef.current?.value || "").trim();
    const email = (heroEmailRef.current?.value || "").trim();
    const phone = (heroPhoneRef.current?.value || "").trim();
    const specialEnquiry = (heroSpecialEnquiryRef.current?.value || "").trim();

    // Save to backend
    try {
      await api.post('/project-enquiries', {
        name,
        email,
        phone,
        message: "Enquiry from Shapoorji Pallonji Dualis Landing Page",
        specialEnquiry,
        project: "Shapoorji Pallonji Dualis"
      });
    } catch (error) {
      console.error("Error saving enquiry:", error);
    }

    // Navigate to Thank You page
    setCurrentPage("thank-you");

    // Reset form
    if (heroNameRef.current) heroNameRef.current.value = "";
    if (heroEmailRef.current) heroEmailRef.current.value = "";
    if (heroPhoneRef.current) heroPhoneRef.current.value = "";
    if (heroSpecialEnquiryRef.current) heroSpecialEnquiryRef.current.value = "";
  };

  const handleFooterSubmit = async (e) => {
    e.preventDefault();
    const name = (footerNameRef.current?.value || "").trim();
    const email = (footerEmailRef.current?.value || "").trim();
    const phone = (footerPhoneRef.current?.value || "").trim();
    const specialEnquiry = (footerSpecialEnquiryRef.current?.value || "").trim();

    // Save to backend
    try {
      await api.post('/project-enquiries', {
        name,
        email,
        phone,
        message: "Footer Enquiry from Shapoorji Pallonji Dualis Landing Page",
        specialEnquiry,
        project: "Shapoorji Pallonji Dualis"
      });
    } catch (error) {
      console.error("Error saving enquiry:", error);
    }

    // Navigate to Thank You page
    setCurrentPage("thank-you");

    // Reset form
    if (footerNameRef.current) footerNameRef.current.value = "";
    if (footerEmailRef.current) footerEmailRef.current.value = "";
    if (footerPhoneRef.current) footerPhoneRef.current.value = "";
    if (footerSpecialEnquiryRef.current) footerSpecialEnquiryRef.current.value = "";
  };

  const heroImages = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=3540&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full font-sans text-white overflow-x-hidden">

      {/* ================= NAVBAR STRIP ================= */}
      <nav className="w-full bg-[#dfae75] py-2 border-b border-black/10 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage("home")}
            className="flex items-center gap-1.5 text-black hover:bg-black/10 px-2 sm:px-3 py-1.5 rounded-lg transition-colors font-semibold text-sm"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center justify-center gap-3 absolute left-1/2 -translate-x-1/2">
            <img
              src={logo}
              alt="Shapoorji Pallonji Logo"
              className="h-10 sm:h-14 w-auto"
            />
            <span className="text-black text-lg sm:text-xl md:text-2xl font-bold tracking-wider uppercase hidden xs:inline-block">
              Shapoorji Pallonji
            </span>
          </div>
          
          <div className="w-[60px] opacity-0 pointer-events-none"></div> {/* Spacer for flex balance */}
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full min-h-screen lg:h-screen flex flex-col">
        {/* Background Images with Auto Slide */}
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${index === currentHeroImage ? 'opacity-100' : 'opacity-0'
              }`}
            style={{
              backgroundImage: `url('${img}')`,
            }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"></div>
          </div>
        ))}

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-6 lg:py-0 flex-grow flex flex-col lg:flex-row justify-center lg:justify-between items-center gap-6 lg:gap-10">

          {/* Left Text Content */}
          <div className="w-full lg:w-3/5 space-y-4 md:space-y-6 animate-fade-in-up mt-2 lg:mt-0 order-1">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide leading-tight text-[#fdf8e8]">
              SHAPOORJI PALLONJI DUALIS
            </h1>

            <h2 className="text-lg sm:text-xl md:text-3xl font-light tracking-wide italic text-gray-200">
              In Sector 46 Rohtak
            </h2>

            <div className="w-fit bg-[#dfae75] text-black px-3 py-1.5 md:px-4 md:py-2 text-[10px] sm:text-xs md:text-base font-bold uppercase tracking-wider rounded-sm">
              EXCLUSIVE 3 & 4 BHK LUXURY UNITS
            </div>

            <div className="bg-[#e4b57b] bg-opacity-95 text-black px-4 py-2 md:px-6 md:py-3 w-fit font-bold text-xs sm:text-sm md:text-xl tracking-wider rounded-sm shadow-xl border-l-4 border-black/20">
              FLASH SALE: ₹24,000/sq.ft (3BHK) | ₹25,000/sq.ft (4BHK)
            </div>

            {/* Features List - Hidden on mobile, shown on desktop */}
            <ul className="hidden lg:flex lg:flex-col space-y-3 mt-8 text-base font-medium text-gray-100/90">
              <li className="flex items-center space-x-3">
                <span className="text-[#dfae75] text-xl">✓</span>
                <span>Twin Tower Concept with only 198 Units</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-[#dfae75] text-xl">✓</span>
                <span>Exclusive Tower for 4 BHK</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-[#dfae75] text-xl">✓</span>
                <span>G+40 Tower Height</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-[#dfae75] text-xl">✓</span>
                <span>4 Level Basement + 4 Level Podium Parking</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-[#dfae75] text-xl">✓</span>
                <span>Special 20:80 Festive Payment Plan</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-[#dfae75] text-xl">✓</span>
                <span>Clubhouse with Modern Amenities</span>
              </li>
            </ul>

            <div className="hidden lg:block pt-6 text-2xl md:text-4xl font-serif text-white/40 italic">
              Artist's Impression
            </div>
          </div>

          {/* Right Form */}
          <div className="w-full lg:w-1/3 bg-black/60 backdrop-blur-md p-6 md:p-8 rounded-lg border border-white/10 shadow-2xl order-2">
            <h3 className="text-2xl font-semibold mb-6">Get in touch with us.</h3>

            <form onSubmit={handleHeroSubmit} className="space-y-6">
              <div className="relative">
                <input
                  ref={heroNameRef}
                  type="text"
                  placeholder="Name*"
                  required
                  className="w-full bg-transparent border-b border-gray-400 py-2 focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-300"
                />
              </div>

              <div className="relative">
                <input
                  ref={heroEmailRef}
                  type="email"
                  placeholder="Email*"
                  required
                  className="w-full bg-transparent border-b border-gray-400 py-2 focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-300"
                />
              </div>

              <div className="relative">
                <input
                  ref={heroPhoneRef}
                  type="tel"
                  placeholder="Mobile*"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)}
                  className="w-full bg-transparent border-b border-gray-400 py-2 focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-300"
                />
              </div>

              <div className="relative">
                <input
                  ref={heroSpecialEnquiryRef}
                  type="text"
                  placeholder="Special Enquiry"
                  className="w-full bg-transparent border-b border-gray-400 py-2 focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-300"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black font-bold py-3 uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Submit
              </button>
            </form>

            {/* Watch Video Button */}
            <button
              onClick={() => {
                setActiveVideo({
                  type: 'cloudinary',
                  src: 'https://player.cloudinary.com/embed/?cloud_name=dn0j5mkmb&public_id=hitech-landing-page_sfmk0g'
                });
                setIsVideoPopupOpen(true);
              }}
              className="w-full mt-3 sm:mt-4 bg-[#dfae75]/10 backdrop-blur-sm border border-[#dfae75]/30 text-[#dfae75] font-bold py-2.5 sm:py-3 rounded-lg uppercase tracking-wider text-xs sm:text-sm hover:bg-[#dfae75]/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Video
            </button>
          </div>

          {/* Features List - Shown on mobile below form */}
          <div className="w-full lg:hidden pb-6 order-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <span className="text-[#dfae75]">✓</span>
                <span className="text-[10px] sm:text-xs">Twin Tower (198 Units)</span>
              </li>
              <li className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <span className="text-[#dfae75]">✓</span>
                <span className="text-[10px] sm:text-xs">Exclusive 4 BHK Tower</span>
              </li>
              <li className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <span className="text-[#dfae75]">✓</span>
                <span className="text-[10px] sm:text-xs">G+40 Tower Height</span>
              </li>
              <li className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <span className="text-[#dfae75]">✓</span>
                <span className="text-[10px] sm:text-xs">8 Level Parking</span>
              </li>
              <li className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <span className="text-[#dfae75]">✓</span>
                <span className="text-[10px] sm:text-xs">20:80 Payment Plan</span>
              </li>
              <li className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <span className="text-[#dfae75]">✓</span>
                <span className="text-[10px] sm:text-xs">Modern Clubhouse</span>
              </li>
            </div>
          </div>
        </div>

        {/* Floating Scroll Indicator - Hidden on mobile if needed, or kept */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden lg:flex space-x-2">
          {heroImages.map((_, idx) => (
            <div
              key={idx}
              className={`w-8 h-1 rounded-full transition-all duration-300 ${idx === currentHeroImage ? 'bg-[#dfae75] w-12' : 'bg-white/30'}`}
            ></div>
          ))}
        </div>
      </section>

      {/* ================= OVERVIEW SECTION ================= */}
      <section className="bg-[#1c1915] py-10 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left Content */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl tracking-wide uppercase">
                  <span className="text-[#dfae75]">SHAPOORJI</span> <span className="text-[#e4b57b]">PALLONJI SECTOR 46</span>
                </h2>
                <h3 className="text-xl md:text-2xl text-white font-light tracking-widest uppercase">
                  IN SECTOR 46 Rohtak
                </h3>
              </div>

              <div className="text-gray-300 leading-relaxed text-sm md:text-base text-justify space-y-4 font-light">
                <p>
                  Introducing THE DUALIS by Shapoorji Pallonji in Sector 46, Rohtak - where luxury meets exclusivity in the heart of Rohtak. This prestigious development features a unique Twin Tower Concept with only 198 meticulously crafted units, ensuring an intimate and exclusive living experience.
                </p>
                <p>
                  THE DUALIS offers exclusive 3 & 4 BHK luxury units, with a dedicated tower exclusively for 4 BHK residences. Rising to an impressive G+40 tower height, these residences redefine modern luxury living with spacious layouts ranging from 2852-3009 sq.ft for 3BHK units and 3519-3605 sq.ft for 4BHK units.
                </p>
                <p>
                  Experience world-class amenities spread across a magnificent clubhouse, complemented by 4-level basement and 4-level podium car parking. With the exclusive 20:80 Festive Payment Plan, owning your dream home has never been more accessible.
                </p>
              </div>

              <div>
                <button
                  onClick={() => setIsPopupOpen(true)}
                  className="bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black font-bold py-3 px-8 uppercase tracking-wider hover:shadow-lg hover:scale-105 transition-all duration-300">
                  DOWNLOAD PRICE LIST
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="w-full lg:w-1/2">
              <div className="relative group overflow-hidden border-4 border-[#dfae75]/20 rounded-sm">
                <div className="absolute inset-0 bg-[#dfae75]/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img
                  src="http://shapoorjidualis.com/img/g1.jpg"
                  alt="Shapoorji Pallonji Sector 46"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= VIDEO SHOWCASE SECTION ================= */}
      <section className="bg-black py-10 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-serif text-[#dfae75] uppercase tracking-widest mb-4">
              Experience <span className="text-[#e4b57b]">THE DUALIS</span>
            </h2>
            <p className="text-gray-400 text-lg">Watch our exclusive project showcase</p>
          </div>

          <div className="max-w-2xl mx-auto px-4">
            <div
              onClick={() => {
                setActiveVideo({
                  type: 'cloudinary',
                  src: 'https://player.cloudinary.com/embed/?cloud_name=dn0j5mkmb&public_id=hitech-landing-page_sfmk0g'
                });
                setIsVideoPopupOpen(true);
              }}
              className="relative group cursor-pointer rounded-xl overflow-hidden shadow-2xl border-4 border-[#dfae75]/30 hover:border-[#dfae75]/60 transition-all duration-300"
            >
              <div className="aspect-video w-full relative">
                <img
                  src="http://shapoorjidualis.com/img/g1.jpg"
                  alt="Project Video"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[#dfae75] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-black fill-current translate-x-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setActiveVideo({
                    type: 'cloudinary',
                    src: 'https://player.cloudinary.com/embed/?cloud_name=dn0j5mkmb&public_id=hitech-landing-page_sfmk0g'
                  });
                  setIsVideoPopupOpen(true);
                }}
                className="text-[#dfae75] font-bold uppercase tracking-widest text-sm hover:underline"
              >
                Click to Watch Full Video
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HIGHLIGHTS SECTION ================= */}
      <section className="bg-[#1c1915] py-10 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12">

            {/* Left Image */}
            <div className="w-full lg:w-1/2">
              <div className="relative group overflow-hidden border-4 border-[#dfae75]/20 rounded-sm">
                <div className="absolute inset-0 bg-[#dfae75]/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img
                  src="./book-visit-site.png"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2670&auto=format&fit=crop' }}
                  alt="Shapoorji Dualis Lobby"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 text-white/80 text-sm font-serif italic z-20">
                  Artist's Impression
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl tracking-wide uppercase text-[#e4b57b]">
                  SHAPOORJI DUALIS <span className="text-white">HIGHLIGHTS</span>
                </h2>
              </div>

              <ul className="space-y-4 text-gray-300 font-light text-sm md:text-base">
                <li className="flex items-start">
                  <span className="text-[#dfae75] mr-3 mt-1">•</span>
                  <span>Twin Tower Concept with only 198 exclusive units</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#dfae75] mr-3 mt-1">•</span>
                  <span>Dedicated tower exclusively for 4 BHK residences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#dfae75] mr-3 mt-1">•</span>
                  <span>Unit Sizes: 3BHK + Utility (2852-3009 sq.ft) | 4BHK + Utility (3519-3605 sq.ft)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#dfae75] mr-3 mt-1">•</span>
                  <span>G+40 Tower Height with stunning city views</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#dfae75] mr-3 mt-1">•</span>
                  <span>4 Level Basement + 4 Level Podium Car Parking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#dfae75] mr-3 mt-1">•</span>
                  <span>Concierge Services by Quintessentially</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#dfae75] mr-3 mt-1">•</span>
                  <span>Attractive 30:40:30 & Special 20:80 Payment Plans</span>
                </li>
              </ul>

              <div>
                <button
                  onClick={() => setIsPopupOpen(true)}
                  className="bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black font-bold py-3 px-8 uppercase tracking-wider hover:shadow-lg hover:scale-105 transition-all duration-300">
                  BOOK SITE VISIT
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ================= FLASH SALE SECTION ================= */}
      <section className="relative bg-gradient-to-br from-[#1a1816] via-[#242b2e] to-[#1a1816] py-10 md:py-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#dfae75] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#e4b57b] rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">

          {/* Flash Sale Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-[#dfae75] to-[#e4b57b] text-black font-bold text-sm md:text-base uppercase tracking-widest rounded-full animate-pulse">
              ✨ Flash Sale Alert ✨
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-4 uppercase tracking-wide">
              Exclusive <span className="text-[#dfae75]">20:80</span> Special Festive Payment Plan
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">Limited Units Only - Don't Miss This Opportunity!</p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

            {/* Payment Plan Highlights */}
            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border-2 border-[#dfae75]/30 hover:border-[#dfae75]/60 transition-all duration-300 shadow-2xl">
              <h3 className="text-2xl md:text-3xl text-[#dfae75] font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">💰</span> Payment Plan Highlights
              </h3>
              <ul className="space-y-4 text-gray-200 text-base md:text-lg">
                <li className="flex items-start gap-3 p-3 bg-[#dfae75]/10 rounded-lg hover:bg-[#dfae75]/20 transition-colors">
                  <span className="text-[#dfae75] font-bold text-xl">•</span>
                  <span><strong className="text-[#e4b57b]">10%</strong> on Booking</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-[#dfae75]/10 rounded-lg hover:bg-[#dfae75]/20 transition-colors">
                  <span className="text-[#dfae75] font-bold text-xl">•</span>
                  <span><strong className="text-[#e4b57b]">10%</strong> within 90 days</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-[#dfae75]/10 rounded-lg hover:bg-[#dfae75]/20 transition-colors">
                  <span className="text-[#dfae75] font-bold text-xl">•</span>
                  <span><strong className="text-[#e4b57b]">10%</strong> in May 2028</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-[#dfae75]/10 rounded-lg hover:bg-[#dfae75]/20 transition-colors">
                  <span className="text-[#dfae75] font-bold text-xl">•</span>
                  <span><strong className="text-[#e4b57b]">50%</strong> on Application of OC</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-[#dfae75]/10 rounded-lg hover:bg-[#dfae75]/20 transition-colors">
                  <span className="text-[#dfae75] font-bold text-xl">•</span>
                  <span><strong className="text-[#e4b57b]">20%</strong> on Offer of Possession</span>
                </li>
              </ul>
            </div>

            {/* Flat Pricing */}
            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border-2 border-[#dfae75]/30 hover:border-[#dfae75]/60 transition-all duration-300 shadow-2xl">
              <h3 className="text-2xl md:text-3xl text-[#dfae75] font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">🏡</span> Flat Pricing
              </h3>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#dfae75]/20 to-[#e4b57b]/20 p-6 rounded-lg border border-[#dfae75]/40">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-lg md:text-xl font-semibold">3 BHK + S</span>
                    <span className="text-[#dfae75] text-2xl md:text-3xl font-bold">₹24,000</span>
                  </div>
                  <p className="text-gray-400 text-sm">per sq.ft</p>
                </div>

                <div className="bg-gradient-to-r from-[#dfae75]/20 to-[#e4b57b]/20 p-6 rounded-lg border border-[#dfae75]/40">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-lg md:text-xl font-semibold">4 BHK + S</span>
                    <span className="text-[#dfae75] text-2xl md:text-3xl font-bold">₹25,000</span>
                  </div>
                  <p className="text-gray-400 text-sm">per sq.ft</p>
                </div>

                <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm md:text-base text-center font-semibold">
                    ⚠️ Payment Plan is subject to limited inventory only
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* CTA Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-gradient-to-r from-[#dfae75] to-[#e4b57b] text-black font-bold py-4 px-12 text-lg md:text-xl uppercase tracking-wider rounded-full hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-pulse"
            >
              HURRY!! REGISTER NOW
            </button>
            <p className="text-gray-400 mt-4 text-sm md:text-base">Limited time offer - Don't miss out!</p>
          </div>

        </div>
      </section>

      {/* ================= PRICE LIST SECTION ================= */}
      <section className="bg-[#242b2e] py-10 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl tracking-wide uppercase text-[#e4b57b]">
              SHAPOORJI <span className="text-[#dfae75]">DUALIS PRICE LIST</span>
            </h2>
          </div>

          <div className="bg-[#1a202c] p-8 max-w-6xl mx-auto rounded-lg shadow-2xl overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-5 gap-6 text-center items-center">

              {/* Headings */}
              <div className="col-span-1 text-[#dfae75] font-bold text-sm tracking-widest uppercase mb-4 border-r border-gray-700 pb-2">TYPE</div>
              <div className="col-span-1 text-[#dfae75] font-bold text-sm tracking-widest uppercase mb-4 border-r border-gray-700 pb-2">SIZES</div>
              <div className="col-span-1 text-[#dfae75] font-bold text-sm tracking-widest uppercase mb-4 border-r border-gray-700 pb-2">
                PAYMENT PLAN<br /><span className="text-xs text-gray-400">FLEXI 10x10</span>
              </div>
              <div className="col-span-1 text-[#dfae75] font-bold text-sm tracking-widest uppercase mb-4 border-r border-gray-700 pb-2">
                PAYMENT PLAN<br /><span className="text-xs text-gray-400">30:40:30</span>
              </div>
              <div className="col-span-1 text-[#dfae75] font-bold text-sm tracking-widest uppercase mb-4"></div>

              {/* Row 1 */}
              <div className="col-span-1 border-r border-gray-700 h-full flex items-center justify-center">
                <div className="text-white font-medium uppercase">
                  3 BHK + SERVANT ROOM
                </div>
              </div>
              <div className="col-span-1 border-r border-gray-700 h-full flex items-center justify-center">
                <div className="text-white">
                  2850-3000 Sq.ft.
                </div>
              </div>
              <div className="col-span-1 border-r border-gray-700 h-full flex items-center justify-center">
                <div className="text-white">
                  ₹ 5.77 Cr* - 6.47 Cr*
                </div>
              </div>
              <div className="col-span-1 border-r border-gray-700 h-full flex items-center justify-center">
                <div className="text-white">
                  ₹ 5.99 Cr* - 6.69 Cr*
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-center py-4">
                <button
                  onClick={() => setIsPopupOpen(true)}
                  className="bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black w-full py-3 px-2 text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
                  DOWNLOAD
                </button>
              </div>

              {/* Divider */}
              <div className="col-span-5 h-px bg-gray-700 my-2"></div>

              {/* Row 2 */}
              <div className="col-span-1 border-r border-gray-700 h-full flex items-center justify-center">
                <div className="text-white font-medium uppercase">
                  4 BHK + SERVANT ROOM
                </div>
              </div>
              <div className="col-span-1 border-r border-gray-700 h-full flex items-center justify-center">
                <div className="text-white">
                  3600 - 3700 Sq.ft.
                </div>
              </div>
              <div className="col-span-1 border-r border-gray-700 h-full flex items-center justify-center">
                <div className="text-white">
                  ₹ 7.95 Cr* - 8.41 Cr*
                </div>
              </div>
              <div className="col-span-1 border-r border-gray-700 h-full flex items-center justify-center">
                <div className="text-white">
                  ₹ 7.68 Cr* - 8.14 Cr*
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-center py-4">
                <button
                  onClick={() => setIsPopupOpen(true)}
                  className="bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black w-full py-3 px-2 text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
                  DOWNLOAD
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ================= AMENITIES SECTION ================= */}
      <section className="bg-black py-10 md:py-24 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-serif text-[#dfae75] mb-2 uppercase tracking-widest">AMENITIES</h2>
          <p className="text-white text-lg md:text-xl font-light mb-8 tracking-wide">
            Shapoorji Pallonji Dualis The Iconic Life.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12 max-w-7xl mx-auto">

            {/* Badminton & Pickle Ball Court */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Badminton & Pickle Ball</span>
            </div>

            {/* Fitness Zone/Gym */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 4l12 0" />
                <path d="M5 4l0 16" />
                <path d="M19 4l0 16" />
                <path d="M6 20l12 0" />
                <path d="M4 9l16 0" />
                <path d="M4 15l16 0" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Fitness Zone/Gym</span>
            </div>

            {/* Swimming Pool */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M2 12c.6.5 1.2 1 2.5 1s2.5 0 4-2c1.4.3 2.7.7 4 1.5 1.4-1.2 2.7-2 4.5-2 2 .5 3.3 1.3 5 2.5" />
                <path d="M2 16c.6.5 1.2 1 2.5 1s2.5 0 4-2c1.4.3 2.7.7 4 1.5 1.4-1.2 2.7-2 4.5-2 2 .5 3.3 1.3 5 2.5" />
                <path d="M2 20c.6.5 1.2 1 2.5 1s2.5 0 4-2c1.4.3 2.7.7 4 1.5 1.4-1.2 2.7-2 4.5-2 2 .5 3.3 1.3 5 2.5" />
                <circle cx="18" cy="6" r="3" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Swimming Pool</span>
            </div>

            {/* Banquet Hall */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M3 3h18v18H3z" />
                <path d="M8 8h8v8H8z" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Banquet Hall</span>
            </div>

            {/* Golf Simulator */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="10" r="1" />
                <path d="M12 11v10" />
                <path d="M8 21h8" />
                <path d="M12 3l-3 7h6l-3-7z" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Golf Simulator</span>
            </div>

            {/* Indoor Gaming Arena */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="4" width="20" height="12" rx="2" />
                <circle cx="6" cy="10" r="1" fill="currentColor" />
                <circle cx="18" cy="10" r="1" fill="currentColor" />
                <circle cx="12" cy="10" r="1" fill="currentColor" />
                <path d="M4 16v4" />
                <path d="M20 16v4" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Indoor Gaming Arena</span>
            </div>

            {/* Steam and Sauna */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="8" width="18" height="13" rx="2" />
                <path d="M7 3v5" />
                <path d="M12 3v5" />
                <path d="M17 3v5" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Steam & Sauna</span>
            </div>

            {/* Salon */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="8" r="3" />
                <path d="M12 11v10" />
                <path d="M8 15l4-4 4 4" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Salon</span>
            </div>

            {/* Jacuzzi */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <ellipse cx="12" cy="17" rx="8" ry="4" />
                <path d="M8 7v3" />
                <path d="M12 5v5" />
                <path d="M16 7v3" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Jacuzzi</span>
            </div>

            {/* Spa */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M12 2v6" />
                <path d="M12 18v4" />
                <circle cx="12" cy="12" r="4" />
                <path d="M4.93 4.93l4.24 4.24" />
                <path d="M14.83 14.83l4.24 4.24" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Spa</span>
            </div>

            {/* Yoga Aerobics Room */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="5" r="2" />
                <path d="M9 20l-1-4 2-5h4l2 5-1 4" />
                <path d="M8 12l-4 3" />
                <path d="M16 12l4 3" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Yoga Aerobics Room</span>
            </div>

            {/* Reading Lounge & Library */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Reading Lounge & Library</span>
            </div>

            {/* Kids' Play Area */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M4 20l10-10" />
                <path d="M14 10l4-4" />
                <path d="M14 20h6" />
                <path d="M17 17l3 3" />
                <path d="M3 20h2" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Kids' Play Area</span>
            </div>

            {/* Vehicular Movement */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="11" width="18" height="8" rx="2" />
                <circle cx="7" cy="19" r="2" />
                <circle cx="17" cy="19" r="2" />
                <path d="M3 11V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Surface Level Parking</span>
            </div>

            {/* Café & Bar */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Café & Bar</span>
            </div>

            {/* Multipurpose Hall */}
            <div className="flex flex-col items-center group cursor-pointer">
              <svg className="w-16 h-16 md:w-20 md:h-20 mb-4 text-[#dfae75] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                <path d="M7 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
                <path d="M2 20h20" />
                <path d="M12 9V5" />
                <path d="M12 5l-2 2" />
                <path d="M12 5l2 2" />
              </svg>
              <span className="text-white text-xs md:text-sm uppercase tracking-widest font-medium text-center">Multipurpose Hall</span>
            </div>

          </div>

          <div className="mt-10">
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black font-bold py-3 px-10 uppercase tracking-wider hover:opacity-90 transition-opacity">
              KNOW MORE
            </button>
          </div>
        </div>
      </section>

      {/* ================= FLOOR PLAN SECTION ================= */}
      <section className="bg-[#242b2e] py-10 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-serif text-[#e4b57b] uppercase tracking-widest">
              MASTER & <span className="text-[#dfae75]">FLOOR PLAN</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">

            {/* Master Plan */}
            <div className="group text-center">
              <div className="relative overflow-hidden rounded-md shadow-2xl mb-6 bg-white p-2">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 group-hover:bg-black/40 transition-colors duration-300"></div>
                <img
                  src="https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg"
                  alt="Master Plan"
                  className="w-full h-64 object-cover filter blur-[2px] group-hover:blur-[1px] transition-all duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button
                    onClick={() => setIsPopupOpen(true)}
                    className="bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black font-bold py-2 px-6 uppercase tracking-wider text-sm hover:scale-105 transition-transform duration-300">
                    KNOW MORE
                  </button>
                </div>
              </div>
              <h3 className="text-white text-lg font-bold uppercase tracking-wider">Master Plan</h3>
            </div>

            {/* 3 BHK */}
            <div className="group text-center">
              <div className="relative overflow-hidden rounded-md shadow-2xl mb-6 bg-white p-2">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 group-hover:bg-black/40 transition-colors duration-300"></div>
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop"
                  alt="3 BHK Plan"
                  className="w-full h-64 object-cover filter blur-[2px] group-hover:blur-[1px] transition-all duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button
                    onClick={() => setIsPopupOpen(true)}
                    className="bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black font-bold py-2 px-6 uppercase tracking-wider text-sm hover:scale-105 transition-transform duration-300">
                    KNOW MORE
                  </button>
                </div>
              </div>
              <h3 className="text-white text-lg font-bold uppercase tracking-wider">3 BHK + SERVANT ROOM</h3>
            </div>

            {/* 4 BHK */}
            <div className="group text-center">
              <div className="relative overflow-hidden rounded-md shadow-2xl mb-6 bg-white p-2">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 group-hover:bg-black/40 transition-colors duration-300"></div>
                <img
                  src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=2670&auto=format&fit=crop"
                  alt="4 BHK Plan"
                  className="w-full h-64 object-cover filter blur-[2px] group-hover:blur-[1px] transition-all duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button
                    onClick={() => setIsPopupOpen(true)}
                    className="bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black font-bold py-2 px-6 uppercase tracking-wider text-sm hover:scale-105 transition-transform duration-300">
                    KNOW MORE
                  </button>
                </div>
              </div>
              <h3 className="text-white text-lg font-bold uppercase tracking-wider">4 BHK + SERVANT ROOM</h3>
            </div>

          </div>
        </div>
      </section>

      {/* ================= LOCATION ADVANTAGE SECTION ================= */}
      <section className="bg-[#1c1915] py-8 md:py-32">
        <div className="container mx-auto px-4">

          {/* Section Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-serif text-[#dfae75] uppercase tracking-widest mb-4">
              LOCATION <span className="text-[#e4b57b]">ADVANTAGE</span>
            </h2>
            <div className="w-24 h-1 bg-[#dfae75] mx-auto mb-6"></div>
            <p className="text-gray-400 text-lg md:text-xl italic max-w-2xl mx-auto">
              "Experience the perfect blend of luxury and connectivity in the heart of Sector 46, Rohtak."
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start max-w-7xl mx-auto">

            {/* Left Side: Map Container */}
            <div className="w-full lg:w-1/2">
              <div className="relative group rounded-xl overflow-hidden border border-[#dfae75]/30 shadow-2xl h-[400px] md:h-[550px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3508.3966175282417!2d77.0530996!3d28.437458099999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d19002b67be4d%3A0x3de978035c482907!2sShapoorji%20Pallonji%20Dualis!5e0!3m2!1sen!2sin!4v1766993248457!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="filter contrast-125 group-hover:contrast-100 transition-all duration-500"
                ></iframe>
                <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-[#dfae75]/30">
                  <p className="text-[#dfae75] font-bold text-sm uppercase tracking-wider mb-1">Project Site:</p>
                  <p className="text-white text-xs">Shapoorji Pallonji Dualis, Sector 46, Rohtak</p>
                </div>
              </div>
            </div>

            {/* Right Side: Proximity Grid */}
            <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">

              {/* Category: Lifestyle */}
              <div className="bg-[#242b2e]/50 backdrop-blur-sm p-6 rounded-lg border border-[#dfae75]/10 hover:border-[#dfae75]/40 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4 text-[#dfae75]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  <h3 className="text-base font-bold uppercase tracking-widest">Lifestyle</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">IKEA Mall</span>
                    <span className="text-[#dfae75] text-xs font-bold">2 MIN</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">Raheja Mall</span>
                    <span className="text-[#dfae75] text-xs font-bold">5 MIN</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">Taj City Centre</span>
                    <span className="text-[#dfae75] text-xs font-bold">11 MIN</span>
                  </div>
                </div>
              </div>

              {/* Category: Education */}
              <div className="bg-[#242b2e]/50 backdrop-blur-sm p-6 rounded-lg border border-[#dfae75]/10 hover:border-[#dfae75]/40 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4 text-[#dfae75]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                  <h3 className="text-base font-bold uppercase tracking-widest">Education</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">Manav Rachna</span>
                    <span className="text-[#dfae75] text-xs font-bold">4 MIN</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">Amity School</span>
                    <span className="text-[#dfae75] text-xs font-bold">7 MIN</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">Scottish High</span>
                    <span className="text-[#dfae75] text-xs font-bold">18 MIN</span>
                  </div>
                </div>
              </div>

              {/* Category: Healthcare */}
              <div className="bg-[#242b2e]/50 backdrop-blur-sm p-6 rounded-lg border border-[#dfae75]/10 hover:border-[#dfae75]/40 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4 text-[#dfae75]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                  <h3 className="text-base font-bold uppercase tracking-widest">Healthcare</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">Medanta Medicity</span>
                    <span className="text-[#dfae75] text-xs font-bold">4 MIN</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">Artemis Hospital</span>
                    <span className="text-[#dfae75] text-xs font-bold">10 MIN</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">Max Hospital</span>
                    <span className="text-[#dfae75] text-xs font-bold">12 MIN</span>
                  </div>
                </div>
              </div>

              {/* Category: Business */}
              <div className="bg-[#242b2e]/50 backdrop-blur-sm p-6 rounded-lg border border-[#dfae75]/10 hover:border-[#dfae75]/40 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4 text-[#dfae75]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  <h3 className="text-base font-bold uppercase tracking-widest">Business</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">Unitech Park</span>
                    <span className="text-[#dfae75] text-xs font-bold">3 MIN</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">DLF Cyber City</span>
                    <span className="text-[#dfae75] text-xs font-bold">18 MIN</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                    <span className="text-xs text-gray-300">IFC Tower</span>
                    <span className="text-[#dfae75] text-xs font-bold">10 MIN</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ================= GALLERY SECTION ================= */}
      <section className="bg-[#242b2e] py-10 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-serif text-[#e4b57b] uppercase tracking-widest">GALLERY</h2>
          </div>

          <GalleryCarousel />

        </div>
      </section>

      {/* ================= UNSURE CTA SECTION ================= */}
      <section className="relative py-24 bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Still Unsure About Selecting The Right Home?</h2>
          <p className="text-xl md:text-2xl mb-8 font-light">Get Answers To All Your Questions</p>
          <button
            onClick={() => setIsPopupOpen(true)}
            className="bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black font-bold py-3 px-10 uppercase tracking-wider hover:scale-105 transition-transform shadow-lg">
            REGISTER NOW
          </button>
        </div>
      </section>

      {/* ================= ENQUIRE FOOTER SECTION ================= */}
      <section className="bg-[#1a1816] py-10 border-t border-[#dfae75]/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

            {/* Left Text */}
            <div className="w-full lg:w-1/3 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl text-[#dfae75] uppercase tracking-widest mb-2 font-serif">ENQUIRE NOW</h2>
              <div className="w-full lg:w-2/3">
                <form onSubmit={handleFooterSubmit} className="flex flex-col md:flex-row items-end gap-6">
                  <div className="w-full relative">
                    <input ref={footerNameRef} type="text" placeholder="Name*" required className="w-full bg-transparent border-b border-gray-600 py-3 text-white focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-500" />
                  </div>
                  <div className="w-full relative">
                    <input ref={footerEmailRef} type="email" placeholder="Email*" required className="w-full bg-transparent border-b border-gray-600 py-3 text-white focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-500" />
                  </div>
                  <div className="w-full relative">
                    <input ref={footerPhoneRef} type="tel" placeholder="Mobile*" required maxLength={10} pattern="[0-9]{10}" onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)} className="w-full bg-transparent border-b border-gray-600 py-3 text-white focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-500" />
                  </div>
                  <div className="w-full relative">
                    <input ref={footerSpecialEnquiryRef} type="text" placeholder="Special Enquiry" className="w-full bg-transparent border-b border-gray-600 py-3 text-white focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-500" />
                  </div>
                  <div className="w-full md:w-auto">
                    <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black font-bold py-3 px-8 uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap shadow-md">
                      SUBMIT
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Copyright/Footer Text */}
            <div className="text-center text-gray-500 text-xs">
              <p className="mt-2 text-sm">
                &copy; 2024 Shapporji Palonji. All Rights Reserved. | <a href="/privacy-policy" className="hover:text-[#dfae75] transition-colors">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <ContactPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} setCurrentPage={setCurrentPage} />
      <VideoPopup
        isOpen={isVideoPopupOpen}
        onClose={() => setIsVideoPopupOpen(false)}
        videoData={activeVideo}
      />
    </div>
  );
};

const GalleryCarousel = () => {
  const images = [
    "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=2070&auto=format&fit=crop"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setItemsToShow(4);
      } else {
        setItemsToShow(1);
      }
    };

    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = images.length - itemsToShow;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = images.length - itemsToShow;
      return prevIndex === 0 ? maxIndex : prevIndex - 1;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [itemsToShow]);

  return (
    <div className="relative w-full max-w-7xl mx-auto h-[300px] md:h-[400px] group">
      <div className="w-full h-full overflow-hidden rounded-lg">
        {/* Image Track */}
        <div
          className="h-full flex transition-transform duration-700 ease-in-out will-change-transform"
          style={{
            transform: `translateX(-${currentIndex * (100 / images.length)}%)`,
            width: `${(images.length / itemsToShow) * 100}%`
          }}
        >
          {images.map((img, index) => (
            <div
              key={index}
              className="h-full p-2 relative box-border"
              style={{ width: `${100 / images.length}%` }}
            >
              <div className="w-full h-full relative overflow-hidden rounded-lg shadow-lg border border-white/10 group-hover:border-[#dfae75]/30 transition-colors">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 bg-[#dfae75] p-3 rounded-full shadow-lg hover:bg-white transition-colors z-20 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 bg-[#dfae75] p-3 rounded-full shadow-lg hover:bg-white transition-colors z-20 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
      </button>

      {/* Dots */}
      <div className="flex justify-center mt-8 gap-2">
        {[...Array(images.length - itemsToShow + 1)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-[#dfae75] w-8' : 'bg-[#dfae75]/30 hover:bg-[#dfae75]'}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default ProjectLanding;

// Video Popup Component
const VideoPopup = ({ isOpen, onClose, videoData }) => {
  if (!isOpen || !videoData) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-[#dfae75] transition-colors text-4xl font-bold p-2"
        >
          ×
        </button>

        {/* Video Container */}
        <div className="relative w-full aspect-video">
          {videoData.type === 'youtube' ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl border-2 border-[#dfae75]/20"
              src={`https://www.youtube.com/embed/${videoData.src}?autoplay=1`}
              title="Project Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : videoData.type === 'cloudinary' ? (
            <iframe
              src={videoData.src}
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl border-2 border-[#dfae75]/20"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            ></iframe>
          ) : (
            <video
              autoPlay
              muted
              playsInline
              controls
              src={videoData.src}
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl border-2 border-[#dfae75]/20"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactPopup = ({ isOpen, onClose, setCurrentPage }) => {
  const popupNameRef = useRef(null);
  const popupEmailRef = useRef(null);
  const popupPhoneRef = useRef(null);
  const popupSpecialEnquiryRef = useRef(null);

  const whatsappNumber = "+91000000";

  const handlePopupSubmit = async (e) => {
    e.preventDefault();
    const name = (popupNameRef.current?.value || "").trim();
    const email = (popupEmailRef.current?.value || "").trim();
    const phone = (popupPhoneRef.current?.value || "").trim();
    const specialEnquiry = (popupSpecialEnquiryRef.current?.value || "").trim();

    // Save to backend
    try {
      await api.post('/project-enquiries', {
        name,
        email,
        phone,
        message: "Popup Enquiry from Shapoorji Pallonji Dualis Landing Page",
        specialEnquiry,
        project: "Shapoorji Pallonji Dualis"
      });
    } catch (error) {
      console.error("Error saving enquiry:", error);
    }

    setCurrentPage("thank-you");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-md bg-[#1c1915] border border-[#dfae75]/30 p-8 rounded-lg shadow-2xl animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h3 className="text-2xl font-serif text-[#dfae75] mb-2 text-center uppercase tracking-wide">Enquire Now</h3>
        <p className="text-gray-400 text-center mb-6 text-sm tracking-wider">Register Here And Get The Best Offers</p>

        <form onSubmit={handlePopupSubmit} className="space-y-4">
          <div>
            <input ref={popupNameRef} type="text" placeholder="Name*" required className="w-full bg-black/30 border border-gray-700 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-500" />
          </div>
          <div>
            <input ref={popupEmailRef} type="email" placeholder="Email*" required className="w-full bg-black/30 border border-gray-700 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-500" />
          </div>
          <div>
            <input ref={popupPhoneRef} type="tel" placeholder="Mobile*" required maxLength={10} pattern="[0-9]{10}" onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)} className="w-full bg-black/30 border border-gray-700 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-500" />
          </div>
          <div>
            <input ref={popupSpecialEnquiryRef} type="text" placeholder="Special Enquiry" className="w-full bg-black/30 border border-gray-700 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#dfae75] transition-colors placeholder-gray-500" />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-[#dfae75] to-[#cfa065] text-black font-bold py-3 uppercase tracking-wider hover:opacity-90 transition-opacity rounded-sm mt-2 shadow-lg">
            SUBMIT
          </button>
        </form>
      </div>
    </div>
  );
};

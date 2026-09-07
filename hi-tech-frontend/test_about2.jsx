import { Target, Eye, Award, ShieldCheck, MapPin, Sparkles, Building2, UserCheck, Quote, CheckCircle2, TrendingUp, Users, Linkedin, Twitter, Mail, Handshake } from "lucide-react";
import chiragImage from "../assets/chirag_sharma.jpg";
import rajeevImage from "../assets/rajeev_bharadwaj.jpg";
import ChannelPartners from "../components/ChannelPartners";
import Reveal from "../components/home/Reveal";

const About = ({ setCurrentPage }) => {
  return (
    <div className="bg-white overflow-x-hidden font-sans text-gray-800">
      
      {/* ===== HERO / ABOUT INTRODUCTION (DARK THEME) ===== */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-32 px-4 sm:px-6 lg:px-8 bg-[#0B1021]">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] bg-[#2e1065] rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8">
              <Reveal variant="up" duration={600}>
                <div className="inline-flex items-center gap-2 bg-indigo-950/60 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-indigo-500/30">
                  <Sparkles size={14} className="text-rose-400" />
                  <span className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-indigo-200">
                    About Brothers Realestate
                  </span>
                </div>
              </Reveal>

              <Reveal variant="up" delay={100} duration={600}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight font-display">
                  Building Trust.<br/>
                  Delivering <span className="text-rose-500">Dreams.</span>
                </h1>
                <div className="w-16 h-1 bg-rose-500 mt-6 rounded-full"></div>
              </Reveal>

              <Reveal variant="up" delay={200} duration={600}>
                <div className="space-y-4 text-indigo-100/80 text-sm md:text-base leading-relaxed max-w-lg">
                  <p>
                    Brothers Realestate is a real estate advisory firm bringing transparency, trust and results to every real estate journey. We help you find the right property, make informed decisions and create lasting value.
                  </p>
                </div>
              </Reveal>

              <Reveal variant="up" delay={300} duration={600}>
                <div className="bg-indigo-950/40 backdrop-blur-sm border border-indigo-500/20 border-l-4 border-l-rose-500 p-5 rounded-r-xl max-w-lg flex gap-4 mt-6">
                  <Quote className="text-indigo-400 shrink-0 mt-1" size={24} />
                  <p className="text-indigo-50 text-sm md:text-base font-medium italic leading-relaxed">
                    "Our goal is simple � to place our client's interest above all else and be a partner in their real estate success story."
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Right Content - Image & Stats */}
            <Reveal variant="left" delay={200} duration={800} className="relative mt-8 lg:mt-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-[16/10] group">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80"
                  alt="Luxury Real Estate"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Floating Stats Bar */}
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#0B1021]/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl flex flex-wrap justify-between items-center gap-4 sm:gap-0">
                  
                  <div className="flex items-center gap-3 w-[45%] sm:w-auto">
                    <div className="w-10 h-10 rounded-full border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Users className="text-indigo-300" size={18} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-tight">15+</p>
                      <p className="text-indigo-200 text-[9px] font-medium uppercase tracking-wider">Years of Experience</p>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-8 bg-white/10"></div>

                  <div className="flex items-center gap-3 w-[45%] sm:w-auto">
                    <div className="w-10 h-10 rounded-full border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Building2 className="text-indigo-300" size={18} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-tight">5000+</p>
                      <p className="text-indigo-200 text-[9px] font-medium uppercase tracking-wider">Happy Clients</p>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-8 bg-white/10"></div>

                  <div className="flex items-center gap-3 w-[45%] sm:w-auto">
                    <div className="w-10 h-10 rounded-full border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Handshake className="text-indigo-300" size={18} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-tight">1000Cr+</p>
                      <p className="text-indigo-200 text-[9px] font-medium uppercase tracking-wider">Worth of Properties Sold</p>
                    </div>
                  </div>

                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Diagonal white sweep separating hero and leaders */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
          <svg className="block w-full h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 120 0 60 1200 0 1200 120z" fill="#f9fafb"></path>
          </svg>
        </div>
      </section>

      {/* ===== LEADERSHIP SECTION (WHITE BACKGROUND) ===== */}
      <section className="relative z-10 py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal variant="up">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1021] font-display">
                Meet <span className="text-rose-500">Our</span> Leaders
              </h2>
              <div className="w-16 h-1 bg-rose-500 mx-auto rounded-full mt-4"></div>
            </Reveal>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            
            {/* Chirag Sharma */}
            <Reveal variant="up" delay={100} className="h-full">
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start group hover:-translate-y-1 transition-transform duration-300 h-full">
                <div className="shrink-0 relative">
                  <div className="w-32 h-40 sm:w-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                    <img
                      src={chiragImage}
                      alt="Chirag Sharma - Founder & CEO"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800";
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex-1 text-center sm:text-left flex flex-col h-full justify-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0B1021] mb-1">Chirag Sharma</h3>
                  <p className="text-rose-500 font-bold text-xs tracking-wider uppercase mb-4">
                    Co-Founder & CEO
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Visionary leader with deep market knowledge and a passion for creating value-driven real estate solutions.
                  </p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-auto">
                    <a href="#" className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                      <Linkedin size={14} />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors">
                      <Twitter size={14} />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                      <Mail size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Rajeev Bharadwaj */}
            <Reveal variant="up" delay={200} className="h-full">
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start group hover:-translate-y-1 transition-transform duration-300 h-full">
                <div className="shrink-0 relative">
                  <div className="w-32 h-40 sm:w-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                    <img
                      src={rajeevImage}
                      alt="Rajeev Bharadwaj - Co Founder"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                
                <div className="flex-1 text-center sm:text-left flex flex-col h-full justify-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0B1021] mb-1">Rajeev Bharadwaj</h3>
                  <p className="text-rose-500 font-bold text-xs tracking-wider uppercase mb-4">
                    Co-Founder
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Strategic thinker with expertise in investments and client relations, ensuring trust and long-term partnerships.
                  </p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-auto">
                    <a href="#" className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                      <Linkedin size={14} />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors">
                      <Twitter size={14} />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                      <Mail size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ===== MISSION, VISION & VALUES ===== */}
      <section className="relative z-10 pt-4 pb-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal variant="up" delay={300}>
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-gray-100">
                
                {/* Mission */}
                <div className="flex flex-col text-center items-center lg:px-6">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-5">
                    <Target size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B1021] mb-2 font-display">Our Mission</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    To deliver exceptional real estate experiences with honesty, transparency and dedication.
                  </p>
                </div>

                {/* Vision */}
                <div className="flex flex-col text-center items-center lg:px-6">
                  <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-5">
                    <Eye size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B1021] mb-2 font-display">Our Vision</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    To be the most trusted real estate brand known for results and lasting relationships.
                  </p>
                </div>

                {/* Values */}
                <div className="flex flex-col text-center items-center lg:px-6">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-5">
                    <Sparkles size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B1021] mb-2 font-display">Our Values</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    Integrity, transparency, excellence and client-first approach drive everything we do.
                  </p>
                </div>

                {/* Why Choose Us */}
                <div className="flex flex-col text-center items-center lg:px-6">
                  <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-5">
                    <Users size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B1021] mb-2 font-display">Why Choose Us</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    Expert guidance, wide network and commitment to help you achieve your property goals.
                  </p>
                </div>

              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FEATURE STRIP ===== */}
      <section className="relative z-20 -mb-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <div className="bg-[#0B1021] rounded-2xl shadow-xl p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-white/10">
              
              <div className="flex items-center gap-4 lg:px-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Detailed Insights</h4>
                  <p className="text-[11px] text-indigo-200 mt-0.5">In-depth market research</p>
                </div>
              </div>

              <div className="flex items-center gap-4 lg:px-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Building2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Verified Listings</h4>
                  <p className="text-[11px] text-indigo-200 mt-0.5">100% verified properties</p>
                </div>
              </div>

              <div className="flex items-center gap-4 lg:px-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Trusted Network</h4>
                  <p className="text-[11px] text-indigo-200 mt-0.5">Strong developer & partner tie-ups</p>
                </div>
              </div>

              <div className="flex items-center gap-4 lg:px-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">End-to-End Support</h4>
                  <p className="text-[11px] text-indigo-200 mt-0.5">From search to possession</p>
                </div>
              </div>

            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== CHANNEL PARTNERS ===== */}
      <ChannelPartners theme="dark" />

    </div>
  );
};

export default About;


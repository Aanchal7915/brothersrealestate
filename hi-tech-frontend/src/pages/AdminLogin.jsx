import { useState, useContext, useEffect, useCallback } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Home, ArrowRight, MapPin, CheckCircle2 } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo1.png";

// The server refuses an admin sign-in without coordinates, so gather them
// before the form can be submitted rather than failing the request. Requires
// a secure context — browsers disable the Geolocation API entirely over
// plain HTTP, so on a non-HTTPS host this never resolves.
const GEO_OPTIONS = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

const geoErrorMessage = (err) => {
  if (!window.isSecureContext) {
    return "Location needs a secure (HTTPS) connection. Open the admin panel over https:// and try again.";
  }
  switch (err?.code) {
    case 1:
      return "Location permission was blocked. Allow location for this site in your browser settings, then click Retry.";
    case 2:
      return "Your location could not be determined. Check that location services are switched on for your device.";
    case 3:
      return "Timed out while getting your location. Move somewhere with a better signal and click Retry.";
    default:
      return "Could not read your location. Enable location access and click Retry.";
  }
};

const AdminLogin = ({ setCurrentPage }) => {
  const { login: adminLogin } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "", securityPasscode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [coords, setCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | requesting | granted | denied
  const [geoError, setGeoError] = useState("");

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      setGeoError("This browser does not support location access, which is required for admin sign-in.");
      return;
    }

    setGeoStatus("requesting");
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setGeoStatus("granted");
      },
      (err) => {
        setCoords(null);
        setGeoStatus("denied");
        setGeoError(geoErrorMessage(err));
      },
      GEO_OPTIONS
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password || !formData.securityPasscode) {
      setError("Please enter your email, password and security passcode");
      return;
    }

    if (!coords) {
      setError("Location access is required to sign in. Enable it below and try again.");
      return;
    }

    setLoading(true);

    try {
      // Coarse city label, purely a cross-check against the coordinates in
      // the audit log. Best-effort: never block the login on it, and never
      // send an IP — the server reads the real one from request headers.
      let approxLocation = "";
      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        const ipData = await ipRes.json();
        if (ipData && !ipData.error) {
          approxLocation = `${ipData.city || ""}, ${ipData.region || ""}, ${ipData.country_name || ""}`
            .trim()
            .replace(/^, |, $/g, "");
        }
      } catch {
        // Ignore — this field is optional metadata.
      }

      // No fallback to a regular user login: a site user is not an admin,
      // and the server no longer accepts a user token on admin routes.
      const data = await adminLogin(
        formData.email,
        formData.password,
        formData.securityPasscode,
        coords,
        approxLocation
      );

      if (data.success) {
        setCurrentPage("admin-dashboard");
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Top right Back to Home */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50">
        <button
          onClick={() => handleNavigate("home")}
          className="flex items-center gap-2 border border-gold/40 hover:bg-gold/10 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-lg"
        >
          <Home size={16} className="text-gold" />
          Back to Home
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center p-4 md:p-6">
        <div className="flex flex-col md:flex-row w-full max-w-[900px] min-h-[540px] bg-[#111111] rounded-2xl overflow-hidden border border-gold/30 shadow-[0_0_50px_rgba(193,162,101,0.08)]">
          {/* Left Side */}
          <div className="hidden md:flex flex-col justify-center items-center w-1/2 relative overflow-hidden border-r border-gold/20 bg-[#080808]">
            {/* Dark elegant background pattern / lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(to right, rgba(193,162,101,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(193,162,101,0.2) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10 flex flex-col items-center p-10 text-center">
              <img
                src={logo}
                alt="Brothers Real Estate Logo"
                className="h-40 w-auto object-contain mb-6 drop-shadow-[0_0_20px_rgba(193,162,101,0.3)] transition-transform duration-500 hover:scale-105"
              />
              <h1 className="text-3xl tracking-[0.25em] font-serif text-white mb-2 uppercase drop-shadow-md">
                Brothers <span className="text-gold">Real Estate</span>
              </h1>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-[1px] w-8 bg-gold/50"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-gold shadow-[0_0_10px_rgba(193,162,101,0.8)]"></div>
                <div className="h-[1px] w-8 bg-gold/50"></div>
              </div>
              <p className="text-white/60 text-xs leading-loose max-w-[260px]">
                Building dreams into reality — manage your listings, enquiries, and more from the admin dashboard.
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-[#111111] relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif mb-2 tracking-wide">
                Welcome <span className="text-gold">Back</span>
              </h2>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-[1px] w-8 bg-white/10"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-gold/70"></div>
                <div className="h-[1px] w-8 bg-white/10"></div>
              </div>
              <p className="text-white/40 text-xs">
                Sign in to continue to your admin dashboard
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-3 mb-5 text-red-400 bg-red-950/20 border border-red-900/40 rounded-lg text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60 group-focus-within:text-gold transition-colors" size={16} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="admin-login-input w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-xs shadow-inner"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60 group-focus-within:text-gold transition-colors" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="admin-login-input w-full pl-10 pr-10 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-xs shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/80 hover:text-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Security Passcode */}
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60 group-focus-within:text-gold transition-colors" size={16} />
                <input
                  type={showPasscode ? "text" : "password"}
                  placeholder="Admin Security Passcode"
                  value={formData.securityPasscode}
                  onChange={(e) => setFormData({ ...formData, securityPasscode: e.target.value })}
                  required
                  className="admin-login-input w-full pl-10 pr-10 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-xs shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/80 hover:text-gold transition-colors"
                >
                  {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-xs py-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-3.5 h-3.5 border border-white/20 rounded bg-[#0a0a0a] checked:bg-gold checked:border-gold transition-colors cursor-pointer"
                    />
                    <svg className="absolute w-2.5 h-2.5 text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-white/50 group-hover:text-white/80 transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-gold hover:text-gold-light transition-colors font-medium hover:underline underline-offset-2 decoration-gold/50"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Location gate — the server rejects an admin sign-in with no
                  coordinates, so surface the permission state here instead of
                  letting the request fail. */}
              <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin
                    size={15}
                    className={`mt-0.5 shrink-0 ${geoStatus === "granted" ? "text-emerald-400" : "text-gold/70"}`}
                  />
                  <div className="flex-1 min-w-0">
                    {geoStatus === "granted" ? (
                      <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 size={13} className="shrink-0" />
                        Location confirmed
                        <span className="font-normal text-white/40">
                          (±{Math.round(coords?.accuracy ?? 0)} m)
                        </span>
                      </p>
                    ) : geoStatus === "requesting" ? (
                      <p className="text-white/60 font-semibold">Getting your location…</p>
                    ) : (
                      <>
                        <p className="text-amber-400 font-semibold mb-1">Location access required</p>
                        <p className="text-white/50 leading-relaxed">
                          {geoError || "Admin sign-in records where it was used. Allow location to continue."}
                        </p>
                        <button
                          type="button"
                          onClick={requestLocation}
                          className="mt-2 text-gold hover:text-gold-light font-semibold underline underline-offset-2 decoration-gold/50 transition-colors"
                        >
                          Retry
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !coords}
                className="group w-full py-3 mt-1 rounded-lg bg-gradient-to-r from-gold to-[#f3e5ab] text-black font-bold text-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-4 text-white/20">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">OR</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => handleNavigate("home")}
                className="text-white/40 hover:text-gold text-xs font-medium transition-colors flex items-center justify-center gap-1.5 mx-auto group"
              >
                <ArrowRight size={12} className="rotate-180 transition-transform group-hover:-translate-x-1" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

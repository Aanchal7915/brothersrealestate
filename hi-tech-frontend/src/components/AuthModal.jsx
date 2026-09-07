import { useState, useContext, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
} from "lucide-react";
import { UserAuthContext } from "../context/UserAuthContext";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo1.png";

const AuthModal = ({ isOpen, onClose, setCurrentPage }) => {
  const { login: userLogin, signup, sendOtp } = useContext(UserAuthContext);
  const { login: adminLogin } = useContext(AuthContext);

  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    otp: "",
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if email is admin
  useEffect(() => {
    if (formData.email.toLowerCase() === "admin@gmail.com") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [formData.email]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", email: "", password: "", phone: "", otp: "" });
      setError("");
      setMode("login");
      setIsAdmin(false);
      setShowPassword(false);
      setIsOtpSent(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isAdmin) {
        // Admin Login
        const result = await adminLogin(formData.email, formData.password);
        if (result.success) {
          onClose();
          setCurrentPage("admin-dashboard");
        } else {
          setError(result.message || "Invalid admin credentials");
        }
      } else if (mode === "login") {
        // User Login
        const result = await userLogin(formData.email, formData.password);
        if (result.success) {
          onClose();
        } else {
          setError(result.message || "Invalid credentials");
        }
      } else {
        // User Signup Flow
        if (!isOtpSent) {
          // Step 1: Send OTP
          if (!formData.name || !formData.email || !formData.password || !formData.phone) {
            setError("Please fill all details before proceeding.");
            setLoading(false);
            return;
          }
          const result = await sendOtp(formData.email);
          if (result.success) {
            setIsOtpSent(true);
          } else {
            setError(result.message || "Failed to send OTP");
          }
        } else {
          // Step 2: Verify OTP & Signup
          if (!formData.otp) {
            setError("Please enter the OTP sent to your email.");
            setLoading(false);
            return;
          }
          const result = await signup(
            formData.name,
            formData.email,
            formData.password,
            formData.phone,
            formData.otp
          );
          if (result.success) {
            onClose();
          } else {
            setError(result.message || "Signup failed");
          }
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
    setIsOtpSent(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 py-20 animate-fadeIn overflow-y-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-ivory rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-red-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

      {/* Modal Container */}
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8 animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col justify-center items-center bg-ivory p-10 w-1/2">
          <div className="mb-6 transition-transform duration-500 hover:scale-105">
            <img
              src={logo}
              alt="Brothers Realestate Logo"
              className="h-32 w-auto object-contain drop-shadow-lg"
            />
          </div>
          <h1
            className="text-4xl font-extrabold text-gray-900 text-center leading-snug"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Brothers <span className="text-matte">Estate</span>
          </h1>
          <p
            className="text-gray-500 mt-4 text-center max-w-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {isAdmin
              ? "Building dreams into reality – manage your listings, enquiries, and more from the admin dashboard."
              : mode === "login"
              ? "Welcome back! Login to explore amazing properties and find your dream home."
              : "Join our community and start your journey to finding the perfect property."}
          </p>
          {isAdmin && (
            <div className="mt-6 flex items-center gap-2 text-matte bg-sky
            -50 px-4 py-2 rounded-full">
              <Shield size={16} />
              <span className="text-sm font-semibold">
                Admin Access Detected
              </span>
            </div>
          )}
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2
            className="text-3xl font-bold text-gray-900 text-center mb-2"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {isAdmin
              ? "Admin Dashboard"
              : mode === "login"
              ? "Welcome Back"
              : "Create Account"}
          </h2>
          <p
            className="text-gray-500 text-center mb-8"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {isAdmin
              ? "Sign in to continue to your dashboard"
              : mode === "login"
              ? "Login to explore amazing properties"
              : "Join Brothers Realestate to find your dream property"}
          </p>

          {error && (
            <div
              className="flex items-center gap-2 p-4 mb-6 text-red-700 bg-red-100 border border-red-300 rounded-xl text-sm font-semibold"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field - Only for Signup */}
            {mode === "signup" && !isAdmin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={isOtpSent}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:border-matte focus:ring-2 focus:ring-black/10 transition-all duration-300 text-gray-800 disabled:opacity-60"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={isOtpSent && mode === "signup"}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:border-matte focus:ring-2 focus:ring-black/10 transition-all duration-300 text-gray-800 disabled:opacity-60"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            {/* Phone Field - Only for Signup */}
            {mode === "signup" && !isAdmin && (
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                  }
                  disabled={isOtpSent}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:border-matte focus:ring-2 focus:ring-black/10 transition-all duration-300 text-gray-800 disabled:opacity-60"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>
            )}

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={isOtpSent && mode === "signup"}
                required
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:border-matte focus:ring-2 focus:ring-black/10 transition-all duration-300 text-gray-800 disabled:opacity-60"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-matte transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* OTP Field - Only for Signup when OTP is sent */}
            {mode === "signup" && !isAdmin && isOtpSent && (
              <div className="relative animate-fadeIn">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })
                  }
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-green-300 rounded-xl bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 text-gray-800"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                <p className="text-xs text-green-600 mt-2 ml-1">OTP sent to your email. Expires in 5 minutes.</p>
              </div>
            )}

            {/* Remember Me - Only for Login */}
            {mode === "login" && (
              <div
                className="flex items-center justify-between text-sm"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-gold" />
                  <span className="text-gray-600">Remember me</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-bold text-lg transition-all duration-300 ${
                loading
                  ? "bg-matte/20 cursor-not-allowed opacity-80"
                  : isAdmin
                  ? "bg-matte hover:shadow-xl hover:scale-[1.02]"
                  : "bg-matte hover:shadow-xl hover:scale-[1.02]"
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isAdmin
                    ? "Logging in..."
                    : mode === "login"
                    ? "Logging in..."
                    : "Creating Account..."}
                </span>
              ) : isAdmin ? (
                "Sign In as Admin"
              ) : mode === "login" ? (
                "Sign In"
              ) : isOtpSent ? (
                "Verify OTP & Create Account"
              ) : (
                "Send OTP to Email"
              )}
            </button>
          </form>

          {/* Toggle Login/Signup - Hide for Admin */}
          {!isAdmin && (
            <div className="text-center mt-8">
              <p
                className="text-gray-600 text-sm"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-matte hover:text-red-500 font-semibold transition-colors"
                >
                  {mode === "login" ? "Sign up here" : "Login here"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;

import { useState } from "react";
import api from "../utils/api";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  ChevronRight,
  Phone,
  Mail,
  Wifi,
  Car,
  Dumbbell,
  Shield,
  Send,
  Heart,
  Share2,
  Camera,
} from "lucide-react";

const PropertyDetails = ({ setCurrentPage }) => {
  // Demo property data
  const property = {
    _id: "1",
    title: "Luxury Villa with Sea View",
    address: "Marine Drive, Mumbai",
    city: "Mumbai",
    price: 12500000,
    bhk: 4,
    bathrooms: 3,
    area: 2500,
    description:
      "Experience luxury living at its finest in this stunning villa featuring breathtaking sea views, premium finishes, and world-class amenities. This architectural masterpiece combines modern elegance with timeless design, offering spacious living areas, high ceilings, and floor-to-ceiling windows that flood the space with natural light.",
    amenities: [
      "Swimming Pool",
      "Gym",
      "Parking",
      "24/7 Security",
      "Power Backup",
      "Clubhouse",
      "Garden",
      "Kids Play Area",
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      },
      {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      },
      {
        url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
      },
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      },
      {
        url: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800",
      },
    ],
    video: null,
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setLoading(false);
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  const amenityIcons = [
    Wifi,
    Dumbbell,
    Car,
    Shield,
    Wifi,
    Dumbbell,
    Car,
    Shield,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <span
              onClick={() => setCurrentPage && setCurrentPage("home")}
              className="text-gray-600 hover:text-matte cursor-pointer transition-colors"
            >
              Home
            </span>
            <ChevronRight size={16} className="text-gray-400" />
            <span
              onClick={() => setCurrentPage && setCurrentPage("listings")}
              className="text-gray-600 hover:text-matte cursor-pointer transition-colors"
            >
              Properties
            </span>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-semibold">
              {property.title}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Gallery */}
      <div className="relative bg-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-4 gap-3 h-[500px]">
            {/* Main Image */}
            <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src={property.images[0].url}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                <Camera size={18} className="text-matte" />
                <span className="font-semibold text-gray-900">
                  {property.images.length} Photos
                </span>
              </div>
            </div>

            {/* Additional Images */}
            {property.images.slice(1, 5).map((image, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={image.url}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold text-sm shadow-lg">
                      For Sale
                    </span>
                    <button
                      onClick={() => setLiked(!liked)}
                      className={`p-2 rounded-full transition-all duration-300 ${
                        liked
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      <Heart size={20} fill={liked ? "currentColor" : "none"} />
                    </button>
                    <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-ivory hover:text-matte transition-all duration-300">
                      <Share2 size={20} />
                    </button>
                  </div>
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={20} className="text-matte" />
                    <span className="text-lg">{property.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black bg-matte bg-clip-text text-transparent">
                    ₹{(property.price / 10000000).toFixed(2)}Cr
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Total Price</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                {[
                  {
                    icon: <Bed size={28} />,
                    value: property.bhk,
                    label: "Bedrooms",
                    color: "from-matte to-matte",
                  },
                  {
                    icon: <Bath size={28} />,
                    value: property.bathrooms,
                    label: "Bathrooms",
                    color: "from-matte to-matte",
                  },
                  {
                    icon: <Square size={28} />,
                    value: property.area,
                    label: "Sq. Ft.",
                    color: "from-orange-500 to-orange-600",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-300"
                  >
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${stat.color} text-white rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-8 bg-matte rounded-full"></div>
                Property Description
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-matte rounded-full"></div>
                Features & Amenities
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity, idx) => {
                  const Icon = amenityIcons[idx % amenityIcons.length];
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-matte text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon size={22} />
                      </div>
                      <span className="font-semibold text-gray-800">
                        {amenity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Enquiry Form */}
          <div className="sticky top-24 h-fit">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 overflow-hidden">
              {/* Price Banner */}
              <div className="relative -m-6 mb-6 p-6 bg-matte text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="text-sm font-semibold opacity-90 mb-1">
                    Starting From
                  </div>
                  <div className="text-4xl font-black mb-1">
                    ₹{property.price.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm opacity-90">Total Price</div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Send Enquiry
              </h2>

              {submitted ? (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl text-green-800">
                  <p className="font-bold text-lg mb-1">Thank you!</p>
                  <p className="text-sm">
                    Your enquiry has been submitted successfully.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-matte focus:ring-4 focus:ring-black/10 transition-all duration-300 text-gray-900 font-medium"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-matte focus:ring-4 focus:ring-black/10 transition-all duration-300 text-gray-900 font-medium"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-matte focus:ring-4 focus:ring-black/10 transition-all duration-300 text-gray-900 font-medium"
                  />
                  <textarea
                    placeholder="I'm interested in this property..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:border-matte focus:ring-4 focus:ring-black/10 transition-all duration-300 text-gray-900 font-medium resize-none h-28"
                  ></textarea>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      loading
                        ? "bg-matte/20 cursor-not-allowed opacity-80"
                        : "bg-matte hover:shadow-2xl hover:scale-105 shadow-lg"
                    }`}
                  >
                    <Send size={20} />
                    {loading ? "Sending..." : "Submit Enquiry"}
                  </button>
                </div>
              )}

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-ivory transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-ivory rounded-lg flex items-center justify-center group-hover:bg-matte/20 transition-colors">
                    <Phone size={18} className="text-matte" />
                  </div>
                  <span className="text-gray-700 font-semibold">
                    +91-123456 7899
                  </span>
                   <span className="text-gray-700 font-semibold">
                    +91-123456 7899
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-ivory transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-ivory rounded-lg flex items-center justify-center group-hover:bg-matte/20 transition-colors">
                    <Mail size={18} className="text-matte" />
                  </div>
                  <span className="text-gray-700 font-semibold">
                    info@brothersestate.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

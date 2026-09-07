import { useContext, useMemo, useState } from "react";
import { Search, MapPin, Building2, Wallet } from "lucide-react";
import { PropertyContext } from "../../context/PropertyContext";
import { PROPERTY_TYPE_OPTIONS } from "../../utils/propertyType";

// Price bands mirror the values Listings.jsx / RentalListings.jsx already parse ("min-max").
const SALE_BUDGETS = [
  { value: "", label: "Any Budget" },
  { value: "0-2000000", label: "Under ₹20 Lakhs" },
  { value: "2000000-5000000", label: "₹20L - ₹50L" },
  { value: "5000000-10000000", label: "₹50L - ₹1 Cr" },
  { value: "10000000-99999999", label: "Above ₹1 Cr" },
];

const fieldClass =
  "w-full appearance-none rounded-xl border border-black/10 bg-white py-3 pl-11 pr-4 text-sm font-medium text-matte outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

const PropertySearch = ({ setCurrentPage }) => {
  const { properties = [] } = useContext(PropertyContext);
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");

  const cities = useMemo(
    () => [...new Set((properties || []).map((p) => p.city).filter(Boolean))].sort(),
    [properties]
  );

  const budgets = SALE_BUDGETS;

  const handleSearch = () => {
    // Handshake: the destination page reads this on mount and applies the filters.
    try {
      localStorage.setItem(
        "listingsFilter",
        JSON.stringify({
          type: "search",
          location,
          propertyType,
          priceRange: budget,
        })
      );
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

  return (
    <div
      className="ce-rise relative z-20 mx-auto mt-6 max-w-6xl px-4 sm:mt-10 sm:px-6 lg:px-8"
      style={{ "--d": "700ms" }}
    >
      <div className="overflow-hidden bg-white shadow-float ring-1 ring-black/[0.08] transition-shadow duration-300 hover:shadow-[0_28px_70px_-20px_rgba(12,12,13,0.3)]">
        {/* Fields */}
        <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end lg:gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-matte/45">Location</span>
            <span className="relative block">
              <MapPin
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold"
              />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={fieldClass}
              >
                <option value="">All locations</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-matte/45">Property Type</span>
            <span className="relative block">
              <Building2
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold"
              />
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-ivory disabled:text-matte/40`}
              >
                <option value="">Select type</option>
                {PROPERTY_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-matte/45">Budget</span>
            <span className="relative block">
              <Wallet
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold"
              />
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={fieldClass}
              >
                {budgets.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <button
            onClick={handleSearch}
            className="group inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-matte px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-matte active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:hover:translate-y-0 md:col-span-2 lg:col-span-1 lg:w-auto"
          >
            <Search
              size={18}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            Search Properties
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;

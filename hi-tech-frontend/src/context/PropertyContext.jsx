import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  // ✅ Always initialize with an empty array
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    bhk: "",
  });

  /**
   * Fetch all properties from backend
   */
  // The API paginates at 10 by default. Every page filters client-side, so
  // pull the full set unless a caller asks for something specific.
  const fetchProperties = async (query = "?limit=200") => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/properties${query}`);

      if (response?.data?.success && Array.isArray(response.data.data)) {
        setProperties(response.data.data);
        setFilteredProperties(response.data.data);
      } else {
        console.warn("Unexpected response:", response.data);
        setProperties([]);
        setFilteredProperties([]);
      }
    } catch (error) {
      console.error("❌ Error fetching properties:", error.message);
      setError("Failed to load properties. Please try again later.");
      setProperties([]);
      setFilteredProperties([]);
    }

    setLoading(false);
  };

  /**
   * Apply filters locally on properties array
   */
  const applyFilters = () => {
    // ✅ Defensive fallback for undefined or non-array
    let filtered = Array.isArray(properties) ? [...properties] : [];

    if (filters.city) {
      filtered = filtered.filter((p) =>
        p.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(
        (p) => parseFloat(p.price) >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(
        (p) => parseFloat(p.price) <= parseFloat(filters.maxPrice)
      );
    }

    if (filters.bhk) {
      filtered = filtered.filter(
        (p) => String(p.bhk) === String(filters.bhk)
      );
    }

    setFilteredProperties(filtered);
  };

  /**
   * Reapply filters whenever properties or filters change
   */
  useEffect(() => {
    applyFilters();
  }, [filters, properties]);

  /**
   * Fetch all properties on mount (if needed)
   */
  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <PropertyContext.Provider
      value={{
        properties,
        filteredProperties,
        loading,
        error,
        fetchProperties,
        filters,
        setFilters,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};
import { createContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

export const CategoryContext = createContext();

/**
 * Categories are scoped to where they were created: the Rental Property page
 * keeps its own set, and Add Property has a separate one. `categories` holds
 * the rental set (what the public rental strip uses); `propertyCategories`
 * holds the ones created from Add Property.
 */
export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [propertyCategories, setPropertyCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/categories?scope=rental");
      if (response?.data?.success && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("❌ Error fetching rental categories:", err.message);
      setError("Failed to load rental categories. Please try again later.");
      setCategories([]);
    }
    setLoading(false);
  }, []);

  const fetchPropertyCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories?scope=property");
      setPropertyCategories(
        response?.data?.success && Array.isArray(response.data.data)
          ? response.data.data
          : []
      );
    } catch (err) {
      console.error("❌ Error fetching property categories:", err.message);
      setPropertyCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchPropertyCategories();
  }, [fetchCategories, fetchPropertyCategories]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        propertyCategories,
        loading,
        error,
        fetchCategories,
        fetchPropertyCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

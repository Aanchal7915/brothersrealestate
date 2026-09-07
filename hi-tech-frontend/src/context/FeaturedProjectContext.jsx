import { createContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

export const FeaturedProjectContext = createContext();

const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Featured Listing showcase projects. These live in their own collection and
 * never appear on the Listings or Rental pages.
 */
export const FeaturedProjectProvider = ({ children }) => {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFeaturedProjects = useCallback(async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/featured-projects${query}`);
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setFeaturedProjects(res.data.data);
      } else {
        setFeaturedProjects([]);
      }
    } catch (err) {
      console.error("❌ Error fetching featured projects:", err.message);
      setError("Failed to load featured projects.");
      setFeaturedProjects([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFeaturedProjects();
  }, [fetchFeaturedProjects]);

  /**
   * A record may exist both here and in the ordinary `properties` collection.
   * Wherever a card is clicked, this decides which brochure it belongs to:
   * the Featured Listing record when one matches, otherwise null.
   */
  const findFeatured = useCallback(
    (property) => {
      if (!property) return null;
      const key = norm(property.slug || property.title);
      if (!key) return null;
      return (
        featuredProjects.find((f) => norm(f.slug) === key) ||
        featuredProjects.find((f) => norm(f.title) === key) ||
        null
      );
    },
    [featuredProjects]
  );

  return (
    <FeaturedProjectContext.Provider
      value={{ featuredProjects, loading, error, fetchFeaturedProjects, findFeatured }}
    >
      {children}
    </FeaturedProjectContext.Provider>
  );
};

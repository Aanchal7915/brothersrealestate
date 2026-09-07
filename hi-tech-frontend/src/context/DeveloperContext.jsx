import { createContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

export const DeveloperContext = createContext();

// Developer Partners (requirements doc section 8) — admin-managed list backing
// the homepage "Developer Partners" strip and each project's "About the
// Developer" section.
export const DeveloperProvider = ({ children }) => {
  const [developers, setDevelopers] = useState([]);
  // Starts true (not false) so the very first render already knows a fetch
  // is in flight — otherwise consumers can't tell "no data yet" apart from
  // "genuinely zero developers" and flash fallback/empty content for a frame.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDevelopers = useCallback(async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/developers${query}`);
      if (response?.data?.success && Array.isArray(response.data.data)) {
        setDevelopers(response.data.data);
      } else {
        setDevelopers([]);
      }
    } catch (err) {
      console.error("Error fetching developers:", err.message);
      setError("Failed to load developers. Please try again later.");
      setDevelopers([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDevelopers();
  }, [fetchDevelopers]);

  return (
    <DeveloperContext.Provider value={{ developers, loading, error, fetchDevelopers }}>
      {children}
    </DeveloperContext.Provider>
  );
};

import { createContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

export const CompanySettingsContext = createContext();

// Admin-editable company contact details (requirements doc section 13/14).
// `settings` starts empty until the fetch resolves — consumers should fall
// back to the static defaults in config/site.js for anything not yet set.
export const CompanySettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get("/company-settings");
      setSettings(res?.data?.data && typeof res.data.data === "object" ? res.data.data : {});
    } catch (err) {
      console.error("Error fetching company settings:", err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <CompanySettingsContext.Provider value={{ settings, loading, fetchSettings }}>
      {children}
    </CompanySettingsContext.Provider>
  );
};

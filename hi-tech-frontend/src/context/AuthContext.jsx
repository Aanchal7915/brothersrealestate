import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const token = localStorage.getItem("token") ||
      (localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).token
        : null
      )
    if (token) {
      localStorage.setItem("token", token);
    }
    if (token) {
      api
        .get("/admin/profile")
        .then((response) => {
          if (response.data.success) {
            setUser(response.data.data);
          }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // `coords` is { latitude, longitude, accuracy } from the browser Geolocation
  // API and is required by the server. `approxLocation` is the coarse
  // IP-derived city string, sent only as a cross-check — the server derives
  // the real IP from request headers and ignores anything we claim about it.
  const login = async (email, password, securityPasscode, coords, approxLocation) => {
    try {
      const response = await api.post("/admin/login", {
        email,
        password,
        securityPasscode,
        location: coords,
        approxLocation,
      });

      if (response.data.success) {
        // Extract token from response.data.data.token (based on adminController structure)
        const token = response.data.data.token;
        const adminData = response.data.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(adminData));
        setUser(adminData);

        return { success: true };
      }
      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

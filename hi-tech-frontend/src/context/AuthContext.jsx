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

  const login = async (email, password, securityPasscode, location, ipAddress) => {
    try {
      const response = await api.post("/admin/login", { 
        email, 
        password, 
        securityPasscode, 
        location, 
        ipAddress 
      });

      console.log("Login API Response:", response.data);

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
      console.error("Login error:", error);
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

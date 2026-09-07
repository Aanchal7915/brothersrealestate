import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userData = localStorage.getItem("userData");
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
      }
    }
    setLoading(false);
  }, []);

  const sendOtp = async (email) => {
    try {
      const response = await api.post("/users/send-otp", { email });
      if (response.data.success) {
        return { success: true };
      }
      return { success: false, message: response.data.message || "Failed to send OTP" };
    } catch (error) {
      console.error("Send OTP error:", error);
      return { success: false, message: error.response?.data?.message || "Error sending OTP" };
    }
  };

  const signup = async (name, email, password, phone, otp) => {
    try {
      const response = await api.post("/users/signup", {
        name,
        email,
        password,
        phone,
        otp
      });

      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        localStorage.setItem("userToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      
      return {
        success: false,
        message: response.data.message || "Signup failed"
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed. Please try again."
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/users/login", { email, password });

      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        localStorage.setItem("userToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      
      return {
        success: false,
        message: response.data.message || "Login failed"
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please try again."
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    setUser(null);
  };

  return (
    <UserAuthContext.Provider value={{ user, login, signup, sendOtp, logout, loading }}>
      {children}
    </UserAuthContext.Provider>
  );
};
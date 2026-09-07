import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Listings from "../pages/Listings";
import PropertyDetails from "../pages/PropertyDetails";
import About from "../pages/About";
import Contact from "../pages/Contact";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AddProperty from "../pages/AddProperty";
import AdminEnquiries from "../pages/AdminEnquiries";
import Chatbot from "./components/Chatbot";
import FloatingChatbot from "./components/FloatingChatbot";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/property/:id" element={<PropertyDetails />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/add-property" element={<AddProperty />} />
      <Route path="/admin/enquiries" element={<AdminEnquiries />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <FloatingChatbot />
    </Routes>
  );
};

export default AppRouter;

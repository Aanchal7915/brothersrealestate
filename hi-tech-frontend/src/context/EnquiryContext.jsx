import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const EnquiryContext = createContext();

export const EnquiryProvider = ({ children }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, handled: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Fetch all enquiries (admin only)
   */
  const fetchEnquiries = async (status = "") => {
    setLoading(true);
    setError("");

    try {
      const query = status ? `?status=${status}` : "";
      const response = await api.get(`/enquiries/all${query}`);

      if (response?.data?.success) {
        setEnquiries(response.data.data || []);
        setStats(response.data.stats || { total: 0, pending: 0, handled: 0 });
      }
    } catch (error) {
      console.error("❌ Error fetching enquiries:", error.message);
      setError("Failed to load enquiries. Please try again later.");
      setEnquiries([]);
    }

    setLoading(false);
  };

  /**
   * Submit new enquiry (public)
   */
  const submitEnquiry = async (enquiryData) => {
    try {
      const response = await api.post('/enquiries', enquiryData);
      if (response.data.success) {
        return response.data;
      }
    } catch (error) {
      console.error("❌ Error submitting enquiry:", error);
      throw error;
    }
  };

  /**
   * Update enquiry status (admin)
   */
  const updateEnquiryStatus = async (id, status) => {
    try {
      const response = await api.put(`/enquiries/${id}`, { status });
      if (response.data.success) {
        // Update local state
        setEnquiries(enquiries.map(enq => 
          enq._id === id ? response.data.data : enq
        ));
        // Update stats
        if (status === 'handled') {
          setStats(prev => ({
            ...prev,
            pending: prev.pending - 1,
            handled: prev.handled + 1
          }));
        } else {
          setStats(prev => ({
            ...prev,
            pending: prev.pending + 1,
            handled: prev.handled - 1
          }));
        }
        return response.data;
      }
    } catch (error) {
      console.error("❌ Error updating enquiry:", error);
      throw error;
    }
  };

  /**
   * Delete enquiry (admin)
   */
  const deleteEnquiry = async (id) => {
    try {
      const enquiry = enquiries.find(e => e._id === id);
      const response = await api.delete(`/enquiries/${id}`);
      if (response.data.success) {
        // Update local state
        setEnquiries(enquiries.filter(enq => enq._id !== id));
        // Update stats
        setStats(prev => ({
          total: prev.total - 1,
          pending: enquiry?.status === 'pending' ? prev.pending - 1 : prev.pending,
          handled: enquiry?.status === 'handled' ? prev.handled - 1 : prev.handled
        }));
        return true;
      }
    } catch (error) {
      console.error("❌ Error deleting enquiry:", error);
      throw error;
    }
  };

  /**
   * Add an admin note to an enquiry (admin)
   */
  const addEnquiryNote = async (id, text) => {
    try {
      const response = await api.put(`/enquiries/${id}/notes`, { text });
      if (response.data.success) {
        // Update local state for the specific enquiry
        setEnquiries(enquiries.map(enq => enq._id === id ? response.data.data : enq));
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Error adding enquiry note:', error);
      throw error;
    }
  };

  const deleteEnquiryNote = async (id, noteId) => {
    try {
      const response = await api.delete(`/enquiries/${id}/notes?noteId=${noteId}`);
      if (response.data.success) {
        setEnquiries(enquiries.map(enq => enq._id === id ? response.data.data : enq));
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Error deleting enquiry note:', error);
      throw error;
    }
  };

  /**
   * Get recent enquiries (admin)
   */
  const fetchRecentEnquiries = async () => {
    try {
      const response = await api.get('/enquiries/recent');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error("❌ Error fetching recent enquiries:", error);
      return [];
    }
  };

  // Fetch on mount if admin is logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchEnquiries();
    }
  }, []);

  return (
    <EnquiryContext.Provider
      value={{
        enquiries,
        stats,
        loading,
        error,
        pendingCount: stats.pending,
        fetchEnquiries,
        submitEnquiry,
        updateEnquiryStatus,
        deleteEnquiry,
        addEnquiryNote,
        deleteEnquiryNote,
        fetchRecentEnquiries
      }}
    >
      {children}
    </EnquiryContext.Provider>
  );
};
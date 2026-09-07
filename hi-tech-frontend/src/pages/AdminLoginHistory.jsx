import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { format } from "date-fns";
import AdminSidebar from "../components/AdminSidebar";
import AdminBackButton from "../components/admin/AdminBackButton";

const AdminLoginHistory = ({ setCurrentPage }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoginHistory();
  }, []);

  const fetchLoginHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/login-history", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch login history", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminSidebar
        currentPage="admin-login-history"
        setCurrentPage={setCurrentPage}
      />
      <div className="flex-1 p-5 pl-20 pt-6 md:p-6 md:pl-24 md:pt-6">
        <AdminBackButton setCurrentPage={setCurrentPage} label="Back" />
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Login History
          </h2>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <span className="w-8 h-8 border-4 border-black/10 border-t-gold rounded-full animate-spin"></span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: "'Inter', sans-serif" }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Date & Time</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Result</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Location</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">IP Address</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Device</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record._id} className="border-b border-gray-50 hover:bg-ivory/30 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {format(new Date(record.createdAt), "dd MMM yyyy, hh:mm a")}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {record.success === false ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                        Failed{record.reason ? ` · ${record.reason}` : ""}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        Success
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {record.latitude != null && record.longitude != null ? (
                      <a
                        href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-gold hover:underline"
                      >
                        {record.location}
                      </a>
                    ) : (
                      record.location || "Unknown"
                    )}
                    {record.approxLocationClaimed ? (
                      <span className="block text-xs text-gray-400">{record.approxLocationClaimed}</span>
                    ) : null}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{record.ipAddress}</td>
                  <td
                    className="py-3 px-4 text-xs text-gray-500 max-w-[220px] truncate"
                    title={record.userAgent}
                  >
                    {record.userAgent || "—"}
                  </td>
                </tr>
              ))}
              
              {history.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-gray-500">
                    No login history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
        </div>
      </div>
    </>
  );
};

export default AdminLoginHistory;

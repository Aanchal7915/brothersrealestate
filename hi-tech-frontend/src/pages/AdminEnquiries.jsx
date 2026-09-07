import React, { useContext, useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Calendar,
  Home as HomeIcon,
  Trash2,
  Check,
  Clock,
  Search,
  Filter,
  RotateCcw,
  MapPin,
  StickyNote,
} from "lucide-react";
import { EnquiryContext } from "../context/EnquiryContext";
import AdminSidebar from "../components/AdminSidebar";
import AdminBackButton from "../components/admin/AdminBackButton";
import Loader from "../components/Loader";

const AdminEnquiries = ({ setCurrentPage }) => {
  const {
    enquiries,
    stats,
    loading,
    fetchEnquiries,
    updateEnquiryStatus,
    deleteEnquiry,
    addEnquiryNote,
    deleteEnquiryNote,
  } = useContext(EnquiryContext);

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [openNotesFor, setOpenNotesFor] = useState(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [addingNoteFor, setAddingNoteFor] = useState(null);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("userToken");
    if (!token) {
      alert("Please login to access enquiries");
      setCurrentPage("login");
      return;
    }
    
    if (filter === "all") {
      fetchEnquiries();
    } else {
      fetchEnquiries(filter);
    }
  }, [filter]);

  const handleStatusUpdate = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await updateEnquiryStatus(id, newStatus);
      alert(`Enquiry marked as ${newStatus}!`);
    } catch (error) {
      alert("Failed to update status: " + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNote = async (enquiryId, noteId) => {
    if (!window.confirm("Delete this note?")) return;
    setDeletingNoteId(noteId);
    try {
      await deleteEnquiryNote(enquiryId, noteId);
    } catch (error) {
      alert("Failed to delete note: " + (error.response?.data?.message || error.message));
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      setActionLoading(id);
      try {
        await deleteEnquiry(id);
        alert("Enquiry deleted successfully!");
      } catch (error) {
        alert("Failed to delete: " + (error.response?.data?.message || error.message));
      } finally {
        setActionLoading(null);
      }
    }
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      enq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.phone.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-ivory">
      <AdminSidebar
        currentPage="admin-enquiries"
        setCurrentPage={setCurrentPage}
      />

      <div className="flex-1 p-4 md:p-6 pt-20 md:pt-24">
        {/* Header */}
        <div className="mb-5">
          <AdminBackButton setCurrentPage={setCurrentPage} to="admin-dashboard" label="Back" />
          <h1 className="text-xl md:text-2xl font-black bg-matte bg-clip-text text-transparent mb-1">
            Enquiry Management
          </h1>
          <p className="text-gray-600 text-xs md:text-sm">
            Manage and respond to customer enquiries
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-matte">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold mb-1">
                  Total Enquiries
                </p>
                <p className="text-2xl font-black text-gray-900">{stats.total}</p>
              </div>
              <div className="w-11 h-11 bg-ivory rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-gold-dark" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold mb-1">Pending</p>
                <p className="text-2xl font-black text-gray-900">{stats.pending}</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-semibold mb-1">Handled</p>
                <p className="text-2xl font-black text-gray-900">{stats.handled}</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Filter Tabs */}
            <div className="flex gap-2">
              {[
                { label: "All", value: "all", color: "blue" },
                { label: "Pending", value: "pending", color: "orange" },
                { label: "Handled", value: "handled", color: "green" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filter === tab.value
                      ? "bg-matte text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                  {tab.value === "all" && ` (${stats.total})`}
                  {tab.value === "pending" && ` (${stats.pending})`}
                  {tab.value === "handled" && ` (${stats.handled})`}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-matte focus:border-matte outline-none transition-all w-full"
              />
            </div>
          </div>
        </div>

        {/* Enquiries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12">
              <Loader />
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No enquiries found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No enquiries available yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredEnquiries.map((enquiry) => (
                    <React.Fragment key={enquiry._id}>
                    <tr
                      className="hover:bg-ivory transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900">{enquiry.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {enquiry.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {enquiry.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {/* The message sits behind this icon — clicking it opens
                            the panel with the full text and the admin notes. */}
                        <button
                          onClick={() =>
                            setOpenNotesFor(openNotesFor === enquiry._id ? null : enquiry._id)
                          }
                          aria-expanded={openNotesFor === enquiry._id}
                          title="View message & notes"
                          className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                            openNotesFor === enquiry._id
                              ? "border-matte bg-matte text-white"
                              : "border-gray-200 bg-gray-100 text-gray-600 hover:border-matte hover:text-matte"
                          }`}
                        >
                          <StickyNote size={16} />
                          {enquiry.adminNotes?.length > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-white">
                              {enquiry.adminNotes.length}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {enquiry.propertyId || enquiry.featuredProjectId ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-gray-900 line-clamp-1">
                                {(enquiry.propertyId || enquiry.featuredProjectId).title}
                              </span>
                              {((enquiry.propertyId || enquiry.featuredProjectId).city && !(enquiry.propertyId || enquiry.featuredProjectId).title.toLowerCase().includes((enquiry.propertyId || enquiry.featuredProjectId).city.toLowerCase())) && (
                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3" />
                                  {(enquiry.propertyId || enquiry.featuredProjectId).city}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200">
                              General Enquiry
                            </span>
                          )}

                          {(enquiry.sourceLabel || enquiry.source) && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Source</span>
                              <span
                                className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                                  enquiry.featuredProjectId
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-ivory text-gold-dark border-gold/30"
                                }`}
                              >
                                {enquiry.sourceLabel || enquiry.source}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            enquiry.status === "pending"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {enquiry.status === "pending" ? (
                            <Clock className="w-3 h-3 mr-1" />
                          ) : (
                            <Check className="w-3 h-3 mr-1" />
                          )}
                          {enquiry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(enquiry.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-1.5">
                          {enquiry.status === "pending" && (
                            <button
                              onClick={() => handleStatusUpdate(enquiry._id, "handled")}
                              disabled={actionLoading === enquiry._id}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-all disabled:opacity-50 border border-transparent hover:border-green-200"
                              title="Mark as Handled"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          
                          {enquiry.status === "handled" && (
                            <button
                              onClick={() => handleStatusUpdate(enquiry._id, "pending")}
                              disabled={actionLoading === enquiry._id}
                              className="p-1.5 text-orange-600 hover:bg-orange-100 rounded transition-all disabled:opacity-50 border border-transparent hover:border-orange-200"
                              title="Revert to Pending"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(enquiry._id)}
                            disabled={actionLoading === enquiry._id}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-all disabled:opacity-50 border border-transparent hover:border-red-200 ml-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable panel — the enquiry's message, then the notes */}
                    {openNotesFor === enquiry._id && (
                      <tr key={enquiry._id + "-notes"} className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Message</h4>
                              <p className="whitespace-pre-line rounded-lg border bg-white p-3 text-sm text-gray-700">
                                {enquiry.message || "No message provided."}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Admin Notes</h4>
                              {(!enquiry.adminNotes || enquiry.adminNotes.length === 0) ? (
                                <p className="text-sm text-gray-500">No notes yet.</p>
                              ) : (
                                <ul className="space-y-2">
                                  {enquiry.adminNotes.map((note, i) => (
                                    <li key={note._id || i} className="bg-white border rounded-lg p-3">
                                      <div className="flex items-start justify-between gap-4">
                                        <div>
                                          <p className="text-sm text-gray-800">{note.text}</p>
                                          <p className="text-xs text-gray-500 mt-2">By {note.admin?.name || 'Admin'} · {new Date(note.createdAt).toLocaleString()}</p>
                                        </div>
                                        <button
                                          onClick={() => handleDeleteNote(enquiry._id, note._id)}
                                          disabled={deletingNoteId === note._id}
                                          title="Delete note"
                                          aria-label="Delete note"
                                          className="shrink-0 rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <textarea
                                value={newNoteText}
                                onChange={(e) => setNewNoteText(e.target.value)}
                                placeholder="Add a private admin note..."
                                className="flex-1 border rounded-lg p-3 resize-none focus:ring-2 focus:ring-matte outline-none"
                                rows={3}
                              />
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={async () => {
                                    if (!newNoteText.trim()) return alert('Please enter a note');
                                    setAddingNoteFor(enquiry._id);
                                    try {
                                      await addEnquiryNote(enquiry._id, newNoteText.trim());
                                      setNewNoteText('');
                                      // refetch list to update reliably
                                      fetchEnquiries(filter === 'all' ? '' : filter);
                                    } catch (error) {
                                      alert('Failed to add note: ' + (error.response?.data?.message || error.message));
                                    } finally {
                                      setAddingNoteFor(null);
                                    }
                                  }}
                                  disabled={addingNoteFor === enquiry._id}
                                  className="px-4 py-2 bg-matte text-white rounded-lg shadow hover:bg-matte disabled:opacity-50"
                                >
                                  {addingNoteFor === enquiry._id ? 'Adding...' : 'Add Note'}
                                </button>
                                <button
                                  onClick={() => { setOpenNotesFor(null); setNewNoteText(''); }}
                                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Count */}
          {filteredEnquiries.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 text-center">
              Showing {filteredEnquiries.length} of {enquiries.length} enquiries
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiries;
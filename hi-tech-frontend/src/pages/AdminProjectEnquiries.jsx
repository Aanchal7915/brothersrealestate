import React, { useEffect, useState } from "react";
import {
    Mail,
    Phone,
    Calendar,
    Trash2,
    Check,
    Clock,
    Search,
    Layout,
    MessageSquare,
    Download,
    FileText,
    X
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminBackButton from "../components/admin/AdminBackButton";
import Loader from "../components/Loader";
import api from "../utils/api";

const AdminProjectEnquiries = ({ setCurrentPage }) => {
    const [enquiries, setEnquiries] = useState([]);
    const [stats, setStats] = useState({ total: 0, contacted: 0, converted: 0, interested: 0, notResponded: 0 });
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [showDateFilters, setShowDateFilters] = useState(false);

    const fetchEnquiries = async (status = "") => {
        setLoading(true);
        try {
            const query = status && status !== "all" ? `?status=${status}` : "";
            const response = await api.get(`/project-enquiries/all${query}`);
            if (response.data.success) {
                setEnquiries(response.data.data);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Error fetching project enquiries:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token") || localStorage.getItem("userToken");
        if (!token) {
            setCurrentPage("admin-login");
            return;
        }
        fetchEnquiries(filter);
    }, [filter]);

    const handleStatusUpdate = async (id, newStatus) => {
        setActionLoading(id);
        try {
            await api.put(`/project-enquiries/${id}`, { status: newStatus });
            fetchEnquiries(filter);
        } catch (error) {
            alert("Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this enquiry?")) {
            setActionLoading(id);
            try {
                await api.delete(`/project-enquiries/${id}`);
                fetchEnquiries(filter);
            } catch (error) {
                alert("Failed to delete enquiry");
            } finally {
                setActionLoading(null);
            }
        }
    };

    const getDateRange = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (dateFilter) {
            case 'today':
                return {
                    start: today,
                    end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                };
            case 'tomorrow':
                const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                return {
                    start: tomorrow,
                    end: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
                };
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);
                return { start: weekStart, end: weekEnd };
            case 'month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                return { start: monthStart, end: monthEnd };
            case 'year':
                const yearStart = new Date(now.getFullYear(), 0, 1);
                const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
                return { start: yearStart, end: yearEnd };
            case 'custom':
                if (customStartDate && customEndDate) {
                    return {
                        start: new Date(customStartDate),
                        end: new Date(new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000)
                    };
                }
                return null;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'converted': return 'bg-green-100 text-green-700 border-green-200';
            case 'contacted': return 'bg-ivory text-matte border-black/10';
            case 'interested': return 'bg-ivory text-matte border-black/10';
            case 'not responded': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleExport = () => {
        const csvData = filteredEnquiries.map(enq => ({
            Name: enq.name,
            Email: enq.email,
            Phone: enq.phone,
            Project: enq.project,
            'Special Enquiry': enq.specialEnquiry || '-',
            Status: enq.status,
            Date: new Date(enq.createdAt).toLocaleDateString()
        }));

        const headers = Object.keys(csvData[0] || {});
        const csv = [
            headers.join(','),
            ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Create filename with date filter info
        let dateLabel = dateFilter === 'all' ? 'all-time' : dateFilter;
        if (dateFilter === 'custom' && customStartDate && customEndDate) {
            dateLabel = `${customStartDate}_to_${customEndDate}`;
        }
        const statusLabel = filter !== 'all' ? `_${filter}` : '';
        a.download = `project-enquiries_${dateLabel}${statusLabel}_${new Date().toISOString().split('T')[0]}.csv`;

        a.click();
        window.URL.revokeObjectURL(url);
    };

    const openNoteModal = (note) => {
        setSelectedNote(note || 'No special enquiry message');
        setShowNoteModal(true);
    };

    const filteredEnquiries = enquiries.filter((enq) => {
        // Search filter
        const matchesSearch = (
            enq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.phone.includes(searchTerm) ||
            (enq.project && enq.project.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Date filter
        const dateRange = getDateRange();
        let matchesDate = true;

        if (dateRange) {
            const enquiryDate = new Date(enq.createdAt);
            matchesDate = enquiryDate >= dateRange.start && enquiryDate < dateRange.end;
        }

        return matchesSearch && matchesDate;
    });

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-ivory/50 flex-col md:flex-row">
            <AdminSidebar
                currentPage="admin-project-enquiries"
                setCurrentPage={setCurrentPage}
            />

            <div className="flex-1 p-4 md:p-6 pt-20 md:pt-24 overflow-x-hidden">
                <div className="mb-5">
                    <AdminBackButton setCurrentPage={setCurrentPage} to="admin-dashboard" label="Back" />
                    <h1 className="text-xl md:text-2xl font-black bg-matte bg-clip-text text-transparent mb-1">
                        Landing Page Leads
                    </h1>
                    <p className="text-gray-600 text-xs md:text-sm">
                        Manage enquiries from Shapoorji Pallonji Dualis Landing Page
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-gray-500">
                        <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Total</p>
                        <p className="text-xl md:text-2xl font-black text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-matte">
                        <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Contacted</p>
                        <p className="text-xl md:text-2xl font-black text-gray-900">{stats.contacted}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-matte">
                        <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Interested</p>
                        <p className="text-xl md:text-2xl font-black text-gray-900">{stats.interested}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
                        <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Converted</p>
                        <p className="text-xl md:text-2xl font-black text-gray-900">{stats.converted}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-400">
                        <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">No Response</p>
                        <p className="text-xl md:text-2xl font-black text-gray-900">{stats.notResponded}</p>
                    </div>
                </div>

                {/* Date Filters - Collapsible */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                    <button
                        onClick={() => setShowDateFilters(!showDateFilters)}
                        className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Calendar className="text-matte" size={20} />
                            <h3 className="text-sm md:text-base font-bold text-gray-700">Date Filter</h3>
                            {dateFilter !== 'all' && (
                                <span className="ml-2 px-2 py-1 bg-ivory text-matte text-xs font-bold rounded-full">
                                    Active
                                </span>
                            )}
                        </div>
                        <div className={`transform transition-transform duration-200 ${showDateFilters ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>

                    {showDateFilters && (
                        <div className="px-4 md:px-6 pb-6 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2 mt-4 mb-4">
                                {[
                                    { id: 'all', label: 'All Time' },
                                    { id: 'today', label: 'Today' },
                                    { id: 'tomorrow', label: 'Tomorrow' },
                                    { id: 'week', label: 'This Week' },
                                    { id: 'month', label: 'This Month' },
                                    { id: 'year', label: 'This Year' },
                                ].map((df) => (
                                    <button
                                        key={df.id}
                                        onClick={() => {
                                            setDateFilter(df.id);
                                            setShowCustomDatePicker(false);
                                        }}
                                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold text-[10px] md:text-sm transition-all ${dateFilter === df.id
                                            ? "bg-matte text-white shadow-lg"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {df.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        setShowCustomDatePicker(!showCustomDatePicker);
                                        if (!showCustomDatePicker) {
                                            setDateFilter('custom');
                                        }
                                    }}
                                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold text-[10px] md:text-sm transition-all flex items-center gap-1 ${dateFilter === 'custom'
                                        ? "bg-matte text-white shadow-lg"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    <Calendar size={14} />
                                    Custom Range
                                </button>
                            </div>

                            {/* Custom Date Picker */}
                            {showCustomDatePicker && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-matte outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                min={customStartDate}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-matte outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                    {customStartDate && customEndDate && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                            <Calendar size={14} />
                                            <span className="font-semibold">
                                                {new Date(customStartDate).toLocaleDateString()} - {new Date(customEndDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100 mb-8">
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {[
                                { id: 'all', label: 'All', count: stats.total },
                                { id: 'not responded', label: 'No Response', count: stats.notResponded },
                                { id: 'contacted', label: 'Contacted', count: stats.contacted },
                                { id: 'interested', label: 'Interested', count: stats.interested },
                                { id: 'converted', label: 'Converted', count: stats.converted }
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setFilter(s.id)}
                                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold text-[10px] md:text-sm transition-all ${filter === s.id
                                        ? "bg-matte text-white shadow-lg"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    {s.label} ({s.count})
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-matte outline-none w-full text-sm"
                                />
                            </div>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-matte hover:bg-gold hover:text-matte text-white rounded-lg font-semibold text-sm transition-all shadow-md"
                                title="Export to CSV"
                            >
                                <Download size={16} />
                                <span className="hidden md:inline">Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                {(searchTerm || dateFilter !== 'all') && (
                    <div className="bg-ivory border border-black/10 rounded-xl p-3 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-matte">
                            <FileText size={16} />
                            <span className="font-semibold">
                                Showing {filteredEnquiries.length} of {enquiries.length} enquiries
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setDateFilter('all');
                                setShowCustomDatePicker(false);
                            }}
                            className="text-xs text-matte hover:text-matte font-semibold underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12"><Loader /></div>
                    ) : filteredEnquiries.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">No leads found</div>
                    ) : (
                        <>
                            {/* Desktop View Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Contact Info</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Special Enquiry</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Project</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredEnquiries.map((enq) => (
                                            <tr key={enq._id} className="hover:bg-ivory/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{enq.name}</div>
                                                    <div className="text-sm text-gray-600 flex items-center gap-1"><Mail size={14} /> {enq.email}</div>
                                                    <div className="text-sm text-gray-600 flex items-center gap-1"><Phone size={14} /> {enq.phone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {enq.specialEnquiry ? (
                                                        <button
                                                            onClick={() => openNoteModal(enq.specialEnquiry)}
                                                            className="flex items-center gap-2 text-matte hover:text-matte hover:bg-ivory px-3 py-1.5 rounded-lg transition-all"
                                                            title="View special enquiry"
                                                        >
                                                            <FileText size={16} />
                                                            <span className="text-xs font-semibold">View Note</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-matte font-mono tracking-tight">{enq.project}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-black border ${getStatusColor(enq.status)}`}>
                                                        {enq.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} /> {new Date(enq.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end items-center gap-3">
                                                        <select
                                                            value={enq.status}
                                                            onChange={(e) => handleStatusUpdate(enq._id, e.target.value)}
                                                            className="text-xs font-bold py-1.5 px-2 rounded-lg border-2 border-gray-200 focus:border-matte outline-none bg-white cursor-pointer"
                                                            disabled={actionLoading === enq._id}
                                                        >
                                                            <option value="not responded">No Response</option>
                                                            <option value="contacted">Contacted</option>
                                                            <option value="interested">Interested</option>
                                                            <option value="converted">Converted</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleDelete(enq._id)}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Delete Enquiry"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile/Tablet Card View */}
                            <div className="lg:hidden divide-y divide-gray-100">
                                {filteredEnquiries.map((enq) => (
                                    <div key={enq._id} className="p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-1">{enq.name}</h3>
                                                <a href={`tel:${enq.phone}`} className="text-sm font-semibold text-matte flex items-center gap-2 mb-1">
                                                    <Phone size={14} /> {enq.phone}
                                                </a>
                                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                                    <Calendar size={12} /> {new Date(enq.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(enq._id)}
                                                className="p-2 text-red-500 bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Inquiry Details</p>
                                                {enq.specialEnquiry && (
                                                    <button
                                                        onClick={() => openNoteModal(enq.specialEnquiry)}
                                                        className="flex items-center gap-1 text-matte hover:text-matte text-xs font-semibold"
                                                    >
                                                        <FileText size={14} />
                                                        View Note
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700">{enq.specialEnquiry ? 'Has special enquiry message' : "No message"}</p>
                                            <div className="mt-3 pt-2 border-t border-gray-200">
                                                <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Target Project</p>
                                                <p className="text-xs font-mono font-bold text-matte">{enq.project}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest px-1">Update Status</p>
                                                <select
                                                    value={enq.status}
                                                    onChange={(e) => handleStatusUpdate(enq._id, e.target.value)}
                                                    className="w-full text-xs font-bold py-2 px-3 rounded-lg border-2 border-gray-200 outline-none bg-white"
                                                    disabled={actionLoading === enq._id}
                                                >
                                                    <option value="not responded">No Response</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="interested">Interested</option>
                                                    <option value="converted">Converted</option>
                                                </select>
                                            </div>
                                            <div className="sm:text-right pt-2 sm:pt-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-black border ${getStatusColor(enq.status)}`}>
                                                    {enq.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Notes Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowNoteModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 md:p-8 relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-ivory rounded-lg">
                                    <FileText className="text-matte" size={24} />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Special Enquiry Note</h2>
                            </div>
                            <button
                                onClick={() => setShowNoteModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200 overflow-y-auto flex-1 min-h-0">
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">{selectedNote}</p>
                        </div>
                        <div className="mt-6 flex justify-end flex-shrink-0">
                            <button
                                onClick={() => setShowNoteModal(false)}
                                className="px-6 py-2.5 bg-matte hover:bg-matte text-white rounded-lg font-semibold transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProjectEnquiries;

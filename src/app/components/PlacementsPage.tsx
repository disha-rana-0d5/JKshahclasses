import { useState, useEffect } from "react";
import { placementApi, BASE_URL } from "../api/api";
import { ClientPagination } from "./ClientPagination";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import {
    Search,
    MapPin,
    Building2,
    Briefcase,
    GraduationCap,
    Banknote,
    Send,
    Loader2,
    Calendar,
    ExternalLink,
    ChevronRight,
    X,
    Upload
} from "lucide-react";

export function PlacementsPage() {
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedPlacement, setSelectedPlacement] = useState(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Pagination State
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Application Form State
    const [applyForm, setApplyForm] = useState({
        studentName: "",
        studentEmail: "",
        studentPhone: "",
        qualification: "",
        resumeUrl: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        document.title = "Placements | JK Shah Classes";
    }, []);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchPlacements();
    }, [pagination.page, debouncedSearch]);

    const fetchPlacements = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: debouncedSearch
            };
            const response = await placementApi.getActivePlacements(params);
            if (response.ok) {
                setPlacements(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total,
                    pages: response.data.pagination.pages
                }));
            }
        } catch (error) {
            console.error("Error fetching placements:", error);
            toast.error("Failed to load placements");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (placement) => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const isAuthenticated = !!token && user?.role === "student";

        if (!isAuthenticated) {
            toast.error("Please login as a student to apply for jobs");
            // Optionally redirect to login
            // navigate("/login", { state: { from: location.pathname } });
            return;
        }

        setSelectedPlacement(placement);
        setIsApplyModalOpen(true);
    };

    const handleViewDetails = (placement) => {
        setSelectedPlacement(placement);
        setIsViewModalOpen(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Only PDF files are allowed");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${BASE_URL}/upload/file`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setApplyForm({ ...applyForm, resumeUrl: data.url });
                toast.success("Resume uploaded successfully");
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading file");
        } finally {
            setIsUploading(false);
        }
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        if (!applyForm.resumeUrl) {
            toast.error("Please upload your resume first");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await placementApi.applyForPlacement(selectedPlacement._id, applyForm);
            if (response.ok) {
                toast.success("Application submitted successfully! Recruiter has been notified.");
                setIsApplyModalOpen(false);
                setApplyForm({
                    studentName: "",
                    studentEmail: "",
                    studentPhone: "",
                    qualification: "",
                    resumeUrl: ""
                });
            } else {
                toast.error(response.data.message || "Failed to submit application");
            }
        } catch (error) {
            console.error("Application error:", error);
            toast.error("Server error. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPlacements = placements.filter(p =>
        p.firmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.domainKnowledge.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Placements & Career Opportunities</h1>
                        <p className="text-slate-600">Connect with top firms and kickstart your professional journey</p>
                    </div>
                </div>

                {/* Filters/Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by firm, location, or domain..."
                            className="pl-10 h-10 border-slate-200 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {/* Listings Section */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-slate-500 text-sm">Loading opportunities...</p>
                        </div>
                    </div>
                ) : filteredPlacements.length > 0 ? (
                    <>
                        {/* Mobile View (Cards) */}
                        <div className="grid grid-cols-1 gap-4 md:hidden mb-12">
                            {filteredPlacements.map((p) => (
                                <div key={p._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 relative">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex flex-col gap-1">
                                            <h4 className="font-bold text-slate-900 leading-snug">{p.firmName}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(p.dateOfNotice).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100">
                                            <MapPin className="w-3 h-3 text-primary" />
                                            <span className="text-[10px] text-slate-600 font-medium">{p.location}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 py-3 border-y border-slate-50/10">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] uppercase font-bold text-slate-400">Position Details</span>
                                            <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-3">{p.domainKnowledge}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Banknote className="w-3.5 h-3.5 text-green-600" />
                                                <span className="text-xs font-bold text-slate-800">{p.remuneration}</span>
                                            </div>
                                            {p.companyPage && (
                                                <a href={p.companyPage} target="_blank" rel="noopener noreferrer" className="text-primary text-[10px] font-bold flex items-center gap-1">
                                                    Website <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button onClick={() => handleApply(p)} className="flex-1 bg-primary text-white h-11 text-xs font-bold rounded-xl">
                                            Apply Now
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleViewDetails(p)}
                                            className="flex-1 h-11 text-xs border-slate-200 text-slate-600 rounded-xl"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                    {p.applicationFormUrl && (
                                        <a href={p.applicationFormUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 self-center hover:text-primary transition-colors flex items-center gap-1">
                                            External Form <ChevronRight className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Desktop View (Table) */}
                        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-12">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date of Notice</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Firm / Company</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate Profile</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredPlacements.map((p) => (
                                            <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {new Date(p.dateOfNotice).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top min-w-[250px]">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-slate-900 leading-tight">{p.firmName}</span>
                                                        <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {p.location}
                                                        </span>
                                                        {p.companyPage && (
                                                            <a href={p.companyPage} target="_blank" rel="noopener noreferrer" className="text-primary text-[10px] hover:underline flex items-center gap-0.5 mt-1">
                                                                View Company Page <ExternalLink className="w-2.5 h-2.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top max-w-md">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-bold text-slate-400">Domain</span>
                                                            <span className="text-xs text-slate-700 line-clamp-2">{p.domainKnowledge}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <Banknote className="w-3.5 h-3.5 text-green-500" />
                                                            <span className="text-xs font-medium text-slate-700">{p.remuneration}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-slate-400">Preferred</span>
                                                        <span className="text-xs text-slate-700 whitespace-pre-wrap">{p.preferredCandidate}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top text-right relative">
                                                    <div className="flex flex-col gap-2 items-end mb-4">
                                                        <Button onClick={() => handleApply(p)} className="bg-primary hover:bg-primary/90 text-white text-xs h-9 px-4 w-full md:w-auto">
                                                            Apply Now
                                                        </Button>
                                                        {p.applicationFormUrl && (
                                                            <a href={p.applicationFormUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                                                                External Form <ChevronRight className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleViewDetails(p)}
                                                        className="absolute bottom-1 right-2 text-[9px] text-primary hover:underline font-medium opacity-70 hover:opacity-100 transition-opacity"
                                                    >
                                                        View details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-20 text-center text-slate-500 mb-12">
                        No active placements found matching your search.
                    </div>
                )}

                {/* View Job Modal */}
                {isViewModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Job Details</h3>
                                    <p className="text-xs text-slate-500">at {selectedPlacement?.firmName}</p>
                                </div>
                                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Firm Name</span>
                                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                            <Building2 className="w-4 h-4 text-primary" />
                                            {selectedPlacement?.firmName}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            {selectedPlacement?.location}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-50">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Domain Knowledge Required</span>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-700 text-sm whitespace-pre-wrap">
                                        {selectedPlacement?.domainKnowledge}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-50">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Preferred Candidate Profile</span>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap">
                                        {selectedPlacement?.preferredCandidate}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-50">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Remuneration</span>
                                        <div className="flex items-center gap-2 text-green-600 font-bold">
                                            <Banknote className="w-4 h-4" />
                                            {selectedPlacement?.remuneration}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Notice Date</span>
                                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                                            <Calendar className="w-4 h-4" />
                                            {selectedPlacement?.dateOfNotice ? new Date(selectedPlacement.dateOfNotice).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 mt-2">
                                    <Button
                                        onClick={() => {
                                            setIsViewModalOpen(false);
                                            handleApply(selectedPlacement);
                                        }}
                                        className="flex-1 bg-primary text-white h-12"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Apply for this Job
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <ClientPagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />

                {/* Apply Modal */}
                {isApplyModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Apply for Position</h3>
                                    <p className="text-xs text-slate-500">at {selectedPlacement?.firmName}</p>
                                </div>
                                <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={submitApplication} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        required
                                        value={applyForm.studentName}
                                        onChange={(e) => setApplyForm({ ...applyForm, studentName: e.target.value })}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email ID</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            value={applyForm.studentEmail}
                                            onChange={(e) => setApplyForm({ ...applyForm, studentEmail: e.target.value })}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            required
                                            value={applyForm.studentPhone}
                                            onChange={(e) => setApplyForm({ ...applyForm, studentPhone: e.target.value })}
                                            placeholder="10-digit mobile"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="qual">Professional Qualification (being pursued)</Label>
                                    <Input
                                        id="qual"
                                        required
                                        value={applyForm.qualification}
                                        onChange={(e) => setApplyForm({ ...applyForm, qualification: e.target.value })}
                                        placeholder="e.g. CA Intermediate, ACCA 9 papers"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Upload Resume (PDF only)</Label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="resume-upload"
                                        />
                                        <label
                                            htmlFor="resume-upload"
                                            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${applyForm.resumeUrl ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                                                }`}
                                        >
                                            {isUploading ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                                    <span className="text-xs text-slate-500">Uploading...</span>
                                                </div>
                                            ) : applyForm.resumeUrl ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="bg-green-100 text-green-600 p-2 rounded-full">
                                                        <Upload className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-green-700">Resume Uploaded!</span>
                                                    <span className="text-[10px] text-green-600 truncate max-w-[200px]">Click to change file</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 text-slate-400">
                                                    <Upload className="w-6 h-6" />
                                                    <span className="text-xs font-medium">Click to upload resume</span>
                                                    <span className="text-[10px]">Max 10MB, PDF only</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" disabled={isSubmitting || isUploading} className="w-full bg-primary hover:bg-primary/90 text-white py-6">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        Submit Application
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

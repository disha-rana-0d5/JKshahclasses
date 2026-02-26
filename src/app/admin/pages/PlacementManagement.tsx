import { useState, useEffect } from "react";
import { placementApi } from "../../api/api";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import {
    CheckCircle,
    XCircle,
    Clock,
    ExternalLink,
    MapPin,
    Calendar,
    Loader2,
    Search,
    Check,
    X,
    PlusCircle,
    Send,
    Building2,
    Upload,
    Trash2
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function PlacementManagement() {
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Post Job Form State
    const [jobForm, setJobForm] = useState({
        firmName: "",
        location: "",
        domainKnowledge: "",
        preferredCandidate: "",
        remuneration: "",
        contactEmail: "",
        companyPage: "",
        applicationFormUrl: ""
    });

    useEffect(() => {
        fetchAdminPlacements();
    }, []);

    const fetchAdminPlacements = async () => {
        setLoading(true);
        try {
            const response = await placementApi.getAdminPlacements();
            if (response.ok) {
                setPlacements(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching admin placements:", error);
            toast.error("Failed to load placements");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await placementApi.updatePlacementStatus(id, status);
            if (response.ok) {
                toast.success(`Placement ${status.toLowerCase()} successfully`);
                fetchAdminPlacements();
            } else {
                toast.error(response.data.message || "Update failed");
            }
        } catch (error) {
            console.error("Status update error:", error);
            toast.error("Server error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this placement?")) return;
        try {
            const response = await placementApi.deletePlacement(id);
            if (response.ok) {
                toast.success("Placement deleted successfully");
                fetchAdminPlacements();
            } else {
                toast.error(response.data.message || "Delete failed");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Server error during deletion");
        }
    };

    const submitJobPost = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await placementApi.createPlacement({ ...jobForm, status: "Verified" });
            if (response.ok) {
                toast.success("Job achievement added successfully!");
                setIsPostJobModalOpen(false);
                setJobForm({
                    firmName: "",
                    location: "",
                    domainKnowledge: "",
                    preferredCandidate: "",
                    remuneration: "",
                    contactEmail: "",
                    companyPage: "",
                    applicationFormUrl: ""
                });
                fetchAdminPlacements();
            } else {
                toast.error(response.data.message || "Failed to add job achievement");
            }
        } catch (error) {
            console.error("Job post error:", error);
            toast.error("Server error. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPlacements = statusFilter === "All"
        ? placements
        : placements.filter(p => p.status === statusFilter);

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Placement Management</h1>
                    <p className="text-sm text-gray-500">Review and verify job postings from companies</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {["All", "Pending", "Verified", "Rejected"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === f ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <Button onClick={() => setIsPostJobModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Add Job Achievement
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Notice Date</th>
                                <th className="px-6 py-4">Firm Details</th>
                                <th className="px-6 py-4">Role & Pay</th>
                                <th className="px-6 py-4">Candidate Profile</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                                        <span className="text-sm text-gray-400">Loading placements...</span>
                                    </td>
                                </tr>
                            ) : filteredPlacements.length > 0 ? (
                                filteredPlacements.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div className="text-sm text-gray-600">
                                                {new Date(p.dateOfNotice).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-gray-900">{p.firmName}</span>
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MapPin className="w-3 h-3" /> {p.location}
                                                </span>
                                                <span className="text-[10px] text-gray-400">{p.contactEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-medium text-gray-700 line-clamp-1">{p.domainKnowledge}</span>
                                                <span className="text-xs text-green-600 font-semibold">{p.remuneration}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <p className="text-xs text-gray-600 line-clamp-2">{p.preferredCandidate}</p>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase ${p.status === 'Verified' ? 'bg-green-100 text-green-700' :
                                                p.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {p.status === 'Pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(p._id, 'Verified')}
                                                            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                                                            title="Approve"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(p._id, 'Rejected')}
                                                            className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white"
                                                            title="Reject"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(p._id, 'Pending')}
                                                    variant="outline"
                                                    className="text-[10px] h-7 px-2"
                                                >
                                                    Reset to Pending
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDelete(p._id)}
                                                    className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                        No placements found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Post Job Modal */}
            {isPostJobModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Add Job Achievement</h3>
                            <button onClick={() => setIsPostJobModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[80vh]">
                            <form onSubmit={submitJobPost} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firm">Firm / Company Name *</Label>
                                        <Input
                                            id="firm"
                                            required
                                            value={jobForm.firmName}
                                            onChange={(e) => setJobForm({ ...jobForm, firmName: e.target.value })}
                                            placeholder="e.g. Jhawar Mantri & Associates"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="loc">Location *</Label>
                                        <Input
                                            id="loc"
                                            required
                                            value={jobForm.location}
                                            onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                            placeholder="e.g. Navi Mumbai, Remote"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="domain">Domain Knowledge required *</Label>
                                    <textarea
                                        id="domain"
                                        required
                                        className="w-full min-h-[80px] rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={jobForm.domainKnowledge}
                                        onChange={(e) => setJobForm({ ...jobForm, domainKnowledge: e.target.value })}
                                        placeholder="e.g. Auditing, Taxation, Corporate Advisory..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pref">Preferred Candidate Profile *</Label>
                                    <textarea
                                        id="pref"
                                        required
                                        className="w-full min-h-[80px] rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={jobForm.preferredCandidate}
                                        onChange={(e) => setJobForm({ ...jobForm, preferredCandidate: e.target.value })}
                                        placeholder="e.g. CA Intermediate, ACCA students..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="rem">Expected Remuneration *</Label>
                                        <Input
                                            id="rem"
                                            required
                                            value={jobForm.remuneration}
                                            onChange={(e) => setJobForm({ ...jobForm, remuneration: e.target.value })}
                                            placeholder="e.g. Rs 10,000 per month"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cemail">Contact Email (for resumes) *</Label>
                                        <Input
                                            id="cemail"
                                            type="email"
                                            required
                                            value={jobForm.contactEmail}
                                            onChange={(e) => setJobForm({ ...jobForm, contactEmail: e.target.value })}
                                            placeholder="hr@firm.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="page">Company Page / LinkedIn (Optional)</Label>
                                        <Input
                                            id="page"
                                            value={jobForm.companyPage}
                                            onChange={(e) => setJobForm({ ...jobForm, companyPage: e.target.value })}
                                            placeholder="https://linkedin.com/company/..."
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsPostJobModalOpen(false)} className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        Add Achievement
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

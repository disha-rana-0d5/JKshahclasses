import { useState, useEffect } from "react";
import { careerApi } from "../../api/api";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import {
    Loader2,
    PlusCircle,
    Search,
    Trash2,
    X,
    Send,
    Edit2,
    MapPin,
    Clock,
    Briefcase
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function CareerListingManagement() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        type: "Full-time",
        status: "Active"
    });

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const { ok, data } = await careerApi.getAdminListings();
            if (ok) setListings(data.data || []);
        } catch (error) {
            toast.error("Failed to load listings");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (listing) => {
        setEditingId(listing._id);
        setFormData({
            title: listing.title,
            description: listing.description,
            location: listing.location,
            type: listing.type,
            status: listing.status
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this listing?")) return;
        const { ok } = await careerApi.deleteListing(id);
        if (ok) {
            toast.success("Listing deleted");
            fetchListings();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const { ok } = await careerApi.addOrUpdateListing({ ...formData, id: editingId });
        if (ok) {
            toast.success(editingId ? "Listing updated" : "Listing created");
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ title: "", description: "", location: "", type: "Full-time", status: "Active" });
            fetchListings();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Job Openings Management</h1>
                    <p className="text-sm text-gray-500">Manage company career opportunities</p>
                </div>
                <Button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-primary text-white">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Opening
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Position</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td>
                            </tr>
                        ) : listings.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50/50 transition-colors text-sm">
                                <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                                <td className="px-6 py-4 text-gray-600">{item.location}</td>
                                <td className="px-6 py-4 text-gray-600">{item.type}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}><Edit2 className="w-4 h-4" /></Button>
                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(item._id)}><Trash2 className="w-4 h-4" /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingId ? "Edit Opening" : "Add New Opening"}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Job Title *</Label>
                                <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior Academic Manager" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Location *</Label>
                                    <Input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Mumbai / Remote" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Job Type</Label>
                                    <select className="w-full h-10 px-3 bg-gray-50 border rounded-md text-sm" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description *</Label>
                                <textarea className="w-full min-h-[100px] p-3 text-sm bg-gray-50 border rounded-md" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="flex gap-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    {editingId ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

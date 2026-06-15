import { useState, useEffect } from "react";
import { careerApi, FRONTEND_URL } from "../../api/api";
import {
    Loader2,
    FileText,
    User,
    Mail,
    Phone,
    Briefcase,
    Download,
    Trash2
} from "lucide-react";
import { toast } from "sonner";

export function CareerApplicationManagement() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { ok, data } = await careerApi.getApplications();
            if (ok) setApplications(data.data || []);
        } catch (error) {
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExportLoading(true);
        try {
            const response = await careerApi.exportApplications();
            if (response.ok) toast.success("Export successful");
        } catch (error) {
            toast.error("Export failed");
        } finally {
            setExportLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this application?")) return;
        try {
            const { ok } = await careerApi.deleteApplication(id);
            if (ok) {
                toast.success("Application deleted");
                fetchApplications();
            }
        } catch (error) {
            toast.error("Failed to delete application");
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Career Applications</h1>
                    <p className="text-sm text-gray-500">View candidates who applied for job openings</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exportLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm font-semibold"
                >
                    {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Export CSV
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Candidate</th>
                            <th className="px-6 py-4">Applied For</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4 text-right">Resume</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" /> Loading...</td>
                            </tr>
                        ) : applications.length > 0 ? (
                            applications.map((app) => (
                                <tr key={app._id} className="hover:bg-gray-50/50 transition-colors text-sm">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{app.name}</div>
                                        <div className="text-[10px] text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-700">{app.postApplied}</span>
                                            {app.category && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm w-fit mt-0.5 font-semibold tracking-wider uppercase">{app.category}</span>}
                                            {app.listingId && <span className="text-[10px] text-primary mt-0.5">{app.listingId.title}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs text-gray-600">
                                            <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.email}</div>
                                            <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.phone}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <a href={app.resumeUrl?.startsWith('http') ? app.resumeUrl : `${FRONTEND_URL}${app.resumeUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20">
                                                <FileText className="w-3.5 h-3.5" /> View
                                            </a>
                                            <button
                                                onClick={() => handleDelete(app._id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Application"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} className="py-20 text-center text-gray-500">No applications yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

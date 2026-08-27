import { useState, useEffect } from "react";
import { placementApi, FRONTEND_URL } from "../../api/api";
import {
    Loader2,
    FileText,
    Calendar,
    User,
    Mail,
    Phone,
    Briefcase,
    ExternalLink,
    Download
} from "lucide-react";
import { toast } from "sonner";

export function JobApplicationManagement() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await placementApi.getApplications();
            if (response.ok) {
                setApplications(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExportLoading(true);
        try {
            const response = await placementApi.exportApplications(startDate, endDate);
            if (response.ok) {
                toast.success("Applications exported successfully");
            } else {
                toast.error("Failed to export applications");
            }
        } catch (error) {
            console.error("Error exporting applications:", error);
            toast.error("An error occurred during export");
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Job Applications</h1>
                    <p className="text-sm text-gray-500">Track and view student applications for job placements</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary outline-none"
                            title="Start Date"
                        />
                        <span className="text-gray-500 text-sm">to</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary outline-none"
                            title="End Date"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exportLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                    >
                        {exportLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Export to CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Applied Date</th>
                                <th className="px-6 py-4">Student Details</th>
                                <th className="px-6 py-4">Job Details</th>
                                <th className="px-6 py-4">Qualification</th>
                                <th className="px-6 py-4 text-right">Resume</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                                        <span className="text-sm text-gray-400">Loading applications...</span>
                                    </td>
                                </tr>
                            ) : applications.length > 0 ? (
                                applications.map((app) => (
                                    <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-gray-500">
                                                    {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                    {app.studentName}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Mail className="w-3 h-3" />
                                                    {app.studentEmail}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Phone className="w-3 h-3" />
                                                    {app.studentPhone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            {app.placementId ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                        <Briefcase className="w-3 h-3 text-primary" />
                                                        {app.placementId.firmName}
                                                    </div>
                                                    <span className="text-[10px] text-gray-500">
                                                        {app.placementId.domainKnowledge} | {app.placementId.location}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-red-500 italic">Job post removed</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className="text-xs text-gray-600 line-clamp-2">
                                                {app.qualification}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            <a
                                                href={(() => {
                                                    if (!app.resumeUrl) return '#';
                                                    try {
                                                        if (app.resumeUrl.startsWith('http')) {
                                                            const urlObj = new URL(app.resumeUrl);
                                                            return `https://jkshahclasses.com${urlObj.pathname}${urlObj.search}`;
                                                        }
                                                        return `https://jkshahclasses.com${app.resumeUrl.startsWith('/') ? '' : '/'}${app.resumeUrl}`;
                                                    } catch (e) {
                                                        return app.resumeUrl;
                                                    }
                                                })()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                View Resume
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                        No applications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

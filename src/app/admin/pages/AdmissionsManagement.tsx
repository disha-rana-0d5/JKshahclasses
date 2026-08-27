import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../api/api";
import { format } from "date-fns";
import { Card } from "../../components/ui/card";
import { Eye, Search, Filter, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";

export function AdmissionsManagement() {
    const [admissions, setAdmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAdmission, setSelectedAdmission] = useState<any | null>(null);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    useEffect(() => {
        fetchAdmissions();
    }, []);

    const fetchAdmissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${BASE_URL}/admissions`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setAdmissions(data.data);
            }
        } catch (error) {
            console.error("Error fetching admissions:", error);
            toast.error("Failed to load admissions");
        } finally {
            setLoading(false);
        }
    };

    const handleSyncToERP = async (id: string) => {
        try {
            setSyncingId(id);
            const token = localStorage.getItem("token");
            const res = await fetch(`${BASE_URL}/admissions/${id}/sync-erp`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Successfully synced to ERP");
                // Update local list
                setAdmissions(admissions.map(a => a._id === id ? data.data : a));
                if (selectedAdmission && selectedAdmission._id === id) {
                    setSelectedAdmission(data.data);
                }
            } else {
                toast.error(data.message || "Failed to sync to ERP");
                // Fetch to get the updated error
                fetchAdmissions();
            }
        } catch (error) {
            console.error("Error syncing to ERP:", error);
            toast.error("An error occurred while syncing to ERP");
        } finally {
            setSyncingId(null);
        }
    };

    const filteredAdmissions = admissions.filter(a => 
        a.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.mobileNumber?.includes(searchTerm)
    );

    const handleExportCSV = () => {
        if (filteredAdmissions.length === 0) {
            toast.error("No records to export");
            return;
        }

        const headers = [
            "Date", "First Name", "Last Name", "Email", "Mobile Number",
            "Father Name", "City", "Branch", "Course", "Level", "Attempt", 
            "10th/12th Percentage", "Residential Area", "Residential City",
            "Earlier Coaching Class", "Earlier Coaching Contact",
            "Source Of Info", "Remark", "ERP Synced", "ERP Error"
        ];
        
        const csvRows = filteredAdmissions.map(record => {
            return [
                format(new Date(record.createdAt), "yyyy-MM-dd HH:mm:ss"),
                `"${(record.firstName || "").replace(/"/g, '""')}"`,
                `"${(record.lastName || "").replace(/"/g, '""')}"`,
                `"${(record.email || "").replace(/"/g, '""')}"`,
                `"${(record.mobileNumber || "").replace(/"/g, '""')}"`,
                `"${(record.fatherName || "").replace(/"/g, '""')}"`,
                `"${(record.city || "").replace(/"/g, '""')}"`,
                `"${(record.branch || "").replace(/"/g, '""')}"`,
                `"${(record.course || "").replace(/"/g, '""')}"`,
                `"${(record.level || "").replace(/"/g, '""')}"`,
                `"${(record.attempt || "").replace(/"/g, '""')}"`,
                `"${(record.percentage10_12 || "").replace(/"/g, '""')}"`,
                `"${(record.residentialArea || "").replace(/"/g, '""')}"`,
                `"${(record.residentialCity || "").replace(/"/g, '""')}"`,
                `"${(record.earlierCoachingClass || "").replace(/"/g, '""')}"`,
                `"${(record.earlierCoachingContactNumber || "").replace(/"/g, '""')}"`,
                `"${(record.sourceOfInfo || "").replace(/"/g, '""')}"`,
                `"${(record.remark || "").replace(/"/g, '""')}"`,
                record.erpSynced ? "Yes" : "No",
                `"${(record.erpError || "").replace(/"/g, '""')}"`
            ].join(",");
        });

        const csvContent = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `admissions-enquiries-${format(new Date(), "yyyy-MM-dd")}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admissions / Enquiries</h1>
                    <p className="text-muted-foreground">Manage and view all student admission enquiries.</p>
                </div>
            </div>

            <Card className="p-4">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or mobile..."
                                className="w-full pl-10 pr-4 py-2 border rounded-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8C84C4] text-white rounded-md text-sm font-medium hover:bg-[#7A73AB] transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export to CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-slate-50 border-y">
                            <tr>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Student Name</th>
                                <th className="px-4 py-3 font-medium">Contact Details</th>
                                <th className="px-4 py-3 font-medium">Course Info</th>
                                <th className="px-4 py-3 font-medium">Branch</th>
                                <th className="px-4 py-3 font-medium">ERP Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10">Loading...</td>
                                </tr>
                            ) : filteredAdmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-muted-foreground">No records found.</td>
                                </tr>
                            ) : (
                                filteredAdmissions.map((record) => (
                                    <tr key={record._id} className="border-b hover:bg-slate-50/50">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {format(new Date(record.createdAt), "dd MMM yyyy, hh:mm a")}
                                        </td>
                                        <td className="px-4 py-4 font-medium">
                                            {record.firstName} {record.lastName}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span>{record.email}</span>
                                                <span className="text-muted-foreground">{record.mobileNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-primary">{record.course}</span>
                                                <span className="text-xs text-muted-foreground">{record.level} | {record.attempt}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">{record.branch}</td>
                                        <td className="px-4 py-4">
                                            {record.erpSynced ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Synced
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800" title={record.erpError || "Not stored in ERP"}>
                                                    Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {!record.erpSynced && (
                                                    <button
                                                        onClick={() => handleSyncToERP(record._id)}
                                                        disabled={syncingId === record._id}
                                                        className="text-amber-600 hover:text-amber-700 flex items-center gap-1 disabled:opacity-50"
                                                        title="Retry ERP Sync"
                                                    >
                                                        <RefreshCw className={`w-4 h-4 ${syncingId === record._id ? 'animate-spin' : ''}`} />
                                                        <span className="text-xs font-medium">Sync</span>
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setSelectedAdmission(record)}
                                                    className="text-primary hover:text-primary/80 flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" /> View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* View Modal */}
            {selectedAdmission && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold">Admission Details</h2>
                                {selectedAdmission.erpSynced ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ ERP Synced
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        ✕ ERP Sync Failed
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setSelectedAdmission(null)} className="text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        </div>
                        
                        {!selectedAdmission.erpSynced && selectedAdmission.erpError && (
                            <div className="bg-red-50 text-red-800 p-4 mx-6 mt-6 rounded-md text-sm">
                                <strong>ERP Error:</strong> {selectedAdmission.erpError}
                            </div>
                        )}
                        
                        <div className="p-6">
                            {/* ENQUIRY DATA */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-primary mb-4 bg-slate-50 p-2 rounded">Step 1: Enquiry Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                                    <div><span className="text-slate-500 block text-xs uppercase">First Name</span> <span className="font-medium">{selectedAdmission.firstName || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">Last Name</span> <span className="font-medium">{selectedAdmission.lastName || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">Father's Name</span> <span className="font-medium">{selectedAdmission.fatherName || 'N/A'}</span></div>
                                    
                                    <div><span className="text-slate-500 block text-xs uppercase">Email</span> <span className="font-medium">{selectedAdmission.email || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">Mobile</span> <span className="font-medium">{selectedAdmission.mobileNumber || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">Alternate Contact</span> <span className="font-medium">{selectedAdmission.alternateContact || 'N/A'}</span></div>

                                    <div><span className="text-slate-500 block text-xs uppercase">Course</span> <span className="font-medium">{selectedAdmission.course || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">Level</span> <span className="font-medium">{selectedAdmission.level || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">Branch</span> <span className="font-medium">{selectedAdmission.branch || 'N/A'}</span></div>
                                    
                                    <div><span className="text-slate-500 block text-xs uppercase">Attempt</span> <span className="font-medium">{selectedAdmission.attempt || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">City</span> <span className="font-medium">{selectedAdmission.city || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">10th/12th Percentage</span> <span className="font-medium">{selectedAdmission.percentage10_12 || 'N/A'}</span></div>
                                    
                                    <div><span className="text-slate-500 block text-xs uppercase">Residential Area</span> <span className="font-medium">{selectedAdmission.residentialArea || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">Residential City</span> <span className="font-medium">{selectedAdmission.residentialCity || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">Earlier Coaching Class</span> <span className="font-medium">{selectedAdmission.earlierCoachingClass || 'N/A'}</span></div>

                                    <div><span className="text-slate-500 block text-xs uppercase">Earlier Coaching Contact</span> <span className="font-medium">{selectedAdmission.earlierCoachingContactNumber || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">Source of Info</span> <span className="font-medium">{selectedAdmission.sourceOfInfo || 'N/A'}</span></div>
                                    <div><span className="text-slate-500 block text-xs uppercase">Remark</span> <span className="font-medium">{selectedAdmission.remark || 'N/A'}</span></div>
                                </div>
                            </div>

                            {/* FULL ADMISSION DATA */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-primary mb-4 bg-slate-50 p-2 rounded">Step 2: Admission Form Data</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                    {/* Personal Details */}
                                    <div>
                                        <h4 className="font-bold border-b pb-1 mb-3 text-slate-700">Personal Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><span className="text-slate-500 block text-xs uppercase">Flat/Building</span> <span className="font-medium">{selectedAdmission.flatBuildingName || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Street Area</span> <span className="font-medium">{selectedAdmission.streetArea || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Country</span> <span className="font-medium">{selectedAdmission.country || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">State</span> <span className="font-medium">{selectedAdmission.state || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Pin Code</span> <span className="font-medium">{selectedAdmission.pinCode || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">WhatsApp</span> <span className="font-medium">{selectedAdmission.whatsapp || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Date of Birth</span> <span className="font-medium">{selectedAdmission.dob || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Gender</span> <span className="font-medium">{selectedAdmission.gender || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">CPT/PCC/IPCC Rank</span> <span className="font-medium">{selectedAdmission.cptRank || 'N/A'}</span></div>
                                        </div>
                                    </div>

                                    {/* Family Details */}
                                    <div>
                                        <h4 className="font-bold border-b pb-1 mb-3 text-slate-700">Family Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><span className="text-slate-500 block text-xs uppercase">Father Mobile</span> <span className="font-medium">{selectedAdmission.fatherMobile || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Father Occupation</span> <span className="font-medium">{selectedAdmission.fatherOccupation || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Mother's Name</span> <span className="font-medium">{selectedAdmission.motherName || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Mother Mobile</span> <span className="font-medium">{selectedAdmission.motherMobile || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Mother Occupation</span> <span className="font-medium">{selectedAdmission.motherOccupation || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Family CA Member</span> <span className="font-medium">{selectedAdmission.familyCa || 'N/A'}</span></div>
                                        </div>
                                    </div>
                                    
                                    {/* Additional Course & Payment Details */}
                                    <div className="col-span-1 md:col-span-2">
                                        <h4 className="font-bold border-b pb-1 mb-3 text-slate-700">Other & Payment Details</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div><span className="text-slate-500 block text-xs uppercase">ICAI Registration No</span> <span className="font-medium">{selectedAdmission.icaiRegistrationNo || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Payment Amount</span> <span className="font-medium text-green-600 font-bold">{selectedAdmission.paymentAmount ? `₹${selectedAdmission.paymentAmount}` : 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Transaction ID</span> <span className="font-medium">{selectedAdmission.txnid || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block text-xs uppercase">Payment Status</span> <span className={`font-medium ${selectedAdmission.stat?.toLowerCase() === 'success' ? 'text-green-600' : ''}`}>{selectedAdmission.stat || 'N/A'}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right text-xs text-slate-400 pt-4 border-t">
                                Record Created On: {format(new Date(selectedAdmission.createdAt), "PPP p")}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

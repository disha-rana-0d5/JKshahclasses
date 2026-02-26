import React, { useState, useEffect } from "react";
import {
    Briefcase,
    MapPin,
    Clock,
    ChevronRight,
    Search,
    User,
    Mail,
    Phone,
    GraduationCap,
    Upload,
    ArrowLeft,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { careerApi } from "../api/api";

export default function CareersPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        postApplied: "",
        resumeUrl: ""
    });

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        const { ok, data } = await careerApi.getActiveListings();
        if (ok) setListings(data.data || []);
        setLoading(false);
    };

    const handleApply = (job) => {
        setSelectedJob(job);
        setFormData({ ...formData, postApplied: job.title });
        setShowApplyModal(true);
    };

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/upload/file`, {
                method: 'POST',
                body: uploadFormData
            });
            const result = await response.json();
            if (result.url) {
                setFormData({ ...formData, resumeUrl: result.url });
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        const { ok } = await careerApi.submitApplication(formData);
        if (ok) {
            setSuccessMessage("Application submitted successfully!");
            setTimeout(() => {
                setShowApplyModal(false);
                setSuccessMessage("");
                setFormData({ name: "", email: "", phone: "", postApplied: "", resumeUrl: "" });
            }, 3000);
        }
        setFormLoading(false);
    };

    const filteredListings = listings.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [expandedJob, setExpandedJob] = useState(null);

    const toggleDetails = (jobId) => {
        setExpandedJob(expandedJob === jobId ? null : jobId);
    };

    const handleApplyClick = (job, e) => {
        e.stopPropagation();
        setSelectedJob(job);
        setFormData({ ...formData, postApplied: job.title });
        setShowApplyModal(true);
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section (Centered) */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4 text-center">
                        Join Our Team
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto text-center">
                        Explore exciting career opportunities at JK Shah Classes and help us shape the future of professional education.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 mt-8">
                    {/* Left Column: Listings Section */}
                    <div className="lg:w-1/2">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-1.5 h-8 bg-[#373081]"></div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Current <span className="font-normal">Openings</span>
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-[#373081]" />
                            </div>
                        ) : filteredListings.length > 0 ? (
                            <div className="space-y-4">
                                {filteredListings.map((job) => (
                                    <div
                                        key={job._id}
                                        className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-[#373081] bg-white shadow-sm hover:shadow-md"
                                    >
                                        <div
                                            className="p-5 flex items-center justify-between cursor-pointer"
                                            onClick={() => toggleDetails(job._id)}
                                        >
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">{job.title}</h3>
                                                <div className="flex items-center text-gray-500 text-sm mt-1 gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                        {job.location}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        {job.type}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    className="text-sm font-semibold text-gray-500 hover:text-[#373081] transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleDetails(job._id);
                                                    }}
                                                >
                                                    {expandedJob === job._id ? 'Hide Details' : 'View Details'}
                                                </button>
                                                <div
                                                    className="p-2 bg-[#373081] text-white rounded-md hover:bg-[#373081]/90 transition-colors"
                                                    onClick={(e) => handleApplyClick(job, e)}
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>

                                        {expandedJob === job._id && (
                                            <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50 animate-in slide-in-from-top-2 duration-300">
                                                <div className="prose prose-sm max-w-none text-gray-600 mb-6">
                                                    <p className="whitespace-pre-wrap">{job.description}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleApplyClick(job, e)}
                                                    className="px-6 py-2 bg-[#373081] text-white font-bold rounded-md hover:bg-[#373081]/90 transition-all text-sm uppercase tracking-wider"
                                                >
                                                    Apply Now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg p-5 flex items-center justify-between bg-white text-gray-400 italic">
                                <span>No current openings found in this category...</span>
                                <div className="text-gray-400">
                                    <span className="text-2xl font-light text-[#373081]">+</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Persistent "Get In Touch" Form */}
                    <div className="lg:w-1/2">
                        <div className="sticky top-24">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-8 bg-[#373081]"></div>
                                <h2 className="text-3xl font-bold text-gray-900 uppercase">Get In Touch</h2>
                            </div>
                            <p className="text-gray-600 mb-8 max-w-md">
                                Upload your CV for exciting Career Opportunities (Teaching as well as Non Teaching) @ JKSC
                            </p>

                            {successMessage && !showApplyModal ? (
                                <div className="py-12 px-8 text-center bg-green-50 rounded-xl border border-green-100 shadow-sm">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                                    <p className="text-gray-600 mb-6">{successMessage}</p>
                                    <button
                                        onClick={() => setSuccessMessage("")}
                                        className="text-[#373081] font-bold hover:underline"
                                    >
                                        Send another application
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Your Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter full name"
                                                className="w-full py-2 bg-transparent border-b border-gray-200 focus:border-[#373081] outline-none transition-colors text-gray-900 font-medium"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Your Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="example@email.com"
                                                className="w-full py-2 bg-transparent border-b border-gray-200 focus:border-[#373081] outline-none transition-colors text-gray-900 font-medium"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Your Phone</label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="+91 00000 00000"
                                                className="w-full py-2 bg-transparent border-b border-gray-200 focus:border-[#373081] outline-none transition-colors text-gray-900 font-medium"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Post Applied</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full py-2 bg-transparent border-b border-gray-200 focus:border-[#373081] outline-none transition-colors text-gray-900 font-medium"
                                                value={formData.postApplied}
                                                placeholder="e.g. Teaching"
                                                onChange={(e) => setFormData({ ...formData, postApplied: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Resume/CV only in PDF Format</label>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                required={!formData.resumeUrl}
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 disabled:opacity-50"
                                            />
                                            {uploading && (
                                                <span className="flex items-center gap-1 text-[#373081] text-sm font-semibold">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Uploading...
                                                </span>
                                            )}
                                            {formData.resumeUrl && !uploading && (
                                                <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Uploaded Successfully
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={formLoading || !formData.resumeUrl}
                                        className="px-10 py-4 bg-[#373081] text-white text-lg font-bold rounded-md hover:bg-[#373081]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto mt-4 uppercase tracking-widest shadow-lg shadow-[#373081]/20"
                                    >
                                        {formLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal (Dialogue) triggered by job arrows */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto pt-10 pb-10">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !formLoading && setShowApplyModal(false)} />
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl relative z-10 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowApplyModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-400 rotate-180" />
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-8 bg-[#373081]"></div>
                            <h2 className="text-3xl font-bold text-gray-900 uppercase">Apply for Role</h2>
                        </div>
                        <p className="text-gray-600 mb-8">
                            Applying for: <span className="font-bold text-gray-900">{selectedJob?.title}</span>
                        </p>

                        {successMessage ? (
                            <div className="py-12 text-center bg-green-50 rounded-xl border border-green-100">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                                <p className="text-gray-600 mb-6">{successMessage}</p>
                                <button
                                    onClick={() => setShowApplyModal(false)}
                                    className="text-[#373081] font-bold hover:underline"
                                >
                                    Close Dialog
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full py-2 bg-gray-50 border-b border-gray-200 focus:border-[#373081] outline-none transition-colors text-gray-900 font-medium cursor-not-allowed"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Your Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full py-2 bg-gray-50 border-b border-gray-200 focus:border-[#373081] outline-none transition-colors text-gray-900 font-medium cursor-not-allowed"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Your Phone</label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full py-2 bg-gray-50 border-b border-gray-200 focus:border-[#373081] outline-none transition-colors text-gray-900 font-medium cursor-not-allowed"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Post Applied</label>
                                        <input
                                            type="text"
                                            required
                                            readOnly
                                            className="w-full py-2 bg-gray-50 border-b border-gray-200 focus:border-[#373081] outline-none transition-colors text-gray-900 font-medium cursor-not-allowed"
                                            value={formData.postApplied}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-500 uppercase tracking-tighter">Resume/CV only in PDF Format</label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            required={!formData.resumeUrl}
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 disabled:opacity-50"
                                        />
                                        {uploading && (
                                            <span className="flex items-center gap-1 text-[#373081] text-sm font-semibold">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Uploading...
                                            </span>
                                        )}
                                        {formData.resumeUrl && !uploading && (
                                            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Uploaded
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={formLoading || !formData.resumeUrl}
                                    className="px-10 py-4 bg-[#373081] text-white text-lg font-bold rounded-md hover:bg-[#373081]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto uppercase tracking-widest shadow-lg shadow-[#373081]/20"
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Submit Application'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

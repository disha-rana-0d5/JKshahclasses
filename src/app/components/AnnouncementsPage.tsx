import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import {
    Bell,
    Calendar,
    ChevronRight,
    FileText,
    Search,
    Filter,
    ArrowRight,
    ImageIcon
} from "lucide-react";
import { announcementApi } from "../api/api";
import { Badge } from "./ui/badge";

export function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeType, setActiveType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchAnnouncements = async () => {
            setIsLoading(true);
            try {
                const { ok, data } = await announcementApi.getAnnouncements(true); // activeOnly = true
                if (ok && data.success) {
                    setAnnouncements(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch announcements:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    const filteredAnnouncements = announcements.filter(a => {
        const matchesType = activeType === "all" || a.type === activeType;
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    const totalPages = Math.ceil(filteredAnnouncements.length / ITEMS_PER_PAGE);
    const paginatedAnnouncements = filteredAnnouncements.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeType, searchQuery]);

    const types = [
        { id: "all", label: "All News" },
        { id: "exam", label: "Exams" },
        { id: "class", label: "Classes" },
        { id: "result", label: "Results" },
        { id: "general", label: "General" }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
            {/* Header Section */}
            <section className="relative pt-12 pb-12 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-left"
                    >
                        <Badge className="mb-4 bg-primary/5 text-primary border-primary/10 hover:bg-primary/10">
                            Updates & Notices
                        </Badge>
                        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 leading-tight">
                            Announcements <span className="text-primary">& Resources</span>
                        </h1>
                        <p className="text-gray-500 text-base max-w-xl">
                            Stay updated with the latest news, exam schedules, and important notifications from JK Shah Classes.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full md:max-w-md relative"
                    >
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-gray-800 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="pb-20 px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="max-w-7xl mx-auto">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-10">
                        {types.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setActiveType(type.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeType === type.id
                                    ? "bg-primary text-white shadow-md shadow-primary/10"
                                    : "bg-white text-gray-500 border border-gray-100 hover:border-primary/20 hover:text-primary"
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Announcements List */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-32" />
                            ))}
                        </div>
                    ) : filteredAnnouncements.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            <AnimatePresence mode="popLayout">
                                {paginatedAnnouncements.map((item, idx) => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{
                                            y: -5,
                                            scale: 1.005,
                                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
                                        }}
                                        transition={{
                                            layout: { duration: 0.3 },
                                            opacity: { duration: 0.3 },
                                            y: { duration: 0.3 },
                                            // Faster hover response
                                            default: { duration: 0.15, ease: "easeOut" }
                                        }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className={`group bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary/20 transition-all flex flex-col gap-6 ${expandedId === item._id ? "ring-2 ring-primary/5 shadow-xl shadow-primary/5" : ""
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start gap-6 w-full">
                                            <div className="flex flex-col gap-2 min-w-[140px]">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    <Calendar className="w-3 h-3 text-primary/60" />
                                                    {new Date(item.publishDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <Badge variant="outline" className={`w-fit text-[10px] px-2 py-0 h-5 capitalize ${item.type === 'exam' ? 'border-red-100 bg-red-50/50 text-red-600' :
                                                    item.type === 'class' ? 'border-blue-100 bg-blue-50/50 text-blue-600' :
                                                        item.type === 'result' ? 'border-green-100 bg-green-50/50 text-green-600' :
                                                            'border-gray-100 bg-gray-50/50 text-gray-500'
                                                    }`}>
                                                    {item.type}
                                                </Badge>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-gray-900 group-hover:text-primary transition-colors mb-1 ${expandedId === item._id ? "text-xl md:text-2xl" : "text-lg"
                                                    }`}>
                                                    {item.title}
                                                </h3>

                                                <AnimatePresence initial={false}>
                                                    {expandedId !== item._id && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="text-gray-500 text-sm line-clamp-1 prose prose-sm max-w-none"
                                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                                        />
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                {expandedId !== item._id && item.attachments && item.attachments.slice(0, 2).map((file: any, fidx: number) => (
                                                    <a
                                                        key={fidx}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                                                        title={file.name}
                                                    >
                                                        {file.fileType === 'pdf' ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                                                    </a>
                                                ))}
                                                <Button
                                                    variant={expandedId === item._id ? "secondary" : "ghost"}
                                                    size="sm"
                                                    className="text-primary font-bold hover:bg-primary/5 group/btn"
                                                    onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                                                >
                                                    {expandedId === item._id ? "Close" : "View"}
                                                    <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${expandedId === item._id ? "rotate-90" : "group-hover/btn:translate-x-1"
                                                        }`} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        <AnimatePresence>
                                            {expandedId === item._id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pt-6 border-t border-gray-50 mt-2">
                                                        <div
                                                            className="text-gray-600 text-base prose prose-blue max-w-none mb-8 leading-relaxed"
                                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                                        />

                                                        {item.attachments && item.attachments.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attachments</h4>
                                                                <div className="grid sm:grid-cols-2 gap-3">
                                                                    {item.attachments.map((file: any, fidx: number) => (
                                                                        <a
                                                                            key={fidx}
                                                                            href={file.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-transparent hover:border-primary/20 hover:bg-white transition-all text-sm font-medium text-gray-700 group/file"
                                                                        >
                                                                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-primary">
                                                                                {file.fileType === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                                                            </div>
                                                                            <span className="flex-1 truncate">{file.name}</span>
                                                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover/file:text-primary transition-colors" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-xl"
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
                                                    ? "bg-primary text-white"
                                                    : "bg-white text-gray-500 border border-gray-100 hover:border-primary/20"
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-xl"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No announcements found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search query.</p>
                            <Button variant="ghost" className="mt-4 text-primary font-bold" onClick={() => { setActiveType('all'); setSearchQuery(''); }}>
                                Reset Filters
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

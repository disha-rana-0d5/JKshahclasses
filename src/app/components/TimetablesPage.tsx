import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { landingPageApi, timeTableApi, erpCourseApi } from "../api/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function TimetablesPage() {
    const [timetableBranches, setTimetableBranches] = useState<string[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>("");
    const [timetables, setTimetables] = useState<any[]>([]);
    const [isTimetablesLoading, setIsTimetablesLoading] = useState(false);

    // Fetch branches for timetables
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await erpCourseApi.fetchExternalERPBranchDetails();
                if (res.ok && res.data?.data) {
                    const uniqueBranches = Array.from(new Set(res.data.data.map((b: any) => b.branchName))).sort() as string[];
                    setTimetableBranches(uniqueBranches);
                }
            } catch (error) {
                console.error("Error fetching branches:", error);
            }
        };
        fetchBranches();
    }, []);

    // Fetch timetables when branch selected
    useEffect(() => {
        if (!selectedBranch) {
            setTimetables([]);
            return;
        }
        const fetchTimetables = async () => {
            setIsTimetablesLoading(true);
            try {
                const res = await timeTableApi.getTimetables({ branch: selectedBranch });
                if (res.ok) {
                    // Only show those with pdfUrl
                    const valid = res.data.filter((t: any) => t.pdfUrl);
                    setTimetables(valid);
                }
            } catch (error) {
                console.error("Error fetching timetables:", error);
            } finally {
                setIsTimetablesLoading(false);
            }
        };
        fetchTimetables();
    }, [selectedBranch]);

    return (
        <div className="min-h-screen bg-[#F9F8FF] py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <div className="inline-block bg-[#FF9800] text-white px-4 py-1 rounded-full text-xs font-bold mb-4">
                        Timetables
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1A1A1A]">
                        Branch Timetables
                    </h2>
                    <p className="text-gray-600 mt-4 text-lg">Select your branch location to view the available schedules.</p>
                </motion.div>

                {/* Section header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF5E5] flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-[#FF9800]" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">Schedules</h3>
                        </div>
                    </div>
                    <div className="w-full md:w-[300px]">
                        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                            <SelectTrigger className="bg-white h-12 shadow-sm border-gray-200">
                                <SelectValue placeholder="Select your branch location" />
                            </SelectTrigger>
                            <SelectContent>
                                {timetableBranches.map((b, i) => (
                                    <SelectItem key={i} value={b}>{b}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Timetables list */}
                {!selectedBranch ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <MapPin className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium text-lg">Please select a branch to view timetables</p>
                    </div>
                ) : isTimetablesLoading ? (
                    <div className="flex justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 border-4 border-[#FF9800] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : timetables.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium text-lg">No timetables currently available for {selectedBranch}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {timetables.map((t, idx) => (
                            <motion.div
                                key={t._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -5 }}
                                onClick={() => window.open(t.pdfUrl, '_blank')}
                                className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl transition-all cursor-pointer group flex flex-col items-start shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">{t.courseName}</h4>
                                <p className="text-sm font-semibold text-gray-500 mb-1">{t.batchName}</p>
                                <p className="text-xs font-medium text-gray-400 mb-6 bg-slate-50 px-2 py-1 rounded-md">
                                    {t.fromDate && t.toDate ? `${format(new Date(t.fromDate), 'dd MMM yyyy')} - ${format(new Date(t.toDate), 'dd MMM yyyy')}` : 'Dates not available'}
                                </p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-100 w-full flex justify-between items-center">
                                    <span className="text-sm text-gray-500 font-semibold group-hover:text-orange-500 transition-colors">View PDF</span>
                                    <ChevronRight className="w-5 h-5 text-orange-500 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

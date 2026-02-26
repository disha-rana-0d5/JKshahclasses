import { useState } from "react";
import { useCourseContext, RankHolder } from "../admin/context/CourseContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Search, Trophy, Medal, Star, Shield, SortDesc, SortAsc } from "lucide-react";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

export function RankHoldersPage() {
    const { rankHolders, categories } = useCourseContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "global" | "india" | "name">("newest");

    const filteredRanks = rankHolders
        .filter(rank => {
            const matchesSearch = rank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rank.course.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All" || rank.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            const getRankNumber = (rank: string) => {
                const numeric = parseInt(rank.replace(/\D/g, ""));
                return isNaN(numeric) ? Infinity : numeric;
            };

            switch (sortOrder) {
                case "newest": {
                    const dateA = new Date((a as any).createdAt || 0).getTime();
                    const dateB = new Date((b as any).createdAt || 0).getTime();
                    return dateB - dateA;
                }
                case "oldest": {
                    const dateA = new Date((a as any).createdAt || 0).getTime();
                    const dateB = new Date((b as any).createdAt || 0).getTime();
                    return dateA - dateB;
                }
                case "global": {
                    const rankA = getRankNumber(a.globalRank);
                    const rankB = getRankNumber(b.globalRank);
                    return rankA - rankB;
                }
                case "india": {
                    const rankA = getRankNumber(a.indiaRank);
                    const rankB = getRankNumber(b.indiaRank);
                    return rankA - rankB;
                }
                case "name":
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

    const activeCategories = ["All", ...Array.from(new Set(rankHolders.map(r => r.category)))];

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
                        <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight tracking-tighter">Our Achievers</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">Celebrating the extraordinary achievements of our students who leading the way globally and nationally.</p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:max-w-3xl">
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                placeholder="Search by name or course..."
                                className="pl-11 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="w-full md:w-64">
                            <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                                <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl focus:ring-primary/20">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-primary/10 p-1.5 rounded-lg">
                                            {sortOrder === "name" ? <Star className="w-4 h-4 text-primary" /> : <SortDesc className="w-4 h-4 text-primary" />}
                                        </div>
                                        <SelectValue placeholder="Sort order" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100">
                                    <SelectItem value="newest" className="rounded-lg">Newest First</SelectItem>
                                    <SelectItem value="oldest" className="rounded-lg">Oldest First</SelectItem>
                                    <SelectItem value="global" className="rounded-lg">Top Global Ranks</SelectItem>
                                    <SelectItem value="india" className="rounded-lg">Top India Ranks</SelectItem>
                                    <SelectItem value="name" className="rounded-lg">Name (A-Z)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
                        {activeCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredRanks.map((rank) => (
                        <div key={rank._id} className="relative group bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                            {/* Purple Header with Name */}
                            <div className="bg-[#373081] p-4 text-center">
                                <h3 className="text-xl font-black text-white">{rank.name}</h3>
                            </div>

                            {/* Sub-header with Course and Year */}
                            <div className="bg-slate-50 py-2 border-b border-slate-100 flex items-center justify-center gap-3">
                                <span className="text-sm font-bold text-slate-600">{rank.course}</span>
                                <div className="w-px h-4 bg-slate-300" />
                                <span className="text-sm font-bold text-slate-600">{rank.session}</span>
                            </div>

                            {/* Full-width Image with Overlaid Rank Shields */}
                            <div className="relative aspect-[3/2] overflow-hidden">
                                <ImageWithFallback
                                    src={rank.image}
                                    alt={rank.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />

                                {/* Overlaid Shields */}
                                {/* Global - Bottom Left */}
                                {rank.globalRank && rank.globalRank?.trim() !== "" && (
                                    <div className="absolute bottom-3 left-3">
                                        <div className="relative">
                                            <Shield className="w-14 h-14 text-amber-500 fill-amber-600 drop-shadow-2xl" strokeWidth={2.5} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                                                <span className="text-[7px] font-black text-white uppercase leading-none">Global</span>
                                                <span className="text-lg font-black text-white leading-none">{rank.globalRank}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* India - Bottom Right */}
                                {rank.indiaRank && rank.indiaRank?.trim() !== "" && (
                                    <div className="absolute bottom-3 right-3">
                                        <div className="relative">
                                            <Shield className="w-14 h-14 text-slate-400 fill-slate-700 drop-shadow-2xl" strokeWidth={2.5} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                                                <span className="text-[7px] font-black text-white uppercase leading-none">India</span>
                                                <span className="text-lg font-black text-white leading-none">{rank.indiaRank}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pinned Category Ribbon - Top Right */}
                            <div className="absolute top-0 right-0 z-20 overflow-hidden w-28 h-28 pointer-events-none">
                                <div className="absolute top-6 -right-10 bg-accent text-white py-1.5 w-40 text-[10px] font-black uppercase tracking-tighter text-center shadow-lg transform rotate-45 border-b border-white/20">
                                    {rank.category}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRanks.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No Rank Holders Found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>

            {/* Background Decorations */}
            <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
            <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2" />
        </div>
    );
}

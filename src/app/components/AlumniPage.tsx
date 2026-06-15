import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { GraduationCap, Award, Users } from "lucide-react";
import { alumniApi } from "../api/api";

interface Alumni {
    _id: string;
    name: string;
    designation: string;
    image: string;
    isFeatured: boolean;
    order: number;
}

export function AlumniPage() {
    const [alumniMembers, setAlumniMembers] = useState<Alumni[]>([]);
    const [featuredAlumni, setFeaturedAlumni] = useState<Alumni | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlumni = async () => {
            try {
                const { ok, data } = await alumniApi.getAlumni({ limit: 100, sort: 'order' });
                if (ok && data.success) {
                    const allAlumni = data.data as Alumni[];
                    setAlumniMembers(allAlumni);

                    // Find featured alumni
                    const featured = allAlumni.find(a => a.isFeatured);
                    if (featured) {
                        setFeaturedAlumni(featured);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch alumni:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlumni();
    }, []);

    // Default featured if none found in API (for backward compatibility/legacy)
    const displayFeatured = featuredAlumni || {
        name: "Hon. Shri Piyush Goyal",
        designation: "Cabinet Minister of Commerce & Industry",
        image: "/uploads/alumni/piyush_goyal.jpg",
        isFeatured: true,
        order: 0
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24 font-sans">
            {/* Premium Hero Section */}
            <div className="relative overflow-hidden bg-[#373081] pt-20 pb-24 md:pt-24 md:pb-32">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-l from-white/20 to-transparent skew-x-12 transform translate-x-1/2" />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6 animate-fade-in">
                        <Award className="w-4 h-4 text-yellow-400" />
                        Legacy of Excellence
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 uppercase">
                        Our <span className="text-[#A79ACD]">Esteemed</span> Alumni
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/70 leading-relaxed italic">
                        "Celebrating the remarkable journeys of our former students who continue to shape the world with leadership and integrity."
                    </p>
                </div>
            </div>

            {/* Featured Alumni Section - Polished */}
            <div className="max-w-7xl mx-auto px-4 -mt-20 md:-mt-32 relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative flex flex-col md:flex-row min-h-[500px]">
                    {/* Background Decorative Gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#373081]/5 to-transparent rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                    {loading ? (
                        <div className="w-full flex items-center justify-center p-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#373081]"></div>
                                <p className="text-[#373081] font-medium animate-pulse">Loading Spotlight...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Image Side - Responsive Aspect Ratio & Non-Cutting Fit */}
                            <div className="w-full md:w-1/3 lg:w-2/5 xl:w-[45%] relative aspect-[4/5] md:aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                                <ImageWithFallback
                                    src={displayFeatured.image || "/uploads/placeholder.png"}
                                    alt={displayFeatured.name}
                                    className="w-full h-full object-contain object-center"
                                />
                            </div>

                            {/* Content Side */}
                            <div className="w-full md:w-2/3 lg:w-3/5 xl:w-[55%] p-8 md:px-12 md:py-16 flex flex-col justify-center relative z-10">
                                <div className="space-y-4">
                                    <span className="text-sm font-bold text-[#373081]/60 uppercase tracking-[0.2em] block">Inspirational Achiever</span>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#373081] uppercase leading-tight">
                                        {displayFeatured.name}
                                    </h2>
                                    <div className="h-1.5 w-24 bg-gradient-to-r from-[#373081] to-[#A79ACD] rounded-full mb-6" />
                                    <div className="space-y-2">
                                        {displayFeatured.designation.split(',').map((part, i) => (
                                            <p key={i} className={`text-xl md:text-2xl font-bold tracking-tight ${i === 0 ? 'text-slate-600 font-semibold' : 'text-[#373081]'}`}>
                                                {part.trim()}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="pt-8 flex flex-wrap gap-6 border-t border-slate-100 mt-8">
                                        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                            <div className="w-10 h-10 rounded-full bg-[#373081]/5 flex items-center justify-center text-[#373081]">
                                                <GraduationCap className="w-5 h-5" />
                                            </div>
                                            <span>JKShah Alumnus</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                            <div className="w-10 h-10 rounded-full bg-[#373081]/5 flex items-center justify-center text-[#373081]">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <span>Inspiration to Thousands</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Stats / Branding Divider */}
            <div className="max-w-7xl mx-auto px-4 mt-24 text-center">
                <div className="inline-block px-8 py-4 bg-[#373081]/5 rounded-2xl border border-[#373081]/10">
                    <p className="text-[#373081] font-bold text-xl md:text-2xl uppercase tracking-widest">A Community of Global Leaders</p>
                </div>
            </div>

            {/* Alumni Grid - Dynamic & Interactive */}
            <div className="max-w-7xl mx-auto px-4 mt-12 md:mt-16">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#373081]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-16">
                        {alumniMembers.filter(a => a._id !== (featuredAlumni?._id)).map((member, index) => (
                            <div key={member._id || index} className="flex flex-col items-center text-center group">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#373081] to-[#A79ACD] rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                                    <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-[6px] border-white ring-2 ring-[#A79ACD]/20 overflow-hidden shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:ring-[#373081]/30 group-hover:-translate-y-2">
                                        <ImageWithFallback
                                            src={member.image || "/uploads/placeholder.png"}
                                            alt={member.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 transition-all duration-300 group-hover:translate-y-[-4px]">
                                    <h3 className="text-[12px] md:text-[14px] font-black text-[#373081] uppercase leading-tight tracking-wide px-2 min-h-[2.5rem] flex items-center justify-center">
                                        {member.name}
                                    </h3>
                                    <div className="h-0.5 w-8 bg-[#A79ACD]/30 mx-auto transition-all duration-300 group-hover:w-16 group-hover:bg-[#373081]/40" />
                                    <p className="text-[10px] md:text-[12px] text-slate-500 font-bold leading-tight max-w-[140px] mx-auto px-1 uppercase tracking-tighter italic">
                                        {member.designation}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

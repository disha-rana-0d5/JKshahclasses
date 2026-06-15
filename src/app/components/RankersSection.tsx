"use client";

import { useState, useEffect } from "react";
import { rankHolderApi } from "../api/api";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "./ui/carousel";

interface RankHolder {
    _id: string;
    name: string;
    image: string;
    category: string;
    subCategory: string;
    globalRank: string;
    indiaRank: string;
    course: string;
    session: string;
    showOnLandingPage?: boolean;
    score?: string;
}

interface RankersSectionProps {
    category?: string;
    subCategory?: string;
    title?: string;
    isLandingPage?: boolean;
}

export function RankersSection({ category, subCategory, title, isLandingPage }: RankersSectionProps) {
    const [rankers, setRankers] = useState<RankHolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [api1, setApi1] = useState<CarouselApi>();
    const [api2, setApi2] = useState<CarouselApi>();

    useEffect(() => {
        const fetchRankers = async () => {
            setLoading(true);
            try {
                const params: any = { limit: 1000 };
                if (subCategory) params.subCategory = subCategory;
                else if (category) params.category = category;

                const { ok, data } = await rankHolderApi.getRankHolders(params);
                if (ok && data.success) {
                    let fetchedRankers = data.data || [];
                    
                    // Robust parser for custom session strings like "May-25"
                    const parseSessionToScore = (session: string) => {
                        if (!session) return 0;
                        // Match any 2-4 digits, even if attached to text (e.g. "May25")
                        const matches = session.match(/\d{2,4}/g);
                        let year = 0;
                        if (matches) {
                            // Take the last number found as the year
                            let num = parseInt(matches[matches.length - 1], 10);
                            // Convert 2-digit years to 4-digit years
                            year = num < 100 ? (num < 50 ? 2000 + num : 1900 + num) : num;
                        }
                        return year;
                    };

                    fetchedRankers.sort((a: RankHolder, b: RankHolder) => {
                        const scoreA = parseSessionToScore(a.session);
                        const scoreB = parseSessionToScore(b.session);
                        
                        if (scoreA !== scoreB) {
                            return scoreB - scoreA; // Highest score (newest date) first
                        }
                        
                        // Fallback to alphabetical if dates are somehow identical
                        return String(b.session || '').localeCompare(String(a.session || ''));
                    });

                    if (isLandingPage) {
                        fetchedRankers = fetchedRankers.filter((r: RankHolder) => r.showOnLandingPage);
                    }
                    setRankers(fetchedRankers);
                }
            } catch (err) {
                console.error("Failed to fetch rankers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRankers();
    }, [category, subCategory]);

    useEffect(() => {
        if (!api1) return;

        const intervalId = setInterval(() => {
            if (api1.canScrollNext()) {
                api1.scrollNext();
            } else {
                api1.scrollTo(0);
            }
        }, 4000);

        return () => clearInterval(intervalId);
    }, [api1]);

    useEffect(() => {
        if (!api2) return;

        const intervalId = setInterval(() => {
            if (api2.canScrollPrev()) {
                api2.scrollPrev();
            } else {
                api2.scrollTo(api2.scrollSnapList().length - 1);
            }
        }, 4000);

        return () => clearInterval(intervalId);
    }, [api2]);

    if (loading && rankers.length === 0) return null;
    if (!loading && rankers.length === 0) return null;

    return (
        <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-border overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                        {title || "Our Shining Stars"}
                    </h2>
                    <div className="h-1 w-20 bg-[#008d3d] mx-auto rounded-full mb-4 opacity-20" />
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto font-medium">
                        Celebrating the consistent excellence and extraordinary achievements of our students globally
                    </p>
                </div>

                {(() => {
                    const line1 = rankers.length >= 6 ? rankers.filter((_, idx) => idx % 2 === 0) : rankers;
                    const line2 = rankers.length >= 6 ? rankers.filter((_, idx) => idx % 2 !== 0) : rankers;

                    return (
                        <div className="space-y-8">
                            {/* Line 1 - Scrolls Right */}
                            <div className="relative px-4 sm:px-12">
                                <Carousel
                                    setApi={setApi1}
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-1 md:-ml-2">
                                        {line1.map((rank) => (
                                            <CarouselItem key={rank._id} className="px-2 md:px-3 basis-1/3 md:basis-1/5 lg:basis-[12.5%]">
                                                <div className="flex flex-col items-center text-center group cursor-default h-full">
                                                    <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                                        <div className="absolute inset-0 bg-[#008d3d] -z-10" />
                                                        <ImageWithFallback
                                                            src={rank.image}
                                                            alt={rank.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                                    </div>

                                                    <div className="space-y-1 px-1">
                                                        <div className="flex flex-col gap-0.5 items-center justify-center min-h-[24px]">
                                                            {rank.globalRank && rank.globalRank.trim() !== "" && (
                                                                <div className="text-[#008d3d] font-black text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-tight leading-tight">
                                                                    WORLD RANK {rank.globalRank}
                                                                </div>
                                                            )}
                                                            {rank.indiaRank && rank.indiaRank.trim() !== "" && (
                                                                <div className="text-[#008d3d] font-black text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-tight leading-tight">
                                                                    ALL INDIA RANK {rank.indiaRank}
                                                                </div>
                                                            )}
                                                            {rank.score && rank.score.trim() !== "" && (
                                                                <div className="text-[#373081] font-black text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-tight leading-tight">
                                                                    SCORE: {rank.score}
                                                                </div>
                                                            )}
                                                            {(!rank.globalRank || rank.globalRank.trim() === "") && (!rank.indiaRank || rank.indiaRank.trim() === "") && (!rank.score || rank.score.trim() === "") && (
                                                                <div className="text-[#008d3d] font-black text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-tight leading-tight">
                                                                    DISTINCTION
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h3 className="text-slate-900 font-bold text-[10px] sm:text-xs lg:text-sm line-clamp-1 leading-tight group-hover:text-[#008d3d] transition-colors">
                                                            {rank.name}
                                                        </h3>
                                                        <p className="text-slate-500 text-[9px] sm:text-[10px] font-semibold line-clamp-1 uppercase tracking-wider">
                                                            {rank.course}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="-left-4 sm:-left-12 h-10 w-10 bg-white shadow-lg border-slate-100 text-slate-400 hover:text-[#008d3d] transition-all" />
                                    <CarouselNext className="-right-4 sm:-right-12 h-10 w-10 bg-white shadow-lg border-slate-100 text-slate-400 hover:text-[#008d3d] transition-all" />
                                </Carousel>
                            </div>

                            {/* Line 2 - Scrolls Left */}
                            {line2.length > 0 && (
                                <div className="relative px-4 sm:px-12">
                                    <Carousel
                                        setApi={setApi2}
                                        opts={{
                                            align: "start",
                                            loop: true,
                                        }}
                                        className="w-full"
                                    >
                                        <CarouselContent className="-ml-1 md:-ml-2">
                                            {line2.map((rank) => (
                                                <CarouselItem key={rank._id} className="px-2 md:px-3 basis-1/3 md:basis-1/5 lg:basis-[12.5%]">
                                                    <div className="flex flex-col items-center text-center group cursor-default h-full">
                                                        <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                                            <div className="absolute inset-0 bg-[#008d3d] -z-10" />
                                                            <ImageWithFallback
                                                                src={rank.image}
                                                                alt={rank.name}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                                        </div>

                                                        <div className="space-y-1 px-1">
                                                            <div className="flex flex-col gap-0.5 items-center justify-center min-h-[24px]">
                                                                {rank.globalRank && rank.globalRank.trim() !== "" && (
                                                                    <div className="text-[#008d3d] font-black text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-tight leading-tight">
                                                                        WORLD RANK {rank.globalRank}
                                                                    </div>
                                                                )}
                                                                {rank.indiaRank && rank.indiaRank.trim() !== "" && (
                                                                    <div className="text-[#008d3d] font-black text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-tight leading-tight">
                                                                        ALL INDIA RANK {rank.indiaRank}
                                                                    </div>
                                                                )}
                                                                {rank.score && rank.score.trim() !== "" && (
                                                                    <div className="text-[#373081] font-black text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-tight leading-tight">
                                                                        SCORE: {rank.score}
                                                                    </div>
                                                                )}
                                                                {(!rank.globalRank || rank.globalRank.trim() === "") && (!rank.indiaRank || rank.indiaRank.trim() === "") && (!rank.score || rank.score.trim() === "") && (
                                                                    <div className="text-[#008d3d] font-black text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-tight leading-tight">
                                                                        DISTINCTION
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <h3 className="text-slate-900 font-bold text-[10px] sm:text-xs lg:text-sm line-clamp-1 leading-tight group-hover:text-[#008d3d] transition-colors">
                                                                {rank.name}
                                                            </h3>
                                                            <p className="text-slate-500 text-[9px] sm:text-[10px] font-semibold line-clamp-1 uppercase tracking-wider">
                                                                {rank.course}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="-left-4 sm:-left-12 h-10 w-10 bg-white shadow-lg border-slate-100 text-slate-400 hover:text-[#008d3d] transition-all" />
                                        <CarouselNext className="-right-4 sm:-right-12 h-10 w-10 bg-white shadow-lg border-slate-100 text-slate-400 hover:text-[#008d3d] transition-all" />
                                    </Carousel>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
        </section>
    );
}

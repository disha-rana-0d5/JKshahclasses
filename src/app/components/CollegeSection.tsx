import React, { useState, useEffect, useRef } from 'react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "./ui/carousel";
import { CountingNumber } from "./ui/CountingNumber";

export function CollegeSection() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    const sections = [
        {
            title: "The JKSC Legacy",
            mainStat: {
                value: "515987+", label: "Students Mentored Till Date"
            },
            subStats: [
                { value: "43+", label: " years of experience" },
                { value: "377+", label: " faculties" },
                { value: "10", label: "States" },
                { value: "49", label: "cities" },
                { value: "124", label: "Face to Face Centres" },
                { value: "3977+", label: "Rankers (since 2001)" },
            ]
        },
        // {
        //     title: "Chartered Accountancy",
        //     mainStat: { value: "1840", label: "CA RANKERS", subLabel: "SINCE 2001" },
        //     subStats: [
        //         { value: "556", label: "CAFC" },
        //         { value: "766", label: "INTER CA" },
        //         { value: "518", label: "FINAL CA" },
        //     ]
        // },
        // {
        //     title: "Company Secretary",
        //     mainStat: { value: "140", label: "CS RANKERS", subLabel: "SINCE 2016" },
        //     subStats: [
        //         { value: "34", label: "CSFC" },
        //         { value: "34", label: "EXECUTIVE" },
        //         { value: "39", label: "PROFESSIONALS" },
        //     ]
        // }
    ];

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5] relative overflow-hidden">
            {/* Logo Watermarks - Repeating Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: 'url("/logo-v2.png")',
                backgroundSize: '200px',
                backgroundRepeat: 'repeat',
            }} />

            {/* Dark Primary Decorative Corner Highlights */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-tr-full -z-0 pointer-events-none" />

            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-primary/20 pointer-events-none rounded-tr-xl" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-primary/20 pointer-events-none rounded-bl-xl" />

            <div className="max-w-7xl mx-auto relative z-10">
                <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
                    <CarouselContent>
                        {sections.map((section, sectionIdx) => (
                            <CarouselItem key={sectionIdx}>
                                {/* Section Header */}
                                <div className="flex justify-center mb-10">
                                    <div className="bg-primary/5 border border-primary/20 rounded-full px-6 py-1.5 backdrop-blur-sm shadow-sm flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <h2 className="text-sm md:text-base font-bold text-primary uppercase tracking-widest">
                                            {section.title}
                                        </h2>
                                    </div>
                                </div>

                                <div className="max-w-7xl mx-auto px-4">
                                    {/* Responsive Stats Layout - Using 8 columns to give main card more space */}
                                    <div className="grid grid-cols-2 lg:grid-cols-8 gap-4 md:gap-6 items-stretch">
                                        {/* Main Big Stat Card - Now spanning 2 columns on desktop for better fit */}
                                        <div className="col-span-2 lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-primary/10 flex flex-col items-center justify-center text-center group">
                                            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-black text-primary mb-3 block">
                                                {current === sectionIdx + 1 && <CountingNumber value={section.mainStat.value} />}
                                                {current !== sectionIdx + 1 && <span>{section.mainStat.value}</span>}
                                            </span>
                                            <p className="text-sm md:text-base font-bold text-foreground tracking-tight leading-tight uppercase">
                                                {section.mainStat.label}
                                            </p>
                                        </div>

                                        {/* Sub Stats - Grid on mobile/tablet, single row on desktop */}
                                        {section.subStats.map((stat, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-md hover:shadow-xl transition-all border border-primary/5 flex flex-col items-center justify-center text-center group hover:-translate-y-1 duration-300"
                                            >
                                                <span className="text-2xl sm:text-3xl md:text-3xl lg:text-2xl xl:text-3xl font-black text-primary/90 mb-2 group-hover:scale-110 transition-transform block">
                                                    {current === sectionIdx + 1 && <CountingNumber value={stat.value} />}
                                                    {current !== sectionIdx + 1 && <span>{stat.value}</span>}
                                                </span>
                                                <p className="text-[11px] md:text-xs font-bold text-muted-foreground tracking-widest uppercase leading-tight min-h-[40px] flex items-center justify-center">
                                                    {stat.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>

                {/* Pagination Dots */}
                {/* <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: count }).map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 rounded-full transition-all ${index + 1 === current ? "bg-[#373081] w-6" : "bg-gray-300 w-2 hover:bg-gray-400"
                                }`}
                            onClick={() => api?.scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div> */}
            </div>
        </section>
    );
}

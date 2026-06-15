import { useState, useEffect } from "react";
import { productApi } from "../api/api";

import { motion } from "motion/react";
import { Button } from "./ui/button";
import {
    ChevronRight,
    ChevronLeft,
    FileText,
    Heart,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

export function TestSeriesPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Today");

    const [testSeries, setTestSeries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterOptions, setFilterOptions] = useState<any>({
        categories: [],
        subcategories: [],
        publishers: [],
        years: []
    });
    const [selectedFilters, setSelectedFilters] = useState<any>({
        category: [],
        subcategory: [],
        publisher: [],
        year: []
    });



    useEffect(() => {
        const fetchFilters = async () => {
            const { ok, data } = await productApi.getProductFilterOptions('test-series');
            if (ok && data.success) {
                setFilterOptions(data.data);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const fetchTestSeries = async () => {
            setIsLoading(true);
            const params: any = { type: 'test-series', limit: 1000 };
            if (selectedFilters.category.length > 0) params.category = selectedFilters.category.join(',');
            if (selectedFilters.subcategory.length > 0) params.subcategory = selectedFilters.subcategory.join(',');
            if (selectedFilters.publisher.length > 0) params.publisher = selectedFilters.publisher.join(',');
            if (selectedFilters.year.length > 0) params.year = selectedFilters.year.join(',');

            const { ok, data } = await productApi.getProducts(params);
            if (ok && data.success) {
                setTestSeries(data.data);
            }
            setIsLoading(false);
        };
        fetchTestSeries();
    }, [selectedFilters]);

    const handleFilterChange = (key: string, value: string) => {
        setSelectedFilters((prev: any) => {
            const isSelected = prev[key].includes(value);
            const newValues = isSelected
                ? prev[key].filter((v: string) => v !== value)
                : [...prev[key], value];

            return {
                ...prev,
                [key]: newValues,
            };
        });
    };

    const clearFilters = () => {
        setSelectedFilters({
            category: [],
            subcategory: [],
            publisher: [],
            year: []
        });
    };

    const hasActiveFilters = Object.values(selectedFilters).some((v: any) => v.length > 0);

    return (
        <div className="flex flex-col min-h-screen bg-white overflow-hidden">
            {/* Main Browsing Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
                    {/* Left Sidebar Filters */}
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-[#1A1A1A]">Filters</h2>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" /> Clear All
                                </button>
                            )}
                        </div>

                        <Accordion type="multiple" defaultValue={["categories", "subcategories"]} className="space-y-4">
                            <AccordionItem value="categories" className="border-none bg-gray-50 rounded-2xl px-6">
                                <AccordionTrigger className="hover:no-underline font-bold text-[#1A1A1A]">Level / Grade</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-3 py-2">
                                        {filterOptions.categories.map((cat: any) => (
                                            <div key={cat._id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cat-${cat._id}`}
                                                    checked={selectedFilters.category.includes(cat._id)}
                                                    onCheckedChange={() => handleFilterChange("category", cat._id)}
                                                />
                                                <Label
                                                    htmlFor={`cat-${cat._id}`}
                                                    className="text-sm font-medium leading-none cursor-pointer"
                                                >
                                                    {cat.name}
                                                </Label>
                                            </div>
                                        ))}
                                        {filterOptions.categories.length === 0 && <p className="text-xs text-gray-400">No categories</p>}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>



                            <AccordionItem value="year" className="border-none bg-gray-50 rounded-2xl px-6">
                                <AccordionTrigger className="hover:no-underline font-bold text-[#1A1A1A]">Exam Term</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-3 py-2">
                                        {filterOptions.years.map((year: number) => (
                                            <div key={year} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`year-${year}`}
                                                    checked={selectedFilters.year.includes(year.toString())}
                                                    onCheckedChange={() => handleFilterChange("year", year.toString())}
                                                />
                                                <Label
                                                    htmlFor={`year-${year}`}
                                                    className="text-sm font-medium leading-none cursor-pointer"
                                                >
                                                    {year}
                                                </Label>
                                            </div>
                                        ))}
                                        {filterOptions.years.length === 0 && <p className="text-xs text-gray-400">No years available</p>}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Main Content Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8 overflow-x-auto">
                            <h2 className="text-3xl font-black text-[#1A1A1A]">Test Series</h2>
                            <div className="flex bg-gray-50 rounded-full p-1 min-w-max">
                                {["Today", "Latest", "Upcoming"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoading ? (
                                <div className="col-span-full flex justify-center py-20">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : testSeries.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl">
                                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Test Series Found</h3>
                                    <p className="text-gray-500">We couldn't find any test series matching your criteria.</p>
                                </div>
                            ) : (
                                testSeries.map((item) => (
                                    <motion.div
                                        key={item._id}
                                        whileHover={{ y: -5 }}
                                        className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => navigate(`/resources/books/${item.slug || item._id}`)}
                                    >
                                        <div className="bg-[#F8FAFC] rounded-2xl aspect-[4/3] overflow-hidden mb-5 flex items-center justify-center p-6 relative">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl"
                                                />
                                            ) : (
                                                <FileText className="w-16 h-16 text-blue-200" />
                                            )}
                                            <button className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                                                <Heart className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex-1 flex flex-col px-1">
                                            <h3 className="text-[15px] font-semibold text-[#1E293B] leading-[1.4] mb-4 line-clamp-3">
                                                {item.title}
                                            </h3>

                                            <div className="mt-auto">
                                                {item.oldPrice && item.price < item.oldPrice && (
                                                    <div className="inline-block bg-[#22C55E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-3">
                                                        {Math.round((1 - item.price / item.oldPrice) * 100)}% off
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    {item.oldPrice && (
                                                        <span className="text-gray-400 text-lg line-through font-medium">
                                                            ₹{item.oldPrice}
                                                        </span>
                                                    )}
                                                    <span className="text-blue-600 text-2xl font-extrabold flex items-center">
                                                        ₹{item.price}
                                                    </span>
                                                </div>

                                                {item.quantity === 0 && (
                                                    <p className="text-[#EF4444] text-xs font-bold mt-3 uppercase tracking-wider">
                                                        Sold Out
                                                    </p>
                                                )}

                                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                                                        {item.subcategory?.name || "General"}
                                                    </span>
                                                    <Button size="sm" className="h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-[10px] font-bold">
                                                        VIEW MORE
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

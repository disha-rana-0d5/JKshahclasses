import { useState, useEffect } from "react";
import { productApi } from "../api/api";

import { motion } from "motion/react";
import { Button } from "./ui/button";
import {
    ChevronRight,
    ChevronLeft,
    Truck,
    ShieldCheck,
    Award,
    RefreshCcw,
    BookOpen,
    Heart,
    X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

export function BooksPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Today");

    const [books, setBooks] = useState<any[]>([]);
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

    const features = [
        { icon: Truck, title: "Quick Delivery", desc: "Fast and reliable shipping for all your study materials delivered to your doorstep.", color: "text-blue-500", bg: "bg-blue-50" },
        { icon: ShieldCheck, title: "Secure Payment", desc: "100% safe and encrypted transactions with multiple secure payment methods.", color: "text-indigo-500", bg: "bg-indigo-50" },
        { icon: Award, title: "Best Quality", desc: "Premium books and resources meticulously curated by industry experts.", color: "text-purple-500", bg: "bg-purple-50" },
        { icon: RefreshCcw, title: "Return Guarantee", desc: "Easy returns and replacements for any damaged or incorrect items.", color: "text-indigo-500", bg: "bg-indigo-50" }
    ];

    useEffect(() => {
        const fetchFilters = async () => {
            const { ok, data } = await productApi.getProductFilterOptions('book');
            if (ok && data.success) {
                setFilterOptions(data.data);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true);
            const params: any = { type: 'book', limit: 1000 };
            if (selectedFilters.category.length > 0) params.category = selectedFilters.category.join(',');
            if (selectedFilters.subcategory.length > 0) params.subcategory = selectedFilters.subcategory.join(',');
            if (selectedFilters.publisher.length > 0) params.publisher = selectedFilters.publisher.join(',');
            if (selectedFilters.year.length > 0) params.year = selectedFilters.year.join(',');

            const { ok, data } = await productApi.getProducts(params);
            if (ok && data.success) {
                setBooks(data.data);
            }
            setIsLoading(false);
        };
        fetchBooks();
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
                // If category changes, we might want to clear subcategories that don't belong,
                // but with multi-select, it's safer to just let the UI filter the subcategory list.
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
            {/* Promo Hero Section */}
            <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6">
                    {/* Left Banner */}
                    <div className="lg:col-span-8 bg-[#EFEEFF] rounded-[40px] p-8 md:p-12 relative overflow-hidden min-h-[400px] flex items-center">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FF7D50] rounded-full translate-x-1/4 -translate-y-1/4 opacity-10"></div>
                        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[#FF7D50] rounded-full translate-x-1/3 -translate-y-1/3 z-0"></div>

                        <div className="relative z-10 max-w-md">
                            <p className="text-[#373081] font-bold text-xs tracking-widest uppercase mb-4">BACK TO SCHOOL</p>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1A1A1A] leading-tight mb-4">
                                Special <span className="text-[#373081]">50% Off</span><br />
                                <span className="text-2xl md:text-3xl font-bold">for our student community</span>
                            </h2>
                            <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                                We believe education should be supported in every way. To help students access quality resources at an affordable price, we're offering an exclusive 50% discount. Simply verify your student status and enjoy premium services designed to help you learn, grow, and succeed.
                            </p>
                            <div className="flex gap-4">
                                <Button className="bg-[#5C53E0] hover:bg-[#4A42C9] text-white rounded-xl px-8 py-6 text-sm font-bold transition-all">
                                    Get the deal <ChevronRight className="ml-2 w-4 h-4" />
                                </Button>
                                <Button variant="outline" className="border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl px-8 py-6 text-sm font-bold">
                                    See other promos
                                </Button>
                            </div>

                            {/* Pagination Dots */}
                            <div className="flex gap-1.5 mt-12">
                                <div className="w-4 h-1.5 bg-[#5C53E0] rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-[#D1D1D1] rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-[#D1D1D1] rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-[#D1D1D1] rounded-full"></div>
                            </div>
                        </div>

                        {/* Banner Image */}
                        <div className="absolute right-0 bottom-0 w-1/2 h-full hidden md:block">
                            <img
                                src="/images/student-promo.png"
                                alt="Student Promo"
                                className="w-full h-full object-contain object-top scale-x-[-1] mix-blend-multiply"
                            />
                        </div>
                    </div>

                    {/* Right Featured Card */}
                    <div className="lg:col-span-4 bg-[#3E6573] rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col items-center justify-center text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

                        <p className="text-2xl font-bold mb-6">Best Seller</p>
                        <p className="text-xs opacity-60 mb-8 font-medium">Based sales this week</p>

                        <div className="relative w-full aspect-[3/4] max-w-[200px] mb-8 group cursor-pointer">
                            <div className="absolute -inset-4 bg-white/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <img
                                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
                                alt="Best Seller"
                                className="w-full h-full object-cover rounded-xl shadow-2xl relative z-10 transition-transform group-hover:scale-105"
                            />

                            {/* Arrows */}
                            <button className="absolute left-[-20%] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 z-20 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="absolute right-[-20%] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 z-20 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold mb-1">Pushing Clouds</h3>
                        <p className="text-[10px] opacity-60 uppercase tracking-widest mb-6">ADVENTURE, SCIENCE, COMEDY</p>

                        <div className="bg-white rounded-full px-4 py-2 flex items-center gap-3">
                            <span className="text-[#3E6573] text-[10px] font-bold line-through opacity-40">68.00</span>
                            <span className="text-[#3E6573] text-sm font-black">USD 45.25</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Bar */}
            <section className="px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                            <div className={`${feature.bg} p-4 rounded-2xl`}>
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#1A1A1A] mb-1">{feature.title}</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Browsing Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
                    {/* Left Sidebar Filters */}
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-[#1A1A1A]">Filter Option</h2>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-[#5C53E0] hover:underline flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" /> Clear All
                                </button>
                            )}
                        </div>

                        <Accordion type="multiple" defaultValue={["categories", "subcategories"]} className="space-y-4">
                            <AccordionItem value="categories" className="border-none bg-gray-50 rounded-2xl px-6">
                                <AccordionTrigger className="hover:no-underline font-bold text-[#1A1A1A]">Shop by Category</AccordionTrigger>
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
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
                                <AccordionTrigger className="hover:no-underline font-bold text-[#1A1A1A]">Select Year</AccordionTrigger>
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
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {year}
                                                </Label>
                                            </div>
                                        ))}
                                        {filterOptions.years.length === 0 && <p className="text-xs text-gray-400">No years available</p>}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="publisher" className="border-none bg-gray-50 rounded-2xl px-6">
                                <AccordionTrigger className="hover:no-underline font-bold text-[#1A1A1A]">Choose Publisher</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-3 py-2">
                                        {filterOptions.publishers.map((pub: any) => (
                                            <div key={pub._id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`pub-${pub._id}`}
                                                    checked={selectedFilters.publisher.includes(pub._id)}
                                                    onCheckedChange={() => handleFilterChange("publisher", pub._id)}
                                                />
                                                <Label
                                                    htmlFor={`pub-${pub._id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {pub.name}
                                                </Label>
                                            </div>
                                        ))}
                                        {filterOptions.publishers.length === 0 && <p className="text-xs text-gray-400">No publishers available</p>}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Main Content Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8 overflow-x-auto">
                            <h2 className="text-3xl font-black text-[#1A1A1A]">Books</h2>
                            <div className="flex bg-gray-50 rounded-full p-1 min-w-max">
                                {["Today", "This Week", "This Month"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab ? "bg-white text-[#5C53E0] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoading ? (
                                <div className="col-span-full flex justify-center py-20">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : books.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl">
                                    <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Books Found</h3>
                                    <p className="text-gray-500">We couldn't find any books matching your criteria.</p>
                                </div>
                            ) : (
                                books.map((book) => (
                                    <motion.div
                                        key={book._id}
                                        whileHover={{ y: -5 }}
                                        className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => navigate(`/resources/books/${book.slug || book._id}`)}
                                    >
                                        {/* Image Container */}
                                        <div className="bg-[#F3F4F6] rounded-2xl aspect-[4/5] overflow-hidden mb-5 flex items-center justify-center p-6 relative">
                                            <img
                                                src={book.image}
                                                alt={book.title}
                                                className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl"
                                            />
                                            <button className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                                                <Heart className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 flex flex-col px-1">
                                            <h3 className="text-[15px] font-semibold text-[#4A1D1D] leading-[1.4] mb-4 line-clamp-3">
                                                {book.title}
                                            </h3>

                                            <div className="mt-auto">
                                                {book.oldPrice && book.price < book.oldPrice && (
                                                    <div className="inline-block bg-[#22C55E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-3">
                                                        {Math.round((1 - book.price / book.oldPrice) * 100)}% off
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    {book.oldPrice && (
                                                        <span className="text-gray-500 text-lg line-through font-medium">
                                                            {book.oldPrice}
                                                        </span>
                                                    )}
                                                    <span className="text-[#EF4444] text-2xl font-extrabold flex items-center">
                                                        ₹{book.price}
                                                    </span>
                                                </div>

                                                {book.quantity === 0 && (
                                                    <p className="text-[#EF4444] text-xs font-bold mt-3 uppercase tracking-wider">
                                                        Sold Out
                                                    </p>
                                                )}
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

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import {
    Play,
    Star,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    LayoutGrid,
    Clock,
    Tag
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productApi } from "../api/api";

export function ResourcesPage() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [books, setBooks] = useState<any[]>([]);
    const [isBooksLoading, setIsBooksLoading] = useState(true);
    const [testSeries, setTestSeries] = useState<any[]>([]);
    const [isTestSeriesLoading, setIsTestSeriesLoading] = useState(true);

    const booksScrollRef = useRef<HTMLDivElement>(null);
    const testSeriesScrollRef = useRef<HTMLDivElement>(null);

    const stats = [
        { label: "Years of eLearning Education Experience", value: "25+" },
        { label: "Students Enrolled in LMSZONE Courses", value: "56k" },
        { label: "Experienced Teacher's service.", value: "170+" },
    ];

    // Fetch product categories
    useEffect(() => {
        const fetchCategories = async () => {
            const { ok, data } = await productApi.getCategories();
            if (ok && data.success) setCategories(data.data || []);
        };
        fetchCategories();
    }, []);

    // Fetch products whenever category changes
    useEffect(() => {
        const fetchData = async () => {
            setIsBooksLoading(true);
            setIsTestSeriesLoading(true);

            const baseParams: Record<string, any> = { limit: 12 };
            if (activeCategory !== "all") baseParams.category = activeCategory;

            // Fetch Books
            const bookRes = await productApi.getProducts({ ...baseParams, type: "book" });
            if (bookRes.ok && bookRes.data.success) setBooks(bookRes.data.data || []);
            else setBooks([]);
            setIsBooksLoading(false);

            // Fetch Test Series
            const testRes = await productApi.getProducts({ ...baseParams, type: "test-series" });
            if (testRes.ok && testRes.data.success) setTestSeries(testRes.data.data || []);
            else setTestSeries([]);
            setIsTestSeriesLoading(false);
        };
        fetchData();
    }, [activeCategory]);

    const scrollProducts = (ref: React.RefObject<HTMLDivElement>, dir: "left" | "right") => {
        if (!ref.current) return;
        ref.current.scrollBy({ left: dir === "right" ? 260 : -260, behavior: "smooth" });
    };

    const discount = (price: number, oldPrice: number) =>
        Math.round((1 - price / oldPrice) * 100);

    return (
        <div className="flex flex-col min-h-screen bg-white overflow-hidden">

            {/* ── Hero Section ────────────────────────────── */}
            <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-32 px-4 sm:px-6 lg:px-8 bg-[#FFF5F1]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="z-10"
                        >
                            <div className="inline-block bg-[#FF7D50] text-white px-4 py-1 rounded-full text-xs font-bold mb-6">
                                eLearning Platform
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-[#1A1A1A] leading-tight mb-6">
                                Smart Learning <br />
                                <span className="text-[#1A1A1A]">Deeper &amp; More</span> <br />
                                <span className="text-[#FF7D50]">-Amazing</span>
                            </h1>
                            <p className="text-gray-600 text-lg mb-8 max-w-lg leading-relaxed">
                                Phosphorescently deploy unique intellectual capital without enterprise-
                                after bricks &amp; clicks synergy. Enthusiastically revolutionize intuitive.
                            </p>
                            <div className="flex flex-wrap gap-4 items-center">
                                <Button
                                    size="lg"
                                    className="bg-[#00BA9D] hover:bg-[#00BA9D]/90 text-white rounded-full px-8 py-6 text-base font-bold transition-all hover:scale-105"
                                    onClick={() => navigate("/courses")}
                                >
                                    Start Free Trial
                                    <span className="ml-2">↗</span>
                                </Button>
                                <button className="flex items-center gap-3 group px-4 py-2">
                                    <div className="w-12 h-12 bg-[#FF7D50] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#FF7D50]/20 group-hover:scale-110 transition-transform">
                                        <Play className="w-5 h-5 fill-current" />
                                    </div>
                                    <span className="font-bold text-[#1A1A1A]">How it Work</span>
                                </button>
                            </div>
                        </motion.div>

                        {/* Right */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative flex justify-center lg:justify-end"
                        >
                            <div className="relative w-full max-w-[500px]">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7D50]/10 to-transparent rounded-full -z-0 scale-125" />
                                <div className="absolute inset-0 border border-gray-200 rounded-full -z-0 scale-110" />
                                <div className="absolute inset-0 border border-gray-100 rounded-full -z-0 scale-150 opacity-50" />
                                <div className="relative z-10">
                                    <img
                                        src="/uploads/2026/03/student_transperent.png"
                                        alt="Student"
                                        className="w-full h-auto object-contain mix-blend-multiply"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FFF5F1] to-transparent pointer-events-none" />
                                </div>
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -left-8 top-1/4 z-20 bg-white p-3 rounded-2xl shadow-xl"
                                >
                                    <div className="bg-[#FFCC00] p-1.5 rounded-lg">
                                        <Star className="w-6 h-6 text-white fill-current" />
                                    </div>
                                </motion.div>
                                <motion.div
                                    animate={{ x: [0, 10, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -right-10 bottom-1/3 z-20"
                                >
                                    <div className="bg-[#FF7D50] text-white font-black text-6xl opacity-10 select-none -rotate-12">
                                        Learn
                                    </div>
                                </motion.div>
                                <div className="absolute -bottom-10 -right-5 w-48 h-48 bg-[#FF7D50]/10 rounded-full blur-3xl -z-10" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Stats Section ────────────────────────────── */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-block bg-[#00BA9D] text-white px-4 py-1 rounded-full text-xs font-bold mb-6">
                            About Us
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#1A1A1A] max-w-3xl mx-auto leading-snug mb-16">
                            <span className="text-gray-900">We are passionate about empowering learners</span>{" "}
                            <span className="text-gray-500">
                                Worldwide with high-quality, accessible &amp; engaging education.
                                Our mission offering a diverse range of courses.
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-12 text-left max-w-5xl mx-auto">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="flex items-center gap-6 group"
                            >
                                <div className="text-5xl lg:text-6xl font-extrabold text-[#1A1A1A] group-hover:text-[#FF7D50] transition-colors">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-semibold text-gray-500 max-w-[140px] leading-tight">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Explore Our Products ─────────────────────── */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F9F8FF]">
                <div className="max-w-7xl mx-auto">

                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-10"
                    >
                        <div className="inline-block bg-[#5C53E0] text-white px-4 py-1 rounded-full text-xs font-bold mb-4">
                            Our Products
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1A1A1A]">
                            Explore Our Products
                        </h2>
                    </motion.div>

                    {/* ── Category Boxes ── */}
                    {categories.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-wrap gap-3 mb-12"
                        >
                            {/* All */}
                            <button
                                onClick={() => setActiveCategory("all")}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all ${activeCategory === "all"
                                    ? "bg-[#5C53E0] text-white border-[#5C53E0] shadow-lg shadow-[#5C53E0]/20"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-[#5C53E0] hover:text-[#5C53E0]"
                                    }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                All
                            </button>

                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => setActiveCategory(cat._id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all ${activeCategory === cat._id
                                        ? "bg-[#5C53E0] text-white border-[#5C53E0] shadow-lg shadow-[#5C53E0]/20"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-[#5C53E0] hover:text-[#5C53E0]"
                                        }`}
                                >
                                    <Tag className="w-3.5 h-3.5" />
                                    {cat.name}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {/* ── Books Carousel ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-16"
                    >
                        {/* Section header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#EFEEFF] flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-[#5C53E0]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Books</h3>
                                    <p className="text-xs text-gray-400">Browse our book collection</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => scrollProducts(booksScrollRef, "left")}
                                    className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#5C53E0] hover:text-[#5C53E0] transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => scrollProducts(booksScrollRef, "right")}
                                    className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#5C53E0] hover:text-[#5C53E0] transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => navigate("/resources/books")}
                                    className="ml-2 text-xs font-bold text-[#5C53E0] hover:underline flex items-center gap-1"
                                >
                                    View All <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Book cards */}
                        {isBooksLoading ? (
                            <div className="flex justify-center py-16">
                                <div className="w-12 h-12 border-4 border-[#5C53E0] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : books.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100">
                                <BookOpen className="w-10 h-10 text-gray-200 mb-3" />
                                <p className="text-gray-400 font-medium text-sm">No books found in this category</p>
                            </div>
                        ) : (
                            <div
                                ref={booksScrollRef}
                                className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                            >
                                {books.map((book, idx) => (
                                    <motion.div
                                        key={book._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ y: -5 }}
                                        onClick={() => navigate(`/resources/books/${book.slug || book._id}`)}
                                        className="min-w-[200px] max-w-[200px] bg-white rounded-3xl p-3 border border-gray-100 hover:shadow-xl transition-all snap-start cursor-pointer group flex flex-col"
                                    >
                                        {/* Cover */}
                                        <div className="bg-[#F3F4F6] rounded-2xl aspect-[3/4] overflow-hidden mb-3 flex items-center justify-center p-4 relative">
                                            <img
                                                src={book.image}
                                                alt={book.title}
                                                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                                            />
                                            {book.oldPrice && book.price < book.oldPrice && (
                                                <div className="absolute top-2 left-2 bg-[#22C55E] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                                    {discount(book.price, book.oldPrice)}% off
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 px-1 flex flex-col justify-between">
                                            <h4 className="text-[12px] font-semibold text-gray-800 leading-snug mb-2 line-clamp-2">
                                                {book.title}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                {book.oldPrice && (
                                                    <span className="text-gray-400 text-xs line-through">₹{book.oldPrice}</span>
                                                )}
                                                <span className="text-[#EF4444] text-base font-black">₹{book.price}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* ── Test Series ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {/* Section header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#FFF0F3] flex items-center justify-center">
                                    <LayoutGrid className="w-5 h-5 text-[#E94B64]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Test Series</h3>
                                    <p className="text-xs text-gray-400">Practice tests &amp; mock exams</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => scrollProducts(testSeriesScrollRef, "left")}
                                    className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#E94B64] hover:text-[#E94B64] transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => scrollProducts(testSeriesScrollRef, "right")}
                                    className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#E94B64] hover:text-[#E94B64] transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => navigate("/resources/test-series")}
                                    className="ml-2 text-xs font-bold text-[#E94B64] hover:underline flex items-center gap-1"
                                >
                                    View All <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Test Series cards */}
                        {isTestSeriesLoading ? (
                            <div className="flex justify-center py-16">
                                <div className="w-12 h-12 border-4 border-[#E94B64] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : testSeries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100">
                                <Clock className="w-10 h-10 text-gray-200 mb-3" />
                                <p className="text-gray-400 font-medium text-sm">No test series found in this category</p>
                            </div>
                        ) : (
                            <div
                                ref={testSeriesScrollRef}
                                className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                            >
                                {testSeries.map((item, idx) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ y: -5 }}
                                        onClick={() => navigate(`/resources/books/${item.slug || item._id}`)}
                                        className="min-w-[200px] max-w-[200px] bg-white rounded-3xl p-3 border border-gray-100 hover:shadow-xl transition-all snap-start cursor-pointer group flex flex-col"
                                    >
                                        <div className="bg-[#F8FAFC] rounded-2xl aspect-[3/4] overflow-hidden mb-3 flex items-center justify-center p-4 relative">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <LayoutGrid className="w-10 h-10 text-blue-100" />
                                            )}
                                            {item.oldPrice && item.price < item.oldPrice && (
                                                <div className="absolute top-2 left-2 bg-[#22C55E] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                                    {discount(item.price, item.oldPrice)}% off
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 px-1 flex flex-col justify-between">
                                            <h4 className="text-[12px] font-semibold text-gray-800 leading-snug mb-2 line-clamp-2">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                {item.oldPrice && (
                                                    <span className="text-gray-400 text-xs line-through">₹{item.oldPrice}</span>
                                                )}
                                                <span className="text-blue-600 text-base font-black">₹{item.price}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                </div>
            </section>
        </div>
    );
}

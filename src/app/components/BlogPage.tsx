import { useState, useEffect, useCallback } from "react";
import { blogApi } from "../api/api";
import { Loader2, Calendar, User, ChevronRight, Search, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { BlogSidebar } from "./BlogSidebar";
import { ListingPagination } from "./ui/ListingPagination";

export function BlogPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI input states (decoupled from URL sync to allow independent typing)
    const [headerSearchInput, setHeaderSearchInput] = useState(searchParams.get("search") || "");
    const [sidebarSearchInput, setSidebarSearchInput] = useState(searchParams.get("search") || "");

    // Derived values from URL parameters (Primary Data Source)
    const selectedCategory = searchParams.get("category");
    const searchQuery = searchParams.get("search") || "";
    const currentPage = parseInt(searchParams.get("page") || "1");

    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchBlogs = useCallback(async (page: number, search: string, cat: string | null) => {
        setLoading(true);
        try {
            const params: any = {
                page,
                limit: 10,
                search
            };
            if (cat) params.category = cat;

            const res = await blogApi.getBlogs(params);
            if (res.ok) {
                setBlogs(res.data.data);
                setTotalPages(res.data.totalPages);
                setTotalItems(res.data.totalResults);
            }
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await blogApi.getCategories({ limit: 100, onlyActive: true });
            if (res.ok) setCategories(res.data.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch blogs when URL params change
    useEffect(() => {
        fetchBlogs(currentPage, searchQuery, selectedCategory);
    }, [currentPage, searchQuery, selectedCategory, fetchBlogs]);

    // Sync input fields ONLY when the URL search param changes globally
    useEffect(() => {
        setHeaderSearchInput(searchQuery);
        setSidebarSearchInput(searchQuery);
    }, [searchQuery]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        setSearchParams(params);
        window.scrollTo(0, 0);
    };

    const handleHeaderSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (headerSearchInput) {
            params.set("search", headerSearchInput);
            params.delete("category"); // Header search is global
        } else {
            params.delete("search");
        }
        params.set("page", "1");
        setSearchParams(params);
    };

    const handleSidebarSearch = (query: string) => {
        const params = new URLSearchParams(searchParams);
        if (query) {
            params.set("search", query);
            // Optional: User might want to keep category when searching from sidebar
            // but the request implies they should work differently.
            // Keeping category for sidebar search as it's "contextual"
        } else {
            params.delete("search");
        }
        params.set("page", "1");
        setSearchParams(params);
    };

    const handleCategorySelect = (cat: string | null) => {
        const params = new URLSearchParams(); // Reset all params when selecting category
        if (cat) params.set("category", cat);

        // This clears search and resets page
        setSearchParams(params);
        setHeaderSearchInput("");
        setSidebarSearchInput("");
    };

    const handleClearFilters = () => {
        setSearchParams({});
        setHeaderSearchInput("");
        setSidebarSearchInput("");
    };

    return (
        <div className="min-h-screen bg-white pb-20 font-sans">
            {/* Minimalist Header Section */}
            <div className="bg-white pt-28 pb-16 px-4 border-b border-gray-100">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif italic">
                            The JK Shah Journal
                        </h1>
                        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
                            Expert insights, exam strategies, and the latest from the world of professional education.
                        </p>
                    </motion.div>

                    {/* Minimalist Search */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="max-w-xl mx-auto relative"
                    >
                        <form onSubmit={handleHeaderSearchSubmit}>
                            <div className="relative group">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search stories, ideas, and expertise..."
                                    className="pl-8 pr-4 py-6 bg-transparent border-0 border-b border-gray-200 rounded-none shadow-none focus-visible:ring-0 focus-visible:border-primary text-gray-900 text-lg placeholder:text-gray-400 decoration-none"
                                    value={headerSearchInput}
                                    onChange={(e) => setHeaderSearchInput(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-primary font-bold hover:bg-transparent"
                                >
                                    Search
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-gray-500 font-medium">Fetching the latest stories...</p>
                            </div>
                        ) : blogs.length > 0 ? (
                            <div className="space-y-12">
                                {/* Featured Post - Only on First Page with No Search/Category */}
                                {currentPage === 1 && !searchQuery && !selectedCategory && blogs[0] && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="mb-16"
                                    >
                                        <Link
                                            to={`/blog/${blogs[0].slug}`}
                                            className="group grid lg:grid-cols-2 gap-8 items-center"
                                        >
                                            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100">
                                                <img
                                                    src={blogs[0].image}
                                                    alt={blogs[0].title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary">
                                                    <span>{blogs[0].category?.name || "Featured"}</span>
                                                </div>
                                                <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 leading-tight group-hover:underline decoration-primary/30 underline-offset-4">
                                                    {blogs[0].title}
                                                </h2>
                                                <div
                                                    className="text-gray-600 text-lg line-clamp-3 leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: blogs[0].description }}
                                                />
                                                <div className="pt-2">
                                                    <p className="text-sm font-serif italic text-gray-500">
                                                        {new Date(blogs[0].createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )}

                                {/* Blog Feed */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {blogs.slice(currentPage === 1 && !searchQuery && !selectedCategory ? 1 : 0).map((blog, idx) => (
                                        <motion.div
                                            key={blog._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                                        >
                                            <Link
                                                to={`/blog/${blog.slug}`}
                                                className="group flex flex-col h-full bg-white rounded-xl overflow-hidden"
                                            >
                                                <div className="relative aspect-[16/9] overflow-hidden rounded-xl mb-6">
                                                    <img
                                                        src={blog.image}
                                                        alt={blog.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-primary">
                                                        <span>{blog.category?.name || "Article"}</span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight font-serif group-hover:text-primary transition-colors">
                                                        {blog.title}
                                                    </h3>
                                                    <div
                                                        className="text-gray-500 text-sm line-clamp-2 leading-relaxed"
                                                        dangerouslySetInnerHTML={{ __html: blog.description }}
                                                    />
                                                    <div className="pt-2">
                                                        <span className="text-xs font-serif italic text-gray-400">
                                                            {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-12 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                        <ListingPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                            totalItems={totalItems}
                                            itemsPerPage={10}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-20 text-center border border-dashed border-gray-200 shadow-sm">
                                <div className="max-w-sm mx-auto">
                                    <div className="bg-primary/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                        <Search className="h-10 w-10 text-primary/40" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                                    <p className="text-gray-500 mb-8">We couldn't find any articles matching your search criteria. Try adjusting your filters.</p>
                                    <Button
                                        variant="default"
                                        className="rounded-full px-8"
                                        onClick={handleClearFilters}
                                    >
                                        Clear all filters
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <BlogSidebar
                        searchQuery={sidebarSearchInput}
                        setSearchQuery={setSidebarSearchInput}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={handleCategorySelect}
                        onSearch={() => handleSidebarSearch(sidebarSearchInput)}
                    />
                </div>
            </div>
        </div>
    );
}

export default BlogPage;

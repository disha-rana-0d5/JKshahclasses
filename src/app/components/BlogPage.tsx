import { useState, useEffect, useCallback } from "react";
import { blogApi } from "../api/api";
import { Loader2, Calendar, User, ChevronRight, Search } from "lucide-react";
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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Section */}
            <div className="bg-primary pt-24 pb-12 px-4 shadow-lg">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Our Blog</h1>
                    <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto mb-8">
                        Our latest news and thought leadership pieces.
                    </p>

                    {/* Header Global Search */}
                    <div className="max-w-md mx-auto relative group">
                        <form onSubmit={handleHeaderSearchSubmit}>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search articles globally..."
                                    className="pl-12 pr-4 py-6 bg-white border-0 rounded-full shadow-xl focus-visible:ring-2 focus-visible:ring-white/20 text-gray-900"
                                    value={headerSearchInput}
                                    onChange={(e) => setHeaderSearchInput(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6 h-9 bg-primary hover:bg-primary-dark"
                                >
                                    Search
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-gray-500 font-medium">Updating results...</p>
                            </div>
                        ) : blogs.length > 0 ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {blogs.map((blog) => (
                                        <Link
                                            key={blog._id}
                                            to={`/blog/${blog.slug}`}
                                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                                        >
                                            <div className="relative h-64 overflow-hidden">
                                                <img
                                                    src={blog.image}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                    {blog.category?.name || "Uncategorized"}
                                                </div>
                                            </div>
                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-4 uppercase tracking-widest font-bold">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(blog.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="h-1 w-1 bg-gray-300 rounded-full" />
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="h-3 w-3" />
                                                        {blog.author || "Admin"}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                    {blog.title}
                                                </h3>
                                                <div
                                                    className="text-gray-500 text-sm mb-6 line-clamp-3 overflow-hidden leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: blog.description }}
                                                />
                                                <div className="mt-auto flex items-center text-primary font-bold text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                                                    Read Full Article <ChevronRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </Link>
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

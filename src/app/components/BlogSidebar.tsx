import { Search, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { blogApi } from "../api/api";
import { Link } from "react-router-dom";

interface BlogSidebarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    categories: any[];
    selectedCategory?: string | null;
    setSelectedCategory?: (id: string | null) => void;
    onSearch?: () => void;
}

export function BlogSidebar({
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    onSearch
}: BlogSidebarProps) {
    const [localSearch, setLocalSearch] = useState(searchQuery);

    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    const handleSearchClick = () => {
        setSearchQuery(localSearch);
        if (onSearch) onSearch();
    };

    return (
        <div className="w-full lg:w-80 space-y-8">
            {/* Search Widget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 px-1">Search</h4>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search blogs..."
                        className="pl-10"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearchClick();
                            }
                        }}
                    />
                </div>
            </div>

            {/* Category Widget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 px-1">Categories</h4>
                <div className="space-y-2">
                    <button
                        onClick={() => setSelectedCategory && setSelectedCategory(null)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setSelectedCategory && setSelectedCategory(cat._id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat._id ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Posts Widget */}
            <RecentPostsWidget />

            {/* Newsletter Widget (Placeholder) */}
            <div className="bg-primary rounded-xl p-6 text-white overflow-hidden relative">
                <div className="relative z-10">
                    <h4 className="font-bold text-xl mb-2">Subscribe</h4>
                    <p className="text-white/80 text-sm mb-4">Get the latest updates directly in your inbox.</p>
                    <Input
                        placeholder="Email Address"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 mb-3"
                    />
                    <Button className="w-full bg-white text-primary hover:bg-gray-100">
                        Subscribe Now
                    </Button>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
        </div>
    );
}

function RecentPostsWidget() {
    const [recentPosts, setRecentPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRecent = async () => {
            setLoading(true);
            try {
                const res = await blogApi.getBlogs({ limit: 5 });
                if (res.ok) {
                    setRecentPosts(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch recent posts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    if (loading) return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
    );

    if (recentPosts.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 px-1">Recent Posts</h4>
            <div className="space-y-4">
                {recentPosts.map((post) => (
                    <Link
                        key={post._id}
                        to={`/blog/${post.slug}`}
                        className="group block"
                    >
                        <h5 className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {post.title}
                        </h5>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

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
        <div className="w-full lg:w-80 space-y-12 pt-4">
            {/* Search Widget */}
            <div className="pb-8 border-b border-gray-100">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-widest mb-4">Search</h4>
                <div className="relative group">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search stories..."
                        className="pl-7 pr-0 py-2 bg-transparent border-0 border-b border-gray-200 rounded-none shadow-none focus-visible:ring-0 focus-visible:border-gray-900 text-sm transition-all"
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
            <div className="pb-8 border-b border-gray-100">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-widest mb-6">Categories</h4>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory && setSelectedCategory(null)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!selectedCategory ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setSelectedCategory && setSelectedCategory(cat._id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedCategory === cat._id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Posts Widget */}
            <RecentPostsWidget />

            {/* Newsletter Widget */}
            <div className="bg-gray-900 rounded-2xl p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                    <h4 className="font-serif italic text-2xl mb-2">Stay in the loop</h4>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">Join our weekly newsletter for exclusive tips and updates.</p>
                    <div className="space-y-3">
                        <Input
                            placeholder="Your email address"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-lg py-5 px-4 focus-visible:ring-1 focus-visible:ring-white/20"
                        />
                        <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold py-5 rounded-lg transition-transform group-hover:scale-[1.02]">
                            Subscribe
                        </Button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors"></div>
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
        <div className="pb-8 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-widest mb-6">Trending Stories</h4>
            <div className="space-y-6">
                {recentPosts.map((post, idx) => (
                    <Link
                        key={post._id}
                        to={`/blog/${post.slug}`}
                        className="group flex gap-4"
                    >
                        <span className="text-2xl font-bold text-gray-200 font-serif group-hover:text-primary/20 transition-colors">
                            0{idx + 1}
                        </span>
                        <div className="space-y-1">
                            <h5 className="text-sm font-bold text-gray-900 group-hover:underline decoration-primary/30 underline-offset-2 line-clamp-2 leading-tight font-serif">
                                {post.title}
                            </h5>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

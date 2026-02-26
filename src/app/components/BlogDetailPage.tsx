import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { blogApi } from "../api/api";
import { Loader2, Calendar, User, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { BlogSidebar } from "./BlogSidebar";

export function BlogDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchBlog();
        fetchCategories();
    }, [slug]);

    useEffect(() => {
        if (!blog) return;

        // Update Title
        const baseTitle = blog.metaTitle || blog.title || "JK Shah Classes Blog";
        document.title = `${baseTitle} | JK Shah Classes`;

        // Update Meta Description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }

        // Strip HTML from description if using it as fallback
        const plainDescription = blog.description?.replace(/<[^>]*>?/gm, '') || "";
        const descriptionContent = blog.metaDescription ||
            (plainDescription.substring(0, 160) + (plainDescription.length > 160 ? '...' : '')) ||
            "Read this blog post on JK Shah Classes.";

        metaDescription.setAttribute('content', descriptionContent);

        // Update Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', blog.metaKeywords || "");

        // Cleanup function to reset title when leaving the page
        return () => {
            document.title = "JK Shah Classes - India's Leading CA Coaching";
        };
    }, [blog]);

    const fetchBlog = async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const res = await blogApi.getBlog(slug);
            if (res.ok) {
                setBlog(res.data.data);
            } else {
                navigate("/blog");
            }
        } catch (error) {
            console.error("Failed to fetch blog detail", error);
            navigate("/blog");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await blogApi.getCategories({ limit: 100, onlyActive: true });
            if (res.ok) setCategories(res.data.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const handleSearch = () => {
        navigate(`/blog?search=${encodeURIComponent(searchQuery)}`);
    };

    const handleCategoryClick = (id: string | null) => {
        if (id) {
            navigate(`/blog?category=${id}`);
        } else {
            navigate("/blog");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!blog) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Hero */}
            <div className="bg-primary pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10 mb-4 h-8 px-2"
                        onClick={() => navigate("/blog")
                        }
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Blog
                    </Button >
                    <div className="text-center md:text-left">
                        <div className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-3">
                            {blog.category?.name || "Uncategorized"}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                            {blog.title}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/80 text-xs">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(blog.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                {blog.author || "Admin"}
                            </span>
                        </div>
                    </div>
                </div >
            </div >

            <div className="max-w-7xl mx-auto px-4 mt-[-30px]">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="aspect-[21/9] w-full overflow-hidden">
                            <img
                                src={blog.image}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6 md:p-10">
                            <div
                                className="prose prose-sm md:prose-base max-w-none prose-primary"
                                dangerouslySetInnerHTML={{ __html: blog.description }}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <BlogSidebar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        categories={categories}
                        selectedCategory={blog.category?._id}
                        setSelectedCategory={handleCategoryClick}
                        onSearch={handleSearch}
                    />
                </div>
            </div>
        </div >
    );
}

export default BlogDetailPage;

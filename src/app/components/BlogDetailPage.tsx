import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { blogApi } from "../api/api";
import { Loader2, Calendar, User, ChevronLeft, Clock, Share2 } from "lucide-react";
import { motion } from "motion/react";
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
        document.title = `${baseTitle}`;

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

        // Update OG Title
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.setAttribute('property', 'og:title');
            document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', `${baseTitle}`);

        // Update OG Description
        let ogDescription = document.querySelector('meta[property="og:description"]');
        if (!ogDescription) {
            ogDescription = document.createElement('meta');
            ogDescription.setAttribute('property', 'og:description');
            document.head.appendChild(ogDescription);
        }
        ogDescription.setAttribute('content', descriptionContent);



        // Cleanup function to reset title when leaving the page
        return () => {
            document.title = "JK Shah Classes";
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
        <div className="min-h-screen bg-white pb-20 font-sans">
            {/* Minimalist Header */}
            <div className="bg-white pt-28 pb-12 px-4 border-b border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Button
                            variant="ghost"
                            className="text-gray-500 hover:text-primary mb-8 h-8 px-0 flex items-center gap-1 group"
                            onClick={() => navigate("/blog")}
                        >
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to stories
                        </Button>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary">
                                <span>{blog.category?.name || "Article"}</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-gray-900 leading-[1.1] tracking-tight">
                                {blog.title}
                            </h1>

                            <div className="flex items-center justify-between py-6 border-y border-gray-100 mt-8">
                                <div className="flex items-center gap-4">
                                    <p className="text-sm font-serif italic text-gray-500">
                                        {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-primary">
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12 mb-20">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Main Content */}
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-12"
                        >
                            <div className="aspect-[21/10] w-full overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="max-w-3xl mx-auto">
                                <div
                                    className="prose prose-lg md:prose-xl max-w-none prose-gray font-serif prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-2xl"
                                    dangerouslySetInnerHTML={{ __html: blog.description }}
                                />
                            </div>
                        </motion.div>
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

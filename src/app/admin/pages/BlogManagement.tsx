import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Search, Trash2, Pencil, Loader2, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { blogApi, BASE_URL } from "../../api/api";
import { toast } from "sonner";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { generateSlug } from "../utils/slugify";

export function BlogManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [catLoading, setCatLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [catSearchQuery, setCatSearchQuery] = useState("");

    const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
    const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<any>(null);
    const [editingCat, setEditingCat] = useState<any>(null);

    const [blogForm, setBlogForm] = useState({
        title: "",
        category: "",
        image: "",
        description: "",
        slug: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: ""
    });

    const [catForm, setCatForm] = useState({
        name: "",
        slug: ""
    });

    useEffect(() => {
        fetchCategories();
        fetchBlogs();
    }, []);

    const fetchCategories = async () => {
        setCatLoading(true);
        try {
            const res = await blogApi.getCategories({ search: catSearchQuery, limit: 100 });
            if (res.ok) {
                setCategories(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch categories");
        } finally {
            setCatLoading(false);
        }
    };

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await blogApi.getBlogs({ search: searchQuery, limit: 100 });
            if (res.ok) {
                setBlogs(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'blog') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                setBlogForm({ ...blogForm, image: data.url });
                toast.success("Image uploaded successfully");
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch (error) {
            toast.error("Image upload failed");
        }
    };

    const handleBlogSubmit = async () => {
        if (!blogForm.title || !blogForm.category || !blogForm.description) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            let res;
            if (editingBlog) {
                res = await blogApi.updateBlog(editingBlog._id, blogForm);
            } else {
                res = await blogApi.addBlog(blogForm);
            }

            if (res.ok) {
                toast.success(editingBlog ? "Blog updated" : "Blog added");
                setIsBlogDialogOpen(false);
                setEditingBlog(null);
                setBlogForm({
                    title: "",
                    category: "",
                    image: "",
                    description: "",
                    slug: "",
                    metaTitle: "",
                    metaDescription: "",
                    metaKeywords: ""
                });
                fetchBlogs();
            } else {
                toast.error(res.data.message || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleCatSubmit = async () => {
        if (!catForm.name) {
            toast.error("Please enter category name");
            return;
        }

        try {
            let res;
            if (editingCat) {
                res = await blogApi.updateCategory(editingCat._id, catForm);
            } else {
                res = await blogApi.addCategory(catForm);
            }

            if (res.ok) {
                toast.success(editingCat ? "Category updated" : "Category added");
                setIsCatDialogOpen(false);
                const newCat = res.data.data;
                setEditingCat(null);
                setCatForm({ name: "", slug: "" });
                await fetchCategories();

                // If we were adding category from blog dialog, auto-select it
                if (isBlogDialogOpen && !editingCat) {
                    setBlogForm(prev => ({ ...prev, category: newCat._id }));
                }
            } else {
                toast.error(res.data.message || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDeleteBlog = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this blog?")) {
            try {
                const res = await blogApi.deleteBlog(id);
                if (res.ok) {
                    toast.success("Blog deleted");
                    fetchBlogs();
                }
            } catch (error) {
                toast.error("Delete failed");
            }
        }
    };

    const handleDeleteCat = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                const res = await blogApi.deleteCategory(id);
                if (res.ok) {
                    toast.success("Category deleted");
                    fetchCategories();
                }
            } catch (error) {
                toast.error("Delete failed");
            }
        }
    };

    const openEditBlog = (blog: any) => {
        setEditingBlog(blog);
        setBlogForm({
            title: blog.title,
            category: blog.category._id || blog.category,
            image: blog.image,
            description: blog.description,
            slug: blog.slug,
            metaTitle: blog.metaTitle || "",
            metaDescription: blog.metaDescription || "",
            metaKeywords: blog.metaKeywords || ""
        });
        setIsBlogDialogOpen(true);
    };

    const openEditCat = (cat: any) => {
        setEditingCat(cat);
        setCatForm({
            name: cat.name,
            slug: cat.slug
        });
        setIsCatDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Blog Management</h2>
                <p className="text-muted-foreground">Manage your blog posts and categories.</p>
            </div>

            <Tabs defaultValue="blogs" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="blogs">Manage Blogs</TabsTrigger>
                    <TabsTrigger value="categories">Blog Categories</TabsTrigger>
                </TabsList>

                <TabsContent value="blogs" className="space-y-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search blogs..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchBlogs()}
                            />
                        </div>
                        <Button onClick={() => {
                            setEditingBlog(null);
                            setBlogForm({
                                title: "",
                                category: "",
                                image: "",
                                description: "",
                                slug: "",
                                metaTitle: "",
                                metaDescription: "",
                                metaKeywords: ""
                            });
                            setIsBlogDialogOpen(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" /> Add Blog
                        </Button>
                    </div>

                    <div className="rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : blogs.length > 0 ? (
                                    blogs.map((blog) => (
                                        <TableRow key={blog._id}>
                                            <TableCell>
                                                <img src={blog.image} alt={blog.title} className="w-12 h-12 object-cover rounded" />
                                            </TableCell>
                                            <TableCell className="font-medium max-w-xs truncate">{blog.title}</TableCell>
                                            <TableCell>{blog.category?.name || 'N/A'}</TableCell>
                                            <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => openEditBlog(blog)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteBlog(blog._id)} className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No blogs found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                className="pl-9"
                                value={catSearchQuery}
                                onChange={(e) => setCatSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchCategories()}
                            />
                        </div>
                        <Button onClick={() => {
                            setEditingCat(null);
                            setCatForm({ name: "", slug: "" });
                            setIsCatDialogOpen(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" /> Add Category
                        </Button>
                    </div>

                    <div className="rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {catLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <TableRow key={cat._id}>
                                            <TableCell className="font-medium">{cat.name}</TableCell>
                                            <TableCell>{cat.slug}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => openEditCat(cat)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCat(cat._id)} className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Blog Dialog */}
            <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingBlog ? "Edit Blog" : "Add New Blog"}</DialogTitle>
                        <DialogDescription>
                            Enter the details of the blog post.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={blogForm.title}
                                    onChange={(e) => {
                                        const newTitle = e.target.value;
                                        const oldSlug = blogForm.slug;
                                        const autoSlug = generateSlug(blogForm.title);

                                        setBlogForm(prev => ({
                                            ...prev,
                                            title: newTitle,
                                            slug: (!prev.slug || prev.slug === generateSlug(prev.title)) ? generateSlug(newTitle) : prev.slug
                                        }));
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={blogForm.category}
                                    onValueChange={(val) => setBlogForm({ ...blogForm, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <div className="flex gap-2">
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                setEditingCat(null);
                                                setCatForm({ name: "", slug: "" });
                                                setIsCatDialogOpen(true);
                                            }}
                                            title="Add New Category"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (Optional)</Label>
                                <Input
                                    id="slug"
                                    placeholder="auto-generated-if-empty"
                                    value={blogForm.slug}
                                    onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Blog Image</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'blog')}
                                        className="hidden"
                                        id="blog-image-upload"
                                    />
                                    <Label
                                        htmlFor="blog-image-upload"
                                        className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-gray-50 flex-1"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                        {blogForm.image ? "Change Image" : "Upload Image"}
                                    </Label>
                                    {blogForm.image && (
                                        <div className="w-10 h-10 border rounded overflow-hidden">
                                            <img src={blogForm.image} alt="preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1 italic">
                                    Recommended dimensions: 1200 x 600 px (or 2:1 aspect ratio)
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <div className="h-[300px] mb-12">
                                <ReactQuill
                                    theme="snow"
                                    value={blogForm.description}
                                    onChange={(val) => setBlogForm({ ...blogForm, description: val })}
                                    style={{ height: '250px' }}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-lg font-semibold mb-4">SEO Meta Information</h3>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="metaTitle">Meta Title</Label>
                                    <Input
                                        id="metaTitle"
                                        placeholder="Enter SEO meta title"
                                        value={blogForm.metaTitle}
                                        onChange={(e) => setBlogForm({ ...blogForm, metaTitle: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="metaDescription">Meta Description</Label>
                                        <Input
                                            id="metaDescription"
                                            placeholder="Enter SEO meta description"
                                            value={blogForm.metaDescription}
                                            onChange={(e) => setBlogForm({ ...blogForm, metaDescription: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="metaKeywords">Meta Keywords</Label>
                                        <Input
                                            id="metaKeywords"
                                            placeholder="Enter meta keywords (comma separated)"
                                            value={blogForm.metaKeywords}
                                            onChange={(e) => setBlogForm({ ...blogForm, metaKeywords: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBlogDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleBlogSubmit}>Save Blog</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Category Dialog */}
            <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCat ? "Edit Category" : "Add New Category"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="catName">Category Name</Label>
                            <Input
                                id="catName"
                                value={catForm.name}
                                onChange={(e) => {
                                    const newName = e.target.value;
                                    setCatForm(prev => ({
                                        ...prev,
                                        name: newName,
                                        slug: (!prev.slug || prev.slug === generateSlug(prev.name)) ? generateSlug(newName) : prev.slug
                                    }));
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="catSlug">Slug (Optional)</Label>
                            <Input
                                id="catSlug"
                                value={catForm.slug}
                                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCatDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCatSubmit}>Save Category</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default BlogManagement;

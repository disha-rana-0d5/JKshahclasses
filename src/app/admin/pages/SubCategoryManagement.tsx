import { useState } from "react";
import { useCourseContext } from "../context/CourseContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Search, Trash2, Pencil, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Category } from "../context/CourseContext";
import { useEffect } from "react";
import { generateSlug } from "../utils/slugify";
import { ImageUpload } from "../../components/ImageUpload";

export function SubCategoryManagement() {
    const {
        categories,
        allCategories,
        refreshCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        loading,
        pagination
    } = useCourseContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [newSubCategory, setNewSubCategory] = useState({
        name: "",
        parent: "",
        slug: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        whyTitle: "Why CA?",
        whyPoints: ["", "", "", "", "", "", ""],
        whyJKShahTitle: "Why JKShah Classes?",
        whyJKShahPoints: ["", "", "", "", "", "", ""],
        sequence: 0,
        bannerTitle: "",
        bannerSubtitle: "",
        bannerBadges: ["", "", ""],
        bannerBadgeIcons: ["", "", ""],
        bannerStats: [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }]
    });

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Category>>({});

    useEffect(() => {
        const filters: any = { parent: { $ne: null } }; // Only fetch sub-categories

        refreshCategories({
            page: currentPage,
            limit: 10,
            search: searchQuery,
            filter: JSON.stringify(filters)
        });
    }, [searchQuery, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const mainCategories = allCategories.filter(c => !c.parent);
    const subCategories = categories; // This comes from refreshCategories which applies the filter

    const handleAddSubCategory = () => {
        if (newSubCategory.name.trim() && newSubCategory.parent) {
            addCategory(
                newSubCategory.name.trim(),
                "",
                newSubCategory.parent,
                newSubCategory.slug.trim(),
                newSubCategory.metaTitle.trim(),
                newSubCategory.metaDescription.trim(),
                newSubCategory.metaKeywords.trim(),
                newSubCategory.whyTitle.trim(),
                "", // whyContent
                newSubCategory.whyJKShahTitle.trim(),
                "", // whyJKShahContent
                newSubCategory.whyPoints,
                newSubCategory.whyJKShahPoints,
                Number(newSubCategory.sequence) || 0,
                newSubCategory.bannerTitle.trim(),
                newSubCategory.bannerSubtitle.trim(),
                newSubCategory.bannerBadges,
                newSubCategory.bannerBadgeIcons,
                newSubCategory.bannerStats
            ).then(() => {
                setNewSubCategory({
                    name: "",
                    parent: "",
                    slug: "",
                    metaTitle: "",
                    metaDescription: "",
                    metaKeywords: "",
                    whyTitle: "Why CA?",
                    whyPoints: ["", "", "", "", "", "", ""],
                    whyJKShahTitle: "Why JKShah Classes?",
                    whyJKShahPoints: ["", "", "", "", "", "", ""],
                    sequence: 0,
                    bannerTitle: "",
                    bannerSubtitle: "",
                    bannerBadges: ["", "", ""],
                    bannerBadgeIcons: ["", "", ""],
                    bannerStats: [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }]
                });
            });
        }
    };

    const handleEditClick = (cat: Category) => {
        setEditingCategory(cat);
        setEditFormData({
            name: cat.name,
            parent: cat.parent,
            slug: cat.slug || "",
            metaTitle: cat.metaTitle || "",
            metaDescription: cat.metaDescription || "",
            metaKeywords: cat.metaKeywords || "",
            whyTitle: cat.whyTitle || "Why CA?",
            whyPoints: (cat.whyPoints && cat.whyPoints.some(p => p)) ? cat.whyPoints : [cat.whyContent || "", "", "", "", "", "", ""],
            whyJKShahTitle: cat.whyJKShahTitle || "Why JKShah Classes?",
            whyJKShahPoints: (cat.whyJKShahPoints && cat.whyJKShahPoints.some(p => p)) ? cat.whyJKShahPoints : [cat.whyJKShahContent || "", "", "", "", "", "", ""],
            sequence: cat.sequence || 0,
            bannerTitle: cat.bannerTitle || "",
            bannerSubtitle: cat.bannerSubtitle || "",
            bannerBadges: cat.bannerBadges?.length ? cat.bannerBadges : ["", "", ""],
            bannerBadgeIcons: cat.bannerBadgeIcons?.length ? cat.bannerBadgeIcons : ["", "", ""],
            bannerStats: cat.bannerStats?.length ? cat.bannerStats : [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }]
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateCategory = async () => {
        if (editingCategory && editFormData.name?.trim()) {
            await updateCategory(editingCategory._id, editFormData);
            setIsEditDialogOpen(false);
            setEditingCategory(null);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Sub Category Management</h2>
                <p className="text-muted-foreground">Add, Remove and search course sub categories.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Create Sub Category Form */}
                <div className="p-6 rounded-xl border border-border bg-white shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Plus className="h-4 w-4 text-primary" /> Create Sub Category
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="parent">Parent Category</Label>
                            <select
                                id="parent"
                                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={newSubCategory.parent}
                                onChange={(e) => setNewSubCategory({ ...newSubCategory, parent: e.target.value })}
                            >
                                <option value="">Select Parent</option>
                                {mainCategories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newName">Sub Category Name</Label>
                            <Input
                                id="newName"
                                placeholder="e.g. CA"
                                value={newSubCategory.name}
                                onChange={(e) => {
                                    const newName = e.target.value;
                                    setNewSubCategory(prev => ({
                                        ...prev,
                                        name: newName,
                                        slug: (!prev.slug || prev.slug === generateSlug(prev.name)) ? generateSlug(newName) : prev.slug
                                    }));
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newSlug">Slug</Label>
                            <Input
                                id="newSlug"
                                placeholder="e.g. ca-course"
                                value={newSubCategory.slug}
                                onChange={(e) => setNewSubCategory({ ...newSubCategory, slug: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newMetaTitle">Meta Title</Label>
                            <Input
                                id="newMetaTitle"
                                placeholder="Meta Title"
                                value={newSubCategory.metaTitle}
                                onChange={(e) => setNewSubCategory({ ...newSubCategory, metaTitle: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newMetaKeywords">Meta Keywords</Label>
                            <Input
                                id="newMetaKeywords"
                                placeholder="keyword1, keyword2"
                                value={newSubCategory.metaKeywords}
                                onChange={(e) => setNewSubCategory({ ...newSubCategory, metaKeywords: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newSequence">Sequence (Priority)</Label>
                            <Input
                                id="newSequence"
                                type="number"
                                placeholder="0"
                                value={newSubCategory.sequence}
                                onChange={(e) => setNewSubCategory({ ...newSubCategory, sequence: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="lg:col-span-3 space-y-2">
                            <Label htmlFor="newMetaDesc">Meta Description</Label>
                            <Textarea
                                id="newMetaDesc"
                                placeholder="Meta Description"
                                rows={2}
                                value={newSubCategory.metaDescription}
                                onChange={(e) => setNewSubCategory({ ...newSubCategory, metaDescription: e.target.value })}
                            />
                        </div>

                        <div className="lg:col-span-3 border-t pt-4">
                            <h4 className="text-sm font-semibold mb-4 text-foreground">Comparison Section (Left Side)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newWhyTitle">Title</Label>
                                    <Input
                                        id="newWhyTitle"
                                        placeholder="e.g. Why CA?"
                                        value={newSubCategory.whyTitle}
                                        onChange={(e) => setNewSubCategory({ ...newSubCategory, whyTitle: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label>Comparison Points (7 Points)</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {newSubCategory.whyPoints.map((point, index) => (
                                            <Input
                                                key={index}
                                                placeholder={`Point ${index + 1}`}
                                                value={point}
                                                onChange={(e) => {
                                                    const updatedPoints = [...newSubCategory.whyPoints];
                                                    updatedPoints[index] = e.target.value;
                                                    setNewSubCategory(prev => ({ ...prev, whyPoints: updatedPoints }));
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 border-t pt-4">
                            <h4 className="text-sm font-semibold mb-4 text-foreground">Comparison Section (Right Side)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newWhyJKShahTitle">Title</Label>
                                    <Input
                                        id="newWhyJKShahTitle"
                                        placeholder="e.g. Why JKShah Classes?"
                                        value={newSubCategory.whyJKShahTitle}
                                        onChange={(e) => setNewSubCategory({ ...newSubCategory, whyJKShahTitle: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label>Comparison Points (7 Points)</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {newSubCategory.whyJKShahPoints.map((point, index) => (
                                            <Input
                                                key={index}
                                                placeholder={`Point ${index + 1}`}
                                                value={point}
                                                onChange={(e) => {
                                                    const updatedPoints = [...newSubCategory.whyJKShahPoints];
                                                    updatedPoints[index] = e.target.value;
                                                    setNewSubCategory(prev => ({ ...prev, whyJKShahPoints: updatedPoints }));
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 border-t pt-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-bold mb-4 text-foreground flex items-center gap-2">
                                    <div className="w-1 h-4 bg-red-600 rounded-full" />
                                    Course Detail Banner Section
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/5 p-4 rounded-xl border border-dashed text-foreground">
                                    <div className="space-y-2">
                                        <Label htmlFor="newBannerTitle" className="text-xs font-semibold">Banner Title</Label>
                                        <Input
                                            id="newBannerTitle"
                                            placeholder="e.g. Empower your career with CA."
                                            className="bg-white"
                                            value={newSubCategory.bannerTitle}
                                            onChange={(e) => setNewSubCategory({ ...newSubCategory, bannerTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newBannerSubtitle" className="text-xs font-semibold">Banner Subtitle</Label>
                                        <Input
                                            id="newBannerSubtitle"
                                            placeholder="e.g. Get there with JK Shah Classes."
                                            className="bg-white"
                                            value={newSubCategory.bannerSubtitle}
                                            onChange={(e) => setNewSubCategory({ ...newSubCategory, bannerSubtitle: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Badge Configuration (Outcome Section)</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(newSubCategory.bannerBadges || ["", "", ""]).map((badge, index) => (
                                        <div key={index} className="space-y-4 p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="space-y-2 text-foreground">
                                                <Label className="text-[10px] font-bold text-red-600 uppercase">Badge {index + 1} Name</Label>
                                                <Input
                                                    placeholder={`e.g. High Income`}
                                                    className="h-8 text-xs font-medium"
                                                    value={badge}
                                                    onChange={(e) => {
                                                        const updated = [...(newSubCategory.bannerBadges || ["", "", ""])];
                                                        updated[index] = e.target.value;
                                                        setNewSubCategory({ ...newSubCategory, bannerBadges: updated });
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2 text-foreground">
                                                <Label className="text-[10px] font-bold text-red-600 uppercase">Badge {index + 1} Icon</Label>
                                                <ImageUpload
                                                    className="mt-1"
                                                    value={newSubCategory.bannerBadgeIcons?.[index] || ""}
                                                    onChange={(url) => {
                                                        const updated = [...(newSubCategory.bannerBadgeIcons || ["", "", ""])];
                                                        updated[index] = url;
                                                        setNewSubCategory({ ...newSubCategory, bannerBadgeIcons: updated });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 space-y-4">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statistics Section</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(newSubCategory.bannerStats || [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }]).map((stat, index) => (
                                        <div key={index} className="space-y-2 p-3 border rounded-xl bg-white shadow-sm text-foreground">
                                            <Input
                                                placeholder={`Value ${index + 1}`}
                                                className="h-8 text-xs font-bold"
                                                value={stat.value}
                                                onChange={(e) => {
                                                    const updated = [...(newSubCategory.bannerStats || [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }])];
                                                    updated[index] = { ...updated[index], value: e.target.value };
                                                    setNewSubCategory({ ...newSubCategory, bannerStats: updated });
                                                }}
                                            />
                                            <Input
                                                placeholder={`Label ${index + 1}`}
                                                className="h-8 text-xs"
                                                value={stat.label}
                                                onChange={(e) => {
                                                    const updated = [...(newSubCategory.bannerStats || [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }])];
                                                    updated[index] = { ...updated[index], label: e.target.value };
                                                    setNewSubCategory({ ...newSubCategory, bannerStats: updated });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={handleAddSubCategory}
                            disabled={!newSubCategory.parent}
                            className="w-full md:w-auto"
                        >
                            Add Sub Category
                        </Button>
                    </div>
                </div>
            </div>

            <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search all sub categories..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="rounded-md border border-border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="font-bold">Sub Category Name</TableHead>
                            <TableHead className="font-bold">Parent Category</TableHead>
                            <TableHead className="font-bold">Sequence</TableHead>
                            <TableHead className="font-bold">Slug</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Loading categories...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : subCategories.length > 0 ? (
                            subCategories.map((cat) => (
                                <TableRow key={cat._id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium text-foreground">
                                        {cat.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold w-fit">
                                            {mainCategories.find(c => c._id === cat.parent)?.name || "Unknown"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {cat.sequence || 0}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs font-mono">
                                        {cat.slug || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditClick(cat)}
                                                className="text-primary hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteCategory(cat._id, cat.name)}
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    No sub categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination.categories && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.categories.page - 1) * pagination.categories.limit + 1} to {Math.min(pagination.categories.page * pagination.categories.limit, pagination.categories.total)} of {pagination.categories.total} sub categories
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === pagination.categories.pages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Sub Category Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Sub Category</DialogTitle>
                        <DialogDescription>
                            Update sub category details, banner configuration and Comparison section.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4 text-foreground">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editParent">Parent Category</Label>
                                <select
                                    id="editParent"
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={editFormData.parent || ""}
                                    onChange={(e) => setEditFormData({ ...editFormData, parent: e.target.value })}
                                >
                                    <option value="">Select Parent</option>
                                    {mainCategories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Sub Category Name</Label>
                                <Input
                                    id="name"
                                    value={editFormData.name || ""}
                                    onChange={(e) => {
                                        const newName = e.target.value;
                                        setEditFormData(prev => ({
                                            ...prev,
                                            name: newName,
                                            slug: (!prev.slug || prev.slug === generateSlug(prev.name || "")) ? generateSlug(newName) : prev.slug
                                        }));
                                    }}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={editFormData.slug || ""}
                                    onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="metaTitle">Meta Title</Label>
                                <Input
                                    id="metaTitle"
                                    value={editFormData.metaTitle || ""}
                                    onChange={(e) => setEditFormData({ ...editFormData, metaTitle: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                                <Input
                                    id="metaKeywords"
                                    value={editFormData.metaKeywords || ""}
                                    onChange={(e) => setEditFormData({ ...editFormData, metaKeywords: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editSequence">Sequence (Priority)</Label>
                                <Input
                                    id="editSequence"
                                    type="number"
                                    value={editFormData.sequence || 0}
                                    onChange={(e) => setEditFormData({ ...editFormData, sequence: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <Textarea
                                    id="metaDescription"
                                    rows={2}
                                    value={editFormData.metaDescription || ""}
                                    onChange={(e) => setEditFormData({ ...editFormData, metaDescription: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 border-t pt-4">
                                <h4 className="text-sm font-semibold mb-4 text-foreground">Comparison Section (Left Side)</h4>
                                <div className="grid gap-4">
                                    <div className="grid gap-2 text-foreground">
                                        <Label htmlFor="whyTitle">Title</Label>
                                        <Input
                                            id="whyTitle"
                                            placeholder="e.g. Why CA?"
                                            value={editFormData.whyTitle || ""}
                                            onChange={(e) => setEditFormData({ ...editFormData, whyTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-4">
                                        <Label className="text-foreground">Comparison Points (7 Points)</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {(editFormData.whyPoints || ["", "", "", "", "", "", ""]).map((point, index) => (
                                                <Input
                                                    key={index}
                                                    placeholder={`Point ${index + 1}`}
                                                    className="text-foreground"
                                                    value={point}
                                                    onChange={(e) => {
                                                        const updatedPoints = [...(editFormData.whyPoints || ["", "", "", "", "", "", ""])];
                                                        updatedPoints[index] = e.target.value;
                                                        setEditFormData(prev => ({ ...prev, whyPoints: updatedPoints }));
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 border-t pt-4">
                                <h4 className="text-sm font-semibold mb-4 text-foreground">Comparison Section (Right Side)</h4>
                                <div className="grid gap-4">
                                    <div className="grid gap-2 text-foreground">
                                        <Label htmlFor="whyJKShahTitle">Title</Label>
                                        <Input
                                            id="whyJKShahTitle"
                                            placeholder="e.g. Why JKShah Classes?"
                                            value={editFormData.whyJKShahTitle || ""}
                                            onChange={(e) => setEditFormData({ ...editFormData, whyJKShahTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-4">
                                        <Label className="text-foreground">Comparison Points (7 Points)</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {(editFormData.whyJKShahPoints || ["", "", "", "", "", "", ""]).map((point, index) => (
                                                <Input
                                                    key={index}
                                                    placeholder={`Point ${index + 1}`}
                                                    className="text-foreground"
                                                    value={point}
                                                    onChange={(e) => {
                                                        const updatedPoints = [...(editFormData.whyJKShahPoints || ["", "", "", "", "", "", ""])];
                                                        updatedPoints[index] = e.target.value;
                                                        setEditFormData(prev => ({ ...prev, whyJKShahPoints: updatedPoints }));
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 border-t pt-6 space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold mb-4 text-foreground flex items-center gap-2">
                                        <div className="w-1 h-4 bg-red-600 rounded-full" />
                                        Course Detail Banner Section
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/5 p-4 rounded-xl border border-dashed text-foreground">
                                        <div className="space-y-2">
                                            <Label htmlFor="editBannerTitle" className="text-xs font-semibold">Banner Title</Label>
                                            <Input
                                                id="editBannerTitle"
                                                value={editFormData.bannerTitle || ""}
                                                className="bg-white"
                                                onChange={(e) => setEditFormData({ ...editFormData, bannerTitle: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="editBannerSubtitle" className="text-xs font-semibold">Banner Subtitle</Label>
                                            <Input
                                                id="editBannerSubtitle"
                                                value={editFormData.bannerSubtitle || ""}
                                                className="bg-white"
                                                onChange={(e) => setEditFormData({ ...editFormData, bannerSubtitle: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Badge Configuration (Outcome Section)</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(editFormData.bannerBadges || ["", "", ""]).map((badge, index) => (
                                            <div key={index} className="space-y-4 p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className="space-y-2 text-foreground">
                                                    <Label className="text-[10px] font-bold text-red-600 uppercase">Badge {index + 1} Name</Label>
                                                    <Input
                                                        placeholder={`e.g. High Income`}
                                                        className="h-8 text-xs font-medium"
                                                        value={badge}
                                                        onChange={(e) => {
                                                            const updated = [...(editFormData.bannerBadges || ["", "", ""])];
                                                            updated[index] = e.target.value;
                                                            setEditFormData({ ...editFormData, bannerBadges: updated });
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-2 text-foreground">
                                                    <Label className="text-[10px] font-bold text-red-600 uppercase">Badge {index + 1} Icon</Label>
                                                    <ImageUpload
                                                        className="mt-1"
                                                        value={editFormData.bannerBadgeIcons?.[index] || ""}
                                                        onChange={(url) => {
                                                            const updated = [...(editFormData.bannerBadgeIcons || ["", "", ""])];
                                                            updated[index] = url;
                                                            setEditFormData({ ...editFormData, bannerBadgeIcons: updated });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-4">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-foreground">Statistics Section</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(editFormData.bannerStats || [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }]).map((stat, index) => (
                                            <div key={index} className="space-y-2 p-3 border rounded-xl bg-white shadow-sm text-foreground">
                                                <Input
                                                    placeholder="Value"
                                                    className="h-8 text-xs font-bold"
                                                    value={stat.value}
                                                    onChange={(e) => {
                                                        const updated = [...(editFormData.bannerStats || [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }])];
                                                        updated[index] = { ...updated[index], value: e.target.value };
                                                        setEditFormData({ ...editFormData, bannerStats: updated });
                                                    }}
                                                />
                                                <Input
                                                    placeholder="Label"
                                                    className="h-8 text-xs"
                                                    value={stat.label}
                                                    onChange={(e) => {
                                                        const updated = [...(editFormData.bannerStats || [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }])];
                                                        updated[index] = { ...updated[index], label: e.target.value };
                                                        setEditFormData({ ...editFormData, bannerStats: updated });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateCategory}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

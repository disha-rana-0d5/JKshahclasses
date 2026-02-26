import { useState } from "react";
import { useCourseContext } from "../context/CourseContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Category } from "../context/CourseContext";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../components/ui/pagination";
import { useEffect } from "react";
import { generateSlug } from "../utils/slugify";

export function SubCategoryManagement() {
    const {
        categories,
        allCategories,
        refreshCategories,
        addCategory,
        updateCategory,
        deleteCategory,
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
        whyContent: "",
        whyJKShahTitle: "Why JKShah Classes?",
        whyJKShahContent: "",
        sequence: 0,
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
                newSubCategory.whyContent.trim(),
                newSubCategory.whyJKShahTitle.trim(),
                newSubCategory.whyJKShahContent.trim(),
                Number(newSubCategory.sequence) || 0
            );
            setNewSubCategory({
                name: "",
                parent: "",
                slug: "",
                metaTitle: "",
                metaDescription: "",
                metaKeywords: "",
                whyTitle: "Why CA?",
                whyContent: "",
                whyJKShahTitle: "Why JKShah Classes?",
                whyJKShahContent: "",
                sequence: 0
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
            whyContent: cat.whyContent || "",
            whyJKShahTitle: cat.whyJKShahTitle || "Why JKShah Classes?",
            whyJKShahContent: cat.whyJKShahContent || "",
            sequence: cat.sequence || 0
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
                                <div className="space-y-2">
                                    <Label htmlFor="newWhyContent">Content</Label>
                                    <Textarea
                                        id="newWhyContent"
                                        placeholder="Enter content..."
                                        rows={2}
                                        value={newSubCategory.whyContent}
                                        onChange={(e) => setNewSubCategory({ ...newSubCategory, whyContent: e.target.value })}
                                    />
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
                                <div className="space-y-2">
                                    <Label htmlFor="newWhyJKShahContent">Content</Label>
                                    <Textarea
                                        id="newWhyJKShahContent"
                                        placeholder="Enter content..."
                                        rows={2}
                                        value={newSubCategory.whyJKShahContent}
                                        onChange={(e) => setNewSubCategory({ ...newSubCategory, whyJKShahContent: e.target.value })}
                                    />
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

            <div className="rounded-md border border-border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sub Category Name</TableHead>
                            <TableHead>Parent Category</TableHead>
                            <TableHead>Sub Category Name</TableHead>
                            <TableHead>Parent Category</TableHead>
                            <TableHead>Sequence</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subCategories.length > 0 ? (
                            subCategories.map((cat) => (
                                <TableRow key={cat._id}>
                                    <TableCell className="font-medium">
                                        {cat.name}
                                    </TableCell>
                                    <TableCell>
                                        {mainCategories.find(c => c._id === cat.parent)?.name || "Unknown"}
                                    </TableCell>
                                    <TableCell>
                                        {mainCategories.find(c => c._id === cat.parent)?.name || "Unknown"}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {cat.sequence || 0}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {cat.slug || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditClick(cat)}
                                                className="text-primary hover:bg-primary/10 hover:text-primary"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteCategory(cat._id, cat.name)}
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
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
                    <Pagination className="justify-end mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                                    }}
                                />
                            </PaginationItem>
                            {[...Array(pagination.categories.pages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        href="#"
                                        isActive={currentPage === i + 1}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentPage(i + 1);
                                        }}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < pagination.categories.pages) setCurrentPage(currentPage + 1);
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Edit Sub Category Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Sub Category</DialogTitle>
                        <DialogDescription>
                            Update sub category details and SEO fields.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
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
                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <Textarea
                                    id="metaDescription"
                                    rows={2}
                                    value={editFormData.metaDescription || ""}
                                    onChange={(e) => setEditFormData({ ...editFormData, metaDescription: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold mb-4">Comparison Section (Left Side)</h4>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="whyTitle">Title</Label>
                                    <Input
                                        id="whyTitle"
                                        placeholder="e.g. Why CA?"
                                        value={editFormData.whyTitle || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, whyTitle: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="whyContent">Content</Label>
                                    <Textarea
                                        id="whyContent"
                                        rows={4}
                                        placeholder="Enter the 'Why' content..."
                                        value={editFormData.whyContent || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, whyContent: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold mb-4">Comparison Section (Right Side)</h4>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="whyJKShahTitle">Title</Label>
                                    <Input
                                        id="whyJKShahTitle"
                                        placeholder="e.g. Why JKShah Classes?"
                                        value={editFormData.whyJKShahTitle || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, whyJKShahTitle: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="whyJKShahContent">Content</Label>
                                    <Textarea
                                        id="whyJKShahContent"
                                        rows={4}
                                        placeholder="Enter the 'Why JKShah' content..."
                                        value={editFormData.whyJKShahContent || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, whyJKShahContent: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold mb-4">Other Settings</h4>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="editSequence">Sequence (Priority)</Label>
                                    <Input
                                        id="editSequence"
                                        type="number"
                                        value={editFormData.sequence || 0}
                                        onChange={(e) => setEditFormData({ ...editFormData, sequence: parseInt(e.target.value) || 0 })}
                                    />
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
        </div >
    );
}

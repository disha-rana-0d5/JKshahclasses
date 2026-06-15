import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { ImageUpload } from "../../components/ImageUpload";
import { toast } from "sonner";
import { useCourseContext, AlumniWorkAt } from "../context/CourseContext";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../components/ui/pagination";

const emptyForm = (): Partial<AlumniWorkAt> => ({
    companyName: "",
    image: "/uploads/placeholder.png",
    category: "",
    subCategory: "",
    course: "",
    order: 0,
});

export function AlumniWorkAtManagement() {
    const {
        alumniWorkAt, addAlumniWorkAt, updateAlumniWorkAt, deleteAlumniWorkAt,
        loading, pagination, refreshAlumniWorkAt,
        allCategories, allCourses
    } = useCourseContext();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editing, setEditing] = useState<AlumniWorkAt | null>(null);
    const [formData, setFormData] = useState<Partial<AlumniWorkAt>>(emptyForm());
    const [searchQuery, setSearchQuery] = useState("");
    const [courseFilter, setCourseFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const parentCategories = allCategories.filter(c => !c.parent);
    const subCategories = allCategories.filter(
        c => c.parent && parentCategories.find(p => p.name === formData.category && p._id === c.parent)
    );

    useEffect(() => {
        const filters: any = {};
        if (courseFilter !== "All") filters.course = courseFilter;
        refreshAlumniWorkAt({
            page: currentPage,
            limit: 10,
            search: searchQuery,
            filter: JSON.stringify(filters)
        });
    }, [searchQuery, courseFilter, currentPage]);

    const handleOpenAdd = () => {
        setEditing(null);
        setFormData(emptyForm());
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (item: AlumniWorkAt) => {
        setEditing(item);
        setFormData({ ...item });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            await updateAlumniWorkAt(editing._id, formData);
        } else {
            await addAlumniWorkAt(formData);
        }
        setIsDialogOpen(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Alumni Work At</h2>
                    <p className="text-muted-foreground">Manage company logos shown in the "Our Alumni Work At" section.</p>
                    <p className="text-[11px] text-yellow-600 font-medium mt-1">
                        Tip: Assign a specific Course to show a logo only on that course page. Leave blank to show on all pages.
                    </p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add Company Logo
                </Button>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-4">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by company name..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="w-full md:w-56">
                    <Select value={courseFilter} onValueChange={v => { setCourseFilter(v); setCurrentPage(1); }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Course" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Courses</SelectItem>
                            {allCourses.filter(c => c.status === "Active").map(c => (
                                <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Logo</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Sub Category</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alumniWorkAt.length > 0 ? (
                            alumniWorkAt.map(item => (
                                <TableRow key={item._id}>
                                    <TableCell>
                                        <img
                                            src={item.image}
                                            alt={item.companyName}
                                            className="h-10 w-24 object-contain bg-gray-50 rounded border p-1"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.category ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                            {item.category || '—'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {item.subCategory || <span className="text-xs text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteAlumniWorkAt(item._id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                                    No logos found. Click "Add Company Logo" to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.alumniWorkAt && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.alumniWorkAt.page - 1) * pagination.alumniWorkAt.limit + 1} to{" "}
                        {Math.min(pagination.alumniWorkAt.page * pagination.alumniWorkAt.limit, pagination.alumniWorkAt.total)} of{" "}
                        {pagination.alumniWorkAt.total} logos
                    </p>
                    <Pagination className="justify-end mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" onClick={e => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }} />
                            </PaginationItem>
                            {[...Array(pagination.alumniWorkAt.pages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink href="#" isActive={currentPage === i + 1} onClick={e => { e.preventDefault(); setCurrentPage(i + 1); }}>
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href="#" onClick={e => { e.preventDefault(); if (currentPage < pagination.alumniWorkAt.pages) setCurrentPage(currentPage + 1); }} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[540px]">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Company Logo" : "Add Company Logo"}</DialogTitle>
                        <DialogDescription>Upload a company logo and optionally assign it to a specific course.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">

                        {/* Category + Sub Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.category || ""}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">Select Category (Optional)</option>
                                    {parentCategories.map(cat => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subCategory">Sub Category</Label>
                                <select
                                    id="subCategory"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.subCategory || ""}
                                    onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                                >
                                    <option value="">Select Sub Category (Optional)</option>
                                    {(formData.category ? subCategories : allCategories.filter(c => c.parent)).map(sub => (
                                        <option key={sub._id} value={sub.name}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="imageUrl">Logo Image (URL or Path)</Label>
                                <Input
                                    id="imageUrl"
                                    placeholder="Paste URL or server path, e.g. /uploads/logo.png"
                                    value={formData.image && formData.image !== "/uploads/placeholder.png" ? formData.image : ""}
                                    onChange={e => setFormData({ ...formData, image: e.target.value || "/uploads/placeholder.png" })}
                                />
                                {formData.image && formData.image !== "/uploads/placeholder.png" && (
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="mt-1 h-12 object-contain rounded border bg-gray-50 p-1"
                                        onError={e => { e.currentTarget.style.display = "none"; }}
                                        onLoad={e => { e.currentTarget.style.display = "block"; }}
                                    />
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex-1 border-t border-border" />
                                <span>or upload a file</span>
                                <div className="flex-1 border-t border-border" />
                            </div>
                            <ImageUpload
                                label=""
                                value={formData.image || ""}
                                onChange={url => setFormData({ ...formData, image: url })}
                                recommendedDimensions="Transparent PNG, min 200px wide"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">
                                {editing ? "Save Changes" : "Add Logo"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

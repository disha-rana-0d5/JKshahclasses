import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Trash2, Pencil, ImageIcon, Info } from "lucide-react";
import { useCourseContext, CourseTimeline } from "../context/CourseContext";
import { ImageUpload } from "../../components/ImageUpload";
import { toast } from "sonner";
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

export function TimelineManagement() {
    const { courseTimelines, categories, addOrUpdateTimeline, deleteTimeline, loading, pagination, refreshTimelines } = useCourseContext();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const [formData, setFormData] = useState<Partial<CourseTimeline>>({
        subCategory: "",
        image: "/placeholder.png"
    });

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        refreshTimelines({
            page: currentPage,
            limit: 10
        });
    }, [currentPage]);

    // All categories (some courses only have a main category without sub-categories)
    const availableCategories = categories;

    const handleOpenAdd = () => {
        setFormData({
            subCategory: availableCategories[0]?.name || "",
            image: "/placeholder.png"
        });
        setIsAddDialogOpen(true);
    };

    const handleOpenEdit = (timeline: CourseTimeline) => {
        setFormData({
            subCategory: timeline.subCategory,
            image: timeline.image
        });
        setIsAddDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subCategory) {
            toast.error("Please select a sub-category");
            return;
        }

        await addOrUpdateTimeline({ ...formData, image: formData.image || "/placeholder.png" });
        setIsAddDialogOpen(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading timelines...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Course Timeline Management</h2>
                    <p className="text-muted-foreground">Manage the visual journey maps for different course categories and sub-categories.</p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add/Update Timeline
                </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">Upload Guidelines:</p>
                    <ul className="list-disc ml-4 space-y-1">
                        <li>Only <strong>one timeline</strong> image is allowed per category/sub-category. Adding a new one will replace the existing one.</li>
                        <li>Recommended dimensions: <strong>1200 x 600 px</strong> (or 2:1 aspect ratio).</li>
                        <li>Format: JPG, PNG or WebP (max 2MB).</li>
                    </ul>
                </div>
            </div>

            <div className="rounded-md border border-border bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Preview</TableHead>
                            <TableHead>Category / Sub-Category</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courseTimelines.length > 0 ? (
                            courseTimelines.map((timeline) => (
                                <TableRow key={timeline._id}>
                                    <TableCell>
                                        <div className="w-24 h-12 bg-gray-100 rounded border border-border overflow-hidden">
                                            <img src={timeline.image} alt={timeline.subCategory} className="w-full h-full object-cover" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold">{timeline.subCategory}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(timeline)}>
                                                <Pencil className="h-4 w-4 text-primary" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteTimeline(timeline._id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                                    No timelines configured yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination.courseTimelines && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.courseTimelines.page - 1) * pagination.courseTimelines.limit + 1} to {Math.min(pagination.courseTimelines.page * pagination.courseTimelines.limit, pagination.courseTimelines.total)} of {pagination.courseTimelines.total} timelines
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
                            {[...Array(pagination.courseTimelines.pages)].map((_, i) => (
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
                                        if (currentPage < pagination.courseTimelines.pages) setCurrentPage(currentPage + 1);
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add/Update Course Timeline</DialogTitle>
                        <DialogDescription>
                            Select a category or sub-category and upload its journey timeline image.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subCategory">Select Category / Sub-Category</Label>
                                <Select
                                    value={formData.subCategory}
                                    onValueChange={(val) => setFormData({ ...formData, subCategory: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category/sub-category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCategories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {courseTimelines.some(t => t.subCategory === formData.subCategory) && (
                                    <p className="text-[10px] text-amber-600 font-bold">
                                        * Note: A timeline already exists for this category. Uploading will replace it.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Timeline Image</Label>
                                <ImageUpload
                                    value={formData.image || ""}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                    recommendedDimensions="1200 x 600 px (2:1)"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">
                                {courseTimelines.some(t => t.subCategory === formData.subCategory) ? "Update Timeline" : "Upload Timeline"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

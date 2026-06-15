import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { useCourseContext, Alumni } from "../context/CourseContext";
import { ImageUpload } from "../../components/ImageUpload";
import { toast } from "sonner";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../components/ui/pagination";

export function AlumniManagement() {
    const { alumni, addAlumni, updateAlumni, deleteAlumni, loading, pagination, refreshAlumni } = useCourseContext();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [formData, setFormData] = useState<Partial<Alumni>>({
        name: "",
        image: "/uploads/placeholder.png",
        designation: "",
        isFeatured: false,
        order: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        refreshAlumni({
            page: currentPage,
            limit: 10,
            search: searchQuery
        });
    }, [searchQuery, currentPage]);

    const handleOpenAdd = () => {
        setEditingAlumni(null);
        setFormData({
            name: "",
            image: "/uploads/placeholder.png",
            designation: "",
            isFeatured: false,
            order: 0
        });
        setErrors({});
        setIsAddDialogOpen(true);
    };

    const handleOpenEdit = (member: Alumni) => {
        setEditingAlumni(member);
        setFormData(member);
        setErrors({});
        setIsAddDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Simple validation
        if (!formData.name?.trim() || !formData.designation?.trim()) {
            toast.error("Please fill all required fields");
            return;
        }

        if (editingAlumni) {
            await updateAlumni(editingAlumni._id, formData);
        } else {
            await addAlumni(formData);
        }
        setIsAddDialogOpen(false);
    };

    if (loading && alumni.length === 0) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading alumni...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Alumni Management</h2>
                    <p className="text-muted-foreground">Manage the list of esteemed alumni shown on the website.</p>
                    <p className="text-[11px] text-yellow-600 font-medium mt-1">Note: Only one alumnus can be in the "Spotlight" at a time. Setting a new spotlight will replace the current one.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleOpenAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add Alumni
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-4">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or designation..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border border-border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alumni.length > 0 ? (
                            alumni.map((member) => (
                                <TableRow key={member._id} className={member.isFeatured ? "bg-primary/5" : ""}>
                                    <TableCell>
                                        <img src={member.image} alt={member.name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {member.name}
                                            {member.isFeatured && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase border border-yellow-200 shadow-sm">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                                    </span>
                                                    Spotlight
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.designation}</TableCell>
                                    <TableCell>{member.order}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant={member.isFeatured ? "default" : "outline"}
                                            size="sm"
                                            className={member.isFeatured ? "bg-yellow-500 hover:bg-yellow-600 border-none" : ""}
                                            onClick={async () => {
                                                if (member.isFeatured) return;
                                                await updateAlumni(member._id, { ...member, isFeatured: true });
                                                refreshAlumni({ page: currentPage, limit: 10, search: searchQuery });
                                            }}
                                        >
                                            {member.isFeatured ? "Spotlight Active" : "Set Spotlight"}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(member)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteAlumni(member._id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                                    No alumni found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination.alumni && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.alumni.page - 1) * pagination.alumni.limit + 1} to {Math.min(pagination.alumni.page * pagination.alumni.limit, pagination.alumni.total)} of {pagination.alumni.total} alumni
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
                            {[...Array(pagination.alumni.pages)].map((_, i) => (
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
                                        if (currentPage < pagination.alumni.pages) setCurrentPage(currentPage + 1);
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
                        <DialogTitle>{editingAlumni ? "Edit Alumni" : "Add New Alumni"}</DialogTitle>
                        <DialogDescription>
                            Enter the details of the esteemed alumnus.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="designation">Designation</Label>
                                <Input
                                    id="designation"
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="order">Display Order</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="isFeatured">Featured Alumni</Label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <ImageUpload
                                    label="Portrait Image"
                                    value={formData.image || ""}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                    recommendedDimensions="500 x 500 px"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">
                                {editingAlumni ? "Save Changes" : "Add Alumni"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

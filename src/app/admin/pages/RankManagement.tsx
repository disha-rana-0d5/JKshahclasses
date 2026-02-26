import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Pencil, Trash2, Search, FileUp, Loader2 } from "lucide-react";
import { useCourseContext, RankHolder } from "../context/CourseContext";
import { ImageUpload } from "../../components/ImageUpload";
import { rankHolderApi, BASE_URL } from "../../api/api";
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

export function RankManagement() {
    const { rankHolders, allCategories: categories, addRankHolder, updateRankHolder, deleteRankHolder, loading, pagination, refreshRankHolders } = useCourseContext();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingRank, setEditingRank] = useState<RankHolder | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<Partial<RankHolder>>({
        name: "",
        image: "/uploads/placeholder.png",
        category: "",
        globalRank: "",
        indiaRank: "",
        course: "",
        session: ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (name: string, value: string) => {
        let error = "";
        if (!value || value.trim() === "") {
            switch (name) {
                case "name": error = "Student name is required"; break;
                case "category": error = "Sub-category is required"; break;
                case "course": error = "Course/Subject is required"; break;
                case "session": error = "Session is required"; break;
            }
        }

        // Custom check for ranks - they are individually optional but collectively required
        if (name === "globalRank" || name === "indiaRank") {
            const globalValue = name === "globalRank" ? value : (formData.globalRank || "");
            const indiaValue = name === "indiaRank" ? value : (formData.indiaRank || "");

            if (!globalValue.trim() && !indiaValue.trim()) {
                error = "At least one rank (Global or India) is required";
            } else {
                // Clear errors on both fields if at least one is filled
                setErrors(prev => ({ ...prev, globalRank: "", indiaRank: "" }));
                return true;
            }
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error === "";
    };

    const isFormValid = () => {
        const requiredFields = ["name", "category", "course", "session"];
        const newErrors: Record<string, string> = {};
        let isValid = true;

        requiredFields.forEach(field => {
            const value = formData[field as keyof RankHolder] as string;
            if (!value || value.trim() === "") {
                const label = field.charAt(0).toUpperCase() + field.slice(1);
                newErrors[field] = `${label} is required`;
                isValid = false;
            }
        });

        // Check if at least one rank is provided
        if (!formData.globalRank?.trim() && !formData.indiaRank?.trim()) {
            newErrors.globalRank = "At least one rank is required";
            newErrors.indiaRank = "At least one rank is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    useEffect(() => {
        const filters: any = {};
        if (categoryFilter !== "All") filters.category = categoryFilter;

        refreshRankHolders({
            page: currentPage,
            limit: 10,
            search: searchQuery,
            filter: JSON.stringify(filters)
        });
    }, [searchQuery, categoryFilter, currentPage]);

    const handleOpenAdd = () => {
        setEditingRank(null);
        setFormData({
            name: "",
            image: "/uploads/placeholder.png",
            category: categories[0]?.name || "",
            globalRank: "",
            indiaRank: "",
            course: "",
            session: ""
        });
        setErrors({});
        setIsAddDialogOpen(true);
    };

    const handleOpenEdit = (rank: RankHolder) => {
        setEditingRank(rank);
        setFormData(rank);
        setErrors({});
        setIsAddDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) {
            toast.error("Please fill all required fields");
            return;
        }
        const finalData = { ...formData };
        if (editingRank) {
            await updateRankHolder(editingRank._id, finalData);
        } else {
            await addRankHolder(finalData);
        }
        setIsAddDialogOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleBulkUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a CSV file");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await rankHolderApi.bulkUploadRankHolders(formData);
            if (res.ok) {
                toast.success(res.data.message);
                setIsBulkDialogOpen(false);
                setSelectedFile(null);
                refreshRankHolders({ page: currentPage, limit: 10 });
            } else {
                toast.error(res.data.message || "Bulk upload failed");
            }
        } catch (error) {
            toast.error("An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    const handleExport = async () => {
        try {
            toast.info("Exporting data...");
            const res = await rankHolderApi.exportRankHolders();
            if (res.ok && res.data) {
                const url = window.URL.createObjectURL(res.data);
                const a = document.createElement("a");
                a.href = url;
                a.download = "rank_holders_edit.csv";
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success("Export successful");
            } else {
                toast.error("Failed to export data");
            }
        } catch (error) {
            console.error("Export error:", error);
            toast.error("An error occurred during export");
        }
    };

    const downloadSampleTemplate = () => {
        const headers = ["name", "category", "globalRank", "indiaRank", "course", "session", "image"];
        const sampleData = ["John Doe", "ACCA", "1", "1", "Financial Reporting", "June 2023", "/uploads/placeholder.png"];
        const csvContent = [headers.join(","), sampleData.join(",")].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "rank_holders_template.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading rank holders...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Rank Holder Management</h2>
                    <p className="text-muted-foreground">Manage and showcase your top-performing students.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)}>
                        <FileUp className="mr-2 h-4 w-4" /> Bulk Upload
                    </Button>
                    <Button onClick={handleOpenAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add Rank Holder
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-4">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or course..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-48">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Sub-Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Sub-Categories</SelectItem>
                            {categories.filter(c => c.parent).map((cat) => (
                                <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border border-border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Sub-Category</TableHead>
                            <TableHead>Global Rank</TableHead>
                            <TableHead>India Rank</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Session</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rankHolders.length > 0 ? (
                            rankHolders.map((rank) => (
                                <TableRow key={rank._id}>
                                    <TableCell>
                                        <img src={rank.image} alt={rank.name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                                    </TableCell>
                                    <TableCell className="font-medium">{rank.name}</TableCell>
                                    <TableCell>{rank.category}</TableCell>
                                    <TableCell>{rank.globalRank}</TableCell>
                                    <TableCell>{rank.indiaRank}</TableCell>
                                    <TableCell>{rank.course}</TableCell>
                                    <TableCell>{rank.session}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(rank)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteRankHolder(rank._id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground italic">
                                    No rank holders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination.rankHolders && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.rankHolders.page - 1) * pagination.rankHolders.limit + 1} to {Math.min(pagination.rankHolders.page * pagination.rankHolders.limit, pagination.rankHolders.total)} of {pagination.rankHolders.total} rank holders
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
                            {[...Array(pagination.rankHolders.pages)].map((_, i) => (
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
                                        if (currentPage < pagination.rankHolders.pages) setCurrentPage(currentPage + 1);
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingRank ? "Edit Rank Holder" : "Add New Rank Holder"}</DialogTitle>
                        <DialogDescription>
                            Enter the details of the student who achieved a top rank.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="name">Student Name</Label>
                                <Input
                                    id="name"
                                    className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                                    value={formData.name}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({ ...formData, name: val });
                                        validateField("name", val);
                                    }}
                                />
                                {errors.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Sub-Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => {
                                        setFormData({ ...formData, category: val });
                                        validateField("category", val);
                                    }}
                                >
                                    <SelectTrigger className={errors.category ? "border-destructive focus-visible:ring-destructive" : ""}>
                                        <SelectValue placeholder="Select sub-category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.filter(c => c.parent).map((cat) => (
                                            <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category && <p className="text-xs font-medium text-destructive">{errors.category}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course">Course/Subject</Label>
                                <Input
                                    id="course"
                                    className={errors.course ? "border-destructive focus-visible:ring-destructive" : ""}
                                    placeholder="e.g. AAA, Audit, etc."
                                    value={formData.course}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({ ...formData, course: val });
                                        validateField("course", val);
                                    }}
                                />
                                {errors.course && <p className="text-xs font-medium text-destructive">{errors.course}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="globalRank">Global Rank</Label>
                                <Input
                                    id="globalRank"
                                    className={errors.globalRank ? "border-destructive focus-visible:ring-destructive" : ""}
                                    placeholder="e.g. 11"
                                    value={formData.globalRank}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({ ...formData, globalRank: val });
                                        validateField("globalRank", val);
                                    }}
                                />
                                {errors.globalRank && <p className="text-xs font-medium text-destructive">{errors.globalRank}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="indiaRank">India Rank</Label>
                                <Input
                                    id="indiaRank"
                                    className={errors.indiaRank ? "border-destructive focus-visible:ring-destructive" : ""}
                                    placeholder="e.g. 03"
                                    value={formData.indiaRank}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({ ...formData, indiaRank: val });
                                        validateField("indiaRank", val);
                                    }}
                                />
                                {errors.indiaRank && <p className="text-xs font-medium text-destructive">{errors.indiaRank}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="session">Session</Label>
                                <Input
                                    id="session"
                                    className={errors.session ? "border-destructive focus-visible:ring-destructive" : ""}
                                    placeholder="e.g. June 2021"
                                    value={formData.session}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({ ...formData, session: val });
                                        validateField("session", val);
                                    }}
                                />
                                {errors.session && <p className="text-xs font-medium text-destructive">{errors.session}</p>}
                            </div>
                            <div className="space-y-2">
                                <ImageUpload
                                    label="Student Image"
                                    value={formData.image || ""}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                    recommendedDimensions="500 x 500 px (1:1)"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={Object.values(errors).some(err => err !== "")}>
                                {editingRank ? "Save Changes" : "Add Rank Holder"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Upload Rank Holders</DialogTitle>
                        <DialogDescription>
                            Upload a CSV file containing rank holder details. <br />
                            <strong>To bulk edit:</strong> Export the current list, edit the CSV, and upload it back.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={handleExport}>
                                <FileUp className="mr-2 h-4 w-4" /> Export for Edit
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="csvFile">Select CSV File</Label>
                            <Input
                                id="csvFile"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Required columns: name, category, course, session. <br />
                            Optional columns: globalRank, indiaRank, image. <br />
                            <strong>_id column required for updates.</strong>
                        </div>
                        <Button variant="link" className="p-0 h-auto" onClick={downloadSampleTemplate}>
                            Download Sample Template (For new records)
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)} disabled={isUploading}>Cancel</Button>
                        <Button onClick={handleBulkUpload} disabled={isUploading || !selectedFile}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                </>
                            ) : (
                                "Upload CSV"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

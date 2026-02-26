import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Trash2, Info, Briefcase, Pencil } from "lucide-react";
import { useCourseContext, CareerOpportunityConfig } from "../context/CourseContext";
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

export function CareerOpportunityManagement() {
    const { careerConfigs, categories, addOrUpdateCareerConfig, deleteCareerConfig, loading, pagination, refreshCareerConfigs } = useCourseContext();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<CareerOpportunityConfig | null>(null);

    const [formData, setFormData] = useState<Partial<CareerOpportunityConfig>>({
        subCategory: "",
        image: "/uploads/placeholder.png",
        opportunities: Array(8).fill("")
    });

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        refreshCareerConfigs({
            page: currentPage,
            limit: 10
        });
    }, [currentPage]);

    // Sub-categories are categories that have a parent
    const subCategories = categories.filter(c => c.parent);

    const handleOpenAdd = () => {
        setEditingConfig(null);
        setFormData({
            subCategory: subCategories[0]?.name || "",
            image: "/uploads/placeholder.png",
            opportunities: Array(8).fill("")
        });
        setIsAddDialogOpen(true);
    };

    const handleOpenEdit = (config: CareerOpportunityConfig) => {
        setEditingConfig(config);
        setFormData(config);
        setIsAddDialogOpen(true);
    };

    const handleOppChange = (index: number, value: string) => {
        const newOpps = [...(formData.opportunities || [])];
        newOpps[index] = value;
        setFormData({ ...formData, opportunities: newOpps });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subCategory || formData.opportunities?.some(o => !o)) {
            toast.error("Please fill in all career points");
            return;
        }

        await addOrUpdateCareerConfig({ ...formData, _id: editingConfig?._id, image: formData.image || "" });
        setEditingConfig(null);
        setIsAddDialogOpen(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading configurations...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Career Opportunities Management</h2>
                    <p className="text-muted-foreground">Manage the 8 fixed career paths and images for course sub-categories.</p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add/Update Config
                </Button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                    <p className="font-bold mb-1">Configuration Rules:</p>
                    <ul className="list-disc ml-4 space-y-1">
                        <li>Each sub-category can have exactly <strong>one</strong> career configuration.</li>
                        <li>You must provide exactly <strong>8 career points</strong> for optimal layout.</li>
                        <li>Recommended image dimensions: <strong>600x800px</strong> (portrait for best fit).</li>
                    </ul>
                </div>
            </div>

            <div className="rounded-md border border-border bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Sub-Category</TableHead>
                            <TableHead>Career Points</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {careerConfigs.length > 0 ? (
                            careerConfigs.map((config) => (
                                <TableRow key={config._id}>
                                    <TableCell>
                                        <div className="w-12 h-16 bg-gray-100 rounded border border-border overflow-hidden">
                                            <img src={config.image} alt={config.subCategory} className="w-full h-full object-cover" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-[#373081]">{config.subCategory}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {config.opportunities.slice(0, 4).map((o, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-600">
                                                    {o}
                                                </span>
                                            ))}
                                            {config.opportunities.length > 4 && <span className="text-[10px] text-slate-400">+{config.opportunities.length - 4} more</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(config)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteCareerConfig(config._id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                                    No configurations found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination.careerConfigs && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.careerConfigs.page - 1) * pagination.careerConfigs.limit + 1} to {Math.min(pagination.careerConfigs.page * pagination.careerConfigs.limit, pagination.careerConfigs.total)} of {pagination.careerConfigs.total} configurations
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
                            {[...Array(pagination.careerConfigs.pages)].map((_, i) => (
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
                                        if (currentPage < pagination.careerConfigs.pages) setCurrentPage(currentPage + 1);
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) setEditingConfig(null);
            }}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingConfig ? `Edit Career Configuration: ${editingConfig.subCategory}` : "Add New Career Configuration"}</DialogTitle>
                        <DialogDescription>
                            Configure the 8 career points and representative image for a sub-category.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="subCategory">Select Sub-Category</Label>
                                    <Select
                                        value={formData.subCategory}
                                        onValueChange={(val) => setFormData({ ...formData, subCategory: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select sub-category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subCategories.map((cat) => (
                                                <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Section Image</Label>
                                    <ImageUpload
                                        value={formData.image || ""}
                                        onChange={(url) => setFormData({ ...formData, image: url })}
                                        recommendedDimensions="600 x 800 px (3:4 or 4:5)"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-[#373081]" />
                                    Define 8 Career Points
                                </Label>
                                <div className="grid gap-3">
                                    {Array(8).fill(0).map((_, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-slate-400 w-4">{i + 1}.</span>
                                            <Input
                                                placeholder={`Career point ${i + 1}...`}
                                                value={formData.opportunities?.[i] || ""}
                                                onChange={(e) => handleOppChange(i, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="sticky bottom-0 bg-white pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Configuration</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { productApi } from "../../api/api";
import { toast } from "sonner";

export function ProductSubCategoryManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState<any>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            const { ok, data } = await productApi.getCategories();
            if (ok && data.success) setCategories(data.data);
        };
        fetchCategories();
    }, []);

    const fetchSubCategories = async (catId: string) => {
        setIsLoading(true);
        const { ok, data } = await productApi.getSubCategories(catId);
        if (ok && data.success) setSubcategories(data.data);
        setIsLoading(false);
    };

    const handleCategoryChange = (val: string) => {
        setSelectedCategory(val);
        fetchSubCategories(val);
    };

    const handleSave = async () => {
        if (!name || !selectedCategory) return toast.error("Name and Category are required");
        setIsSaving(true);
        const { ok, data } = editingSubCategory
            ? await productApi.updateSubCategory(editingSubCategory._id, name, selectedCategory)
            : await productApi.addSubCategory(name, selectedCategory);

        if (ok && data.success) {
            toast.success(editingSubCategory ? "Subcategory updated" : "Subcategory added");
            setName("");
            setIsAdding(false);
            setEditingSubCategory(null);
            fetchSubCategories(selectedCategory);
        } else {
            toast.error(data.message || "Failed to save subcategory");
        }
        setIsSaving(false);
    };

    const handleEdit = (sub: any) => {
        setEditingSubCategory(sub);
        setName(sub.name);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        setIsLoading(true);
        const { ok, data } = await productApi.deleteSubCategory(id);
        if (ok && data.success) {
            toast.success("Subcategory deleted");
            fetchSubCategories(selectedCategory);
        } else {
            toast.error(data?.message || "Failed to delete subcategory");
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Product Sub Categories</h2>
                    <p className="text-muted-foreground">Manage sub-categories for your products.</p>
                </div>
                <Button onClick={() => { setEditingSubCategory(null); setName(""); setIsAdding(true); }} disabled={!selectedCategory} className="bg-[#E94B64] hover:bg-[#D43F57]">
                    <Plus className="w-4 h-4 mr-2" /> Add Sub Category
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4 max-w-sm">
                        <Label>Select Category</Label>
                        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat._id} value={cat._id}>
                                        {cat.name} ({cat.type || 'book'})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {isAdding && (
                <Card>
                    <CardHeader><CardTitle>{editingSubCategory ? "Edit Sub Category" : "Add Sub Category"}</CardTitle></CardHeader>
                    <CardContent className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                            <Label>Sub Category Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Audit" />
                        </div>
                        {editingSubCategory && (
                            <div className="w-64 space-y-2">
                                <Label>Parent Category</Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                {cat.name} ({cat.type || 'book'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingSubCategory ? "Update" : "Save"}
                        </Button>
                        <Button variant="outline" onClick={() => { setIsAdding(false); setEditingSubCategory(null); }}>Cancel</Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="pt-6">
                    {!selectedCategory ? (
                        <div className="text-center py-8 text-muted-foreground">Please select a category to view sub-categories.</div>
                    ) : isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subcategories.map(sub => (
                                    <TableRow key={sub._id}>
                                        <TableCell>{sub.name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(sub)} className="text-blue-500">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(sub._id)} className="text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {subcategories.length === 0 && (
                                    <TableRow><TableCell colSpan={2} className="text-center py-4">No subcategories found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

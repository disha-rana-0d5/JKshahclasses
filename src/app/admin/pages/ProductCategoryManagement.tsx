import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Search, Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { productApi } from "../../api/api";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";

export function ProductCategoryManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("book");
    const [isSaving, setIsSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const fetchCategories = async () => {
        setIsLoading(true);
        const { ok, data } = await productApi.getCategories();
        if (ok && data.success) setCategories(data.data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSave = async () => {
        if (!name) return toast.error("Name is required");
        setIsSaving(true);
        const { ok, data } = editingCategory
            ? await productApi.updateCategory(editingCategory._id, name, type)
            : await productApi.addCategory(name, type);

        if (ok && data.success) {
            toast.success(editingCategory ? "Category updated" : "Category added");
            setName("");
            setType("book");
            setEditingCategory(null);
            setIsAdding(false);
            fetchCategories();
        } else {
            toast.error(data.message || "Failed to save category");
        }
        setIsSaving(false);
    };

    const handleEdit = (cat: any) => {
        setEditingCategory(cat);
        setName(cat.name);
        setType(cat.type || "book");
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        setIsLoading(true);
        const { ok, data } = await productApi.deleteCategory(id);
        if (ok && data.success) {
            toast.success("Category deleted");
            fetchCategories();
        } else {
            toast.error(data?.message || "Failed to delete category");
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Product Categories</h2>
                    <p className="text-muted-foreground">Manage categories for your products.</p>
                </div>
                <Button onClick={() => { setEditingCategory(null); setName(""); setType("book"); setIsAdding(true); }} className="bg-[#E94B64] hover:bg-[#D43F57]">
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader><CardTitle>{editingCategory ? "Edit Category" : "Add Category"}</CardTitle></CardHeader>
                    <CardContent className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                            <Label>Category Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CA Final" />
                        </div>
                        <div className="w-48 space-y-2">
                            <Label>Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="book">Book</SelectItem>
                                    <SelectItem value="test-series">Test Series</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingCategory ? "Update" : "Save"}
                        </Button>
                        <Button variant="outline" onClick={() => { setIsAdding(false); setEditingCategory(null); }}>Cancel</Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="pt-6">
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map(cat => (
                                    <TableRow key={cat._id}>
                                        <TableCell className="font-medium">{cat.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {cat.type || 'book'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} className="text-blue-500">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(cat._id)} className="text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

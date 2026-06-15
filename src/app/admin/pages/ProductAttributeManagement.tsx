import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Trash2, Loader2, ChevronRight, Pencil, Check, X } from "lucide-react";
import { productApi } from "../../api/api";
import { toast } from "sonner";

export function ProductAttributeManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [attributes, setAttributes] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");

    // Attribute Level
    const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
    const [attributeValues, setAttributeValues] = useState<any[]>([]);
    const [isAddingAttribute, setIsAddingAttribute] = useState(false);
    const [attributeName, setAttributeName] = useState("");
    const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);
    const [editingAttributeName, setEditingAttributeName] = useState("");

    // Value Level
    const [isAddingValue, setIsAddingValue] = useState(false);
    const [valueName, setValueName] = useState("");
    const [valueAmount, setValueAmount] = useState("");
    const [editingValueId, setEditingValueId] = useState<string | null>(null);
    const [editingValueName, setEditingValueName] = useState("");
    const [editingValueAmount, setEditingValueAmount] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const { ok, data } = await productApi.getCategories();
            if (ok && data.success) setCategories(data.data);
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = async (val: string) => {
        setSelectedCategory(val);
        setSelectedSubCategory("");
        setSubcategories([]);
        setAttributes([]);
        setSelectedAttribute(null);
        const { ok, data } = await productApi.getSubCategories(val);
        if (ok && data.success) setSubcategories(data.data);
    };

    const handleSubCategoryChange = (val: string) => {
        setSelectedSubCategory(val);
        fetchAttributes(val);
    };

    const fetchAttributes = async (subId: string) => {
        setIsLoading(true);
        const { ok, data } = await productApi.getAttributes(subId);
        if (ok && data.success) setAttributes(data.data);
        setIsLoading(false);
    };

    const handleAddAttribute = async () => {
        if (!attributeName || !selectedSubCategory) return toast.error("Name and Sub Category are required");
        setIsSaving(true);
        const { ok, data } = await productApi.addAttribute(attributeName, selectedSubCategory);
        if (ok && data.success) {
            toast.success("Attribute added");
            setAttributeName("");
            setIsAddingAttribute(false);
            fetchAttributes(selectedSubCategory);
        } else {
            toast.error(data?.message || "Failed to add attribute");
        }
        setIsSaving(false);
    };

    const handleUpdateAttribute = async () => {
        if (!editingAttributeName || !editingAttributeId) return;
        setIsSaving(true);
        const { ok, data } = await productApi.updateAttribute(editingAttributeId, { name: editingAttributeName });
        if (ok && data.success) {
            toast.success("Attribute updated");
            setEditingAttributeId(null);
            fetchAttributes(selectedSubCategory);
            if (selectedAttribute?._id === editingAttributeId) {
                setSelectedAttribute(data.data);
            }
        } else {
            toast.error(data?.message || "Failed to update attribute");
        }
        setIsSaving(false);
    };

    const handleDeleteAttribute = async (id: string) => {
        if (!confirm("Are you sure? This will delete all values too.")) return;
        setIsLoading(true);
        const { ok, data } = await productApi.deleteAttribute(id);
        if (ok && data.success) {
            toast.success("Attribute deleted");
            if (selectedAttribute?._id === id) setSelectedAttribute(null);
            fetchAttributes(selectedSubCategory);
        } else {
            toast.error(data?.message || "Failed to delete attribute");
            setIsLoading(false);
        }
    };

    const handleSelectAttribute = async (attr: any) => {
        setSelectedAttribute(attr);
        setIsLoading(true);
        const { ok, data } = await productApi.getAttributeValues(attr._id);
        if (ok && data.success) setAttributeValues(data.data);
        setIsLoading(false);
    };

    const handleAddValue = async () => {
        if (!valueName || !selectedAttribute) return toast.error("Value name is required");
        setIsSaving(true);
        const { ok, data } = await productApi.addAttributeValue(valueName, selectedAttribute._id, Number(valueAmount) || 0);
        if (ok && data.success) {
            toast.success("Value added");
            setValueName("");
            setValueAmount("");
            setIsAddingValue(false);
            // Refresh values
            handleSelectAttribute(selectedAttribute);
        }
        setIsSaving(false);
    };

    const handleUpdateValue = async () => {
        if (!editingValueName || !editingValueId) return;
        setIsSaving(true);
        const { ok, data } = await productApi.updateAttributeValue(editingValueId, {
            value: editingValueName,
            amount: Number(editingValueAmount) || 0
        });
        if (ok && data.success) {
            toast.success("Value updated");
            setEditingValueId(null);
            handleSelectAttribute(selectedAttribute);
        } else {
            toast.error(data?.message || "Failed to update value");
        }
        setIsSaving(false);
    };

    const handleDeleteValue = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        setIsLoading(true);
        const { ok, data } = await productApi.deleteAttributeValue(id);
        if (ok && data.success) {
            toast.success("Value deleted");
            handleSelectAttribute(selectedAttribute);
        } else {
            toast.error(data?.message || "Failed to delete value");
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Product Attributes & Values</h2>
                    <p className="text-muted-foreground">Manage variations like Subject, Book Type, and their available options.</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Select Category</Label>
                            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Select Sub Category</Label>
                            <Select value={selectedSubCategory} onValueChange={handleSubCategoryChange} disabled={!selectedCategory}>
                                <SelectTrigger><SelectValue placeholder="Select Sub Category" /></SelectTrigger>
                                <SelectContent>
                                    {subcategories.map(sub => <SelectItem key={sub._id} value={sub._id}>{sub.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedSubCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Attributes List */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Attribute Types</CardTitle>
                            <Button size="sm" onClick={() => setIsAddingAttribute(true)} variant="outline">
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isAddingAttribute && (
                                <div className="mb-4 p-3 border rounded-lg space-y-3 bg-muted/50">
                                    <Input value={attributeName} onChange={e => setAttributeName(e.target.value)} placeholder="e.g. Subject or Book Type" />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleAddAttribute} disabled={isSaving}>Save</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsAddingAttribute(false)}>Cancel</Button>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                {attributes.map(attr => (
                                    <div
                                        key={attr._id}
                                        onClick={() => handleSelectAttribute(attr)}
                                        className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-colors ${selectedAttribute?._id === attr._id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                    >
                                        {editingAttributeId === attr._id ? (
                                            <div className="space-y-2" onClick={e => e.stopPropagation()}>
                                                <Input
                                                    value={editingAttributeName}
                                                    onChange={e => setEditingAttributeName(e.target.value)}
                                                    className="h-8"
                                                />
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={handleUpdateAttribute} disabled={isSaving}>Update</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingAttributeId(null)}>Cancel</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{attr.name}</span>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingAttributeId(attr._id);
                                                        setEditingAttributeName(attr.name);
                                                    }}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteAttribute(attr._id);
                                                    }}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {attributes.length === 0 && <div className="text-center py-6 text-muted-foreground">No attributes found.</div>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attribute Values */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">
                                {selectedAttribute ? `Values for "${selectedAttribute.name}"` : "Select an Attribute"}
                            </CardTitle>
                            {selectedAttribute && (
                                <Button size="sm" onClick={() => setIsAddingValue(true)} variant="outline">
                                    <Plus className="w-4 h-4 mr-1" /> Add Value
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {!selectedAttribute ? (
                                <div className="text-center py-10 text-muted-foreground">Select an attribute from the left to manage its values.</div>
                            ) : (
                                <>
                                    {isAddingValue && (
                                        <div className="mb-4 p-3 border rounded-lg space-y-3 bg-muted/50">
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input value={valueName} onChange={e => setValueName(e.target.value)} placeholder="e.g. Accounting" />
                                                <Input type="number" value={valueAmount} onChange={e => setValueAmount(e.target.value)} placeholder="Amount (e.g. 500)" />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={handleAddValue} disabled={isSaving}>Save</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setIsAddingValue(false)}>Cancel</Button>
                                            </div>
                                        </div>
                                    )}
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Value</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {attributeValues.map(val => (
                                                <TableRow key={val._id}>
                                                    {editingValueId === val._id ? (
                                                        <>
                                                            <TableCell>
                                                                <Input
                                                                    value={editingValueName}
                                                                    onChange={e => setEditingValueName(e.target.value)}
                                                                    className="h-8"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={editingValueAmount}
                                                                    onChange={e => setEditingValueAmount(e.target.value)}
                                                                    className="h-8"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-1">
                                                                    <Button size="icon" className="h-8 w-8" onClick={handleUpdateValue} disabled={isSaving}><Check className="w-4 h-4" /></Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingValueId(null)}><X className="w-4 h-4" /></Button>
                                                                </div>
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TableCell className="font-medium">{val.value}</TableCell>
                                                            <TableCell className="font-medium">₹{val.amount || 0}</TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-1">
                                                                    <Button variant="ghost" size="icon" className="text-blue-500 h-8 w-8" onClick={() => {
                                                                        setEditingValueId(val._id);
                                                                        setEditingValueName(val.value);
                                                                        setEditingValueAmount(String(val.amount || 0));
                                                                    }}>
                                                                        <Pencil className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteValue(val._id)} className="text-destructive h-8 w-8">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            ))}
                                            {attributeValues.length === 0 && (
                                                <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground">No values found.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

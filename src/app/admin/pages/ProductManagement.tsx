import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Book, LayoutGrid, Package, PlusCircle, Upload, Loader2, IndianRupee, Search, Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { productApi } from "../../api/api";
import { toast } from "sonner";
import { ImageUpload } from "../../components/ImageUpload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { Check, X } from "lucide-react";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export function ProductManagement() {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [faculties, setFaculties] = useState<any[]>([]);

    // Variable Product State
    const [isVariable, setIsVariable] = useState(false);
    const [availableAttributes, setAvailableAttributes] = useState<any[]>([]);
    const [attributesConfig, setAttributesConfig] = useState<any[]>([]); // { attribute: id, values: [ids] }
    const [variants, setVariants] = useState<any[]>([]);
    const [allAttributeValues, setAllAttributeValues] = useState<Record<string, any[]>>({}); // attrId -> values[]

    // Form state
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [oldPrice, setOldPrice] = useState("");
    const [category, setCategory] = useState("");
    const [subcategory, setSubcategory] = useState("");
    const [faculty, setFaculty] = useState("");
    const [productInfo, setProductInfo] = useState("");
    const [description, setDescription] = useState("");
    const [year, setYear] = useState("");
    const [quantity, setQuantity] = useState("");

    const [image, setImage] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [isFetchingProducts, setIsFetchingProducts] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("book");
    const [newAttributeName, setNewAttributeName] = useState("");
    const [newValueNames, setNewValueNames] = useState<Record<string, string>>({}); // attrId -> string
    const [newValuePrices, setNewValuePrices] = useState<Record<string, string>>({}); // attrId -> string (price)
    const [newValueQuantities, setNewValueQuantities] = useState<Record<string, string>>({}); // attrId -> string (qty)
    const [editingStockId, setEditingStockId] = useState<string | null>(null);
    const [editingStockValue, setEditingStockValue] = useState("");
    const [newlyCreatedAttributeIds, setNewlyCreatedAttributeIds] = useState<string[]>([]);




    const fetchInitialData = async () => {
        const [catRes, facRes] = await Promise.all([
            productApi.getCategories(),
            productApi.getFaculties()
        ]);
        if (catRes.ok && catRes.data.success) setCategories(catRes.data.data);
        if (facRes.ok && facRes.data.success) setFaculties(facRes.data.data);
    };

    const fetchProducts = async (page: number = 1, search: string = "", type: string = activeTab) => {
        setIsFetchingProducts(true);
        const params: Record<string, any> = { type, page, limit: 10 };
        if (search) params.search = search;
        const { ok, data } = await productApi.getProducts(params);
        if (ok && data.success) {
            setProducts(data.data);
            setPagination(data.pagination);
            setCurrentPage(data.pagination.page);
        }
        setIsFetchingProducts(false);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(1, searchQuery, activeTab);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, activeTab]);

    const handleCategoryChange = async (catId: string) => {
        setCategory(catId);
        setSubcategory("");
        setSubcategories([]);
        setAvailableAttributes([]);
        const { ok, data } = await productApi.getSubCategories(catId);
        if (ok && data.success) setSubcategories(data.data);
    };

    const handleTabChange = (val: string) => {
        const type = val === "books" ? "book" : "test-series";
        setActiveTab(type);
        setSearchQuery(""); // Reset search when switching tabs
        resetForm();
    };

    const handleSubCategoryChange = async (subId: string) => {
        setSubcategory(subId);
        // Attributes are now product-specific OR global, not linked to subcategory
    };

    const handleAddAttribute = async () => {
        if (!newAttributeName) return toast.error("Please enter attribute name");
        setIsLoading(true);
        // If editing, link to product. If not, link will happen after save.
        const { ok, data } = await productApi.addAttribute(newAttributeName, undefined, editingProduct?._id, 0, false);
        if (ok && data.success) {
            toast.success("Attribute added successfully");
            setNewAttributeName("");

            const newAttr = data.data;
            if (!editingProduct) {
                setNewlyCreatedAttributeIds(prev => [...prev, newAttr._id]);
            }

            // Refresh attributes from API
            const attRes = await productApi.getAttributes(undefined, editingProduct?._id);
            if (attRes.ok && attRes.data.success) {
                let fetchedAttrs = attRes.data.data;

                // For "New Product" view (where editingProduct is null), 
                // the backend normally returns only Global attributes.
                // We need to ensure all the ones we've created in this session (newlyCreatedAttributeIds)
                // are also visible, even if they aren't linked to a product ID yet.
                if (!editingProduct) {
                    // Start with the newly created one (it's definitely part of this session)
                    let sessionAttrs = [newAttr];

                    // We also need to keep track of any PREVIOUSLY created attributes from this session
                    // that might have been filtered out by the latest getAttributes call.
                    // Let's merge the newly fetched (mostly global) ones with all our session ones.

                    setAvailableAttributes(prev => {
                        // 1. Get current list (which should already have previous session attrs)
                        // 2. Add the one we just created if it's not there
                        const currentSessionList = [...prev];
                        if (!currentSessionList.find(a => a._id === newAttr._id)) {
                            currentSessionList.push(newAttr);
                        }

                        // 3. Merge with latest global/product attributes from API
                        const merged = [...currentSessionList];
                        fetchedAttrs.forEach((fa: any) => {
                            if (!merged.find(m => m._id === fa._id)) {
                                merged.push(fa);
                            }
                        });
                        return merged;
                    });
                } else {
                    // If editing, backend should already return the correct ones linked to this product.
                    setAvailableAttributes(fetchedAttrs);
                }
            }
        } else {
            toast.error(data.message || "Failed to add attribute");
        }
        setIsLoading(false);
    };

    const handleAddValue = async (attrId: string) => {
        const valName = newValueNames[attrId];
        const valPrice = newValuePrices[attrId] || "0";
        const valQty = newValueQuantities[attrId] || "0";
        if (!valName) return toast.error("Please enter value");
        setIsLoading(true);
        const { ok, data } = await productApi.addAttributeValue(valName, attrId, Number(valPrice), Number(valQty));
        if (ok && data.success) {
            toast.success("Value added successfully");
            setNewValueNames(prev => ({ ...prev, [attrId]: "" }));
            setNewValuePrices(prev => ({ ...prev, [attrId]: "" }));
            setNewValueQuantities(prev => ({ ...prev, [attrId]: "" }));
            // Refresh values for this attribute
            const vRes = await productApi.getAttributeValues(attrId);
            if (vRes.ok && vRes.data.success) {
                setAllAttributeValues(prev => ({ ...prev, [attrId]: vRes.data.data }));
            }
        } else {
            toast.error(data.message || "Failed to add value");
        }
        setIsLoading(false);
    };

    const handleDeleteAttribute = async (attrId: string) => {
        if (!confirm("Are you sure you want to delete this attribute and all its values?")) return;
        setIsLoading(true);
        const { ok, data } = await productApi.deleteAttribute(attrId);
        if (ok && data.success) {
            toast.success("Attribute deleted successfully");
            setAvailableAttributes(prev => prev.filter(a => a._id !== attrId));
            setAttributesConfig(prev => prev.filter(a => a.attribute !== attrId));
        } else {
            toast.error(data.message || "Failed to delete attribute. It might be in use.");
        }
        setIsLoading(false);
    };

    const handleDeleteValue = async (valId: string, attrId: string) => {
        if (!confirm("Delete this value?")) return;
        setIsLoading(true);
        const { ok, data } = await productApi.deleteAttributeValue(valId);
        if (ok && data.success) {
            toast.success("Value deleted");
            // Refresh values
            const vRes = await productApi.getAttributeValues(attrId);
            if (vRes.ok && vRes.data.success) {
                setAllAttributeValues(prev => ({ ...prev, [attrId]: vRes.data.data }));
            }
        } else {
            toast.error(data.message || "Failed to delete value");
        }
        setIsLoading(false);
    };

    const resetForm = () => {
        setTitle(""); setPrice(""); setOldPrice(""); setQuantity(""); setCategory("");
        setSubcategory(""); setFaculty("");
        setProductInfo(""); setDescription(""); setImage("");
        setYear("");
        setIsVariable(false);
        setAttributesConfig([]);
        setVariants([]);
        setAvailableAttributes([]); // Clear attributes
        setNewlyCreatedAttributeIds([]);
        setEditingProduct(null);
    };

    const handleEditProduct = async (prod: any) => {
        setEditingProduct(prod);
        setTitle(prod.title || "");
        setPrice(String(prod.price || ""));
        setOldPrice(String(prod.oldPrice || ""));
        setImage(prod.image || "");
        setProductInfo(prod.productInfo || "");
        setDescription(prod.description || "");
        setYear(String(prod.year || ""));
        setQuantity(String(prod.quantity || ""));

        // Set category and load its subcategories
        const catId = prod.category?._id || prod.category || "";
        setCategory(catId);
        if (catId) {
            const { ok, data } = await productApi.getSubCategories(catId);
            if (ok && data.success) setSubcategories(data.data);
        }

        const subId = prod.subcategory?._id || prod.subcategory || "";
        setSubcategory(subId);

        const { ok, data } = await productApi.getAttributes(undefined, prod._id);
        let availableIds: string[] = [];
        if (ok && data.success) {
            setAvailableAttributes(data.data);
            availableIds = data.data.map((a: any) => a._id);
            const valuesMap: Record<string, any[]> = {};
            for (const attr of data.data) {
                const vRes = await productApi.getAttributeValues(attr._id);
                if (vRes.ok && vRes.data.success) valuesMap[attr._id] = vRes.data.data;
            }
            setAllAttributeValues(valuesMap);
        }

        setIsVariable(prod.isVariable || false);
        // Normalize and PRUNE attributesConfig (remove ones not in availableAttributes)
        const normalizedConfig = (prod.attributesConfig || [])
            .map((ac: any) => ({
                attribute: ac.attribute?._id || ac.attribute,
                values: (ac.values || []).map((v: any) => v._id || v)
            }))
            .filter(ac => availableIds.includes(ac.attribute));
        setAttributesConfig(normalizedConfig);

        // For variants, prune attributes to only include active ones AND DEDUPLICATE
        const seenFormattedCombos = new Set();
        const formattedVariants: any[] = [];

        (prod.variants || []).forEach((v: any) => {
            const rawAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
            const prunedAttrs: Record<string, string> = {};
            Object.entries(rawAttrs || {}).forEach(([attrId, valId]) => {
                if (availableIds.includes(attrId)) {
                    prunedAttrs[attrId] = typeof valId === 'object' ? (valId as any)._id : (valId as any);
                }
            });

            // Generate a stable key for deduplication
            const comboKey = Object.entries(prunedAttrs).sort().map(([k, v]) => `${k}:${v}`).join('|');
            if (!seenFormattedCombos.has(comboKey)) {
                seenFormattedCombos.add(comboKey);
                formattedVariants.push({
                    ...v,
                    attributes: prunedAttrs
                });
            }
        });
        setVariants(formattedVariants);
        setFaculty(prod.faculty?._id || prod.faculty || "");
        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async () => {
        if (!title || (!isVariable && !price) || !category) {
            return toast.error("Please fill title, price and category");
        }
        setIsLoading(true);

        let finalPrice = Number(price);
        let finalOldPrice = oldPrice ? Number(oldPrice) : undefined;

        if (isVariable && variants.length > 0) {
            const activeVariants = variants.filter(v => v.isActive);
            if (activeVariants.length > 0) {
                finalPrice = Math.min(...activeVariants.map(v => v.price));
                finalOldPrice = Math.max(...activeVariants.map(v => v.oldPrice || 0)) || undefined;
            }
        }

        const productData = {
            title,
            type: activeTab,
            price: finalPrice,
            oldPrice: finalOldPrice,
            category,
            subcategory: subcategory || undefined,
            faculty: faculty || undefined,
            productInfo,
            description,
            isVariable,
            attributesConfig,
            variants,
            image,
            year: year ? Number(year) : undefined,
            quantity: quantity ? Number(quantity) : 0
        };

        const { ok, data } = editingProduct
            ? await productApi.updateProduct(editingProduct._id, productData)
            : await productApi.addProduct(productData);

        if (ok && data.success) {
            const product = data.data;
            const isNew = !editingProduct;

            // If new product was created, link the newly created attributes to it
            if (isNew && newlyCreatedAttributeIds.length > 0) {
                for (const attrId of newlyCreatedAttributeIds) {
                    await productApi.updateAttribute(attrId, { product: product._id });
                }
            }

            toast.success(editingProduct ? "Product updated successfully" : "Product saved successfully");
            resetForm();
            fetchProducts(currentPage, searchQuery);
        } else {
            toast.error(data.message || "Failed to save product");
        }
        setIsLoading(false);
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const { ok } = await productApi.deleteProduct(id);
        if (ok) {
            toast.success("Product deleted successfully");
            fetchProducts(currentPage, searchQuery);
        } else {
            toast.error("Failed to delete product");
        }
    };

    const handleUpdateStock = async (id: string, qty: number) => {
        setIsLoading(true);
        const { ok, data } = await productApi.updateProduct(id, { quantity: qty });
        if (ok && data.success) {
            toast.success("Stock updated");
            setEditingStockId(null);
            fetchProducts(currentPage, searchQuery);
        } else {
            toast.error(data.message || "Failed to update stock");
        }
        setIsLoading(false);
    };

    const toggleAttributeInConfig = (attrId: string) => {
        setAttributesConfig(prev => {
            const exists = prev.find(a => a.attribute === attrId);
            if (exists) return prev.filter(a => a.attribute !== attrId);
            return [...prev, { attribute: attrId, values: [] }];
        });
    };

    const toggleValueInConfig = (attrId: string, valueId: string) => {
        setAttributesConfig(prev => prev.map(a => {
            if (a.attribute !== attrId) return a;
            const values = a.values.includes(valueId)
                ? a.values.filter((v: string) => v !== valueId)
                : [...a.values, valueId];
            return { ...a, values };
        }));
    };

    const generateVariants = () => {
        // 1. Deduplicate attributesConfig by attribute ID just in case
        const uniqueConfig = attributesConfig.reduce((acc: any[], current) => {
            if (!acc.find(a => a.attribute === current.attribute)) {
                acc.push(current);
            }
            return acc;
        }, []);

        if (uniqueConfig.length === 0 || uniqueConfig.some(a => a.values.length === 0)) {
            return toast.error("Please select at least one value for each active attribute");
        }

        const cartesian = (...args: any[][]) => args.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

        const configsToCombine = uniqueConfig.map(a => a.values.map((v: string) => ({ attrId: a.attribute, valId: v })));
        const combinations = configsToCombine.length > 1 ? cartesian(...configsToCombine) : configsToCombine[0].map(v => [v]);

        const seenCombos = new Set();
        const newVariants: any[] = [];

        combinations.forEach((combo: any[]) => {
            const attrs: Record<string, string> = {};
            let comboPriceOffset = 0;
            let comboQty = 0;
            let qtyFound = false;

            combo.forEach(c => {
                attrs[c.attrId] = c.valId;
                const valObj = allAttributeValues[c.attrId]?.find(av => av._id === c.valId);
                if (valObj?.amount) comboPriceOffset += valObj.amount;
                if (valObj?.quantity && valObj.quantity > 0) {
                    if (!qtyFound || valObj.quantity < comboQty) {
                        comboQty = valObj.quantity;
                        qtyFound = true;
                    }
                }
            });

            // Create a unique key for this combination to prevent duplicates
            const comboKey = Object.entries(attrs).sort().map(([k, v]) => `${k}:${v}`).join('|');
            if (seenCombos.has(comboKey)) return;
            seenCombos.add(comboKey);

            // Check if variant already exists to preserve its data (price, image, etc.)
            // IMPORTANT: Only match based on the attributes that are in the CURRENT uniqueConfig
            const existing = variants.find(v => {
                const vAttrs = v.attributes;
                const activeAttrIds = uniqueConfig.map(uc => uc.attribute);

                // Must match all current attributes
                const allMatch = activeAttrIds.every(id => vAttrs[id] === attrs[id]);
                // And must not have extra attributes that were removed (pruning)
                const noExtra = Object.keys(vAttrs).every(id => activeAttrIds.includes(id));

                return allMatch && noExtra;
            });

            newVariants.push(existing || {
                attributes: attrs,
                price: comboPriceOffset,
                oldPrice: comboPriceOffset,
                quantity: comboQty,
                isActive: true
            });
        });

        setVariants(newVariants);
        toast.success(`Generated ${newVariants.length} unique combinations`);
    };

    const updateVariant = (index: number, field: string, value: any) => {
        setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
    };

    const deleteVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{editingProduct ? "Edit Product" : "Add Product"}</h2>
                    <p className="text-muted-foreground">Manage your books and test series here.</p>
                </div>
            </div>

            <Tabs value={activeTab === "book" ? "books" : "test-series"} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="books" className="flex items-center gap-2">
                        <Book className="w-4 h-4" />
                        Add Book
                    </TabsTrigger>
                    <TabsTrigger value="test-series" className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" />
                        Add Test Series
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab === "book" ? "books" : "test-series"}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{activeTab === "book" ? "Book Details" : "Test Series Details"}</CardTitle>
                            <CardDescription>Enter the details for the new {activeTab === "book" ? "book" : "test series"} product.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">{activeTab === "book" ? "Book Title" : "Test Series Title"}</Label>
                                    <Input
                                        id="title"
                                        placeholder={`Enter ${activeTab === "book" ? "book" : "test series"} title`}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                {!isVariable && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Selling Price (₹)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                placeholder="1100"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="oldPrice">Original Price (₹)</Label>
                                            <Input
                                                id="oldPrice"
                                                type="number"
                                                placeholder="1500"
                                                value={oldPrice}
                                                onChange={(e) => setOldPrice(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="quantity">Quantity</Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                placeholder="100"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={category} onValueChange={handleCategoryChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories
                                                .filter(cat => (cat.type || 'book') === activeTab)
                                                .map(cat => (
                                                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subcategory">Sub Category</Label>
                                    <Select value={subcategory} onValueChange={handleSubCategoryChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Sub Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subcategories.map(sub => (
                                                <SelectItem key={sub._id} value={sub._id}>{sub.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 flex items-center gap-4 pt-6">
                                    <Switch
                                        id="isVariable"
                                        checked={isVariable}
                                        onCheckedChange={setIsVariable}
                                    />
                                    <Label htmlFor="isVariable" className="cursor-pointer font-bold text-lg">Variable Product (Multiple Subjects/Types)</Label>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">{activeTab === "book" ? "Year of Publication" : "Year"}</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        placeholder="e.g. 2024"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                    />
                                </div>
                            </div>

                            {isVariable && (
                                <div className="space-y-6 border-t pt-6 bg-muted/20 p-4 rounded-xl border border-dashed border-muted-foreground/30">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg">1. Select Attributes & Values</h3>

                                        <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 mb-6">
                                            <Label className="text-blue-700 font-bold mb-2 block">Quick Add New Attribute</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="e.g. Color, Type, Size"
                                                    value={newAttributeName}
                                                    onChange={e => setNewAttributeName(e.target.value)}
                                                    className="bg-white"
                                                />
                                                <Button onClick={handleAddAttribute} type="button" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100">
                                                    <PlusCircle className="w-4 h-4 mr-2" />
                                                    Add Attribute
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-blue-500 mt-1 uppercase tracking-wider font-bold">This attribute will be created for this specific product</p>
                                        </div>

                                        {availableAttributes.length === 0 ? (
                                            <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                No attributes added yet. Use the form above to create one (e.g. "Language", "Attempt", "Format").
                                            </p>
                                        ) : (
                                            <div className="space-y-4">
                                                {availableAttributes.map(attr => {
                                                    const config = attributesConfig.find(a => a.attribute === attr._id);
                                                    const values = allAttributeValues[attr._id] || [];
                                                    const isActive = !!config;

                                                    return (
                                                        <div key={attr._id} className="p-4 bg-white rounded-lg border shadow-sm">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <Switch checked={isActive} onCheckedChange={() => toggleAttributeInConfig(attr._id)} />
                                                                    <span className="font-bold text-gray-700">{attr.name}</span>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                                                                    onClick={() => handleDeleteAttribute(attr._id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                            {isActive && (
                                                                <div className="space-y-4 ml-14">
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {values.map(v => {
                                                                            const isValSelected = config.values.includes(v._id);
                                                                            return (
                                                                                <div key={v._id} className="flex items-center gap-1 group">
                                                                                    <Badge
                                                                                        variant={isValSelected ? "default" : "outline"}
                                                                                        className={`cursor-pointer px-3 py-1 ${isValSelected ? 'bg-primary' : 'hover:bg-muted'}`}
                                                                                        onClick={() => toggleValueInConfig(attr._id, v._id)}
                                                                                    >
                                                                                        {v.value}
                                                                                        {isValSelected && <Check className="ml-1 w-3 h-3" />}
                                                                                    </Badge>
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteValue(v._id, attr._id); }}
                                                                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-opacity"
                                                                                        title="Delete value from database"
                                                                                    >
                                                                                        <X className="w-3 h-3" />
                                                                                    </button>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    <div className="flex gap-2 max-w-xs">
                                                                        <Input
                                                                            placeholder={`Add ${attr.name}...`}
                                                                            value={newValueNames[attr._id] || ""}
                                                                            onChange={e => setNewValueNames(prev => ({ ...prev, [attr._id]: e.target.value }))}
                                                                            className="h-8 text-xs flex-1"
                                                                        />
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="Price"
                                                                            value={newValuePrices[attr._id] || ""}
                                                                            onChange={e => setNewValuePrices(prev => ({ ...prev, [attr._id]: e.target.value }))}
                                                                            className="h-8 text-xs w-16"
                                                                        />
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="Qty"
                                                                            value={newValueQuantities[attr._id] || ""}
                                                                            onChange={e => setNewValueQuantities(prev => ({ ...prev, [attr._id]: e.target.value }))}
                                                                            className="h-8 text-xs w-16"
                                                                        />
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                                                                            onClick={() => handleAddValue(attr._id)}
                                                                        >
                                                                            Add
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <Button onClick={generateVariants} variant="secondary" className="w-full">
                                                    Generate / Update Combinations
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {variants.length > 0 && (
                                        <div className="space-y-4 pt-4 border-t border-dashed">
                                            <h3 className="font-bold text-lg">2. Manage Combinations</h3>
                                            <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                                                <Table>
                                                    <TableHeader className="bg-muted/50">
                                                        <TableRow>
                                                            <TableHead>Combination</TableHead>
                                                            <TableHead className="w-24">Price (₹)</TableHead>
                                                            <TableHead className="w-24">Quantity</TableHead>
                                                            <TableHead className="w-20">Status</TableHead>
                                                            <TableHead className="w-10"></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {variants.map((v, idx) => {
                                                            const comboTitles = Object.entries(v.attributes)
                                                                .map(([attrId, valId]) => {
                                                                    const valObj = allAttributeValues[attrId]?.find((av: any) => av._id === valId);
                                                                    if (valObj) return valObj.value;

                                                                    // Fallback: try to find in attributesConfig if allAttributeValues is missing it
                                                                    const configEntry = attributesConfig.find(ac => ac.attribute === attrId);
                                                                    const fallbackVal = configEntry?.values.find((vv: any) => vv._id === valId || vv === valId);
                                                                    return typeof fallbackVal === 'object' ? fallbackVal.value : null;
                                                                })
                                                                .filter(Boolean)
                                                                .join(' + ');

                                                            return (
                                                                <TableRow key={idx}>
                                                                    <TableCell className="text-sm font-medium">{comboTitles}</TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            className="h-8 px-2"
                                                                            type="number"
                                                                            value={v.price}
                                                                            onChange={e => updateVariant(idx, 'price', Number(e.target.value))}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            className="h-8 px-2"
                                                                            type="number"
                                                                            value={v.quantity || 0}
                                                                            onChange={e => updateVariant(idx, 'quantity', Number(e.target.value))}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Switch
                                                                            className="scale-75"
                                                                            checked={v.isActive}
                                                                            onCheckedChange={val => updateVariant(idx, 'isActive', val)}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteVariant(idx)}>
                                                                            <X className="w-4 h-4" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="faculty">Author/Faculty</Label>
                                <Select value={faculty} onValueChange={setFaculty}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Faculty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {faculties.map(fac => (
                                            <SelectItem key={fac._id} value={fac._id}>{fac.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Book Cover Image</Label>
                                <ImageUpload
                                    value={image}
                                    onChange={setImage}
                                    recommendedDimensions="600x800"
                                />
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label htmlFor="productInfo">Product Information</Label>
                                <Textarea
                                    id="productInfo"
                                    placeholder="e.g. Book will be delivered in 7 working days."
                                    value={productInfo}
                                    onChange={(e) => setProductInfo(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Other Details</Label>
                                <p className="text-xs text-muted-foreground mb-1">This rich text content will be displayed on the product detail page.</p>
                                <div className="border border-input rounded-md overflow-hidden">
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={description}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setDescription(data);
                                        }}
                                        config={{
                                            toolbar: [
                                                'heading',
                                                '|',
                                                'bold',
                                                'italic',
                                                'link',
                                                'bulletedList',
                                                'numberedList',
                                                '|',
                                                'outdent',
                                                'indent',
                                                '|',
                                                'blockQuote',
                                                'insertTable',
                                                'undo',
                                                'redo'
                                            ]
                                        }}
                                    />
                                </div>
                            </div>



                            <div className="flex justify-end gap-4 pt-4">
                                <Button variant="outline" onClick={resetForm}>
                                    {editingProduct ? "Cancel Edit" : "Cancel"}
                                </Button>
                                <Button
                                    className="bg-[#E94B64] hover:bg-[#D43F57] text-white"
                                    onClick={handleSave}
                                    disabled={isLoading}
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {editingProduct ? "Update Product" : "Save Product"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-8">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Existing {activeTab === "book" ? "Books" : "Test Series"}</CardTitle>
                                    <CardDescription>View and manage your added {activeTab === "book" ? "books" : "test series"}.</CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={`Search ${activeTab === "book" ? "books" : "test series"}...`}
                                        className="pl-8 h-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>{activeTab === "book" ? "Book" : "Test Series"}</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Sub Category</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Year</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isFetchingProducts ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                                </TableCell>
                                            </TableRow>
                                        ) : products.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                    No {activeTab === "book" ? "books" : "test series"} found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            products.map((prod) => (
                                                <TableRow key={prod._id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-12 bg-muted rounded flex items-center justify-center overflow-hidden border">
                                                                {prod.image ? (
                                                                    <img src={prod.image} className="w-full h-full object-cover" />
                                                                ) : <Book className="w-4 h-4 text-muted-foreground" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-sm line-clamp-1">{prod.title}</span>
                                                                <span className="text-xs text-muted-foreground">{prod.faculty?.name || 'No Faculty'}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {prod.category?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {prod.subcategory?.name || <span className="text-muted-foreground text-xs">—</span>}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {prod.isVariable ? (
                                                            <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                                                                Variable ({prod.variants?.length || 0})
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-gray-500">Simple</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {prod.year || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-red-600">₹{prod.price}</span>
                                                            {prod.oldPrice && <span className="text-xs line-through text-muted-foreground">₹{prod.oldPrice}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {prod.isVariable ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-purple-700">
                                                                    {prod.variants?.reduce((acc: number, v: any) => acc + (v.quantity || 0), 0) || 0} Total
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground">across variants</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 group">
                                                                {editingStockId === prod._id ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <Input
                                                                            className="h-7 w-16 px-1 text-xs"
                                                                            type="number"
                                                                            value={editingStockValue}
                                                                            onChange={(e) => setEditingStockValue(e.target.value)}
                                                                            autoFocus
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') handleUpdateStock(prod._id, Number(editingStockValue));
                                                                                if (e.key === 'Escape') setEditingStockId(null);
                                                                            }}
                                                                        />
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                            onClick={() => handleUpdateStock(prod._id, Number(editingStockValue))}
                                                                        >
                                                                            <Check className="w-3 h-3" />
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                            onClick={() => setEditingStockId(null)}
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <span className={`font-medium ${prod.quantity <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                                                                            {prod.quantity || 0}
                                                                        </span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={() => {
                                                                                setEditingStockId(prod._id);
                                                                                setEditingStockValue(String(prod.quantity || 0));
                                                                            }}
                                                                        >
                                                                            <Pencil className="w-3 h-3" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEditProduct(prod)}>
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProduct(prod._id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {pagination && pagination.pages > 1 && (
                                <div className="flex items-center justify-between pt-4">
                                    <p className="text-xs text-muted-foreground">
                                        Showing <span className="font-medium text-foreground">{((currentPage - 1) * 10) + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * 10, pagination.total)}</span> of <span className="font-medium text-foreground">{pagination.total}</span> {activeTab === "book" ? "books" : "test series"}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchProducts(currentPage - 1, searchQuery)}
                                            disabled={currentPage === 1 || isFetchingProducts}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => fetchProducts(page, searchQuery)}
                                                    disabled={isFetchingProducts}
                                                    className={`h-8 w-8 p-0 text-xs ${currentPage === page ? 'bg-[#E94B64] hover:bg-[#D43F57]' : ''}`}
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchProducts(currentPage + 1, searchQuery)}
                                            disabled={currentPage === pagination.pages || isFetchingProducts}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

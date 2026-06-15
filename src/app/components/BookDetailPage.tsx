import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    Info,

    ShoppingCart,
    ArrowLeft,
    BookOpen,
    Check,
    X,
    Tag,
    Layers,
    User,
    Minus,
    PlusCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { productApi } from "../api/api";

export function BookDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState("1");
    const { addToCart, setIsDrawerOpen } = useCart();

    const [book, setBook] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [liked, setLiked] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    // Variable Product State
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [currentVariant, setCurrentVariant] = useState<any>(null);
    const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);

    const activeAttributes = useMemo(() => {
        if (!book?.attributesConfig) return [];
        const seen = new Set();
        return book.attributesConfig.filter((c: any) => {
            if (!c.attribute || !c.values?.length) return false;
            const attrId = c.attribute._id?.toString() || c.attribute.toString();
            if (seen.has(attrId)) return false;
            seen.add(attrId);
            return true;
        });
    }, [book?.attributesConfig]);

    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!slug) return;
            setIsLoading(true);
            const { ok, data } = await productApi.getProduct(slug);
            if (ok && data.success) {
                setBook(data.data);

                // Try to get same-category products first
                let related: any[] = [];
                const productType = data.data.type || "book";

                if (data.data.category) {
                    const catRes = await productApi.getProducts({
                        type: productType,
                        category: data.data.category._id || data.data.category,
                        limit: 7,
                    });
                    if (catRes.ok && catRes.data.success) {
                        related = catRes.data.data.filter((p: any) => p._id !== data.data._id);
                    }
                }

                // If we got fewer than 2 same-category products, fall back to all of same type
                if (related.length < 2) {
                    const allRes = await productApi.getProducts({ type: productType, limit: 7 });
                    if (allRes.ok && allRes.data.success) {
                        related = allRes.data.data.filter((p: any) => p._id !== data.data._id);
                    }
                }

                setRelatedProducts(related.slice(0, 6));

                // Initialize selected attributes
                if (data.data.variants?.length > 0) {
                    const activeVariants = data.data.variants.filter((v: any) => v.isActive !== false);
                    const prices = activeVariants.map((v: any) => v.price).filter((p: any) => p !== undefined && p !== null);
                    if (prices.length > 0) {
                        setPriceRange({
                            min: Math.min(...prices),
                            max: Math.max(...prices)
                        });
                    }
                }
                setSelectedAttributes({});
            }
            setIsLoading(false);
        };
        fetchBookDetails();
    }, [slug]);

    useEffect(() => {
        if (book?.isVariable && book.variants && activeAttributes.length > 0) {
            const activeAttrIds = activeAttributes.map(c => c.attribute._id?.toString() || c.attribute.toString());

            // Filter selectedAttributes to only those that are in activeAttributes
            const filteredSelected: Record<string, string> = {};
            activeAttrIds.forEach(id => {
                if (selectedAttributes[id]) {
                    filteredSelected[id] = selectedAttributes[id];
                }
            });

            const selectedCount = Object.keys(filteredSelected).length;
            const requiredCount = activeAttrIds.length;

            if (selectedCount === requiredCount) {
                const variant = book.variants.find((v: any) => {
                    const vAttrs = v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes;
                    return activeAttributes.every((config: any) => {
                        const attrId = config.attribute._id?.toString() || config.attribute.toString();
                        return String(vAttrs[attrId]) === String(filteredSelected[attrId]);
                    });
                });
                setCurrentVariant(variant || null);
            } else {
                setCurrentVariant(null);
            }
        }
    }, [selectedAttributes, book, activeAttributes]);

    const handleAttributeChange = (attrId: string, valId: string) => {
        setSelectedAttributes(prev => ({ ...prev, [attrId]: valId }));
    };

    const handleAddToCart = () => {
        if (!book) return;

        if (book.isVariable && !currentVariant) {
            toast.error("Please select all options before adding to cart");
            return;
        }

        const user = localStorage.getItem("user");
        if (!user) {
            toast.error("Please login to add items to cart");
            navigate("/login");
            return;
        }
        const variantKey = currentVariant
            ? Object.entries(currentVariant.attributes)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => `${k}:${v}`)
                .join('|')
            : 'base';

        addToCart({
            id: `${book._id}-${variantKey}`,
            productId: book._id,
            title: currentVariant ? `${book.title} (${activeAttributes.map((config: any) => {
                const attrId = config.attribute._id?.toString() || config.attribute.toString();
                const vid = selectedAttributes[attrId];
                const valObj = config.values.find((v: any) => v._id === vid || String(v._id) === String(vid));
                return valObj?.value;
            }).join(' + ')})` : book.title,
            price: currentVariant ? currentVariant.price : book.price,
            image: (currentVariant?.image) || book.image,
            quantity: parseInt(quantity),
            type: book.type || 'book',
            variantId: currentVariant?._id,
            variantName: currentVariant ? activeAttributes.map((config: any) => {
                const attrId = config.attribute._id?.toString() || config.attribute.toString();
                const vid = selectedAttributes[attrId];
                const valObj = config.values.find((v: any) => v._id === vid || String(v._id) === String(vid));
                return valObj?.value;
            }).join(' + ') : undefined
        });
        setAddedToCart(true);
        toast.success("Added to cart successfully!");
        setTimeout(() => {
            setIsDrawerOpen(true);
            setAddedToCart(false);
        }, 800);
    };

    const handleBuyNow = () => {
        if (!book) return;

        if (book.isVariable && !currentVariant) {
            toast.error("Please select all options before buying");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login to proceed to checkout");
            navigate("/login");
            return;
        }

        const variantKey = currentVariant
            ? Object.entries(currentVariant.attributes)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => `${k}:${v}`)
                .join('|')
            : 'base';

        addToCart({
            id: `${book._id}-${variantKey}`,
            productId: book._id,
            title: currentVariant ? `${book.title} (${activeAttributes.map((config: any) => {
                const attrId = config.attribute._id?.toString() || config.attribute.toString();
                const vid = selectedAttributes[attrId];
                const valObj = config.values.find((v: any) => v._id === vid || String(v._id) === String(vid));
                return valObj?.value;
            }).join(' + ')})` : book.title,
            price: currentVariant ? currentVariant.price : book.price,
            image: (currentVariant?.image) || book.image,
            quantity: parseInt(quantity),
            type: book.type || 'book',
            variantId: currentVariant?._id,
            variantName: currentVariant ? activeAttributes.map((config: any) => {
                const attrId = config.attribute._id?.toString() || config.attribute.toString();
                const vid = selectedAttributes[attrId];
                const valObj = config.values.find((v: any) => v._id === vid || String(v._id) === String(vid));
                return valObj?.value;
            }).join(' + ') : undefined
        });

        navigate("/checkout");
    };

    const discount =
        book?.oldPrice && book?.price < book?.oldPrice
            ? Math.round((1 - book.price / book.oldPrice) * 100)
            : null;

    const categoryName =
        book?.category && typeof book.category === "object"
            ? book.category.name
            : book?.category;

    const subcategoryName =
        book?.subcategory && typeof book.subcategory === "object"
            ? book.subcategory.name
            : book?.subcategory;

    const facultyName =
        book?.faculty && typeof book.faculty === "object"
            ? book.faculty.name
            : book?.faculty;

    return (
        <div className="min-h-screen bg-[#F9F8FF]">
            {/* Accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#5C53E0] via-[#E94B64] to-[#FF7D50]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#5C53E0] mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-semibold">Back to {book?.type === 'test-series' ? 'Test Series' : 'Books'}</span>
                </motion.button>

                {/* Loading */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-14 h-14 border-4 border-[#5C53E0] border-t-transparent rounded-full animate-spin mb-5" />
                        <p className="text-gray-400 font-medium text-sm tracking-wide">
                            Loading details…
                        </p>
                    </div>
                ) : !book ? (
                    <div className="text-center py-40">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-200 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Product Not Found
                        </h2>
                        <Button onClick={() => navigate(book?.type === 'test-series' ? "/resources/test-series" : "/resources/books")}>
                            Back to {book?.type === 'test-series' ? "Test Series" : "Library"}
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* ── Hero ── */}
                        <div className="grid lg:grid-cols-2 gap-10 mb-14">
                            {/* Book Cover */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45 }}
                                className="relative"
                            >
                                <div className="bg-gradient-to-br from-[#EFEEFF] to-[#E0DEFF] rounded-[40px] aspect-square flex items-center justify-center p-12 relative overflow-hidden shadow-xl shadow-[#5C53E0]/10">
                                    <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-[#FF7D50] rounded-full translate-x-1/4 -translate-y-1/4 opacity-10 blur-2xl" />
                                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#5C53E0] rounded-full -translate-x-1/4 translate-y-1/4 opacity-10 blur-2xl" />

                                    <img
                                        src={book.image}
                                        alt={book.title}
                                        className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl relative z-10 transition-transform duration-500 hover:scale-105"
                                    />

                                    {/* Wishlist */}
                                    <button
                                        onClick={() => setLiked((l) => !l)}
                                        className="absolute top-6 right-6 z-20 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                        <Heart
                                            className={`w-5 h-5 transition-colors ${liked ? "fill-[#E94B64] text-[#E94B64]" : "text-gray-400"}`}
                                        />
                                    </button>

                                    {/* Discount badge */}
                                    {discount && (
                                        <div className="absolute top-6 left-6 z-20 bg-[#22C55E] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                                            {discount}% OFF
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.1 }}
                                className="flex flex-col justify-center"
                            >
                                {/* Category + Subcategory pills */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {categoryName && (
                                        <span className="inline-flex items-center gap-1.5 bg-[#EFEEFF] text-[#5C53E0] text-xs font-bold px-3 py-1.5 rounded-full">
                                            <Tag className="w-3 h-3" />
                                            {categoryName}
                                        </span>
                                    )}
                                    {subcategoryName && (
                                        <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                                            <Layers className="w-3 h-3" />
                                            {subcategoryName}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-5">
                                    {book.title}
                                </h1>

                                {/* Author / Faculty */}
                                {facultyName && (
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5C53E0] to-[#E94B64] flex items-center justify-center text-white font-bold text-sm shadow">
                                            {facultyName[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">
                                                Author / Faculty
                                            </p>
                                            <p className="text-sm font-bold text-gray-800">
                                                {facultyName}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="w-full h-px bg-gray-100 mb-5" />

                                {/* Price */}
                                <div className="flex items-end gap-3 mb-5">
                                    <span className="text-4xl font-black text-[#E94B64]">
                                        {book.isVariable ? (
                                            currentVariant ? (
                                                `₹${currentVariant.price}`
                                            ) : priceRange ? (
                                                priceRange.min === priceRange.max ? `₹${priceRange.min}` : `₹${priceRange.min} - ₹${priceRange.max}`
                                            ) : (
                                                `₹${book.price}`
                                            )
                                        ) : (
                                            `₹${book.price}`
                                        )}
                                    </span>
                                    {/* Show old price only if variant is selected or if it's a simple product */}
                                    {(currentVariant ? currentVariant.oldPrice : (!book.isVariable ? book.oldPrice : null)) && (
                                        <span className="text-xl text-gray-400 line-through font-medium pb-1">
                                            ₹{currentVariant ? currentVariant.oldPrice : book.oldPrice}
                                        </span>
                                    )}
                                </div>

                                {/* Variant Selectors */}
                                {book.isVariable && book.attributesConfig?.length > 0 && (
                                    <div className="space-y-6 mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {activeAttributes.map((config: any) => {
                                                const attrId = config.attribute._id?.toString() || config.attribute.toString();
                                                return (
                                                    <div key={attrId} className="space-y-2">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-[#5C53E0]">
                                                            {config.attribute?.name}
                                                        </Label>
                                                        <Select
                                                            value={selectedAttributes[attrId]}
                                                            onValueChange={(val) => handleAttributeChange(attrId, val)}
                                                        >
                                                            <SelectTrigger className="w-full bg-[#F9F8FF] border-gray-100 focus:ring-[#5C53E0]/20 h-11 font-semibold rounded-xl">
                                                                <SelectValue placeholder={`Select ${config.attribute?.name}`} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {config.values.map((v: any) => (
                                                                    <SelectItem key={v._id} value={v._id} className="font-medium">
                                                                        {v.value}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {currentVariant && !currentVariant.isActive && (
                                            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
                                                <X className="w-4 h-4" />
                                                This combination is currently unavailable
                                            </div>
                                        )}
                                        {currentVariant && currentVariant.quantity === 0 && (
                                            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
                                                <Info className="w-4 h-4" />
                                                This variant is Sold Out
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Out of stock */}
                                {((!book.isVariable && book.quantity === 0) || (book.isVariable && currentVariant && currentVariant.quantity === 0)) && (
                                    <p className="text-sm text-[#EF4444] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block animate-pulse" />
                                        Sold Out
                                    </p>
                                )}

                                {/* Quantity Selection */}
                                <div className="mb-8">
                                    <label className="block text-xs font-black text-[#5C53E0] mb-3 uppercase tracking-[0.15em]">
                                        Quantity
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                                            <button
                                                onClick={() => setQuantity(prev => Math.max(1, parseInt(prev) - 1).toString())}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-400 hover:text-[#5C53E0] transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <div className="w-12 text-center font-black text-gray-900 border-x border-gray-50">
                                                {quantity}
                                            </div>
                                            <button
                                                onClick={() => setQuantity(prev => (parseInt(prev) + 1).toString())}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-400 hover:text-[#5C53E0] transition-colors"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                                            {parseInt(quantity) > 1 ? `${quantity} items selected` : 'Select amount'}
                                        </div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="flex flex-wrap gap-3">
                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleAddToCart}
                                        disabled={(!book.isVariable && book.quantity === 0) || (book.isVariable && (!currentVariant || currentVariant.quantity === 0))}
                                        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold border-2 transition-all ${addedToCart
                                            ? "bg-[#22C55E] border-[#22C55E] text-white"
                                            : "bg-white border-[#E94B64] text-[#E94B64] hover:bg-[#FFF5F7]"
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <AnimatePresence mode="wait" initial={false}>
                                            {addedToCart ? (
                                                <motion.span
                                                    key="check"
                                                    initial={{ opacity: 0, scale: 0.7 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Check className="w-4 h-4" /> Added!
                                                </motion.span>
                                            ) : (
                                                <motion.span
                                                    key="cart"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleBuyNow}
                                        disabled={(!book.isVariable && book.quantity === 0) || (book.isVariable && (!currentVariant || currentVariant.quantity === 0))}
                                        className="flex-1 min-w-[140px] bg-gradient-to-r from-[#5C53E0] to-[#E94B64] hover:opacity-90 text-white rounded-2xl py-4 text-sm font-bold shadow-lg shadow-[#E94B64]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Buy Now
                                    </motion.button>
                                </div>
                            </motion.div>
                        </div>

                        {/* ── Info Section ── */}
                        {(book.productInfo || book.faculty?.bio) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.2 }}
                                className="mb-14 space-y-5"
                            >
                                {/* Product Info + About the Author — full width, equal columns */}
                                {(book.productInfo || book.faculty?.bio) && (
                                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Product Info */}
                                            {book.productInfo && (
                                                <div className="flex-1 p-8">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-[#EFEEFF] flex items-center justify-center shrink-0">
                                                            <Info className="w-5 h-5 text-[#5C53E0]" />
                                                        </div>
                                                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                                                            Product Info
                                                        </h2>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {book.productInfo}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Divider — vertical on desktop, horizontal on mobile */}
                                            {book.productInfo && book.faculty?.bio && (
                                                <>
                                                    {/* vertical */}
                                                    <div className="hidden md:block w-px bg-gray-200 my-6 self-stretch" />
                                                    {/* horizontal */}
                                                    <div className="block md:hidden h-px bg-gray-200 mx-8" />
                                                </>
                                            )}

                                            {/* About the Author */}
                                            {book.faculty?.bio && (
                                                <div className="flex-1 p-8">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-[#FFF0F3] flex items-center justify-center shrink-0">
                                                            <User className="w-5 h-5 text-[#E94B64]" />
                                                        </div>
                                                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                                                            About the Author
                                                        </h2>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed italic">
                                                        {book.faculty.bio}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                )}

                            </motion.div>
                        )}

                        {/* ── Description (Rich Text) ── */}
                        {book.description && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.25 }}
                                className="mb-14"
                            >
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-2xl bg-[#FFF5F7] flex items-center justify-center shrink-0">
                                            <BookOpen className="w-5 h-5 text-[#E94B64]" />
                                        </div>
                                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                                            Other Details
                                        </h2>
                                    </div>
                                    <div
                                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed
                                            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-3
                                            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-2
                                            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mb-2
                                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                                            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                                            [&_li]:text-sm [&_li]:text-gray-600
                                            [&_p]:mb-3 [&_p]:text-sm [&_p]:text-gray-600
                                            [&_strong]:font-bold [&_strong]:text-gray-800
                                            [&_blockquote]:border-l-4 [&_blockquote]:border-[#E94B64] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600
                                            [&_table]:w-full [&_table]:border-collapse
                                            [&_th]:text-left [&_th]:p-2 [&_th]:bg-gray-50 [&_th]:font-semibold [&_th]:text-xs [&_th]:border [&_th]:border-gray-200
                                            [&_td]:p-2 [&_td]:text-sm [&_td]:border [&_td]:border-gray-200 [&_td]:text-gray-600
                                            [&_a]:text-[#5C53E0] [&_a]:underline"
                                        dangerouslySetInnerHTML={{ __html: book.description }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* ── Related Products ── */}
                        {relatedProducts.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.3 }}
                                className="mb-16"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-[#FFF0F3] flex items-center justify-center">
                                            <Heart className="w-5 h-5 fill-[#E94B64] text-[#E94B64]" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-gray-900">
                                                You Might Also Like
                                            </h2>
                                            <p className="text-xs text-gray-400">
                                                More from this category
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(book?.type === 'test-series' ? "/resources/test-series" : "/resources/books")}
                                        className="text-xs font-bold text-[#5C53E0] hover:underline flex items-center gap-1"
                                    >
                                        View All <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="relative group/carousel">
                                    <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
                                        {relatedProducts.map((prod, idx) => (
                                            <motion.div
                                                key={prod._id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.06 }}
                                                whileHover={{ y: -5 }}
                                                className="min-w-[200px] max-w-[200px] bg-white rounded-3xl p-3 border border-gray-100 hover:shadow-xl transition-all snap-start cursor-pointer group flex flex-col"
                                                onClick={() =>
                                                    navigate(prod.type === 'test-series' ? `/resources/test-series/${prod.slug || prod._id}` : `/resources/books/${prod.slug || prod._id}`)
                                                }
                                            >
                                                <div className="bg-[#F3F4F6] rounded-2xl aspect-[3/4] overflow-hidden mb-3 flex items-center justify-center p-4 relative">
                                                    <img
                                                        src={prod.image}
                                                        alt={prod.title}
                                                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                    {prod.oldPrice &&
                                                        prod.price < prod.oldPrice && (
                                                            <div className="absolute top-2 left-2 bg-[#22C55E] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                                                {Math.round(
                                                                    (1 - prod.price / prod.oldPrice) * 100
                                                                )}
                                                                % off
                                                            </div>
                                                        )}
                                                </div>
                                                <div className="flex-1 px-1 flex flex-col justify-between">
                                                    <h3 className="text-[12px] font-semibold text-gray-800 leading-snug mb-2 line-clamp-2">
                                                        {prod.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        {prod.oldPrice && (
                                                            <span className="text-gray-400 text-xs line-through">
                                                                ₹{prod.oldPrice}
                                                            </span>
                                                        )}
                                                        <span className="text-[#EF4444] text-base font-black">
                                                            ₹{prod.price}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <button className="absolute left-[-16px] top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-400 hover:text-[#5C53E0] opacity-0 group-hover/carousel:opacity-100 transition-all z-10 border border-gray-100 hover:border-[#5C53E0]">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button className="absolute right-[-16px] top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-400 hover:text-[#5C53E0] opacity-0 group-hover/carousel:opacity-100 transition-all z-10 border border-gray-100 hover:border-[#5C53E0]">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.section>
                        )}

                    </>
                )}
            </div>
        </div>
    );
}

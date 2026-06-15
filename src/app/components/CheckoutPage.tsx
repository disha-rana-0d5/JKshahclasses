import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ShoppingBag, ChevronRight, MapPin, User, Receipt, CreditCard, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { orderApi, productApi } from "../api/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function CheckoutPage() {
    const { cartItems, cartCount, clearCart } = useCart();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderId, setOrderId] = useState("");

    const [formData, setFormData] = useState(() => {
        const savedAddress = localStorage.getItem("checkout_address");
        if (savedAddress) {
            try {
                return JSON.parse(savedAddress);
            } catch (e) {
                console.error("Error parsing saved address", e);
            }
        }
        return {
            customerInfo: {
                name: "",
                email: "",
                mobile: ""
            },
            shippingAddress: {
                addressLine: "",
                city: "",
                state: "",
                pincode: "",
                country: "India"
            },
            billingAddress: {
                addressLine: "",
                city: "",
                state: "",
                pincode: "",
                country: "India"
            }
        };
    });

    useEffect(() => {
        localStorage.setItem("checkout_address", JSON.stringify(formData));
    }, [formData]);

    const [sameAsShipping, setSameAsShipping] = useState(true);

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    const subtotal = cartItems.reduce(
        (acc, item) => acc + parseInt(item.price) * item.quantity,
        0
    );

    const handleInputChange = (section: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setIsSubmitting(true);

        // Stock Validation
        for (const item of cartItems) {
            try {
                const { ok, data } = await productApi.getProduct(item.productId);
                if (ok && data.success) {
                    const product = data.data;
                    if (product.isVariable && item.variantId) {
                        const variant = product.variants.find((v: any) => v._id === item.variantId);
                        if (variant && (variant.quantity || 0) < item.quantity) {
                            toast.error(`Only ${variant.quantity || 0} units of ${item.title} (${item.variantName}) available`);
                            setIsSubmitting(false);
                            return;
                        }
                    } else {
                        if ((product.quantity || 0) < item.quantity) {
                            toast.error(`Only ${product.quantity || 0} units of ${item.title} available`);
                            setIsSubmitting(false);
                            return;
                        }
                    }
                }
            } catch (err) {
                console.error("Error validating stock:", err);
            }
        }

        const orderData = {
            user: user ? (user._id || user.id) : undefined,
            items: cartItems.map(item => ({
                productId: item.productId,
                productType: item.type || 'book',
                title: item.title,
                price: parseInt(item.price),
                quantity: item.quantity,
                image: item.image,
                variantId: item.variantId,
                variantName: item.variantName
            })),
            customerInfo: formData.customerInfo,
            shippingAddress: formData.shippingAddress,
            billingAddress: sameAsShipping ? formData.shippingAddress : formData.billingAddress,
            totalAmount: subtotal,
            paymentMethod: "COD", // Hardcoded for now as per request simple flow
            paymentId: "COD-" + Math.random().toString(36).substring(7).toUpperCase()
        };

        try {
            const { ok, data } = await orderApi.createOrder(orderData);
            if (ok && data.success) {
                toast.success("Order placed successfully!");
                setOrderId(data.data._id);
                setIsSuccess(true);
                clearCart();
            } else {
                toast.error(data.message || "Failed to place order");
            }
        } catch (error) {
            toast.error("An error occurred during checkout");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">Order Confirmed!</h2>
                        <p className="text-gray-500 mt-2">Your order ORD-{orderId.toString().slice(-6).toUpperCase()} has been placed successfully. A confirmation email has been sent to {formData.customerInfo.email}.</p>
                    </div>
                    <div className="pt-4">
                        <Button
                            onClick={() => navigate("/")}
                            className="w-full bg-[#373081] hover:bg-[#2a2463] text-white rounded-xl py-6 font-bold"
                        >
                            Return to Home
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link to="/" className="text-gray-500 hover:text-[#E94B64] transition-colors flex items-center gap-2 text-sm font-medium mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Store
                        </Link>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Checkout <Sparkles className="w-8 h-8 text-[#E94B64]" />
                        </h1>
                    </div>
                    <div className="hidden md:flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[#F3F4F6] flex items-center justify-center text-[10px] font-bold text-gray-400">
                                    {i}
                                </div>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Secure Checkout</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        {/* Customer Info */}
                        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                            <CardHeader className="bg-white border-b border-gray-50 p-6">
                                <CardTitle className="flex items-center gap-3 text-xl font-black">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                        <User className="w-5 h-5" />
                                    </div>
                                    Customer Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Full Name</Label>
                                        <Input
                                            id="name"
                                            required
                                            placeholder="Enter your full name"
                                            className="rounded-xl border-gray-200 focus:ring-[#E94B64] focus:border-[#E94B64] py-6"
                                            value={formData.customerInfo.name}
                                            onChange={(e) => handleInputChange("customerInfo", "name", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            placeholder="your@email.com"
                                            className="rounded-xl border-gray-200 focus:ring-[#E94B64] focus:border-[#E94B64] py-6"
                                            value={formData.customerInfo.email}
                                            onChange={(e) => handleInputChange("customerInfo", "email", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Mobile Number</Label>
                                        <Input
                                            id="mobile"
                                            required
                                            placeholder="+91 XXXXX XXXXX"
                                            className="rounded-xl border-gray-200 focus:ring-[#E94B64] focus:border-[#E94B64] py-6"
                                            value={formData.customerInfo.mobile}
                                            onChange={(e) => handleInputChange("customerInfo", "mobile", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Address */}
                        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                            <CardHeader className="bg-white border-b border-gray-50 p-6">
                                <CardTitle className="flex items-center gap-3 text-xl font-black">
                                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="s_address" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Full Address</Label>
                                        <Input
                                            id="s_address"
                                            required
                                            placeholder="House No, Street, Landmark"
                                            className="rounded-xl border-gray-200 focus:ring-[#E94B64] focus:border-[#E94B64] py-6"
                                            value={formData.shippingAddress.addressLine}
                                            onChange={(e) => handleInputChange("shippingAddress", "addressLine", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="s_city" className="text-sm font-bold text-gray-700 uppercase tracking-wider">City</Label>
                                        <Input
                                            id="s_city"
                                            required
                                            placeholder="City"
                                            className="rounded-xl border-gray-200 focus:ring-[#E94B64] focus:border-[#E94B64] py-6"
                                            value={formData.shippingAddress.city}
                                            onChange={(e) => handleInputChange("shippingAddress", "city", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="s_state" className="text-sm font-bold text-gray-700 uppercase tracking-wider">State</Label>
                                        <Input
                                            id="s_state"
                                            required
                                            placeholder="State"
                                            className="rounded-xl border-gray-200 focus:ring-[#E94B64] focus:border-[#E94B64] py-6"
                                            value={formData.shippingAddress.state}
                                            onChange={(e) => handleInputChange("shippingAddress", "state", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="s_pincode" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Pincode</Label>
                                        <Input
                                            id="s_pincode"
                                            required
                                            placeholder="6-digit Pincode"
                                            className="rounded-xl border-gray-200 focus:ring-[#E94B64] focus:border-[#E94B64] py-6"
                                            value={formData.shippingAddress.pincode}
                                            onChange={(e) => handleInputChange("shippingAddress", "pincode", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Billing Address */}
                        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                            <CardHeader className="bg-white border-b border-gray-50 p-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <CardTitle className="flex items-center gap-3 text-xl font-black">
                                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                            <Receipt className="w-5 h-5" />
                                        </div>
                                        Billing Address
                                    </CardTitle>
                                    <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                        <Checkbox
                                            id="sameAsShipping"
                                            checked={sameAsShipping}
                                            onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                                            className="rounded-md border-[#E94B64] data-[state=checked]:bg-[#E94B64]"
                                        />
                                        <label htmlFor="sameAsShipping" className="text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer">
                                            Same as Shipping
                                        </label>
                                    </div>
                                </div>
                            </CardHeader>
                            <AnimatePresence>
                                {!sameAsShipping && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label htmlFor="b_address" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Full Address</Label>
                                                    <Input
                                                        id="b_address"
                                                        required={!sameAsShipping}
                                                        placeholder="House No, Street, Landmark"
                                                        className="rounded-xl border-gray-200 focus:ring-[#E94B64] focus:border-[#E94B64] py-6"
                                                        value={formData.billingAddress.addressLine}
                                                        onChange={(e) => handleInputChange("billingAddress", "addressLine", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="b_city" className="text-sm font-bold text-gray-700 uppercase tracking-wider">City</Label>
                                                    <Input
                                                        id="b_city"
                                                        required={!sameAsShipping}
                                                        placeholder="City"
                                                        className="rounded-xl border-gray-200 focus:ring-[#E94B64] focus:border-[#E94B64] py-6"
                                                        value={formData.billingAddress.city}
                                                        onChange={(e) => handleInputChange("billingAddress", "city", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="b_state" className="text-sm font-bold text-gray-700 uppercase tracking-wider">State</Label>
                                                    <Input
                                                        id="b_state"
                                                        required={!sameAsShipping}
                                                        placeholder="State"
                                                        className="rounded-xl border-gray-200 focus:ring-[#E94B64] focus:border-[#E94B64] py-6"
                                                        value={formData.billingAddress.state}
                                                        onChange={(e) => handleInputChange("billingAddress", "state", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="b_pincode" className="text-sm font-bold text-gray-700 uppercase tracking-wider">Pincode</Label>
                                                    <Input
                                                        id="b_pincode"
                                                        required={!sameAsShipping}
                                                        placeholder="6-digit Pincode"
                                                        className="rounded-xl border-gray-200 focus:ring-[#E94B64] focus:border-[#E94B64] py-6"
                                                        value={formData.billingAddress.pincode}
                                                        onChange={(e) => handleInputChange("billingAddress", "pincode", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <Card className="rounded-3xl border-none shadow-sm overflow-hidden sticky top-24">
                            <CardHeader className="bg-white border-b border-gray-50 p-6">
                                <CardTitle className="flex items-center gap-3 text-xl font-black">
                                    <ShoppingBag className="w-5 h-5 text-[#E94B64]" />
                                    Order Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 p-2 border border-gray-100">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-[10px] font-bold text-gray-400">Qty: {item.quantity}</span>
                                                    <span className="text-sm font-black text-[#E94B64]">₹{parseInt(item.price) * item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Subtotal</span>
                                        <span className="text-gray-900 font-bold">₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Shipping</span>
                                        <span className="text-green-600 font-bold">FREE</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                        <span className="text-lg font-black text-gray-900">Total</span>
                                        <span className="text-2xl font-black text-[#E94B64]">₹{subtotal}</span>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                                        <CreditCard className="w-5 h-5 text-orange-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-orange-900 uppercase tracking-wider">Payment Method</p>
                                            <p className="text-xs text-orange-700 font-medium mt-1">Cash on Delivery (Standard)</p>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || cartItems.length === 0}
                                        className="w-full bg-[#E94B64] hover:bg-[#D43F57] text-white rounded-2xl py-8 text-lg font-black shadow-xl shadow-[#E94B64]/20 transition-all group"
                                    >
                                        {isSubmitting ? "Placing Order..." : (
                                            <>
                                                Place Your Order
                                                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-[10px] text-gray-400 text-center font-medium">
                                        By placing an order, you agree to our <Link to="/terms" className="text-[#E94B64] underline">Terms of Service</Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </div>
    );
}

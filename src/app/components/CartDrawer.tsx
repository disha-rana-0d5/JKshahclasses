import { useCart } from "../context/CartContext";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { productApi } from "../api/api";
import { toast } from "sonner";

export function CartDrawer() {
    const navigate = useNavigate();
    const {
        cartItems,
        removeFromCart,
        addToCart,
        isDrawerOpen,
        setIsDrawerOpen,
        cartCount
    } = useCart();

    const total = cartItems.reduce(
        (acc, item) => acc + parseInt(item.price) * item.quantity,
        0
    );

    return (
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
                <SheetHeader className="p-6 border-b border-gray-100 flex-shrink-0">
                    <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                        <ShoppingBag className="w-6 h-6 text-[#E94B64]" />
                        Shopping Cart ({cartCount})
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                            <ShoppingBag className="w-16 h-16" />
                            <p className="text-lg font-medium">Your cart is empty</p>
                            <Button
                                variant="outline"
                                onClick={() => setIsDrawerOpen(false)}
                                className="mt-4 rounded-full"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 group">
                                    <div className="w-20 h-24 bg-[#F3F4F6] rounded-xl flex-shrink-0 p-2">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-contain mix-blend-multiply"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                                                {item.title}
                                            </h4>
                                            <p className="text-[#E94B64] font-black mt-1">₹{item.price}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                                                <button
                                                    onClick={() => {
                                                        if (item.quantity > 1) {
                                                            addToCart({ ...item, quantity: -1 });
                                                        }
                                                    }}
                                                    className="p-1 hover:text-[#E94B64] transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => addToCart({ ...item, quantity: 1 })}
                                                    className="p-1 hover:text-[#E94B64] transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <SheetFooter className="p-6 border-t border-gray-100 bg-gray-50/50 flex-shrink-0 flex-col sm:flex-col gap-4">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="text-2xl font-black text-gray-900">₹{total}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center">
                            Shipping and taxes calculated at checkout
                        </p>
                        <Button
                            onClick={async () => {
                                const token = localStorage.getItem("token");
                                if (!token) {
                                    toast.error("Please login to proceed to checkout");
                                    navigate("/login");
                                    setIsDrawerOpen(false);
                                    return;
                                }

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
                                                    return;
                                                }
                                            } else {
                                                if ((product.quantity || 0) < item.quantity) {
                                                    toast.error(`Only ${product.quantity || 0} units of ${item.title} available`);
                                                    return;
                                                }
                                            }
                                        }
                                    } catch (err) {
                                        console.error("Error validating stock:", err);
                                    }
                                }

                                setIsDrawerOpen(false);
                                navigate("/checkout");
                            }}
                            className="w-full bg-[#E94B64] hover:bg-[#D43F57] text-white rounded-xl py-6 text-base font-bold shadow-lg shadow-[#E94B64]/20 transition-all"
                        >
                            Proceed to Checkout
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}

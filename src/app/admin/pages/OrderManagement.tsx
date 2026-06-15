import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Search, Eye, Filter, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { orderApi } from "../../api/api";
import { Pagination } from "../components/Pagination";
import { toast } from "sonner";
import { cn } from "../../components/ui/utils";

interface OrderItem {
    productId: string;
    productType: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
    variantName?: string;
}

interface Address {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

interface Order {
    _id: string;
    user?: {
        _id: string;
        name: string;
        email: string;
    };
    items: OrderItem[];
    customerInfo: {
        name: string;
        email: string;
        mobile: string;
    };
    shippingAddress: Address;
    billingAddress: Address;
    totalAmount: number;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Failed" | "Completed" | "Ready to Ship";
    paymentMethod: string;
    paymentId?: string;
    orderDate: string;
    createdAt: string;
    trackingInfo?: {
        awbNumber?: string;
        courierName?: string;
        trackingUrl?: string;
    };
}

export function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");

    const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    const [trackingData, setTrackingData] = useState({
        awbNumber: "",
        courierName: "",
        trackingUrl: ""
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
            };

            const filter: any = {};
            if (statusFilter !== "All") filter.status = statusFilter;
            if (paymentFilter !== "All") filter.paymentMethod = paymentFilter;

            if (Object.keys(filter).length > 0) {
                params.filter = JSON.stringify(filter);
            }

            const { ok, data } = await orderApi.getOrders(params);
            if (ok) {
                setOrders(data.data);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    pages: data.pagination.pages
                }));
            }
        } catch (err) {
            toast.error("Failed to fetch orders");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, statusFilter, paymentFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchOrders]);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        if (status === 'Shipped') {
            setPendingOrderId(id);
            setTrackingData({
                awbNumber: "",
                courierName: "",
                trackingUrl: ""
            });
            setIsTrackingDialogOpen(true);
            return;
        }

        try {
            const { ok, data } = await orderApi.updateOrder(id, { status });
            if (ok) {
                toast.success("Order status updated");
                fetchOrders();
                if (selectedOrder?._id === id) {
                    setSelectedOrder(data.data);
                }
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const submitTrackingData = async () => {
        if (!pendingOrderId) return;

        // Basic validation for URLs
        if (trackingData.trackingUrl && !trackingData.trackingUrl.startsWith('http')) {
            toast.error("Tracking URL must start with http or https");
            return;
        }

        try {
            const { ok, data } = await orderApi.updateOrder(pendingOrderId, {
                status: 'Shipped',
                trackingInfo: trackingData
            });
            if (ok) {
                toast.success("Order marked as Shipped and tracking email sent");
                fetchOrders();
                setIsTrackingDialogOpen(false);
                setTrackingData({ awbNumber: "", courierName: "", trackingUrl: "" });
                setPendingOrderId(null);
                if (selectedOrder?._id === pendingOrderId) {
                    setSelectedOrder(data.data);
                }
            }
        } catch (err) {
            toast.error("Failed to update status and send tracking details");
        }
    };

    const handleDeleteOrder = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            const { ok } = await orderApi.deleteOrder(id);
            if (ok) {
                toast.success("Order deleted");
                fetchOrders();
            }
        } catch (err) {
            toast.error("Failed to delete order");
        }
    };

    const getStatusColor = (status: Order["status"]) => {
        switch (status) {
            case "Completed":
            case "Delivered": return "default";
            case "Pending":
            case "Processing": return "secondary";
            case "Ready to Ship": return "secondary";
            case "Shipped": return "outline";
            case "Cancelled": return "destructive";
            default: return "default";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Order & Payment Management</h2>
                    <p className="text-muted-foreground">Track and manage student purchases.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {orders.filter(o => o.status === 'Processing').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {pagination.total > 0 ? Math.round((orders.filter(o => o.status === 'Completed').length / orders.length) * 100) : 0}%
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(orders.reduce((acc, o) => acc + (['Processing', 'Ready to Ship', 'Shipped', 'Delivered', 'Completed', 'Pending'].includes(o.status) ? o.totalAmount : 0), 0))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-4">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search name, email, status..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Ready to Ship">Ready to Ship</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border border-border bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span>Loading orders...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : orders.length > 0 ? (
                            orders.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell className="font-medium text-xs">ORD-{order._id.substring(order._id.length - 6).toUpperCase()}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{order.customerInfo?.name || 'Unknown'}</span>
                                            <span className="text-[10px] text-muted-foreground">{order.customerInfo?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-full">{order.items?.length || 0} Items</span>
                                    </TableCell>
                                    <TableCell className="font-black">{formatCurrency(order.totalAmount)}</TableCell>
                                    <TableCell className="text-xs">{formatDate(order.orderDate)}</TableCell>
                                    <TableCell className="text-xs">{order.paymentMethod}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                                                <Eye className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteOrder(order._id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
            />

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="!max-w-[90vw] w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Order Details</DialogTitle>
                        <DialogDescription>
                            Full breakdown for order ORD-{selectedOrder?._id.substring(selectedOrder?._id.length - 6).toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-8 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer Information</p>
                                        <p className="font-bold text-gray-900">{selectedOrder.customerInfo?.name}</p>
                                        <p className="text-sm text-gray-500">{selectedOrder.customerInfo?.email}</p>
                                        <p className="text-sm text-gray-500">{selectedOrder.customerInfo?.mobile}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Status</p>
                                        <Select
                                            value={selectedOrder.status}
                                            onValueChange={(val) => handleUpdateStatus(selectedOrder._id, val)}
                                        >
                                            <SelectTrigger className="w-full bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Processing">Processing</SelectItem>
                                                <SelectItem value="Ready to Ship">Ready to Ship</SelectItem>
                                                <SelectItem value="Shipped">Shipped</SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {selectedOrder.status === 'Shipped' && (
                                            <div className="mt-2 text-right">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="text-xs h-auto p-0 text-blue-600 font-bold"
                                                    onClick={() => {
                                                        setPendingOrderId(selectedOrder._id);
                                                        setTrackingData({
                                                            awbNumber: selectedOrder.trackingInfo?.awbNumber || "",
                                                            courierName: selectedOrder.trackingInfo?.courierName || "",
                                                            trackingUrl: selectedOrder.trackingInfo?.trackingUrl || ""
                                                        });
                                                        setIsTrackingDialogOpen(true);
                                                    }}
                                                >
                                                    Edit Tracking Details
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Shipping Address</p>
                                        <p className="text-sm font-medium text-gray-700 leading-relaxed">
                                            {selectedOrder.shippingAddress?.addressLine}<br />
                                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Details</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Method</span>
                                            <span className="text-sm font-bold">{selectedOrder.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-sm text-gray-500">ID</span>
                                            <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">{selectedOrder.paymentId || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Items</p>
                                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Qty</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedOrder.items?.map((item, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold line-clamp-1">{item.title}</span>
                                                            {item.variantName && <span className="text-[10px] text-gray-400">{item.variantName}</span>}
                                                            <span className="text-[9px] text-[#E94B64] font-medium uppercase tracking-tighter">{item.productType}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-xs font-bold">{item.quantity}</TableCell>
                                                    <TableCell className="text-right text-xs font-black">{formatCurrency(item.price * item.quantity)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                                        <span className="text-sm font-bold text-gray-500">Total Amount</span>
                                        <span className="text-xl font-black text-[#E94B64]">{formatCurrency(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedOrder?.status === 'Shipped' ? 'Edit' : 'Add'} Tracking Details</DialogTitle>
                        <DialogDescription>
                            Enter the shipment tracking details. These will be sent to the customer via email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="courier">Courier Name</Label>
                            <Input
                                id="courier"
                                placeholder="e.g. BlueDart, Delhivery"
                                value={trackingData.courierName}
                                onChange={(e) => setTrackingData(prev => ({ ...prev, courierName: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="awb">AWB Number / Tracking ID</Label>
                            <Input
                                id="awb"
                                placeholder="Tracking Number"
                                value={trackingData.awbNumber}
                                onChange={(e) => setTrackingData(prev => ({ ...prev, awbNumber: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url">Tracking URL</Label>
                            <Input
                                id="url"
                                type="url"
                                placeholder="https://..."
                                value={trackingData.trackingUrl}
                                onChange={(e) => setTrackingData(prev => ({ ...prev, trackingUrl: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsTrackingDialogOpen(false)}>Cancel</Button>
                            <Button className="bg-[#E94B64] hover:bg-[#D43F57] text-white" onClick={submitTrackingData}>
                                {selectedOrder?.status === 'Shipped' ? 'Update Details' : 'Confirm & Ship'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

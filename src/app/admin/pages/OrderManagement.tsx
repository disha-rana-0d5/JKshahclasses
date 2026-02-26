import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Search, Eye, Filter, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { orderApi } from "../../api/api";
import { Pagination } from "../components/Pagination";
import { toast } from "sonner";
import { cn } from "../../components/ui/utils";

interface Order {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    course: {
        _id: string;
        title: string;
    };
    amount: number;
    status: "Completed" | "Pending" | "Failed";
    paymentMethod: string;
    orderDate: string;
    createdAt: string;
}

export function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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

    const getStatusColor = (status: Order["status"]) => {
        switch (status) {
            case "Completed": return "default";
            case "Pending": return "secondary";
            case "Failed": return "destructive";
            default: return "default";
        }
    };

    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("All");
        setPaymentFilter("All");
        setStartDate("");
        setEndDate("");
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <CardTitle className="text-sm font-medium">Results Shown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{orders.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Page</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{pagination.page} / {pagination.pages}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-4">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search status or payment..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

            </div>

            <div className="rounded-md border border-border bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Course</TableHead>
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
                                    <TableCell className="font-medium">ORD-{order._id.substring(order._id.length - 4).toUpperCase()}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{order.user?.name || 'Unknown'}</span>
                                            <span className="text-xs text-muted-foreground">{order.user?.email || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">{order.course?.title || 'Unknown Course'}</TableCell>
                                    <TableCell>{formatCurrency(order.amount)}</TableCell>
                                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                                    <TableCell>{order.paymentMethod}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                            Full details for order ORD-{selectedOrder?._id.substring(selectedOrder?._id.length - 4).toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">User</p>
                                    <p>{selectedOrder.user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedOrder.user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                                    <p>{formatDate(selectedOrder.orderDate)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Course</p>
                                    <p>{selectedOrder.course?.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                    <p className="font-bold text-primary">{formatCurrency(selectedOrder.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                                    <p>{selectedOrder.paymentMethod}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ShoppingCart, Calendar, Download, TrendingUp, Users, CreditCard, Loader2 } from "lucide-react";
import { dashboardApi, orderApi } from "../../api/api";
import { toast } from "sonner";

export function Reports() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [statsRes, ordersRes] = await Promise.all([
                dashboardApi.getStats(),
                orderApi.getOrders({ limit: 5 })
            ]);

            if (statsRes.ok) setStats(statsRes.data.data);
            if (ordersRes.ok) setRecentOrders(ordersRes.data.data);
        } catch (err) {
            toast.error("Failed to fetch report data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const revenueData = stats?.monthlyRevenue?.map((m: any) => ({
        name: monthNames[m._id - 1],
        value: m.total
    })) || [];

    const orderTrendData = stats?.monthlyOrders?.map((m: any) => ({
        name: monthNames[m._id - 1],
        value: m.count
    })) || [];

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Generating your reports...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground">Analytics & Reports</h2>
                    <p className="text-muted-foreground font-medium">Data-driven insights for your business.</p>
                </div>
                <Button onClick={fetchData} variant="outline" size="sm" className="hidden md:flex">
                    Refresh Data
                </Button>
            </div>

            <Tabs defaultValue="orders" className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
                    <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-6">Revenue & Orders</TabsTrigger>
                    {/* <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-6">User Growth</TabsTrigger> */}
                </TabsList>

                <TabsContent value="orders" className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
                                    <h3 className="text-2xl font-black">{stats?.totalOrders || 0}</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Revenue</p>
                                    <h3 className="text-2xl font-black">{formatCurrency(stats?.totalRevenue || 0)}</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Order Value</p>
                                    <h3 className="text-2xl font-black">
                                        {stats?.totalOrders > 0 ? formatCurrency(stats.totalRevenue / stats.totalOrders) : "₹0"}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Students</p>
                                    <h3 className="text-2xl font-black">{stats?.totalUsers || 0}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        {/* Revenue Trend */}
                        <Card className="border-none shadow-sm rounded-3xl p-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-lg font-black flex items-center gap-2">
                                    Revenue Trend
                                    <Badge variant="secondary" className="font-bold">Monthly</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0 pb-0 h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val}`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(val: number) => [formatCurrency(val), "Revenue"]}
                                        />
                                        <Line type="monotone" dataKey="value" stroke="#E94B64" strokeWidth={4} dot={{ r: 6, fill: '#E94B64', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Order Volume */}
                        <Card className="border-none shadow-sm rounded-3xl p-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-lg font-black flex items-center gap-2">
                                    Order Volume
                                    <Badge variant="outline" className="font-bold">By Month</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0 pb-0 h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={orderTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="value" fill="#373081" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Orders Table */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-gray-50 border-b border-gray-100 p-6">
                            <CardTitle className="text-lg font-black">Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6">Order ID</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Items</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Amount</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Date</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest pr-6">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map((order) => (
                                        <TableRow key={order._id}>
                                            <TableCell className="pl-6 font-bold text-xs uppercase">ORD-{order._id.slice(-6)}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="font-bold text-[10px]">{order.items?.length || 0}</Badge>
                                            </TableCell>
                                            <TableCell className="font-black">{formatCurrency(order.totalAmount)}</TableCell>
                                            <TableCell className="text-xs text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="pr-6">
                                                <Badge className="font-bold uppercase text-[9px] tracking-tighter">{order.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl p-8 text-center bg-blue-50 text-blue-900">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-black">User Growth Module</h3>
                        <p className="max-w-md mx-auto mt-2 font-medium opacity-80">
                            We are currently processing more detailed demographic and geographical user data for this section.
                        </p>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}


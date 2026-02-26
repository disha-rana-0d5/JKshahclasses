import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Bell, Mail, UserPlus, ShoppingCart, AlertCircle, Calendar, Download, TrendingUp, Users, CreditCard, Search, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Label } from "../../components/ui/label";

// --- Reports Data ---
const revenueData = [
    { name: "Jan", value: 10000 },
    { name: "Feb", value: 12000 },
    { name: "Mar", value: 14000 },
    { name: "Apr", value: 12500 },
    { name: "May", value: 8500 },
    { name: "Jun", value: 15000 },
];

const registrationData = [
    { name: "Jan", value: 120 },
    { name: "Feb", value: 145 },
    { name: "Mar", value: 180 },
    { name: "Apr", value: 165 },
    { name: "May", value: 140 },
    { name: "Jun", value: 195 },
];

// --- Notification Data ---
interface NotificationLog {
    id: number;
    type: "New Registration" | "New Purchase" | "Pending Payment";
    message: string;
    date: string;
    status: "Sent" | "Failed";
}

const INITIAL_LOGS: NotificationLog[] = [
    { id: 1, type: "New Registration", message: "New user Rahul Sharma registered", date: "2024-01-15 10:30 AM", status: "Sent" },
    { id: 2, type: "New Purchase", message: "Priya Patel purchased CA Foundation Course", date: "2024-01-15 09:45 AM", status: "Sent" },
    { id: 3, type: "Pending Payment", message: "Payment pending for Order #ORD-002", date: "2024-01-15 09:00 AM", status: "Sent" },
    { id: 4, type: "New Registration", message: "New user Amit Kumar registered", date: "2024-01-14 04:30 PM", status: "Sent" },
];

export function Reports() {
    // Notification Settings State
    const [settings, setSettings] = useState({
        registration: { email: true, push: true },
        purchase: { email: true, push: true },
        payment: { email: true, push: false },
    });

    const toggleSetting = (category: keyof typeof settings, type: "email" | "push") => {
        setSettings(prev => ({
            ...prev,
            [category]: { ...prev[category], [type]: !prev[category][type] }
        }));
    };

    // Notification Log Filters
    const [logTypeFilter, setLogTypeFilter] = useState("All");
    const [logStatusFilter, setLogStatusFilter] = useState("All");
    const [logSearch, setLogSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filteredLogs = INITIAL_LOGS.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(logSearch.toLowerCase());
        const matchesType = logTypeFilter === "All" || log.type === logTypeFilter;
        const matchesStatus = logStatusFilter === "All" || log.status === logStatusFilter;

        let matchesDate = true;
        if (startDate || endDate) {
            const logDate = new Date(log.date).getTime();
            const start = startDate ? new Date(startDate).getTime() : 0;
            const end = endDate ? new Date(endDate).getTime() : Infinity;
            matchesDate = logDate >= start && logDate <= end;
        }

        return matchesSearch && matchesType && matchesStatus && matchesDate;
    });

    const resetFilters = () => {
        setLogTypeFilter("All");
        setLogStatusFilter("All");
        setStartDate("");
        setEndDate("");
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Analytics & Notifications</h2>
                <p className="text-muted-foreground">Monitor performance, generate reports, and manage alerts.</p>
            </div>

            <Tabs defaultValue="orders" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger
                        value="orders"
                        className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                        Order Reports
                    </TabsTrigger>
                    <TabsTrigger
                        value="users"
                        className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                        User Reports
                    </TabsTrigger>
                    <TabsTrigger
                        value="notifications"
                        className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                        Notifications
                    </TabsTrigger>
                </TabsList>

                {/* --- ORDER REPORTS TAB --- */}
                <TabsContent value="orders" className="space-y-6">
                    {/* Filters & Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="grid gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="date" className="pl-9 w-[160px]" defaultValue="2024-01-01" />
                                </div>
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">End Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="date" className="pl-9 w-[160px]" defaultValue="2024-01-31" />
                                </div>
                            </div>
                            <Button variant="secondary" className="mt-5">Apply Filter</Button>
                        </div>
                        <div className="flex items-center gap-2 mt-5 md:mt-0">
                            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
                            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="p-3 bg-red-100 rounded-lg text-red-600">
                                    <ShoppingCart className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                                    <h3 className="text-2xl font-bold">465</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                    <h3 className="text-2xl font-bold">₹69.78L</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                                    <h3 className="text-2xl font-bold">₹15,005</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Unique Buyers</p>
                                    <h3 className="text-2xl font-bold">398</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Revenue Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip
                                        cursor={{ stroke: '#888888' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4, fill: "var(--primary)" }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Recent Orders Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>ORD-001</TableCell>
                                        <TableCell>Rahul Sharma</TableCell>
                                        <TableCell>CA Foundation</TableCell>
                                        <TableCell>₹25,000</TableCell>
                                        <TableCell>2024-01-15</TableCell>
                                        <TableCell><Badge variant="default">Completed</Badge></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>ORD-002</TableCell>
                                        <TableCell>Priya Patel</TableCell>
                                        <TableCell>CS Executive</TableCell>
                                        <TableCell>₹38,000</TableCell>
                                        <TableCell>2024-01-14</TableCell>
                                        <TableCell><Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">Pending</Badge></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- USER REPORTS TAB --- */}
                <TabsContent value="users" className="space-y-6">
                    {/* Filters & Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="grid gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="date" className="pl-9 w-[160px]" defaultValue="2024-01-01" />
                                </div>
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">End Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="date" className="pl-9 w-[160px]" defaultValue="2024-01-31" />
                                </div>
                            </div>
                            <Button variant="secondary" className="mt-5">Apply Filter</Button>
                        </div>
                        <div className="flex items-center gap-2 mt-5 md:mt-0">
                            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                                    <h3 className="text-2xl font-bold">945</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                                    <h3 className="text-2xl font-bold">195</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="p-3 bg-red-100 rounded-lg text-red-600">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                                    <h3 className="text-2xl font-bold">+18.5%</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registration Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Registration Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={registrationData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Recent Registrations Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Registrations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Registered</TableHead>
                                        <TableHead>Courses Enrolled</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Amit Kumar</TableCell>
                                        <TableCell>amit@example.com</TableCell>
                                        <TableCell>2024-01-16</TableCell>
                                        <TableCell>1</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Sneha Gupta</TableCell>
                                        <TableCell>sneha@example.com</TableCell>
                                        <TableCell>2024-01-15</TableCell>
                                        <TableCell>2</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- NOTIFICATIONS TAB --- */}
                <TabsContent value="notifications" className="space-y-6">
                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Notification Settings</CardTitle>
                            <CardDescription>Manage how you receive admin alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="flex items-center justify-between space-x-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                        <UserPlus className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium leading-none">New User Registration</p>
                                        <p className="text-sm text-muted-foreground">Get notified when a new user registers on the platform</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={settings.registration.email} onCheckedChange={() => toggleSetting('registration', 'email')} />
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={settings.registration.push} onCheckedChange={() => toggleSetting('registration', 'push')} />
                                        <Bell className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between space-x-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                        <ShoppingCart className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium leading-none">New Purchase Alert</p>
                                        <p className="text-sm text-muted-foreground">Get notified when a user purchases a course</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={settings.purchase.email} onCheckedChange={() => toggleSetting('purchase', 'email')} />
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={settings.purchase.push} onCheckedChange={() => toggleSetting('purchase', 'push')} />
                                        <Bell className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between space-x-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium leading-none">Pending Payment Reminder</p>
                                        <p className="text-sm text-muted-foreground">Get notified about pending payment approvals</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={settings.payment.email} onCheckedChange={() => toggleSetting('payment', 'email')} />
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={settings.payment.push} onCheckedChange={() => toggleSetting('payment', 'push')} />
                                        <Bell className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Logs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-4">
                                <div className="relative flex-1 w-full md:max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search logs..."
                                        className="pl-9"
                                        value={logSearch}
                                        onChange={(e) => setLogSearch(e.target.value)}
                                    />
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <Filter className="h-4 w-4" />
                                            Filters
                                            {(logTypeFilter !== "All" || logStatusFilter !== "All" || startDate || endDate) && (
                                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">Active</Badge>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-96" align="end">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium leading-none">Filter Logs</h4>
                                                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                                                    Reset
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="type">Type</Label>
                                                <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
                                                    <SelectTrigger id="type">
                                                        <SelectValue placeholder="Select Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="All">All Types</SelectItem>
                                                        <SelectItem value="New Registration">New Registration</SelectItem>
                                                        <SelectItem value="New Purchase">New Purchase</SelectItem>
                                                        <SelectItem value="Pending Payment">Pending Payment</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="status">Status</Label>
                                                <Select value={logStatusFilter} onValueChange={setLogStatusFilter}>
                                                    <SelectTrigger id="status">
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="All">All Status</SelectItem>
                                                        <SelectItem value="Sent">Sent</SelectItem>
                                                        <SelectItem value="Failed">Failed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Date Range</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="h-8 flex-1 text-xs"
                                                    />
                                                    <span className="text-muted-foreground">-</span>
                                                    <Input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="h-8 w-[130px] text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <Badge variant="outline">{log.type}</Badge>
                                            </TableCell>
                                            <TableCell>{log.message}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{log.date}</TableCell>
                                            <TableCell>
                                                <Badge variant={log.status === "Sent" ? "default" : "destructive"} className="uppercase text-[10px]">
                                                    {log.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

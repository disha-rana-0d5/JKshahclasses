import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Users, BookOpen, ShoppingCart, TrendingUp, MoreVertical, ArrowUpRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { useState, useEffect } from "react";
import { dashboardApi } from "../../api/api";

export function Dashboard() {
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { ok, data } = await dashboardApi.getStats();
                if (ok && data.success) {
                    setStatsData(data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        { title: "Total Users", value: statsData?.totalUsers?.toLocaleString() || "0", icon: Users, change: "Real-time", color: "text-blue-600" },
        { title: "Total Courses", value: statsData?.totalCourses || "0", icon: BookOpen, change: "Total active courses", color: "text-green-600" },
        { title: "Total Orders", value: statsData?.totalOrders || "0", icon: ShoppingCart, change: "Successfull purchases", color: "text-purple-600" },
        { title: "Revenue", value: `₹${(statsData?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, change: "Total income", color: "text-orange-600" },
    ];

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
                <p className="text-muted-foreground">Overview of your platform performance.</p>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Orders Over Time</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={ordersData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip />
                                <Line type="monotone" dataKey="orders" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>User Registrations</CardTitle>
                        <CardDescription>
                            New users joined this week.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={registrationData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px' }}
                                />
                                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            */}

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* 
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Orders</CardTitle>
                        <Button variant="outline" size="sm" className="ml-auto">
                            View All <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{order.user}</span>
                                        <span className="text-xs text-muted-foreground">{order.course}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="font-bold text-sm">{order.amount}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                */}

                {/* New Registrations List */}
                <Card className="col-span-1 md:col-span-3">
                    <CardHeader>
                        <CardTitle>Registered Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                            {statsData?.latestRegistrations?.map((user: any, i: number) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-xs font-medium text-primary">
                                                {user.name.split(' ').map((n: string) => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{formatTime(user.createdAt)}</div>
                                </div>
                            ))}
                            {(!statsData?.latestRegistrations || statsData.latestRegistrations.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent registrations found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

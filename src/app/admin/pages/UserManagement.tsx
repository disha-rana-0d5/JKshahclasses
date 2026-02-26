import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Search, MoreHorizontal, Eye, UserX, UserCheck, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Label } from "../../components/ui/label";
import { Filter, X } from "lucide-react";
import { userApi } from "../../api/api";
import { toast } from "sonner";
import { cn } from "../../components/ui/utils";
import { Pagination } from "../components/Pagination";

interface EnrolledCourse {
    courseId: {
        _id: string;
        title: string;
    };
    status: "Active" | "Completed";
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    status: "Active" | "Inactive";
    enrolledCourses: EnrolledCourse[];
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [courseFilter, setCourseFilter] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Modal State
    const [viewUser, setViewUser] = useState<User | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
            };

            const filter: any = {};
            if (statusFilter !== "All") filter.status = statusFilter;
            // Note: course filter and date range could be complex to implement on backend immediately,
            // so we'll start with status and search.

            if (Object.keys(filter).length > 0) {
                params.filter = JSON.stringify(filter);
            }

            const { ok, data } = await userApi.getUsers(params);
            if (ok) {
                setUsers(data.data);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    pages: data.pagination.pages
                }));
            }
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    // Derived Filter Options
    const allCourses = Array.from(new Set(users.flatMap(u => u.enrolledCourses?.map(c => c.courseId?.title)))).filter(Boolean).sort();

    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("All");
        setCourseFilter("All");
        setStartDate("");
        setEndDate("");
        setPagination(prev => ({ ...prev, page: 1 }));
    };


    const toggleStatus = async (user: User) => {
        const newStatus = user.status === "Active" ? "Inactive" : "Active";
        try {
            const { ok } = await userApi.updateUser(user._id, { status: newStatus });
            if (ok) {
                toast.success(`User ${newStatus === "Active" ? "activated" : "deactivated"} successfully`);
                fetchUsers();
            }
        } catch (err) {
            toast.error("Failed to update user status");
        }
    };

    const handleView = (user: User) => {
        setViewUser(user);
        setIsViewOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">User Management</h2>
                    <p className="text-muted-foreground">View and manage registered users and their enrollments.</p>
                </div>
                <Button variant="outline">Export CSV</Button>
            </div>

            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-4">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users by name or email..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                            {(statusFilter !== "All" || courseFilter !== "All" || startDate || endDate) && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">Active</Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96" align="end">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium leading-none">Filter Users</h4>
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                                    Reset
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Status</SelectItem>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course">Course</Label>
                                <Select value={courseFilter} onValueChange={setCourseFilter}>
                                    <SelectTrigger id="course">
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Courses</SelectItem>
                                        {allCourses.map(course => (
                                            <SelectItem key={course} value={course}>{course}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Join Date Range</Label>
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
                                        className="h-8 flex-1 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="rounded-md border border-border bg-white min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Loading users...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-center">Enrolled Courses</TableHead>
                                <TableHead>Join Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "capitalize font-medium",
                                                    user.role === 'admin'
                                                        ? "bg-purple-50 text-purple-700 border-purple-200"
                                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                                )}
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-normal">
                                                {user.enrolledCourses?.length || 0} Courses
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleView(user)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleStatus(user)}>
                                                        {user.status === "Active" ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                                                        {user.status === "Active" ? "Deactivate User" : "Activate User"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
            />

            {/* View User Details Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                    </DialogHeader>
                    {viewUser && (
                        <div className="py-4">
                            <div className="flex items-center gap-4 mb-6">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-xl bg-red-100 text-red-600">
                                        {viewUser.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">{viewUser.name}</h3>
                                    <p className="text-sm text-muted-foreground">{viewUser.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground whitespace-nowrap">Registered: {formatDate(viewUser.createdAt)}</p>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "h-5 text-[10px] capitalize px-1.5 ml-1 font-medium",
                                                viewUser.role === 'admin'
                                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                            )}
                                        >
                                            {viewUser.role}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium text-sm">Enrolled Courses</h4>
                                {viewUser.enrolledCourses.length > 0 ? (
                                    <div className="space-y-2">
                                        {viewUser.enrolledCourses.map((course, idx) => (
                                            <div key={course.courseId?._id || idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                <span className="font-medium text-sm">{course.courseId?.title || 'Unknown Course'}</span>
                                                <Badge
                                                    variant={course.status === "Active" ? "default" : "secondary"}
                                                    className={course.status === "Completed" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                                                >
                                                    {course.status.toLowerCase()}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No active enrollments.</p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

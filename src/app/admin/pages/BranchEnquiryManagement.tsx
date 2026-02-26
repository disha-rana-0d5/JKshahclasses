import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Search, Loader2, Mail, MailOpen, Trash2, CheckCircle, Clock } from "lucide-react";
import { branchEnquiryApi } from "../../api/api";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

export function BranchEnquiryManagement() {
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchEnquiries = async () => {
        try {
            setIsLoading(true);
            const { ok, data } = await branchEnquiryApi.getBranchEnquiries();
            if (ok && data.success) {
                setEnquiries(data.data);
            } else {
                toast.error("Failed to load enquiries");
            }
        } catch (error) {
            toast.error("Failed to fetch enquiries");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string, currentStatus: boolean) => {
        try {
            setActionLoading(id);
            const { ok, data } = await branchEnquiryApi.updateBranchEnquiryReadStatus(id, !currentStatus);
            if (ok && data.success) {
                setEnquiries(prev => prev.map(eq => eq._id === id ? { ...eq, isRead: !currentStatus } : eq));
                toast.success(currentStatus ? "Marked as unread" : "Marked as read");
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setActionLoading(id);
            const { ok, data } = await branchEnquiryApi.deleteBranchEnquiry(id);
            if (ok && data.success) {
                setEnquiries(prev => prev.filter(eq => eq._id !== id));
                toast.success("Enquiry deleted successfully");
            } else {
                toast.error(data.message || "Failed to delete enquiry");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const filteredEnquiries = enquiries.filter(
        (eq) =>
            eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.course.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Branch Enquiries</h2>
                    <p className="text-muted-foreground">Manage and view enquiries submitted for all branches.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {enquiries.filter(e => !e.isRead).length} Unread
                    </Badge>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, branch or course..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button variant="outline" onClick={fetchEnquiries} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Refresh
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Student Details</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Course Target</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredEnquiries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No enquiries found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEnquiries.map((enquiry) => (
                                    <TableRow key={enquiry._id} className={!enquiry.isRead ? "bg-blue-50/30 font-medium" : ""}>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{format(new Date(enquiry.createdAt), "dd MMM yyyy")}</span>
                                                <span className="text-[10px] text-muted-foreground">{format(new Date(enquiry.createdAt), "hh:mm a")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {enquiry.isRead ? (
                                                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                                    Read
                                                </Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                                                    Unread
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{enquiry.name}</div>
                                            <div className="text-sm text-muted-foreground">{enquiry.email}</div>
                                            <div className="text-sm text-muted-foreground">{enquiry.phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-primary/20 text-primary">{enquiry.branchName}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">{enquiry.course}</span>
                                        </TableCell>
                                        <TableCell className="max-w-[200px]">
                                            <span className="text-sm text-muted-foreground line-clamp-2" title={enquiry.description || "No description provided"}>
                                                {enquiry.description || <span className="italic">None</span>}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title={enquiry.isRead ? "Mark as unread" : "Mark as read"}
                                                    onClick={() => handleMarkAsRead(enquiry._id, enquiry.isRead)}
                                                    disabled={actionLoading === enquiry._id}
                                                >
                                                    {actionLoading === enquiry._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                    ) : enquiry.isRead ? (
                                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                                    ) : (
                                                        <MailOpen className="w-4 h-4 text-primary" />
                                                    )}
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            disabled={actionLoading === enquiry._id}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Enquiry</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this enquiry from <strong>{enquiry.name}</strong>? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(enquiry._id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

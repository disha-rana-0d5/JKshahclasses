import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { paymentEnquiryApi } from "../../api/api";
import { format } from "date-fns";

export default function ErpEnquiriesManagement() {
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token") || "";
            const response = await paymentEnquiryApi.getAllEnquiries(token);
            if (response.ok && response.data?.success) {
                setEnquiries(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch ERP Enquiries", error);
        } finally {
            setLoading(false);
        }
    };

    const groupedUsers = useMemo(() => {
        const map = new Map<string, any[]>();
        enquiries.forEach(enq => {
            const mobile = enq.mobileNumber || "Unknown";
            if (!map.has(mobile)) map.set(mobile, []);
            map.get(mobile)!.push(enq);
        });
        return Array.from(map.entries()).map(([mobile, records]) => ({
            mobile,
            firstName: records[0].firstName,
            email: records[0].email,
            records: records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }));
    }, [enquiries]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">ERP Payment Enquiries</h1>
                <p className="text-muted-foreground mt-2">
                    View captured details of users who initiated a payment. Grouped by Mobile Number.
                </p>
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Mobile Number</TableHead>
                            <TableHead>Total Enquiries</TableHead>
                            <TableHead>Latest Enquiry Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : groupedUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No ERP enquiries found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            groupedUsers.map((user, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium text-primary">
                                        {user.firstName || "-"}
                                    </TableCell>
                                    <TableCell>{user.email || "-"}</TableCell>
                                    <TableCell>{user.mobile}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{user.records.length}</Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {user.records[0]?.createdAt ? format(new Date(user.records[0].createdAt), 'MMM dd, yyyy') : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">View Enquiries</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-5xl sm:max-w-5xl max-h-[85vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>All Enquiries for {user.firstName || user.mobile}</DialogTitle>
                                                </DialogHeader>
                                                <div className="mt-4 space-y-6">
                                                    {user.records.map((enquiry) => (
                                                        <div key={enquiry._id} className="border rounded-lg p-4 bg-slate-50/30">
                                                            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                                                <div className="font-bold text-primary">{enquiry.course || "Unknown Course"}</div>
                                                                <Badge variant={enquiry.status === "Pending" ? "secondary" : "default"}>
                                                                    {enquiry.status}
                                                                </Badge>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                <div className="flex flex-col"><span className="font-semibold text-muted-foreground">Enquiry ID</span><span>{enquiry.enqId || "-"}</span></div>
                                                                <div className="flex flex-col"><span className="font-semibold text-muted-foreground">Amount</span><span>₹{enquiry.amount || "-"}</span></div>
                                                                <div className="flex flex-col"><span className="font-semibold text-muted-foreground">Level</span><span>{enquiry.level || "-"}</span></div>
                                                                <div className="flex flex-col"><span className="font-semibold text-muted-foreground">Attempt</span><span>{enquiry.attempt || "-"}</span></div>
                                                                <div className="flex flex-col"><span className="font-semibold text-muted-foreground">Batch ID</span><span>{enquiry.batch || "-"}</span></div>
                                                                <div className="flex flex-col"><span className="font-semibold text-muted-foreground">Branch / Comp ID</span><span>{enquiry.compId || "-"}</span></div>
                                                                <div className="flex flex-col"><span className="font-semibold text-muted-foreground">Acad Year</span><span>{enquiry.acadYear || "-"}</span></div>
                                                                <div className="flex flex-col"><span className="font-semibold text-muted-foreground">Date</span><span>{enquiry.createdAt ? format(new Date(enquiry.createdAt), 'PP') : "-"}</span></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

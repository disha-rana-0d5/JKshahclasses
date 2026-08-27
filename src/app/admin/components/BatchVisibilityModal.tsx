import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Loader2, Save } from "lucide-react";
import { erpCourseApi } from "../../api/api";
import { toast } from "sonner";

interface BatchVisibilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: any;
}

export function BatchVisibilityModal({ isOpen, onClose, course }: BatchVisibilityModalProps) {
    const [batches, setBatches] = useState<any[]>([]);
    const [visibilityData, setVisibilityData] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && course) {
            fetchBatchesAndVisibility();
        } else {
            setBatches([]);
            setVisibilityData({});
        }
    }, [isOpen, course]);

    const fetchBatchesAndVisibility = async () => {
        if (!course || !course.courseId || !course.levelId) return;
        setLoading(true);
        try {
            // 1. Fetch external ERP batches
            const batchRes = await erpCourseApi.fetchExternalERPBatchDetails(course.courseId, course.levelId);
            let fetchedBatches: any[] = [];
            if (batchRes.ok && batchRes.data?.data) {
                fetchedBatches = batchRes.data.data;
                setBatches(fetchedBatches);
            } else {
                toast.error("Failed to fetch batches from ERP");
                setLoading(false);
                return;
            }

            // 2. Fetch visibility settings
            const visRes = await erpCourseApi.getBatchVisibilities();
            if (visRes.ok && visRes.data?.data) {
                const visMap: Record<string, boolean> = {};
                // Default to true for all fetched batches
                fetchedBatches.forEach(b => {
                    const batchId = b.batchId?.toString();
                    if (batchId) visMap[batchId] = true;
                });
                
                // Override with DB settings
                visRes.data.data.forEach((v: any) => {
                    if (v.erpBatchId) {
                        visMap[v.erpBatchId] = v.isVisible;
                    }
                });
                setVisibilityData(visMap);
            }
        } catch (error) {
            console.error("Error fetching batches or visibility:", error);
            toast.error("Error loading batch data");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (batchId: string, checked: boolean) => {
        setVisibilityData(prev => ({
            ...prev,
            [batchId]: checked
        }));
    };

    const handleSave = async (batchId: string) => {
        setSaving(true);
        try {
            const dataToSave = {
                erpBatchId: batchId,
                courseId: course.courseId.toString(),
                levelId: course.levelId.toString(),
                isVisible: visibilityData[batchId]
            };
            const { ok } = await erpCourseApi.saveBatchVisibility(dataToSave);
            if (ok) {
                toast.success("Batch visibility saved successfully");
            } else {
                toast.error("Failed to save batch visibility");
            }
        } catch (error) {
            console.error("Error saving batch visibility:", error);
            toast.error("An error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Batches</DialogTitle>
                    <DialogDescription>
                        Toggle visibility for batches under <strong>{course?.course} - {course?.level}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Batch Name</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Attempt</TableHead>
                                <TableHead>Language</TableHead>
                                <TableHead className="text-center">Visible</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : batches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No batches found for this course.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                batches.map((batch) => {
                                    const batchId = batch.batchId?.toString();
                                    const isVisible = visibilityData[batchId] ?? true;
                                    return (
                                        <TableRow key={batchId}>
                                            <TableCell className="font-medium text-xs">{batch.batch || ""}</TableCell>
                                            <TableCell className="text-xs">{batch.stDate || batch.syStDate || ""}</TableCell>
                                            <TableCell className="text-xs">{batch.attempt || batch.acr || ""}</TableCell>
                                            <TableCell className="text-xs">English</TableCell>
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={isVisible}
                                                    onCheckedChange={(checked) => handleToggle(batchId, checked)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave(batchId)}
                                                    disabled={saving}
                                                >
                                                    <Save className="h-4 w-4 mr-1" /> Save
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}

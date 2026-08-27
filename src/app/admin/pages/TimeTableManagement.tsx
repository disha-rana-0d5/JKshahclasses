import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Upload, Trash2, Eye, RefreshCw, Calendar as CalendarIcon, MapPin, PlusCircle, CheckCircle2, Clock, Edit, ChevronDown, Check, Download, FileUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/app/components/ui/command";
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { toast } from "sonner";
import { timeTableApi, landingPageApi, erpCourseApi } from '@/app/api/api';
import { Checkbox } from "@/app/components/ui/checkbox";

export default function TimeTableManagement() {
    const [branches, setBranches] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentEditId, setCurrentEditId] = useState<string | null>(null);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkFromDate, setBulkFromDate] = useState('');
    const [bulkToDate, setBulkToDate] = useState('');
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    const [branchOpen, setBranchOpen] = useState(false);
    const [courseOpen, setCourseOpen] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');

    const [formData, setFormData] = useState({
        branches: [],
        courseName: '',
        batchName: '',
        fromDate: '',
        toDate: ''
    });

    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const csvFileInputRef = useRef(null);
    const [uploadingId, setUploadingId] = useState(null);

    useEffect(() => {
        fetchBranches();
        fetchAllCourses();
    }, []);

    useEffect(() => {
        if (selectedBranch || (selectedCourse && selectedCourse !== 'All')) {
            fetchTimetables();
        } else {
            setTimetables([]);
        }
    }, [selectedBranch, selectedCourse]);

    const fetchBranches = async () => {
        try {
            const res = await erpCourseApi.fetchExternalERPBranchDetails();
            if (res.ok && res.data?.data) {
                // Ensure unique branch names
                const uniqueBranches = Array.from(new Set(res.data.data.map((b: any) => b.branchName))).sort();
                setBranches(uniqueBranches as any);
            }
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    const fetchAllCourses = async () => {
        try {
            const res = await timeTableApi.getTimetables({});
            if (res.ok) {
                const uniqueCourses = Array.from(new Set(res.data.map((t: any) => t.courseName))).sort();
                setAllCourses(uniqueCourses as any);
            }
        } catch (error) {
            console.error("Error fetching all courses:", error);
        }
    };

    const fetchTimetables = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (selectedBranch && selectedBranch !== 'All') {
                params.branch = selectedBranch;
            }
            if (selectedCourse && selectedCourse !== 'All') {
                params.courseName = selectedCourse;
            }
            const res = await timeTableApi.getTimetables(params);
            if (res.ok) {
                setTimetables(res.data);
            }
        } catch (error) {
            console.error("Error fetching timetables:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setSelectedIds([]);
    }, [timetables]);

    const handleSelectAll = () => {
        if (timetables.length > 0 && selectedIds.length === timetables.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(timetables.map((t: any) => t._id));
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkUpdateDates = async () => {
        if (selectedIds.length === 0) return;
        if (!bulkFromDate && !bulkToDate) {
            toast.error("Please enter at least one date to update.");
            return;
        }

        setIsBulkUpdating(true);
        let successCount = 0;
        try {
            const updateData: any = {};
            if (bulkFromDate) updateData.fromDate = bulkFromDate;
            if (bulkToDate) updateData.toDate = bulkToDate;

            for (const id of selectedIds) {
                const res = await timeTableApi.updateTimetable(id, updateData);
                if (res.ok) successCount++;
            }
            if (successCount > 0) {
                toast.success("Success", { description: `Updated dates for ${successCount} batches.` });
                fetchTimetables();
                setBulkFromDate('');
                setBulkToDate('');
            } else {
                toast.error("Error", { description: "Failed to update batches." });
            }
        } catch (error) {
            console.error(error);
            toast.error("Error", { description: "Server error during bulk update." });
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected batches?`)) {
            return;
        }

        setIsBulkUpdating(true);
        let successCount = 0;
        try {
            for (const id of selectedIds) {
                const res = await timeTableApi.deleteTimetable(id);
                if (res.ok) successCount++;
            }
            if (successCount > 0) {
                toast.success("Success", { description: `Deleted ${successCount} batches.` });
                fetchTimetables();
                setSelectedIds([]);
            } else {
                toast.error("Error", { description: "Failed to delete batches." });
            }
        } catch (error) {
            console.error(error);
            toast.error("Error", { description: "Server error during bulk delete." });
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await timeTableApi.getTimetables({});
            if (res.ok) {
                const data = res.data;
                const headers = ['branch', 'courseName', 'batchName', 'fromDate', 'toDate'];
                const csvRows = [];
                csvRows.push(headers.join(','));
                
                for (const row of data) {
                    const values = headers.map(header => {
                        let val = row[header] || '';
                        if (header === 'fromDate' || header === 'toDate') {
                            val = val ? format(new Date(val), 'yyyy-MM-dd') : '';
                        }
                        val = val.toString().replace(/"/g, '""');
                        if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`;
                        return val;
                    });
                    csvRows.push(values.join(','));
                }
                
                const csvString = csvRows.join('\n');
                const blob = new Blob([csvString], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', 'timetables.csv');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                toast.error("Failed to export data");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error exporting data");
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            try {
                const lines = text.split(/\r?\n/).filter((l: string) => l.trim() !== '');
                if (lines.length < 2) {
                    toast.error("CSV file must have headers and at least one row of data.");
                    return;
                }
                
                const splitLine = (line: string) => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v: string) => v.replace(/^"|"$/g, '').trim());
                const headers = splitLine(lines[0]);
                
                const requiredHeaders = ['branch', 'courseName', 'batchName', 'fromDate', 'toDate'];
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
                if (missingHeaders.length > 0) {
                    toast.error(`Missing required headers: ${missingHeaders.join(', ')}`);
                    return;
                }

                const dataToImport = lines.slice(1).map((line: string) => {
                    const values = splitLine(line);
                    return headers.reduce((obj: any, header: string, i: number) => {
                        obj[header] = values[i];
                        return obj;
                    }, {});
                });

                const res = await timeTableApi.bulkImportTimetables(dataToImport);
                if (res.ok) {
                    toast.success(`Successfully imported ${res.data.length || dataToImport.length} timetables.`);
                    if (selectedBranch || (selectedCourse && selectedCourse !== 'All')) {
                        fetchTimetables();
                    }
                    fetchAllCourses();
                } else {
                    toast.error("Failed to import timetables.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Error parsing or importing CSV file.");
            }
            
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    const handleSave = async () => {
        if (formData.branches.length === 0 || !formData.courseName || !formData.batchName || !formData.fromDate || !formData.toDate) {
            toast.error("Error", { description: "Please fill all fields and select at least one branch." });
            return;
        }

        try {
            if (modalMode === 'create') {
                for (const branch of formData.branches) {
                    const dataToSave = {
                        branch: branch,
                        courseName: formData.courseName,
                        batchName: formData.batchName,
                        fromDate: formData.fromDate,
                        toDate: formData.toDate
                    };
                    await timeTableApi.createTimetable(dataToSave);
                }
                toast.success("Success", { description: "Timetable entries created." });
            } else {
                const dataToSave = {
                    branch: formData.branches[0],
                    courseName: formData.courseName,
                    batchName: formData.batchName,
                    fromDate: formData.fromDate,
                    toDate: formData.toDate
                };
                const res = await timeTableApi.updateTimetable(currentEditId, dataToSave);
                if (res.ok) {
                    toast.success("Success", { description: "Timetable entry updated." });
                } else {
                    toast.error("Error", { description: "Failed to update timetable." });
                }
            }

            setIsModalOpen(false);
            setFormData({ branches: [], courseName: '', batchName: '', fromDate: '', toDate: '' });
            setCourseSearch('');
            fetchAllCourses(); // Refresh courses list in case a new course was added
            if (selectedBranch || (selectedCourse && selectedCourse !== 'All')) {
                fetchTimetables();
            }
        } catch (error) {
            console.error(error);
            toast.error("Error", { description: "Server error." });
        }
    };

    const handleEditClick = (timetable: any) => {
        setFormData({
            branches: [timetable.branch || (selectedBranch !== 'All' ? selectedBranch : '')] as any,
            courseName: timetable.courseName,
            batchName: timetable.batchName,
            fromDate: timetable.fromDate ? format(new Date(timetable.fromDate), 'yyyy-MM-dd') : '',
            toDate: timetable.toDate ? format(new Date(timetable.toDate), 'yyyy-MM-dd') : ''
        });
        setModalMode('edit');
        setCurrentEditId(timetable._id);
        setIsModalOpen(true);
    };

    const handleDeleteBatch = async (id: string) => {
        if (confirm("Are you sure you want to delete this entire batch?")) {
            try {
                const res = await timeTableApi.deleteTimetable(id);
                if (res.ok) {
                    toast.success("Success", { description: "Batch deleted." });
                    fetchTimetables();
                }
            } catch (error) {
                toast.error("Error", { description: "Failed to delete batch." });
            }
        }
    };

    const handleRemovePdf = async (id: string) => {
        if (confirm("Are you sure you want to remove the PDF?")) {
            try {
                const res = await timeTableApi.updateTimetable(id, { pdfUrl: null });
                if (res.ok) {
                    toast.success("Success", { description: "PDF removed." });
                    fetchTimetables();
                }
            } catch (error) {
                toast.error("Error", { description: "Failed to remove PDF." });
            }
        }
    };

    const handleFileUpload = async (event: any, timetableId: string | null) => {
        const file = event.target.files?.[0];
        if (!file || !timetableId) return;
        if (file.type !== 'application/pdf') {
            toast.error("Invalid File", { description: "Please upload a PDF document." });
            return;
        }

        setUploadingId(timetableId as any);
        try {
            const res = await timeTableApi.uploadPdf(file);
            if (res.ok && res.data?.url) {
                const updateRes = await timeTableApi.updateTimetable(timetableId, { pdfUrl: res.data.url });
                if (updateRes.ok) {
                    toast.success("Success", { description: "PDF uploaded successfully." });
                    fetchTimetables();
                }
            } else {
                toast.error("Error", { description: "File upload failed." });
            }
        } catch (error) {
            toast.error("Error", { description: "Server error during upload." });
        } finally {
            setUploadingId(null);
            if (fileInputRef.current) (fileInputRef.current as any).value = '';
        }
    };

    const triggerFileInput = (id: string) => {
        setUploadingId(id as any); // Temporarily store which item is being uploaded
        (fileInputRef.current as any)?.click();
    };

    const handleViewPdf = (url: string) => {
        window.open(url, '_blank');
    };

    const readyCount = timetables.filter((t: any) => t.pdfUrl).length;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-slate-800">Time Table Management</h1>
                    <div className="flex items-end gap-4">
                        <div className="space-y-2">
                            <Label>Select Branch to View</Label>
                            <Select value={selectedBranch || "none"} onValueChange={(val) => setSelectedBranch(val === "none" ? "" : val)}>
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Choose a branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Select Branch</SelectItem>
                                    <SelectItem value="All">All Branches</SelectItem>
                                    {branches.map((b, i) => (
                                        <SelectItem key={i} value={b as string}>{b}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Select Course to View</Label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="All Courses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Courses</SelectItem>
                                    {allCourses.map((c: string, i) => (
                                        <SelectItem key={i} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                    <Button variant="outline" onClick={handleExport} className="gap-2 h-11 px-4 shadow-sm">
                        <Download className="h-5 w-5" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={() => (csvFileInputRef.current as any)?.click()} className="gap-2 h-11 px-4 shadow-sm">
                        <FileUp className="h-5 w-5" />
                        Import
                    </Button>
                    <Button onClick={() => {
                        setModalMode('create');
                        setFormData({ branches: (selectedBranch && selectedBranch !== 'All') ? [selectedBranch] as any : [], courseName: '', batchName: '', fromDate: '', toDate: '' });
                        setIsModalOpen(true);
                    }} className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 shadow-sm">
                        <PlusCircle className="h-5 w-5" />
                        Create Course / Batch
                    </Button>
                </div>
            </div>

            <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={csvFileInputRef}
                onChange={handleImport}
            />

            <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e, uploadingId)}
            />

            {(selectedBranch || (selectedCourse && selectedCourse !== 'All')) && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-4xl font-extrabold text-[#1f2937] mb-2">
                            {selectedBranch === 'All' || !selectedBranch ? 'All Branches' : selectedBranch}
                            {selectedCourse && selectedCourse !== 'All' ? ` - ${selectedCourse}` : ''}
                        </h2>
                        <p className="text-slate-500 font-medium">
                            {readyCount} of {timetables.length} timetables published.
                            Tap a card to upload or replace.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-primary h-8 w-8" /></div>
                    ) : timetables.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-600">No Timetables Found</h3>
                            <p className="text-slate-400">Create a new entry to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-end gap-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label>Bulk Update From Date</Label>
                                        <Input type="date" value={bulkFromDate} onChange={(e) => setBulkFromDate(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bulk Update To Date</Label>
                                        <Input type="date" value={bulkToDate} onChange={(e) => setBulkToDate(e.target.value)} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button onClick={handleBulkUpdateDates} disabled={isBulkUpdating || selectedIds.length === 0} className="gap-2 bg-slate-800 hover:bg-slate-700 text-white">
                                            {isBulkUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CalendarIcon className="w-4 h-4" />}
                                            Update {selectedIds.length} Selected
                                        </Button>
                                        <Button onClick={handleBulkDelete} disabled={isBulkUpdating || selectedIds.length === 0} variant="destructive" className="gap-2">
                                            {isBulkUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            Delete {selectedIds.length} Selected
                                        </Button>
                                    </div>
                                </div>
                            <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                                <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[50px] text-center align-middle">
                                            <div className="flex items-center justify-center">
                                                <Checkbox 
                                                    className="w-5 h-5 border-2 border-slate-400 data-[state=checked]:border-primary"
                                                    checked={timetables.length > 0 && selectedIds.length === timetables.length} 
                                                    onCheckedChange={handleSelectAll} 
                                                    aria-label="Select all"
                                                />
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-bold text-slate-700">Course Name</TableHead>
                                        {(!selectedBranch || selectedBranch === 'All') && (
                                            <TableHead className="font-bold text-slate-700">Branch</TableHead>
                                        )}
                                        <TableHead className="font-bold text-slate-700">Batch Name</TableHead>
                                        <TableHead className="font-bold text-slate-700">Dates</TableHead>
                                        <TableHead className="font-bold text-slate-700">PDF Status</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {timetables.map((t: any) => (
                                        <TableRow key={t._id} className="hover:bg-slate-50/50">
                                            <TableCell className="text-center align-middle">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox 
                                                        className="w-5 h-5 border-2 border-slate-400 data-[state=checked]:border-primary"
                                                        checked={selectedIds.includes(t._id)} 
                                                        onCheckedChange={() => handleSelectOne(t._id)} 
                                                        aria-label="Select row"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-900">{t.courseName}</TableCell>
                                            {(!selectedBranch || selectedBranch === 'All') && (
                                                <TableCell className="text-slate-600 font-medium">{t.branch}</TableCell>
                                            )}
                                            <TableCell className="text-slate-600">{t.batchName}</TableCell>
                                            <TableCell className="text-slate-600">
                                                {format(new Date(t.fromDate), 'dd MMM yyyy')} - {format(new Date(t.toDate), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                {t.pdfUrl ? (
                                                    <div className="inline-flex items-center gap-1 bg-[#e0f2e9] text-[#2e7d32] px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
                                                        READY
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1 bg-[#fff3e0] text-[#e65100] px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#e65100]" />
                                                        AWAITED
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {t.pdfUrl ? (
                                                        <>
                                                            <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => handleViewPdf(t.pdfUrl)}>
                                                                <Eye className="w-4 h-4" /> View
                                                            </Button>
                                                            <Button size="sm" className="gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={() => triggerFileInput(t._id)}>
                                                                {uploadingId === t._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Replace
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="px-2 border-slate-200 text-red-500 hover:bg-red-50" title="Remove PDF" onClick={() => handleRemovePdf(t._id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            className="gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                                                            onClick={() => triggerFileInput(t._id)}
                                                            disabled={uploadingId === t._id}
                                                        >
                                                            {uploadingId === t._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload PDF
                                                        </Button>
                                                    )}
                                                    <div className="w-px h-8 bg-slate-200 mx-1" />
                                                    <Button variant="outline" size="sm" className="px-2 border-slate-200 text-slate-600 hover:bg-slate-50" title="Edit Batch" onClick={() => handleEditClick(t)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="px-2 border-slate-200 text-red-500 hover:bg-red-50" title="Delete Batch" onClick={() => handleDeleteBatch(t._id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    )}
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{modalMode === 'create' ? 'Create Course / Batch Entry' : 'Edit Timetable Entry'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 overflow-visible">
                        <div className="space-y-2">
                            <Label>Select Branches</Label>
                            {modalMode === 'create' ? (
                                <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" aria-expanded={branchOpen} className="w-full justify-between font-normal">
                                            {formData.branches.length > 0 
                                                ? `${formData.branches.length} branch(es) selected` 
                                                : "Search and select branches..."}
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[450px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search branch..." />
                                            <CommandList>
                                                <CommandEmpty>No branch found.</CommandEmpty>
                                                <CommandGroup>
                                                    {branches.length > 0 && (
                                                        <CommandItem
                                                            onSelect={() => {
                                                                if (formData.branches.length === branches.length) {
                                                                    setFormData(prev => ({ ...prev, branches: [] }));
                                                                } else {
                                                                    setFormData(prev => ({ ...prev, branches: [...branches] as any }));
                                                                }
                                                            }}
                                                        >
                                                            <Checkbox 
                                                                checked={formData.branches.length === branches.length && branches.length > 0} 
                                                                className="mr-3" 
                                                            />
                                                            <span className="font-semibold">Select All</span>
                                                        </CommandItem>
                                                    )}
                                                    {branches.map((b: string) => (
                                                        <CommandItem
                                                            key={b}
                                                            onSelect={() => {
                                                                if (formData.branches.includes(b as never)) {
                                                                    setFormData(prev => ({ ...prev, branches: prev.branches.filter((br: string) => br !== b) as any }));
                                                                } else {
                                                                    setFormData(prev => ({ ...prev, branches: [...prev.branches, b as never] as any }));
                                                                }
                                                            }}
                                                        >
                                                            <Checkbox 
                                                                checked={formData.branches.includes(b as never)} 
                                                                className="mr-3" 
                                                            />
                                                            {b}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <div className="p-3 border rounded-md bg-slate-50 text-slate-700 text-sm font-medium">
                                    {formData.branches[0]} <span className="text-slate-400 font-normal ml-2">(Branch cannot be changed in edit mode)</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label>Course Name</Label>
                            <Popover open={courseOpen} onOpenChange={setCourseOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={courseOpen} className="w-full justify-between font-normal text-left">
                                        {formData.courseName || <span className="text-muted-foreground">Search or create course...</span>}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[450px] p-0" align="start">
                                    <Command>
                                        <CommandInput 
                                            placeholder="Search existing course..." 
                                            value={courseSearch}
                                            onValueChange={setCourseSearch}
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                <Button 
                                                    variant="ghost" 
                                                    className="w-full justify-start font-medium text-primary h-auto py-2" 
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, courseName: courseSearch }));
                                                        setCourseOpen(false);
                                                        setCourseSearch('');
                                                    }}
                                                >
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Create "{courseSearch}"
                                                </Button>
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {allCourses.map((c: string) => (
                                                    <CommandItem
                                                        key={c}
                                                        onSelect={() => {
                                                            setFormData(prev => ({ ...prev, courseName: c }));
                                                            setCourseOpen(false);
                                                            setCourseSearch('');
                                                        }}
                                                    >
                                                        <Check className={`mr-2 h-4 w-4 ${formData.courseName === c ? 'opacity-100' : 'opacity-0'}`} />
                                                        {c}
                                                    </CommandItem>
                                                ))}
                                                {courseSearch && !allCourses.some((c: string) => c.toLowerCase() === courseSearch.toLowerCase()) && (
                                                    <CommandItem
                                                        onSelect={() => {
                                                            setFormData(prev => ({ ...prev, courseName: courseSearch }));
                                                            setCourseOpen(false);
                                                            setCourseSearch('');
                                                        }}
                                                        className="text-primary font-medium"
                                                    >
                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                        Create "{courseSearch}"
                                                    </CommandItem>
                                                )}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Batch Name</Label>
                            <Input
                                placeholder="e.g. Group 2 or Jan 27"
                                value={formData.batchName}
                                onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>From Date</Label>
                                <Input
                                    type="date"
                                    value={formData.fromDate}
                                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>To Date</Label>
                                <Input
                                    type="date"
                                    value={formData.toDate}
                                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>{modalMode === 'create' ? 'Create Entries' : 'Save Changes'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

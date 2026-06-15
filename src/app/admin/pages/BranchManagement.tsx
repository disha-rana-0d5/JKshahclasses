import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { landingPageApi, batchApi, categoryApi, levelApi, facultyApi, branchEnquiryApi, placementApi, careerApi } from "../../api/api";
import { toast } from "sonner";
import { Loader2, Save, MapPin, Plus, Trash2, Edit, Type, Layout, Clock, BookOpen, GraduationCap, Laptop, Video, Trash, Landmark, Building, Building2, Castle, Church, Factory, Home, Hotel, Mountain, Store, Trees, University, Warehouse, MapPinned, Globe, Compass, Tent, School, TowerControl } from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ImageUpload } from "../../components/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../components/ui/command";
import { Check, ChevronsUpDown, X, Calendar as CalendarIcon, FileUp, FileDown, Download } from "lucide-react";
import { cn } from "../../components/ui/utils";
import { format } from "date-fns";
import { Calendar } from "../../components/ui/calendar";
import { CitySelectorModal } from "../../components/modals/CitySelectorModal";
import { useCourseContext } from "../context/CourseContext";



export function BranchManagement() {
    const { allCourses, allCategories } = useCourseContext();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState<any>(null);
    const [batches, setBatches] = useState<any[]>([]);
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [placements, setPlacements] = useState<any[]>([]);
    const [careerListings, setCareerListings] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [faculties, setFaculties] = useState<any[]>([]);
    const [batchFormData, setBatchFormData] = useState({
        location: "",
        categories: [] as string[],
        level: "",
        mode: "",
        language: "",
        startDate: "",
        dayTiming: "",
        examAttempt: ""
    });
    const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
    const [editingBranchIdx, setEditingBranchIdx] = useState<number | null>(null);
    const [branchFormData, setBranchFormData] = useState<any>({
        name: "",
        city: "",
        state: "",
        pincode: "",
        address: "",
        phone: "",
        email: "",
        timings: "",
        students: "",
        image: "",
        courses: [],
        faculties: [],
        mapUrl: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: ""
    });
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    const [startTime, setStartTime] = useState("07:00");
    const [endTime, setEndTime] = useState("13:00");
    const [isAddingBatch, setIsAddingBatch] = useState(false);
    const [isSavingBranch, setIsSavingBranch] = useState(false);
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [activeBranchIndex, setActiveBranchIndex] = useState<number | null>(null);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const formRef = useRef<HTMLDivElement>(null);
    const branchFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchContent();
        fetchBatches();
        fetchEnquiries();
        fetchPlacements();
        fetchCareerListings();
        fetchMetadata();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            setBatchFormData(prev => ({ ...prev, startDate: format(selectedDate, "PPP") }));
        }
    }, [selectedDate]);

    useEffect(() => {
        const start = formatTime(startTime);
        const end = formatTime(endTime);
        const days = selectedDays.length === 7 ? "Everyday" : selectedDays.join(", ");
        setBatchFormData(prev => ({ ...prev, dayTiming: `${days} - ${start} to ${end}` }));
    }, [selectedDays, startTime, endTime]);

    const formatTime = (time: string) => {
        if (!time) return "";
        const [hours, minutes] = time.split(':');
        let h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${minutes} ${ampm}`;
    };

    const fetchMetadata = async () => {
        try {
            const [catRes, levelRes, facultyRes] = await Promise.all([
                categoryApi.getCategories(),
                levelApi.getLevels(),
                facultyApi.getFaculties({ limit: 1000 })
            ]);
            if (catRes.ok && catRes.data.success) {
                // Keep categories for other potential uses, but we'll use allCourses for modules
                setCategories(catRes.data.data.filter((c: any) => c.parent));
            }
            if (levelRes.ok && levelRes.data.success) {
                setLevels(levelRes.data.data);
            }
            if (facultyRes.ok && facultyRes.data.success) {
                setFaculties(facultyRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching metadata:", error);
        }
    };


    const fetchBatches = async () => {
        try {
            const { ok, data } = await batchApi.getBatches();
            if (ok && data.success) {
                setBatches(data.data);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const fetchEnquiries = async () => {
        try {
            const { ok, data } = await branchEnquiryApi.getBranchEnquiries();
            if (ok && data.success) {
                setEnquiries(data.data);
            }
        } catch (error) {
            console.error("Error fetching enquiries:", error);
        }
    };

    const fetchPlacements = async () => {
        try {
            const { ok, data } = await placementApi.getAdminPlacements();
            if (ok && data.success) {
                setPlacements(data.data);
            }
        } catch (error) {
            console.error("Error fetching placements:", error);
        }
    };

    const fetchCareerListings = async () => {
        try {
            const { ok, data } = await careerApi.getAdminListings();
            if (ok && data.success) {
                setCareerListings(data.data);
            }
        } catch (error) {
            console.error("Error fetching career listings:", error);
        }
    };

    const fetchContent = async () => {
        try {
            setLoading(true);
            const { ok, data } = await landingPageApi.getLandingContent();
            if (ok && data.success) {
                let fetchedContent = data.data;
                // Initialize default branchPage if missing
                if (!fetchedContent.branchPage) {
                    fetchedContent.branchPage = {
                        header: {
                            badge: "35+ Branches Pan India",
                            title: "Find a Branch Near You",
                            description: "Visit our state-of-the-art learning centers equipped with modern facilities and experienced faculty"
                        },
                        stats: [
                            { value: "35+", label: "Branches Across India" },
                            { value: "50,000+", label: "Active Students" },
                            { value: "450+", label: "Rank Holders" },
                            { value: "98%", label: "Success Rate" }
                        ],
                        cta: {
                            title: "Visit Our Nearest Branch",
                            description: "Experience our world-class infrastructure and meet our expert faculty in person",
                            scheduleBtn: "Schedule a Visit",
                            downloadBtn: "Download Branch List"
                        }
                    };
                }

                // Initialize default branches if missing - REMOVED to keep it dynamic
                if (!fetchedContent.branches) {
                    fetchedContent.branches = [];
                }
                setContent(fetchedContent);
            } else {
                toast.error("Failed to load content");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { ok, data } = await landingPageApi.updateLandingContent(content);
            if (ok && data.success) {
                toast.success("Branch content updated successfully");
                setContent(data.data);
            } else {
                toast.error("Failed to update content");
            }
        } catch (error) {
            toast.error("Error saving content");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (path: string, value: any) => {
        const keys = path.split('.');
        setContent((prev: any) => {
            const newState = { ...prev };
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };

    const updateBranchField = (index: number, field: string, value: any) => {
        setContent((prev: any) => {
            const newBranches = [...(prev.branches || [])];
            newBranches[index] = { ...newBranches[index], [field]: value };
            return { ...prev, branches: newBranches };
        });
    };

    const addBranch = () => {
        setEditingBranchIdx(null);
        setBranchFormData({
            name: "New Branch",
            city: "City",
            state: "",
            pincode: "",
            address: "",
            phone: "",
            email: "",
            timings: "Mon-Sat: 8:00 AM - 8:00 PM",
            students: "",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
            courses: [],
            faculties: [],
            mapUrl: "",
            metaTitle: "",
            metaDescription: "",
            metaKeywords: ""
        });

        setTimeout(() => {
            if (branchFormRef.current) {
                branchFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleEditBranchLoc = (index: number) => {
        const branch = content.branches[index];
        setBranchFormData({ ...branch });
        setEditingBranchIdx(index);

        setTimeout(() => {
            if (branchFormRef.current) {
                branchFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleSaveBranch = async () => {
        if (!branchFormData.name) {
            toast.error("Branch name is required");
            return;
        }

        try {
            setIsSavingBranch(true);
            let updatedBranches = [...(content.branches || [])];

            if (editingBranchIdx !== null) {
                updatedBranches[editingBranchIdx] = branchFormData;
            } else {
                const newId = updatedBranches.length > 0
                    ? Math.max(...updatedBranches.map((b: any) => b.id || 0)) + 1
                    : 1;
                updatedBranches = [{ ...branchFormData, id: newId }, ...updatedBranches];
            }

            const updatedContent = { ...content, branches: updatedBranches };
            const { ok, data } = await landingPageApi.updateLandingContent(updatedContent);

            if (ok && data.success) {
                toast.success(editingBranchIdx !== null ? "Branch updated successfully" : "Branch added successfully");
                setContent(data.data);
                setEditingBranchIdx(null);
                setBranchFormData({
                    name: "",
                    city: "",
                    state: "",
                    pincode: "",
                    address: "",
                    phone: "",
                    email: "",
                    timings: "",
                    students: "",
                    image: "",
                    courses: [],
                    faculties: [],
                    mapUrl: "",
                    metaTitle: "",
                    metaDescription: "",
                    metaKeywords: ""
                });
            } else {
                toast.error("Failed to update branch");
            }
        } catch (error) {
            toast.error("Error saving branch");
        } finally {
            setIsSavingBranch(false);
        }
    };

    const removeBranch = async (index: number) => {
        if (!content.branches || !content.branches[index]) {
            toast.error("Invalid branch index");
            return;
        }

        const branch = content.branches[index];
        const branchBatches = batches.filter(b => b.location === branch.name);
        const branchEnquiries = enquiries.filter(e => e.branchName === branch.name);
        const branchPlacements = placements.filter(p => p.location === branch.name);
        const branchCareers = careerListings.filter(c => c.location === branch.name);

        const hasDependencies = branchBatches.length > 0 ||
            branchEnquiries.length > 0 ||
            branchPlacements.length > 0 ||
            branchCareers.length > 0;

        if (hasDependencies) {
            let message = `Cannot delete "${branch.name}". It has the following associated items:`;
            if (branchBatches.length > 0) message += `\n- ${branchBatches.length} Batches`;
            if (branchEnquiries.length > 0) message += `\n- ${branchEnquiries.length} Enquiries`;
            if (branchPlacements.length > 0) message += `\n- ${branchPlacements.length} Placements`;
            if (branchCareers.length > 0) message += `\n- ${branchCareers.length} Career Listings`;
            message += `\n\nYou must delete or reassign all associated items before removing this branch.`;

            alert(message);
            return;
        }

        if (!confirm(`Are you sure you want to delete the location "${branch.name}"?`)) {
            return;
        }

        const nextBranches = [...content.branches];
        nextBranches.splice(index, 1);
        const nextContent = { ...content, branches: nextBranches };

        try {
            setSaving(true);
            const { ok, data } = await landingPageApi.updateLandingContent(nextContent);
            if (ok && data.success) {
                toast.success(`"${branch.name}" deleted successfully`);
                setContent(data.data);
            } else {
                toast.error("Failed to delete branch from server");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAllBranches = async () => {
        if (!content.branches || content.branches.length === 0) {
            toast.error("No branches to delete");
            return;
        }

        if (!confirm("Are you sure you want to delete ALL branches? This action cannot be undone and may affect associated items if they rely on branch names.")) {
            return;
        }

        try {
            setSaving(true);
            const { ok, data } = await landingPageApi.deleteAllBranches();
            if (ok && data.success) {
                toast.success("All branches deleted successfully");
                setContent(prev => ({ ...prev, branches: [] }));
            } else {
                toast.error(data.message || "Failed to delete all branches");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setSaving(false);
        }
    };

    const handleBatchSubmit = async () => {
        // Validation
        if (batchFormData.categories.length === 0) {
            toast.error("Please select at least one category");
            return;
        }
        if (!batchFormData.level) {
            toast.error("Please select a level");
            return;
        }
        if (!batchFormData.mode) {
            toast.error("Please select a mode");
            return;
        }
        if (!selectedDate || !batchFormData.startDate) {
            toast.error("Please select a start date");
            return;
        }
        if (selectedDays.length === 0) {
            toast.error("Please select at least one day");
            return;
        }
        if (!startTime || !endTime) {
            toast.error("Please select timing");
            return;
        }
        if (!batchFormData.examAttempt) {
            toast.error("Please enter exam attempt");
            return;
        }

        if (batchFormData.mode === "Face to Face" && !batchFormData.location) {
            toast.error("Location is required for Face to Face mode");
            return;
        }

        if (batchFormData.mode === "Live Online" && !batchFormData.language) {
            toast.error("Language is required for Live Online mode");
            return;
        }

        try {
            setIsAddingBatch(true);
            if (editingBatchId) {
                const { ok, data } = await batchApi.updateBatch(editingBatchId, batchFormData);
                if (ok && data.success) {
                    toast.success("Batch updated successfully");
                    setBatches(batches.map(b => b._id === editingBatchId ? data.data : b));
                    setBatchFormData({
                        location: "",
                        categories: [],
                        level: "",
                        mode: "",
                        language: "",
                        startDate: "",
                        dayTiming: "",
                        examAttempt: ""
                    });
                    setSelectedDate(undefined);
                    setEditingBatchId(null);
                } else {
                    toast.error(data.error || "Failed to update batch");
                }
            } else {
                const { ok, data } = await batchApi.addBatch(batchFormData);
                if (ok && data.success) {
                    toast.success("Batch added successfully");
                    setBatches([...batches, data.data]);
                    setBatchFormData({
                        location: "",
                        categories: [],
                        level: "",
                        mode: "",
                        language: "",
                        startDate: "",
                        dayTiming: "",
                        examAttempt: ""
                    });
                    setSelectedDate(undefined);
                } else {
                    toast.error(data.error || "Failed to add batch");
                }
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setIsAddingBatch(false);
        }
    };

    const handleEditBatch = (batch: any) => {
        setBatchFormData({
            location: batch.location || "",
            categories: batch.categories || [],
            level: batch.level || "",
            mode: batch.mode || "",
            language: batch.language || "",
            startDate: batch.startDate || "",
            dayTiming: batch.dayTiming || "",
            examAttempt: batch.examAttempt || ""
        });
        setEditingBatchId(batch._id);
        if (batch.startDate) {
            const cleanedDateStr = batch.startDate.replace(/(\d+)(st|nd|rd|th)/, '$1');
            const d = new Date(cleanedDateStr);
            if (!isNaN(d.getTime())) {
                setSelectedDate(d);
            } else {
                setSelectedDate(undefined);
            }
        } else {
            setSelectedDate(undefined);
        }

        if (batch.dayTiming) {
            // "Mon, Tue - 5:00 PM to 7:00 PM" -> parse
            const parts = batch.dayTiming.split(" - ");
            if (parts.length === 2) {
                const daysStr = parts[0];
                const timeStr = parts[1];
                if (daysStr === "Everyday") {
                    setSelectedDays(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
                } else {
                    setSelectedDays(daysStr.split(", "));
                }

                const times = timeStr.split(" to ");
                if (times.length === 2) {
                    // Convert AM/PM back to 24h for input type="time"
                    const parseTime = (tString: string) => {
                        const [time, modifier] = tString.split(' ');
                        let [hours, minutes] = time.split(':');
                        if (hours === '12') {
                            hours = '00';
                        }
                        if (modifier === 'PM') {
                            hours = parseInt(hours, 10) + 12 + '';
                        }
                        return `${hours.padStart(2, '0')}:${minutes}`;
                    };
                    setStartTime(parseTime(times[0]));
                    setEndTime(parseTime(times[1]));
                }
            }
        }

        // Scroll to the form
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleDeleteBatch = async (id: string) => {
        if (!confirm("Are you sure you want to delete this batch?")) return;
        try {
            const { ok, data } = await batchApi.deleteBatch(id);
            if (ok && data.success) {
                toast.success("Batch deleted");
                setBatches(batches.filter(b => b._id !== id));
            } else {
                toast.error("Failed to delete batch");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        }
    };

    const handleExport = async () => {
        try {
            const { ok, data } = await landingPageApi.exportBranches();
            if (ok && data) {
                const url = window.URL.createObjectURL(data);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'branches_export.csv';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                toast.success("Branches exported successfully");
            } else {
                toast.error("Failed to export branches");
            }
        } catch (error) {
            toast.error("Error exporting branches");
        }
    };

    const handleBulkUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file first");
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setIsUploading(true);
        try {
            const { ok, data } = await landingPageApi.bulkUploadBranches(formData);
            if (ok && data.success) {
                toast.success(data.message || "Bulk upload successful");
                setIsBulkDialogOpen(false);
                setSelectedFile(null);
                fetchContent(); // Refresh data
            } else {
                toast.error(data.message || "Failed to upload branches");
                if (data.errors && data.errors.length > 0) {
                    console.error("Bulk upload errors:", data.errors);
                    toast.error(`First error: ${data.errors[0]}`);
                }
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setIsUploading(false);
        }
    };

    const downloadSampleTemplate = () => {
        const headers = "id,name,city,state,address,pincode,phone,email,timings,students,courses,facilities,faculties,image,mapUrl\n";
        const sample = "0,Sample Branch,Mumbai,Maharashtra,123 Main St,400001,+91 1234567890,info@example.com,9AM-6PM,500+,Course A;Course B,AC;Library,Faculty A;Faculty B,https://example.com/image.jpg,https://maps.google.com/?q=sample\n";
        const blob = new Blob([headers + sample], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'branches_template.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {

        return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!content) return null;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Branch Management</h2>
                    <p className="text-muted-foreground">Manage branch page content and locations.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                    <TabsTrigger value="content" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Page Content</TabsTrigger>
                    <TabsTrigger value="locations" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Locations</TabsTrigger>
                    <TabsTrigger value="batches" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Batch Management</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6 mt-6">
                    {/* Header Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Type className="h-5 w-5 text-primary" />
                            <CardTitle>Header Section</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Badge Text</Label>
                                <Input
                                    value={content.branchPage?.header?.badge}
                                    onChange={(e) => updateField('branchPage.header.badge', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Main Title</Label>
                                <Input
                                    value={content.branchPage?.header?.title}
                                    onChange={(e) => updateField('branchPage.header.title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={content.branchPage?.header?.description}
                                    onChange={(e) => updateField('branchPage.header.description', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Layout className="h-5 w-5 text-primary" />
                            <CardTitle>Display Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            {content.branchPage?.stats?.map((stat: any, idx: number) => (
                                <div key={idx} className="space-y-2 p-3 border rounded bg-muted/20">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Value</Label>
                                        <Input
                                            value={stat.value}
                                            onChange={(e) => updateField(`branchPage.stats.${idx}.value`, e.target.value)}
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Label</Label>
                                        <Input
                                            value={stat.label}
                                            onChange={(e) => updateField(`branchPage.stats.${idx}.label`, e.target.value)}
                                            className="h-8"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* CTA Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Layout className="h-5 w-5 text-primary" />
                            <CardTitle>Bottom CTA</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={content.branchPage?.cta?.title}
                                    onChange={(e) => updateField('branchPage.cta.title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={content.branchPage?.cta?.description}
                                    onChange={(e) => updateField('branchPage.cta.description', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Schedule Button</Label>
                                    <Input
                                        value={content.branchPage?.cta?.scheduleBtn}
                                        onChange={(e) => updateField('branchPage.cta.scheduleBtn', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Download Button</Label>
                                    <Input
                                        value={content.branchPage?.cta?.downloadBtn}
                                        onChange={(e) => updateField('branchPage.cta.downloadBtn', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="locations" className="space-y-6 mt-6">
                    <div className="flex justify-end mb-4 gap-2">
                        <Button onClick={addBranch} variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Branch
                        </Button>
                    </div>

                    <Card>
                        <CardHeader ref={branchFormRef}>
                            <CardTitle>{editingBranchIdx !== null ? `Edit Branch: ${branchFormData.name}` : "Add New Branch"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Branch Name</Label>
                                    <Input
                                        value={branchFormData.name}
                                        onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                        onClick={() => {
                                            setActiveBranchIndex(-1); // Use -1 or special flag to indicate we're updating branchFormData
                                            setIsCityModalOpen(true);
                                        }}
                                    >
                                        {branchFormData.city || "Select City..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input
                                        value={branchFormData.state}
                                        onChange={(e) => setBranchFormData({ ...branchFormData, state: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pincode</Label>
                                    <Input
                                        value={branchFormData.pincode}
                                        onChange={(e) => setBranchFormData({ ...branchFormData, pincode: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Full Address</Label>
                                    <Input
                                        value={branchFormData.address}
                                        onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={branchFormData.phone}
                                        onChange={(e) => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={branchFormData.email}
                                        onChange={(e) => setBranchFormData({ ...branchFormData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Timings</Label>
                                    <Input
                                        value={branchFormData.timings}
                                        onChange={(e) => setBranchFormData({ ...branchFormData, timings: e.target.value })}
                                        placeholder="e.g. Mon-Sat: 8:00 AM - 8:00 PM"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Students Count</Label>
                                    <Input
                                        value={branchFormData.students}
                                        onChange={(e) => setBranchFormData({ ...branchFormData, students: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Google Maps URL</Label>
                                    <Input
                                        value={branchFormData.mapUrl}
                                        onChange={(e) => setBranchFormData({ ...branchFormData, mapUrl: e.target.value })}
                                        placeholder="Paste Google Maps URL or iframe here"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <ImageUpload
                                        label="Branch Image"
                                        value={branchFormData.image || ""}
                                        onChange={(url) => setBranchFormData({ ...branchFormData, image: url })}
                                        recommendedDimensions="800 x 600 px (4:3)"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Category & Sub Category</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between h-auto min-h-[44px] px-3 py-2 text-left font-normal border-slate-200"
                                            >
                                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                    {(branchFormData.courses && branchFormData.courses.length > 0) ? (
                                                        branchFormData.courses.map((course: string) => (
                                                            <Badge key={course} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 bg-primary/5 text-primary border-primary/10">
                                                                <span className="text-[11px] font-medium">{course}</span>
                                                                <span
                                                                    className="ml-1 p-0.5 cursor-pointer hover:bg-primary/20 rounded-full transition-colors flex items-center justify-center"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setBranchFormData({
                                                                            ...branchFormData,
                                                                            courses: branchFormData.courses.filter((c: string) => c !== course)
                                                                        });
                                                                    }}
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </span>
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground">Select categories...</span>
                                                    )}
                                                </div>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search categories..." />
                                                <CommandList>
                                                    <CommandEmpty>No categories found.</CommandEmpty>
                                                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                                                        {allCategories.map((cat: any) => (
                                                            <CommandItem
                                                                key={cat._id}
                                                                onSelect={() => {
                                                                    const current = branchFormData.courses || [];
                                                                    const name = cat.name;
                                                                    const next = current.includes(name)
                                                                        ? current.filter((c: string) => c !== name)
                                                                        : [...current, name];
                                                                    setBranchFormData({ ...branchFormData, courses: next });
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        (branchFormData.courses || []).includes(cat.name) ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {cat.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Available Faculties</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between h-auto min-h-[44px] px-3 py-2 text-left font-normal border-slate-200"
                                            >
                                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                    {(branchFormData.faculties && branchFormData.faculties.length > 0) ? (
                                                        branchFormData.faculties.map((faculty: string) => (
                                                            <Badge key={faculty} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 bg-primary/5 text-primary border-primary/10">
                                                                <span className="text-[11px] font-medium">{faculty}</span>
                                                                <span
                                                                    className="ml-1 p-0.5 cursor-pointer hover:bg-primary/20 rounded-full transition-colors flex items-center justify-center"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setBranchFormData({
                                                                            ...branchFormData,
                                                                            faculties: branchFormData.faculties.filter((f: string) => f !== faculty)
                                                                        });
                                                                    }}
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </span>
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground">Select faculties...</span>
                                                    )}
                                                </div>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search faculties..." />
                                                <CommandList>
                                                    <CommandEmpty>No faculties found.</CommandEmpty>
                                                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                                                        {faculties.map((f: any) => (
                                                            <CommandItem
                                                                key={f._id}
                                                                onSelect={() => {
                                                                    const current = branchFormData.faculties || [];
                                                                    const updated = current.includes(f.name)
                                                                        ? current.filter((fac: string) => fac !== f.name)
                                                                        : [...current, f.name];
                                                                    setBranchFormData({ ...branchFormData, faculties: updated });
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={(branchFormData.faculties || []).includes(f.name)}
                                                                    className="mr-2"
                                                                />
                                                                {f.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-primary" />
                                    SEO Meta Tags
                                </Label>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs">Meta Title</Label>
                                        <Input
                                            value={branchFormData.metaTitle || ""}
                                            onChange={(e) => setBranchFormData({ ...branchFormData, metaTitle: e.target.value })}
                                            placeholder="e.g. CA Coaching in Andheri | JK Shah Classes"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Meta Description</Label>
                                        <Textarea
                                            value={branchFormData.metaDescription || ""}
                                            onChange={(e) => setBranchFormData({ ...branchFormData, metaDescription: e.target.value })}
                                            placeholder="Brief description for search results..."
                                            className="h-20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Meta Keywords</Label>
                                        <Textarea
                                            value={branchFormData.metaKeywords || ""}
                                            onChange={(e) => setBranchFormData({ ...branchFormData, metaKeywords: e.target.value })}
                                            placeholder="Keyword 1, Keyword 2, ..."
                                            className="h-20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 mt-2 border-t">
                                {editingBranchIdx !== null && (
                                    <Button variant="outline" onClick={() => {
                                        setEditingBranchIdx(null);
                                        setBranchFormData({
                                            name: "", city: "", state: "", pincode: "", address: "", phone: "", email: "", timings: "", students: "", image: "", courses: [], faculties: [], mapUrl: "", metaTitle: "", metaDescription: "", metaKeywords: ""
                                        });
                                    }}>
                                        Cancel
                                    </Button>
                                )}
                                <Button onClick={handleSaveBranch} disabled={isSavingBranch}>
                                    {isSavingBranch && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    {editingBranchIdx !== null ? "Update Branch" : "Save Branch"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Existing Locations</CardTitle>
                            <div className="flex gap-2">
                                {content.branches && content.branches.length > 0 && (
                                    <Button variant="destructive" size="sm" onClick={handleDeleteAllBranches}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete All Branches
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => setIsBulkDialogOpen(true)}>
                                    <FileUp className="mr-2 h-4 w-4" /> Bulk Upload
                                </Button>
                                <Button onClick={addBranch} variant="outline" size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Branch
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Branch Name</TableHead>
                                            <TableHead>City & State</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Modules</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {content.branches && content.branches.length > 0 ? (
                                            content.branches.map((branch: any, index: number) => (
                                                <TableRow key={branch.id || index}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-primary" />
                                                            {branch.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{branch.city}, {branch.state}</TableCell>
                                                    <TableCell>
                                                        <div className="text-xs">
                                                            <div>{branch.phone}</div>
                                                            <div className="text-muted-foreground">{branch.email}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(branch.courses || branch.facilities || []).slice(0, 2).map((c: string) => (
                                                                <Badge key={c} variant="outline" className="text-[10px] py-0">{c}</Badge>
                                                            ))}
                                                            {(branch.courses || branch.facilities || []).length > 2 && (
                                                                <Badge variant="outline" className="text-[10px] py-0">+{(branch.courses || branch.facilities || []).length - 2}</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                                onClick={() => handleEditBranchLoc(index)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            {(() => {
                                                                const branchBatches = batches.filter(b => b.location === branch.name);
                                                                const branchEnquiries = enquiries.filter(e => e.branchName === branch.name);
                                                                const branchPlacements = placements.filter(p => p.location === branch.name);
                                                                const branchCareers = careerListings.filter(c => c.location === branch.name);
                                                                const hasDeps = branchBatches.length > 0 || branchEnquiries.length > 0 || branchPlacements.length > 0 || branchCareers.length > 0;

                                                                return (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className={cn("h-8 w-8 p-0", hasDeps ? "text-muted-foreground cursor-not-allowed opacity-50" : "text-destructive hover:text-destructive hover:bg-red-50")}
                                                                        onClick={() => !hasDeps && removeBranch(index)}
                                                                        disabled={hasDeps}
                                                                        title={hasDeps ? "Cannot delete branch with associated items" : "Delete Branch"}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                );
                                                            })()}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                    No branches found. Add your first branch.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent >
                <TabsContent value="batches" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader ref={formRef}>
                            <CardTitle>{editingBatchId ? "Edit Batch" : "Add New Batch"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Mode <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={batchFormData.mode}
                                        onValueChange={(v) => setBatchFormData({ ...batchFormData, mode: v, location: v !== "Face to Face" ? "" : batchFormData.location, language: v !== "Live Online" ? "" : batchFormData.language })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Face to Face">Face to Face</SelectItem>
                                            <SelectItem value="Live Online">Live Online</SelectItem>
                                            <SelectItem value="Recorded">Recorded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Location {batchFormData.mode === "Face to Face" && <span className="text-red-500">*</span>}</Label>
                                    <Select
                                        value={batchFormData.location}
                                        onValueChange={(v) => setBatchFormData({ ...batchFormData, location: v })}
                                        disabled={batchFormData.mode !== "Face to Face"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {content.branches?.map((b: any) => (
                                                <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {batchFormData.mode === "Live Online" && (
                                    <div className="space-y-2">
                                        <Label>Language <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={batchFormData.language}
                                            onValueChange={(v) => setBatchFormData({ ...batchFormData, language: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="English">English</SelectItem>
                                                <SelectItem value="Hindi">Hindi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Course Categories <span className="text-red-500">*</span></Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between h-auto min-h-[40px] px-3 py-2 text-left font-normal"
                                            >
                                                <div className="flex flex-wrap gap-1">
                                                    {batchFormData.categories.length > 0 ? (
                                                        batchFormData.categories.map((cat) => (
                                                            <Badge key={cat} variant="secondary" className="mr-1">
                                                                {cat}
                                                                <X
                                                                    className="ml-1 h-3 w-3 cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setBatchFormData({
                                                                            ...batchFormData,
                                                                            categories: batchFormData.categories.filter(c => c !== cat)
                                                                        });
                                                                    }}
                                                                />
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground">Select Categories</span>
                                                    )}
                                                </div>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search categories..." />
                                                <CommandList>
                                                    <CommandEmpty>No category found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {categories.map((c: any) => (
                                                            <CommandItem
                                                                key={c._id}
                                                                onSelect={() => {
                                                                    const updated = batchFormData.categories.includes(c.name)
                                                                        ? batchFormData.categories.filter(cat => cat !== c.name)
                                                                        : [...batchFormData.categories, c.name];
                                                                    setBatchFormData({ ...batchFormData, categories: updated });
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={batchFormData.categories.includes(c.name)}
                                                                    className="mr-2"
                                                                />
                                                                {c.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Level <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={batchFormData.level}
                                        onValueChange={(v) => setBatchFormData({ ...batchFormData, level: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {levels.map((l: any) => (
                                                <SelectItem key={l._id} value={l.name}>{l.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Start Date <span className="text-red-500">*</span></Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !selectedDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Days <span className="text-red-500">*</span></Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between h-auto min-h-[40px] px-3 py-2 text-left font-normal"
                                            >
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedDays.length > 0 ? (
                                                        selectedDays.map((day) => (
                                                            <Badge key={day} variant="secondary" className="px-1 text-[10px]">
                                                                {day}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground">Select Days</span>
                                                    )}
                                                </div>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0" align="start">
                                            <Command>
                                                <CommandList>
                                                    <CommandGroup>
                                                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                                            <CommandItem
                                                                key={day}
                                                                onSelect={() => {
                                                                    const updated = selectedDays.includes(day)
                                                                        ? selectedDays.filter(d => d !== day)
                                                                        : [...selectedDays, day];
                                                                    // Sort days in correct order
                                                                    const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                                                                    updated.sort((a, b) => order.indexOf(a) - order.indexOf(b));
                                                                    setSelectedDays(updated);
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={selectedDays.includes(day)}
                                                                    className="mr-2"
                                                                />
                                                                {day}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Timing <span className="text-red-500">*</span></Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="h-10"
                                        />
                                        <span className="text-muted-foreground">to</span>
                                        <Input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="h-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Exam Attempt <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="e.g. May / Nov 2025"
                                        value={batchFormData.examAttempt}
                                        onChange={(e) => setBatchFormData({ ...batchFormData, examAttempt: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-bottom items-end">
                                    <Button onClick={handleBatchSubmit} disabled={isAddingBatch} className="w-full">
                                        {isAddingBatch ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingBatchId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                                        {editingBatchId ? "Save Changes" : "Add Batch"}
                                    </Button>
                                    {editingBatchId && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setEditingBatchId(null);
                                                setBatchFormData({
                                                    location: "",
                                                    categories: [],
                                                    level: "",
                                                    mode: "",
                                                    language: "",
                                                    startDate: "",
                                                    dayTiming: "",
                                                    examAttempt: ""
                                                });
                                                setSelectedDate(undefined);
                                            }}
                                            className="w-full mt-2"
                                            disabled={isAddingBatch}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Existing Batches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>Categories</TableHead>
                                            <TableHead>Day & Timing</TableHead>
                                            <TableHead>Mode</TableHead>
                                            <TableHead>Exam Attempt</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {batches.length > 0 ? (
                                            batches.map((batch) => (
                                                <TableRow key={batch._id}>
                                                    <TableCell className="font-medium">{batch.startDate}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {batch.categories?.map((cat: string) => (
                                                                <Badge key={cat} variant="outline" className="text-[10px] py-0">{cat}</Badge>
                                                            ))}
                                                            {!batch.categories && batch.category && (
                                                                <Badge variant="outline" className="text-[10px] py-0">{batch.category}</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{batch.dayTiming}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {batch.mode === "Face to Face" ? <GraduationCap className="h-4 w-4" /> :
                                                                batch.mode === "Live Online" ? <Laptop className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                                                            {batch.mode}
                                                            {batch.location && <span className="text-xs text-muted-foreground">({batch.location})</span>}
                                                            {batch.language && <span className="text-xs text-muted-foreground ml-1">- {batch.language}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{batch.examAttempt}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 mr-2"
                                                            onClick={() => handleEditBatch(batch)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => handleDeleteBatch(batch._id)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No batches found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs >

            <CitySelectorModal
                isOpen={isCityModalOpen}
                onClose={() => setIsCityModalOpen(false)}
                onSelect={(selected) => {
                    if (activeBranchIndex === -1) {
                        setBranchFormData({ ...branchFormData, city: selected.name, state: selected.state });
                    } else if (activeBranchIndex !== null) {
                        updateBranchField(activeBranchIndex, 'city', selected.name);
                        updateBranchField(activeBranchIndex, 'state', selected.state);
                    }
                }}
                currentCity={activeBranchIndex === -1 ? branchFormData.city : (activeBranchIndex !== null ? content.branches[activeBranchIndex].city : "")}
            />
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Bulk Branch Management</DialogTitle>
                        <DialogDescription>
                            Upload a CSV file to add or update branches in bulk.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                <div className="space-y-0.5">
                                    <h4 className="font-medium">1. Prepare your data</h4>
                                    <p className="text-sm text-muted-foreground">Download the template or export current data.</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={downloadSampleTemplate}>
                                        <Download className="h-4 w-4 mr-2" /> Template
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleExport}>
                                        <FileDown className="h-4 w-4 mr-2" /> Export
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>2. Upload CSV File</Label>
                                <Input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="cursor-pointer"
                                />
                                <p className="text-[11px] text-muted-foreground bg-blue-50 p-2 rounded border border-blue-100 italic">
                                    * Use <b>semicolon (;)</b> to separate multiple values in courses, facilities, and faculties columns.
                                    <br />* Keep <b>id</b> as 0 for new branches, or use existing IDs to update records.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkUpload} disabled={!selectedFile || isUploading}>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                            Upload Branches
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

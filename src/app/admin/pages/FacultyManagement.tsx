import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";

import { Plus, Pencil, Trash2, Search, MoreHorizontal, Filter, Save, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

import { facultyApi, landingPageApi, categoryApi } from "../../api/api";
import { toast } from "sonner";
import { ImageUpload } from "../../components/ImageUpload";
import { Pagination } from "../components/Pagination";
import { useCallback } from "react";

interface Faculty {
    _id?: string;
    id?: number;
    name: string;
    designation: string;
    expertise: string;
    experience: number;
    rating: string;
    totalStudents: string;
    coursesTaught: string[];
    image: string;
    specialization: string;
    qualifications: string[];
    tagline: string;
    achievements: string[];
}

export function FacultyManagement() {
    const [facultyList, setFacultyList] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
    const [formData, setFormData] = useState<Partial<Faculty>>({
        name: "",
        designation: "",
        expertise: "",
        experience: 0,
        rating: "5.0",
        totalStudents: "",
        coursesTaught: [],
        image: "/uploads/placeholder.png",
        specialization: "",
        qualifications: [],
        tagline: "",
        achievements: []
    });

    // Helper to join array fields for inputs
    const [arrayInputs, setArrayInputs] = useState({
        coursesTaught: "",
        qualifications: "",
        achievements: ""
    });

    // Page Content Content State
    const [contentLoading, setContentLoading] = useState(true);
    const [contentSaving, setContentSaving] = useState(false);
    const [pageContent, setPageContent] = useState<any>(null);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [specializationFilter, setSpecializationFilter] = useState("All");

    // Course Categories State (for Expertise mapping)
    const [courseCategories, setCourseCategories] = useState<{ _id: string, name: string }[]>([]);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const resetFilters = () => {
        setSearchQuery("");
        setSpecializationFilter("All");
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const fetchPageContent = async () => {
        try {
            setContentLoading(true);
            const { ok, data } = await landingPageApi.getLandingContent();
            if (ok && data.success) {
                let fetchedContent = data.data;
                // Initialize default sections if missing
                if (!fetchedContent.facultySection) {
                    fetchedContent.facultySection = { title: 'Expert Faculty', subtitle: 'Learn from industry leaders' };
                }
                if (!fetchedContent.facultyPage) {
                    fetchedContent.facultyPage = {
                        header: {
                            badge: "World-Class Faculty",
                            titleLine1: "Learn from the",
                            titleHighlight: "Best Minds",
                            description: "Meet the educators who've mentored 50,000+ successful professionals across India. Their expertise is your advantage."
                        },
                        stats: [
                            { iconName: "GraduationCap", value: "100+", label: "Expert Faculty", sublabel: "Across all programs" },
                            { iconName: "Users", value: "50,000+", label: "Students Mentored", sublabel: "Pan India reach" },
                            { iconName: "Trophy", value: "1,850+", label: "Top Rankers", sublabel: "All India ranks" },
                            { iconName: "TrendingUp", value: "98%", label: "Success Rate", sublabel: "Industry leading" }
                        ],
                        cta: {
                            title: "Ready to Learn from the Best?",
                            description: "Book a free consultation with our faculty and discover your path to success",
                            demoBtnText: "Book Free Demo Class",
                            interviewBtnText: "Watch Faculty Interviews"
                        },
                        trustIndicators: [
                            { iconName: "CheckCircle2", text: "100% Expert Faculty" },
                            { iconName: "Award", text: "Industry Certified" },
                            { iconName: "Target", text: "Result-Oriented Teaching" }
                        ]
                    };
                }
                setPageContent(fetchedContent);
            }
        } catch (error) {
            toast.error("Failed to load page content");
        } finally {
            setContentLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { ok, data } = await categoryApi.getCategories({ limit: 100 });
            if (ok && data.success) {
                // Filter to subcategories only as primary course paths
                const subCategories = data.data.filter((c: any) => c.parent);
                setCourseCategories(subCategories);
            }
        } catch (error) {
            console.error("Failed to load categories for faculty expertise:", error);
        }
    };

    const handleSaveContent = async () => {
        try {
            setContentSaving(true);
            const { ok, data } = await landingPageApi.updateLandingContent(pageContent);
            if (ok && data.success) {
                toast.success("Page content updated successfully");
                setPageContent(data.data);
            } else {
                toast.error(data?.message || "Failed to update page content");
            }
        } catch (error: any) {
            toast.error(error.message || "Error saving page content");
        } finally {
            setContentSaving(false);
        }
    };

    const updateContentField = (path: string, value: any) => {
        const keys = path.split('.');
        setPageContent((prev: any) => {
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

    const fetchFaculties = async () => {
        setIsLoading(true);
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
            };

            const filter: any = {};
            if (specializationFilter !== "All") filter.specialization = specializationFilter;

            if (Object.keys(filter).length > 0) {
                params.filter = JSON.stringify(filter);
            }

            const { ok, data } = await facultyApi.getFaculties(params);
            if (ok && data.success) {
                setFacultyList(data.data || []);
                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.pagination.total || 0,
                        pages: data.pagination.pages || 0
                    }));
                }
            } else {
                toast.error(data?.message || "Failed to fetch faculties");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to fetch faculties");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFaculties();
        }, 300);
        return () => clearTimeout(timer);
    }, [pagination.page, pagination.limit, searchQuery, specializationFilter]);

    useEffect(() => {
        fetchPageContent();
        fetchCategories();
    }, []);

    const handleOpenAdd = () => {
        setEditingFaculty(null);
        setFormData({
            name: "", designation: "", expertise: courseCategories[0]?.name || "Accounts", experience: 0, rating: "5.0",
            totalStudents: "", coursesTaught: [], image: "/uploads/placeholder.png", specialization: "",
            qualifications: [], tagline: "", achievements: []
        });
        setArrayInputs({ coursesTaught: "", qualifications: "", achievements: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (faculty: Faculty) => {
        setEditingFaculty(faculty);
        setFormData({ ...faculty });
        setArrayInputs({
            coursesTaught: Array.isArray(faculty.coursesTaught) ? faculty.coursesTaught.join(", ") : "",
            qualifications: Array.isArray(faculty.qualifications) ? faculty.qualifications.join(", ") : "",
            achievements: Array.isArray(faculty.achievements) ? faculty.achievements.join(", ") : ""
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this faculty member?")) {
            try {
                const { ok, data } = await facultyApi.deleteFaculty(id);
                if (ok && data.success) {
                    toast.success("Faculty deleted successfully");
                    fetchFaculties();
                } else {
                    toast.error(data?.message || "Failed to delete faculty");
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to delete faculty");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalData = {
            ...formData,
            experience: Number(formData.experience),
            coursesTaught: arrayInputs.coursesTaught.split(",").map(s => s.trim()).filter(Boolean),
            qualifications: arrayInputs.qualifications.split(",").map(s => s.trim()).filter(Boolean),
            achievements: arrayInputs.achievements.split(",").map(s => s.trim()).filter(Boolean),
            image: formData.image
        };

        try {
            if (editingFaculty && editingFaculty._id) {
                const { ok, data } = await facultyApi.updateFaculty(editingFaculty._id, finalData);
                if (ok && data.success) {
                    toast.success("Faculty updated successfully");
                    fetchFaculties();
                    setIsDialogOpen(false);
                } else {
                    toast.error(data?.message || "Failed to update faculty");
                }
            } else {
                const { ok, data } = await facultyApi.addFaculty(finalData);
                if (ok && data.success) {
                    toast.success("Faculty added successfully");
                    fetchFaculties();
                    setIsDialogOpen(false);
                } else {
                    toast.error(data?.message || "Failed to add faculty");
                }
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Faculty Management</h2>
                    <p className="text-muted-foreground">Manage faculty section content and teaching staff.</p>
                </div>
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="list" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Faculty Members</TabsTrigger>
                    <TabsTrigger value="content" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Page Content</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4 mt-6">
                    <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-4">
                        <div className="relative flex-1 w-full md:max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search faculty..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">

                            <Button onClick={handleOpenAdd}>
                                <Plus className="mr-2 h-4 w-4" /> Add Faculty
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border border-border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Photo</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Qualification</TableHead>
                                    <TableHead>Specialization</TableHead>
                                    <TableHead>Experience</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Loading faculty...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : facultyList.length > 0 ? (
                                    facultyList.map((faculty) => (
                                        <TableRow key={faculty._id}>
                                            <TableCell>
                                                <Avatar>
                                                    <AvatarImage src={faculty.image} />
                                                    <AvatarFallback>{faculty.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">{faculty.name}</TableCell>
                                            <TableCell>{faculty.qualifications?.join(", ")}</TableCell>
                                            <TableCell>{faculty.specialization}</TableCell>
                                            <TableCell>{faculty.experience}Y</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleOpenEdit(faculty)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => faculty._id && handleDelete(faculty._id)} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No faculty found.
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
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-6 pb-12">
                    {pageContent && (
                        <>
                            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border border-border sticky top-0 z-10 backdrop-blur-sm">
                                <p className="text-sm font-medium text-muted-foreground">Editing Faculty Page & CMS Content</p>
                                <Button onClick={handleSaveContent} disabled={contentSaving} size="sm">
                                    {contentSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Save All Changes
                                </Button>
                            </div>

                            {/* Section Header (Landing Page Preview) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Landing Page Section Header</CardTitle>
                                    <p className="text-sm text-muted-foreground">These titles appear on the main landing page faculty preview.</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Section Title</Label>
                                            <Input
                                                value={pageContent.facultySection?.title}
                                                onChange={(e) => updateContentField('facultySection.title', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Section Subtitle</Label>
                                            <Input
                                                value={pageContent.facultySection?.subtitle}
                                                onChange={(e) => updateContentField('facultySection.subtitle', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Faculty Page Hero */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Faculty Showroom Header (Public Page)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Badge Text</Label>
                                            <Input
                                                value={pageContent.facultyPage?.header?.badge}
                                                onChange={(e) => updateContentField('facultyPage.header.badge', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Title Line 1</Label>
                                            <Input
                                                value={pageContent.facultyPage?.header?.titleLine1}
                                                onChange={(e) => updateContentField('facultyPage.header.titleLine1', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Highlighted Text</Label>
                                            <Input
                                                value={pageContent.facultyPage?.header?.titleHighlight}
                                                onChange={(e) => updateContentField('facultyPage.header.titleHighlight', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Hero Description</Label>
                                            <Input
                                                value={pageContent.facultyPage?.header?.description}
                                                onChange={(e) => updateContentField('facultyPage.header.description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Faculty Page Stats Banner */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Stats Banner</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {pageContent.facultyPage?.stats?.map((stat: any, index: number) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-border rounded-lg bg-muted/10">
                                            <div className="space-y-2">
                                                <Label>Icon Name</Label>
                                                <Input
                                                    value={stat.iconName}
                                                    onChange={(e) => updateContentField(`facultyPage.stats.${index}.iconName`, e.target.value)}
                                                    placeholder="GraduationCap, Users, Trophy..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Value</Label>
                                                <Input
                                                    value={stat.value}
                                                    onChange={(e) => updateContentField(`facultyPage.stats.${index}.value`, e.target.value)}
                                                    placeholder="100+"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Label</Label>
                                                <Input
                                                    value={stat.label}
                                                    onChange={(e) => updateContentField(`facultyPage.stats.${index}.label`, e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Sublabel</Label>
                                                <Input
                                                    value={stat.sublabel}
                                                    onChange={(e) => updateContentField(`facultyPage.stats.${index}.sublabel`, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Faculty Page CTA */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Bottom CTA Section</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>CTA Title</Label>
                                            <Input
                                                value={pageContent.facultyPage?.cta?.title}
                                                onChange={(e) => updateContentField('facultyPage.cta.title', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>CTA Description</Label>
                                            <Input
                                                value={pageContent.facultyPage?.cta?.description}
                                                onChange={(e) => updateContentField('facultyPage.cta.description', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Demo Button Text</Label>
                                            <Input
                                                value={pageContent.facultyPage?.cta?.demoBtnText}
                                                onChange={(e) => updateContentField('facultyPage.cta.demoBtnText', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Interview Button Text</Label>
                                            <Input
                                                value={pageContent.facultyPage?.cta?.interviewBtnText}
                                                onChange={(e) => updateContentField('facultyPage.cta.interviewBtnText', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trust Indicators */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Trust Indicators</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {pageContent.facultyPage?.trustIndicators?.map((item: any, index: number) => (
                                        <div key={index} className="space-y-2 p-3 border border-border rounded bg-muted/10">
                                            <Label>Indicator {index + 1} Text</Label>
                                            <Input
                                                value={item.text}
                                                onChange={(e) => updateContentField(`facultyPage.trustIndicators.${index}.text`, e.target.value)}
                                            />
                                            <div className="mt-2">
                                                <Label className="text-[10px]">Icon (CheckCircle2, Award, Target)</Label>
                                                <Input
                                                    value={item.iconName}
                                                    className="h-7 text-xs"
                                                    onChange={(e) => updateContentField(`facultyPage.trustIndicators.${index}.iconName`, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </>
                    )}
                    {contentLoading && (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle>{editingFaculty ? "Edit Faculty" : "Add New Faculty"}</DialogTitle>
                        <DialogDescription>
                            Enter faculty details below. All fields are required for the showcase.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6">
                        <form id="faculty-form" onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="designation">Designation</Label>
                                    <Input
                                        id="designation"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        placeholder="e.g. Senior Faculty"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expertise">Primary Course / Category</Label>
                                    <Select
                                        value={formData.expertise}
                                        onValueChange={(value) => setFormData({ ...formData, expertise: value })}
                                    >
                                        <SelectTrigger id="expertise">
                                            <SelectValue placeholder="Select primary course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courseCategories.length > 0 ? (
                                                courseCategories.map(cat => (
                                                    <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                                                ))
                                            ) : (
                                                <>
                                                    <SelectItem value="Accounts">Accounts</SelectItem>
                                                    <SelectItem value="Law">Law</SelectItem>
                                                    <SelectItem value="Tax">Tax</SelectItem>
                                                    <SelectItem value="Costing">Costing</SelectItem>
                                                    <SelectItem value="Economics">Economics</SelectItem>
                                                    <SelectItem value="Finance">Finance</SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="specialization">Secondary Specialization</Label>
                                    <Input
                                        id="specialization"
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        placeholder="e.g. Financial Reporting"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="experience">Years of Experience</Label>
                                    <Input
                                        id="experience"
                                        type="number"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rating">Rating</Label>
                                    <Input
                                        id="rating"
                                        value={formData.rating}
                                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                        placeholder="4.9"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalStudents">Total Students</Label>
                                    <Input
                                        id="totalStudents"
                                        value={formData.totalStudents}
                                        onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value })}
                                        placeholder="10,000+"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <ImageUpload
                                    label="Faculty Photo"
                                    value={formData.image || ""}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                    recommendedDimensions="500 x 500 px (1:1)"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tagline">Tagline</Label>
                                <Input
                                    id="tagline"
                                    value={formData.tagline}
                                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                    placeholder="Inspiring quote or mission statement"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="qualifications">Qualifications (comma separated)</Label>
                                <Input
                                    id="qualifications"
                                    value={arrayInputs.qualifications}
                                    onChange={(e) => setArrayInputs({ ...arrayInputs, qualifications: e.target.value })}
                                    placeholder="CA, PhD, M.Com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="coursesTaught">Courses Taught (comma separated)</Label>
                                <Input
                                    id="coursesTaught"
                                    value={arrayInputs.coursesTaught}
                                    onChange={(e) => setArrayInputs({ ...arrayInputs, coursesTaught: e.target.value })}
                                    placeholder="CA Foundation, CA Inter"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="achievements">Key Achievements (comma separated)</Label>
                                <Input
                                    id="achievements"
                                    value={arrayInputs.achievements}
                                    onChange={(e) => setArrayInputs({ ...arrayInputs, achievements: e.target.value })}
                                    placeholder="450+ AIR, Published 12 books"
                                    required
                                />
                            </div>
                        </form>
                    </div>

                    <DialogFooter className="p-6 border-t">
                        <Button type="submit" form="faculty-form" className="w-full">
                            {editingFaculty ? "Update Faculty" : "Add Faculty"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

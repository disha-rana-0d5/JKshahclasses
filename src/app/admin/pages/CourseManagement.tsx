import { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Plus, Pencil, Trash2, Search, MoreHorizontal, Eye, EyeOff, Filter, Video, MessageSquare, Users, BookOpen, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { useCourseContext, Course } from "../context/CourseContext";
import { FAQManagementDialog } from "../components/dialogs/FAQManagementDialog";
import { VideoManagementDialog } from "../components/dialogs/VideoManagementDialog";
import { TestimonialManagementDialog } from "../components/dialogs/TestimonialManagementDialog";
import { SyllabusManagementDialog } from "../components/dialogs/SyllabusManagementDialog";
import { ImageUpload } from "../../components/ImageUpload";
import { FileUpload } from "../../components/FileUpload";
import { Pagination } from "../components/Pagination";
import { courseApi } from "../../api/api";
import { toast } from "sonner";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export function CourseManagement() {
    const {
        addCourse, updateCourse, deleteCourse,
        allCategories: categories, allLevels: levels, faculties
    } = useCourseContext();

    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    // Delete Confirmation State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Course>>({
        title: "",
        description: "",
        overview: "",
        category: "",
        subCategory: "",
        price: 0,
        originalPrice: 0,
        duration: "",
        lessons: 0,
        rating: 4.5,
        reviews: 0,
        facultyName: "",
        facultyImage: "/uploads/placeholder.png",
        discount: "",
        highlights: [],
        tags: [],
        enrolledTotal: 0,
        enrolledRecent: 0,
        status: "Draft",
        image: "/uploads/placeholder.png",
        batchInfo: "New Batch",
        level: "",
        // New fields
        syllabusModules: [],
        facultyDesignation: "",
        facultySpecialization: "",
        facultyExperience: "",
        facultyStudents: "",
        facultyRating: 4.8,
        facultyBio: "",
        courseFeatures: [],
        whatYouLearn: [],
        whoShouldEnroll: [],
        reviewsList: [],
        videos: [],
        faqs: [],
        brochureUrl: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: ""
    });


    const [viewCourse, setViewCourse] = useState<Course | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    // FAQ Dialog State
    // FAQ Dialog State
    const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
    const [selectedFaqCourse, setSelectedFaqCourse] = useState<Course | null>(null);

    const handleManageFaqs = (course: Course) => {
        setSelectedFaqCourse(course);
        setIsFaqDialogOpen(true);
    };

    const handleSaveFaqs = async (courseId: string, faqs: any[]) => {
        await updateCourse(courseId, { faqs });
    };

    // Video Dialog State
    const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
    const [selectedVideoCourse, setSelectedVideoCourse] = useState<Course | null>(null);

    const handleManageVideos = (course: Course) => {
        setSelectedVideoCourse(course);
        setIsVideoDialogOpen(true);
    };

    const handleSaveVideos = async (courseId: string, videos: any[]) => {
        await updateCourse(courseId, { videos });
    };

    // Testimonial Dialog State
    const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
    const [selectedTestimonialCourse, setSelectedTestimonialCourse] = useState<Course | null>(null);

    const handleManageTestimonials = (course: Course) => {
        setSelectedTestimonialCourse(course);
        setIsTestimonialDialogOpen(true);
    };

    const handleSaveTestimonials = async (courseId: string, testimonials: any[]) => {
        await updateCourse(courseId, { testimonials });
    };

    // Syllabus Dialog State
    const [isSyllabusDialogOpen, setIsSyllabusDialogOpen] = useState(false);
    const [selectedSyllabusCourse, setSelectedSyllabusCourse] = useState<Course | null>(null);

    const handleManageSyllabus = (course: Course) => {
        setSelectedSyllabusCourse(course);
        setIsSyllabusDialogOpen(true);
    };

    const handleSaveSyllabus = async (courseId: string, data: { syllabusModules: any[], syllabusPdf?: string }) => {
        await updateCourse(courseId, data);
    };

    // Filter Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [levelFilter, setLevelFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
            };

            const filter: any = {};
            if (categoryFilter !== "All") filter.category = categoryFilter;
            if (levelFilter !== "All") filter.level = levelFilter;
            if (statusFilter !== "All") filter.status = statusFilter;

            if (Object.keys(filter).length > 0) {
                params.filter = JSON.stringify(filter);
            }

            const { ok, data } = await courseApi.getCourses(params);
            if (ok && data.success) {
                setCourses(data.data);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    pages: data.pagination.pages
                }));
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            toast.error("Failed to load courses");
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, categoryFilter, levelFilter, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCourses();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchCourses]);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const resetFilters = () => {
        setSearchQuery("");
        setCategoryFilter("All");
        setLevelFilter("All");
        setStatusFilter("All");
        setPagination(prev => ({ ...prev, page: 1 }));
    };


    const handleOpenAdd = () => {
        setEditingCourse(null);
        setFormData({
            title: "",
            description: "",
            overview: "",
            category: categories[0]?.name || "",
            subCategory: "",
            level: levels[0]?.name || "",
            price: 0,
            originalPrice: 0,
            duration: "",
            lessons: 0,
            rating: 4.5,
            reviews: 0,
            facultyName: "",
            facultyImage: "/uploads/placeholder.png",
            discount: "",
            highlights: [],
            tags: [],
            enrolledTotal: 0,
            enrolledRecent: 0,
            status: "Draft",
            image: "/uploads/placeholder.png",
            batchInfo: "New Batch",
            // New fields
            syllabusModules: [],
            facultyDesignation: "",
            facultySpecialization: "",
            facultyExperience: "",
            facultyStudents: "",
            facultyRating: 4.8,
            facultyBio: "",
            courseFeatures: [],
            whatYouLearn: [],
            whoShouldEnroll: [],
            reviewsList: [],
            videos: [],
            brochureUrl: "",
            metaTitle: "",
            metaDescription: "",
            metaKeywords: ""
        });
        setCurrentStep(1);
        setIsAddDialogOpen(true);
    };

    const handleOpenEdit = (course: Course) => {
        setEditingCourse(course);
        setFormData({ ...course, videos: course.videos || [] });
        setCurrentStep(1);
        setIsAddDialogOpen(true);
    };

    const handleView = (course: Course) => {
        setViewCourse(course);
        setIsViewOpen(true);
    };

    const handleDelete = (id: string) => {
        deleteCourse(id);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            return;
        }

        try {
            if (editingCourse) {
                await updateCourse(editingCourse._id, {
                    ...formData,
                    image: formData.image || "",
                    facultyImage: formData.facultyImage || ""
                });
            } else {
                const { ok, data } = await courseApi.addCourse({
                    ...formData,
                    image: formData.image || "",
                    facultyImage: formData.facultyImage || ""
                });
                if (ok && data.success) {
                    toast.success("Course added successfully");
                }
            }
            fetchCourses();
            setIsAddDialogOpen(false);
            setCurrentStep(1);
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleQuickUpdate = async () => {
        if (!editingCourse) return;

        try {
            await updateCourse(editingCourse._id, {
                ...formData,
                image: formData.image || "",
                facultyImage: formData.facultyImage || ""
            });
            fetchCourses();
            setIsAddDialogOpen(false);
            setCurrentStep(1);
            toast.success("Course updated successfully");
        } catch (error) {
            console.error("Quick update failed:", error);
            toast.error("Failed to update course");
        }
    };

    const toggleVisibility = async (course: Course) => {
        const newStatus = course.status === "Active" ? "Draft" : "Active";
        await updateCourse(course._id, { status: newStatus });
        fetchCourses();
    };

    const handleCourseDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent dropdown from closing if needed, though usually not an issue with AlertDialog
        e.stopPropagation();
        setCourseToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (courseToDelete) {
            await deleteCourse(courseToDelete);
            setIsDeleteDialogOpen(false);
            setCourseToDelete(null);
            fetchCourses();
        }
    };

    // Confirm Delete Dialog
    const deleteDialog = (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the course
                        and remove all associated data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCourseToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Course Management</h2>
                    <p className="text-muted-foreground">Manage your curriculum and course offerings.</p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add Course
                </Button>
            </div>

            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 mb-4">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

            </div>

            <div className="rounded-md border border-border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Course Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Sub Category</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Price</TableHead>

                            <TableHead>Faculty</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Loading courses...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : courses.length > 0 ? (
                            courses.map((course) => (
                                <TableRow key={course._id}>
                                    <TableCell>
                                        <img src={course.image} alt={course.title} className="w-10 h-10 rounded object-cover bg-gray-100" />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {course.title}
                                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{course.description}</p>
                                    </TableCell>
                                    <TableCell>{course.category}</TableCell>
                                    <TableCell>{course.subCategory}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{course.level}</Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-red-600">₹{course.price}</span>
                                            {course.originalPrice && (
                                                <span className="text-xs text-muted-foreground line-through">₹{course.originalPrice}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <img src={course.facultyImage} className="w-6 h-6 rounded-full" />
                                            <span className="text-sm">{course.facultyName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{course.enrolledTotal}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={course.status === "Active"}
                                                onCheckedChange={() => toggleVisibility(course)}
                                            />
                                            <Badge variant={course.status === "Active" ? "default" : "secondary"}>
                                                {course.status}
                                            </Badge>
                                        </div>
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
                                                <DropdownMenuItem onClick={() => handleView(course)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleManageFaqs(course)}>
                                                    <MessageSquare className="mr-2 h-4 w-4" /> Manage FAQs
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleManageVideos(course)}>
                                                    <Video className="mr-2 h-4 w-4" /> Manage Videos
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleManageTestimonials(course)}>
                                                    <Users className="mr-2 h-4 w-4" /> Student Testimonials
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleManageSyllabus(course)}>
                                                    <BookOpen className="mr-2 h-4 w-4" /> Manage Syllabus
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenEdit(course)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleCourseDelete(course._id, e)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                                    No courses found.
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

            {deleteDialog}
            {/* Add/Edit Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
                        <DialogDescription>
                            {editingCourse ? "Update course details below." : "Enter the details for the new course."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        {/* Stepper Header */}
                        <div className="flex items-center justify-between mb-8 px-2 relative">
                            {/* Progress Bar Background */}
                            <div className="absolute top-4 left-0 w-full h-0.5 bg-muted-foreground/20 -z-10" />

                            {[1, 2, 3, 4, 5].map((step) => {
                                const labels = ["Basic Info", "Details", "Faculty", "Reviews", "Videos"];
                                const isClickable = !!editingCourse;
                                const isActive = currentStep >= step;
                                const isCurrent = currentStep === step;

                                return (
                                    <div
                                        key={step}
                                        className={`flex flex-col items-center gap-2 bg-white px-2 cursor-${isClickable ? 'pointer' : 'default'}`}
                                        onClick={() => isClickable && setCurrentStep(step)}
                                    >
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${isActive
                                            ? "bg-primary border-primary text-white"
                                            : "bg-white border-muted-foreground/30 text-muted-foreground"
                                            } ${isClickable ? "hover:scale-110" : ""}`}>
                                            {step}
                                        </div>
                                        <span className={`text-[10px] font-medium transition-colors ${isCurrent ? "text-primary" : "text-muted-foreground"
                                            }`}>
                                            {labels[step - 1]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="grid gap-6 py-4">
                            {currentStep === 1 && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Course Title</Label>
                                            <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Main Category</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(val) => setFormData({ ...formData, category: val, subCategory: "" })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.filter(c => !c.parent).map((cat) => (
                                                        <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subCategory">Sub Category</Label>
                                            <Select
                                                value={formData.subCategory}
                                                onValueChange={(val) => setFormData({ ...formData, subCategory: val })}
                                                disabled={!formData.category}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select sub-category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories
                                                        .filter(c => c.parent && categories.find(p => p._id === c.parent)?.name === formData.category)
                                                        .map((cat) => (
                                                            <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="level-form">Level</Label>
                                            <Select
                                                value={formData.level}
                                                onValueChange={(val) => setFormData({ ...formData, level: val })}
                                            >
                                                <SelectTrigger id="level-form">
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {levels.map((lvl) => (
                                                        <SelectItem key={lvl._id} value={lvl.name}>{lvl.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Current Price (₹)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="originalPrice">Original Price (₹)</Label>
                                            <Input
                                                id="originalPrice"
                                                type="number"
                                                value={formData.originalPrice}
                                                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duration</Label>
                                            <Input
                                                id="duration"
                                                placeholder="e.g. 7 Months"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <ImageUpload
                                                label="Course Thumbnail"
                                                value={formData.image || ""}
                                                onChange={(url) => setFormData({ ...formData, image: url })}
                                                recommendedDimensions="1200 x 600 px (2:1)"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Visibility</Label>
                                            <div className="flex items-center space-x-2 pt-2">
                                                <Switch
                                                    id="status"
                                                    checked={formData.status === "Active"}
                                                    onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "Active" : "Draft" })}
                                                />
                                                <Label htmlFor="status">{formData.status === "Active" ? "Visible to Students" : "Hidden (Draft)"}</Label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <ImageUpload
                                                label="Faculty Image"
                                                value={formData.facultyImage || ""}
                                                onChange={(url) => setFormData({ ...formData, facultyImage: url })}
                                                recommendedDimensions="500 x 500 px (1:1)"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <FileUpload
                                                label="Course Brochure"
                                                value={formData.brochureUrl || ""}
                                                onChange={(url) => setFormData({ ...formData, brochureUrl: url })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-t pt-4 mt-4">
                                        <h3 className="font-semibold">SEO Meta Tags</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="metaTitle">SEO Title</Label>
                                                <Input
                                                    id="metaTitle"
                                                    value={formData.metaTitle}
                                                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                                    placeholder="Enter SEO Title"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="metaDescription">SEO Description</Label>
                                                <Textarea
                                                    id="metaDescription"
                                                    value={formData.metaDescription}
                                                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                                    placeholder="Enter SEO Description"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="metaKeywords">SEO Keywords</Label>
                                                <Input
                                                    id="metaKeywords"
                                                    value={formData.metaKeywords}
                                                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                                                    placeholder="e.g. CA, Final, Accounting (comma separated)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Course Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="overview">Course Overview</Label>
                                        <Textarea
                                            id="overview"
                                            value={formData.overview}
                                            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                                            rows={6}
                                            placeholder="Detailed overview for the course detail page..."
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label>What You'll Learn</Label>
                                        <div className="space-y-2">
                                            {formData.whatYouLearn?.map((item, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        value={item}
                                                        onChange={(e) => {
                                                            const newItems = [...(formData.whatYouLearn || [])];
                                                            newItems[index] = e.target.value;
                                                            setFormData({ ...formData, whatYouLearn: newItems });
                                                        }}
                                                        placeholder={`Learning outcome ${index + 1}`}
                                                    />
                                                    <Button variant="ghost" size="icon" onClick={() => setFormData({ ...formData, whatYouLearn: formData.whatYouLearn?.filter((_, i) => i !== index) })}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, whatYouLearn: [...(formData.whatYouLearn || []), ""] })}>
                                                <Plus className="mr-2 h-4 w-4" /> Add Learning Outcome
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Sidebar Features - Fixed 5 Items */}
                                    <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                                        <div className="space-y-1">
                                            <Label className="text-base">Sidebar Features (This course includes)</Label>
                                            <p className="text-xs text-muted-foreground">These 5 items correspond to the fixed icons in the sidebar (File, Book, Headphones, Award, Download).</p>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                "Comprehensive Study Material",
                                                "Practice Questions Bank",
                                                "24/7 Doubt Support",
                                                "Completion Certificate",
                                                "Downloadable Resources"
                                            ].map((label, index) => (
                                                <div key={index} className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Item {index + 1}: {label}</Label>
                                                    <Input
                                                        value={formData.courseFeatures?.[index] || ""}
                                                        onChange={(e) => {
                                                            const newFeatures = [...(formData.courseFeatures || [])];
                                                            // Ensure array is filled up to this index
                                                            while (newFeatures.length <= index) newFeatures.push("");
                                                            newFeatures[index] = e.target.value;
                                                            setFormData({ ...formData, courseFeatures: newFeatures });
                                                        }}
                                                        placeholder={label}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Key Features (Highlights) - Fixed 6 Items */}
                                    <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                                        <div className="space-y-1">
                                            <Label className="text-base">Key Features (Overview Section)</Label>
                                            <p className="text-xs text-muted-foreground">These 6 items correspond to the fixed icons in the overview grid.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                "Learning Pedagogy developed over 4 decades",
                                                "Focused on 100% conceptual clarity",
                                                "Qualified professionals for teaching as well as non-teaching functions",
                                                "Rigorous and precise test series",
                                                "Detailed revision lectures on course completion",
                                                "24/7 doubt solving support"
                                            ].map((label, index) => (
                                                <div key={index} className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Feature {index + 1}: {label}</Label>
                                                    <Input
                                                        value={formData.highlights?.[index] || ""}
                                                        onChange={(e) => {
                                                            const newHighlights = [...(formData.highlights || [])];
                                                            // Ensure array is filled up to this index
                                                            while (newHighlights.length <= index) newHighlights.push("");
                                                            newHighlights[index] = e.target.value;
                                                            setFormData({ ...formData, highlights: newHighlights });
                                                        }}
                                                        placeholder={label}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Who Should Enroll</Label>
                                        <div className="space-y-2">
                                            {formData.whoShouldEnroll?.map((item, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        value={item}
                                                        onChange={(e) => {
                                                            const newItems = [...(formData.whoShouldEnroll || [])];
                                                            newItems[index] = e.target.value;
                                                            setFormData({ ...formData, whoShouldEnroll: newItems });
                                                        }}
                                                        placeholder={`Target audience ${index + 1}`}
                                                    />
                                                    <Button variant="ghost" size="icon" onClick={() => setFormData({ ...formData, whoShouldEnroll: formData.whoShouldEnroll?.filter((_, i) => i !== index) })}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, whoShouldEnroll: [...(formData.whoShouldEnroll || []), ""] })}>
                                                <Plus className="mr-2 h-4 w-4" /> Add Target Audience
                                            </Button>
                                        </div>
                                    </div>


                                </div>
                            )}



                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="facultySelect">Select Faculty</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                const selected = faculties.find(f => f._id === value);
                                                if (selected) {
                                                    setFormData({
                                                        ...formData,
                                                        facultyName: selected.name,
                                                        facultyDesignation: selected.designation,
                                                        facultySpecialization: selected.expertise,
                                                        facultyExperience: `${selected.experience} Years`,
                                                        facultyStudents: selected.totalStudents,
                                                        facultyImage: selected.image,
                                                        facultyBio: selected.tagline,
                                                        facultyRating: parseFloat(selected.rating) || 4.8
                                                    });
                                                }
                                            }}
                                            value={faculties.find(f => f.name === formData.facultyName)?._id || ""}
                                        >
                                            <SelectTrigger id="facultySelect">
                                                <SelectValue placeholder="Choose from registered faculty" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {faculties.map((f) => (
                                                    <SelectItem key={f._id} value={f._id}>
                                                        {f.name} ({f.expertise})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[10px] text-muted-foreground italic">
                                            Only registered faculty members can be assigned to courses.
                                        </p>
                                    </div>

                                    {formData.facultyName && (
                                        <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-20 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0">
                                                    <img
                                                        src={formData.facultyImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"}
                                                        alt={formData.facultyName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-semibold text-sm">{formData.facultyName}</h3>
                                                    <p className="text-xs text-primary">{formData.facultyDesignation}</p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <Badge variant="outline" className="text-[10px] py-0 h-5">
                                                            {formData.facultySpecialization}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-[10px] py-0 h-5">
                                                            {formData.facultyExperience}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-[10px] py-0 h-5">
                                                            {formData.facultyStudents} Students
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Biography / Tagline</Label>
                                                <p className="text-xs text-foreground line-clamp-3 italic">
                                                    "{formData.facultyBio}"
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {!formData.facultyName && (
                                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-lg bg-muted/10">
                                            <p className="text-xs text-muted-foreground">No faculty selected yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold">Student Reviews</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFormData({
                                                ...formData,
                                                reviewsList: [...(formData.reviewsList || []), { name: "", rating: 5, text: "", achievement: "", date: new Date().toLocaleDateString(), image: "" }]
                                            })}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Review
                                        </Button>
                                    </div>

                                    {formData.reviewsList?.map((review, rIdx) => (
                                        <div key={rIdx} className="bg-muted/30 p-4 rounded-lg space-y-4 border border-border">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    className="bg-white"
                                                    value={review.name}
                                                    onChange={(e) => {
                                                        const newReviews = [...(formData.reviewsList || [])];
                                                        newReviews[rIdx].name = e.target.value;
                                                        setFormData({ ...formData, reviewsList: newReviews });
                                                    }}
                                                    placeholder="Student Name"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-xs">Rating</Label>
                                                    <Input
                                                        type="number"
                                                        max={5}
                                                        min={1}
                                                        step="0.1"
                                                        className="bg-white w-20"
                                                        value={review.rating}
                                                        onChange={(e) => {
                                                            const newReviews = [...(formData.reviewsList || [])];
                                                            newReviews[rIdx].rating = Number(e.target.value);
                                                            setFormData({ ...formData, reviewsList: newReviews });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <Input
                                                className="bg-white"
                                                value={review.achievement}
                                                onChange={(e) => {
                                                    const newReviews = [...(formData.reviewsList || [])];
                                                    newReviews[rIdx].achievement = e.target.value;
                                                    setFormData({ ...formData, reviewsList: newReviews });
                                                }}
                                                placeholder="Achievement (e.g., Cleared CA Inter)"
                                            />
                                            <Textarea
                                                className="bg-white"
                                                value={review.text}
                                                onChange={(e) => {
                                                    const newReviews = [...(formData.reviewsList || [])];
                                                    newReviews[rIdx].text = e.target.value;
                                                    setFormData({ ...formData, reviewsList: newReviews });
                                                }}
                                                placeholder="Review content..."
                                                rows={2}
                                            />
                                            <div className="flex justify-end">
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, reviewsList: formData.reviewsList?.filter((_, i) => i !== rIdx) })}>
                                                    <Trash2 className="h-4 w-4 text-destructive mr-2" /> Remove Review
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold">Course Introduction Videos</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFormData({
                                                ...formData,
                                                videos: [...(formData.videos || []), { title: "", url: "", description: "" }]
                                            })}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Video
                                        </Button>
                                    </div>

                                    {formData.videos?.map((video, vIdx) => (
                                        <div key={vIdx} className="bg-muted/30 p-4 rounded-lg space-y-4 border border-border">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Video Title</Label>
                                                    <Input
                                                        className="bg-white"
                                                        value={video.title}
                                                        onChange={(e) => {
                                                            const newVideos = [...(formData.videos || [])];
                                                            newVideos[vIdx].title = e.target.value;
                                                            setFormData({ ...formData, videos: newVideos });
                                                        }}
                                                        placeholder="e.g., Introduction to CA Course"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Video URL (YouTube/Vimeo)</Label>
                                                    <Input
                                                        className="bg-white"
                                                        value={video.url}
                                                        onChange={(e) => {
                                                            const newVideos = [...(formData.videos || [])];
                                                            newVideos[vIdx].url = e.target.value;
                                                            setFormData({ ...formData, videos: newVideos });
                                                        }}
                                                        placeholder="https://www.youtube.com/embed/..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Video Description</Label>
                                                <Textarea
                                                    className="bg-white"
                                                    value={video.description || ""}
                                                    onChange={(e) => {
                                                        const newVideos = [...(formData.videos || [])];
                                                        newVideos[vIdx].description = e.target.value;
                                                        setFormData({ ...formData, videos: newVideos });
                                                    }}
                                                    placeholder="Brief description of the video content..."
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, videos: formData.videos?.filter((_, i) => i !== vIdx) })}>
                                                    <Trash2 className="h-4 w-4 text-destructive mr-2" /> Remove Video
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!formData.videos || formData.videos.length === 0) && (
                                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-lg bg-muted/10">
                                            <Video className="h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">No videos added yet. These will be shown in a carousel on the details page.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="mt-8 flex justify-between items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-xs text-muted-foreground">
                                    Step {currentStep} of {totalSteps}
                                </div>
                                {editingCourse && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                                        onClick={handleQuickUpdate}
                                    >
                                        <Pencil className="w-3 h-3 mr-2" />
                                        Update Course
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {currentStep > 1 && (
                                    <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                                        Previous
                                    </Button>
                                )}
                                <Button type="submit">
                                    {currentStep === totalSteps ? (editingCourse ? "Update Course" : "Finalize & Add Course") : "Continue"}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog >

            {/* View Course Dialog */}
            < Dialog open={isViewOpen} onOpenChange={setIsViewOpen} >
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Course Preview</DialogTitle>
                    </DialogHeader>
                    {viewCourse && (
                        <div className="grid gap-6 py-4">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3 relative">
                                    <img
                                        src={viewCourse.image}
                                        alt={viewCourse.title}
                                        className="w-full h-48 rounded-lg object-cover bg-muted"
                                    />
                                    {viewCourse.discount && (
                                        <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                                            {viewCourse.discount}
                                        </Badge>
                                    )}
                                    <Badge className="absolute top-2 right-2 bg-red-600">
                                        {viewCourse.category}
                                    </Badge>
                                    <Badge className="absolute top-10 right-2 bg-blue-600">
                                        {viewCourse.level}
                                    </Badge>

                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-2xl">{viewCourse.title}</h3>
                                        <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                            <span>★</span> {viewCourse.rating}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>🕒 {viewCourse.duration}</span>
                                        <span>📖 {viewCourse.lessons} Lessons</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <img src={viewCourse.facultyImage} className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <p className="font-medium">{viewCourse.facultyName}</p>
                                            <p className="text-xs text-muted-foreground">{viewCourse.enrolledTotal}+ students</p>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-2xl font-bold text-red-600">₹{viewCourse.price}</span>
                                        {viewCourse.originalPrice && (
                                            <span className="text-muted-foreground line-through">₹{viewCourse.originalPrice}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 border-t pt-4">
                                <h4 className="font-medium text-sm">Course Description</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {viewCourse.description || "No description provided."}
                                </p>
                            </div>

                            {viewCourse.highlights && viewCourse.highlights.length > 0 && (
                                <div className="space-y-2 border-t pt-4">
                                    <h4 className="font-medium text-sm">Course Highlights</h4>
                                    <ul className="grid grid-cols-2 gap-2">
                                        {viewCourse.highlights.map((highlight, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                                {highlight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}


                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Recent Enrollment</span>
                                    <span className="font-medium">{viewCourse.enrolledRecent} in last 7 days</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Batch Info</span>
                                    <span className="font-medium">{viewCourse.batchInfo}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => handleOpenEdit(viewCourse!)} className="w-full sm:w-auto">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Course
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* FAQ Management Dialog */}
            <FAQManagementDialog
                isOpen={isFaqDialogOpen}
                onClose={() => setIsFaqDialogOpen(false)}
                course={selectedFaqCourse}
                categories={categories}
                onSave={handleSaveFaqs}
            />
            {/* Video Management Dialog */}
            <VideoManagementDialog
                isOpen={isVideoDialogOpen}
                onClose={() => setIsVideoDialogOpen(false)}
                course={selectedVideoCourse}
                onSave={handleSaveVideos}
            />
            {/* Testimonial Management Dialog */}
            <TestimonialManagementDialog
                isOpen={isTestimonialDialogOpen}
                onClose={() => setIsTestimonialDialogOpen(false)}
                course={selectedTestimonialCourse}
                categories={categories}
                onSave={handleSaveTestimonials}
            />
            {/* Syllabus Management Dialog */}
            <SyllabusManagementDialog
                isOpen={isSyllabusDialogOpen}
                onClose={() => setIsSyllabusDialogOpen(false)}
                course={selectedSyllabusCourse}
                onSave={handleSaveSyllabus}
            />
        </div>
    );
}


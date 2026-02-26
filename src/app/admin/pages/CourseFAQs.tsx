import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Search, MessageSquare, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { useCourseContext, Course } from "../context/CourseContext";
import { FAQManagementDialog } from "../components/dialogs/FAQManagementDialog";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../components/ui/pagination";
import { useEffect } from "react";

export function CourseFAQs() {
    const { allCourses: courses, categories, levels, updateCourse, loading, pagination, refreshCourses } = useCourseContext();

    // FAQ Dialog State
    const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
    const [selectedFaqCourse, setSelectedFaqCourse] = useState<Course | null>(null);

    // Filter Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [levelFilter, setLevelFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const filters: any = {};
        if (categoryFilter !== "All") filters.category = categoryFilter;
        if (levelFilter !== "All") filters.level = levelFilter;
        if (statusFilter !== "All") filters.status = statusFilter;

        refreshCourses({
            page: currentPage,
            limit: 10,
            search: searchQuery,
            filter: JSON.stringify(filters)
        });
    }, [searchQuery, categoryFilter, levelFilter, statusFilter, currentPage]);

    const handleManageFaqs = (course: Course) => {
        setSelectedFaqCourse(course);
        setIsFaqDialogOpen(true);
    };

    const handleSaveFaqs = async (courseId: string, faqs: any[]) => {
        await updateCourse(courseId, { faqs });
    };

    const resetFilters = () => {
        setCategoryFilter("All");
        setLevelFilter("All");
        setStatusFilter("All");
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading courses...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Course FAQs</h2>
                    <p className="text-muted-foreground">Manage Frequently Asked Questions for your courses.</p>
                </div>
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
                            <TableHead>Level</TableHead>
                            <TableHead>FAQs Count</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.map((course) => (
                            <TableRow key={course._id}>
                                <TableCell>
                                    <img src={course.image} alt={course.title} className="w-10 h-10 rounded object-cover bg-gray-100" />
                                </TableCell>
                                <TableCell className="font-medium">
                                    {course.title}
                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{course.description}</p>
                                </TableCell>
                                <TableCell>{course.category}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{course.level}</Badge>
                                </TableCell>
                                <TableCell>
                                    {(course.faqs || []).reduce((acc, cat: any) => {
                                        const topicQuestions = (cat.topics || []).reduce((tAcc: number, topic: any) => tAcc + (topic.questions?.length || 0), 0);
                                        const directQuestions = (cat.questions?.length || 0);
                                        return acc + (topicQuestions || directQuestions);
                                    }, 0)} Questions
                                    <span className="text-xs text-muted-foreground block">
                                        in {course.faqs?.length || 0} Categories
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => handleManageFaqs(course)}>
                                        <MessageSquare className="mr-2 h-4 w-4" /> Manage FAQs
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {pagination.courses && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.courses.page - 1) * pagination.courses.limit + 1} to {Math.min(pagination.courses.page * pagination.courses.limit, pagination.courses.total)} of {pagination.courses.total} courses
                    </p>
                    <Pagination className="justify-end mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                                    }}
                                />
                            </PaginationItem>
                            {[...Array(pagination.courses.pages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        href="#"
                                        isActive={currentPage === i + 1}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentPage(i + 1);
                                        }}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < pagination.courses.pages) setCurrentPage(currentPage + 1);
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <FAQManagementDialog
                isOpen={isFaqDialogOpen}
                onClose={() => setIsFaqDialogOpen(false)}
                course={selectedFaqCourse}
                categories={categories}
                onSave={handleSaveFaqs}
            />
        </div>
    );
}

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Loader2, Search, Save } from "lucide-react";
import { Input } from "../../components/ui/input";
import { useCourseContext } from "../context/CourseContext";
import { erpCourseApi } from "../../api/api";
import { toast } from "sonner";
import { BatchVisibilityModal } from "../components/BatchVisibilityModal";
import { Settings2 } from "lucide-react";

export function ERPCoursesManagement() {
    const { allCategories } = useCourseContext();
    const [erpCourses, setErpCourses] = useState<any[]>([]);
    const [mappings, setMappings] = useState<Record<string, { category: string; subCategory: string; isVisible?: boolean }>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourseForBatches, setSelectedCourseForBatches] = useState<any>(null);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

    const mainCategories = allCategories.filter(c => !c.parent);
    const subCategories = allCategories.filter(c => c.parent);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch external ERP courses
                const { ok, data } = await erpCourseApi.fetchExternalERPCourses();
                if (ok && data?.data) {
                    setErpCourses(data.data);
                } else {
                    toast.error("Failed to fetch ERP courses");
                }

                // 2. Fetch mappings from database
                try {
                    const mappingsRes = await erpCourseApi.getMappings();
                    if (mappingsRes.ok && mappingsRes.data?.data) {
                        const loadedMappings: Record<string, { category: string; subCategory: string; isVisible?: boolean }> = {};
                        mappingsRes.data.data.forEach((m: any) => {
                            loadedMappings[m.erpCourseId] = {
                                category: m.category,
                                subCategory: m.subCategory,
                                isVisible: m.isVisible
                            };
                        });
                        setMappings(loadedMappings);
                    }
                } catch (e) {
                    console.error("Error fetching mappings from db", e);
                }
            } catch (error) {
                console.error("Error fetching ERP courses data:", error);
                toast.error("An error occurred while loading data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCategoryChange = (courseId: string, category: string) => {
        setMappings(prev => ({
            ...prev,
            [courseId]: { ...prev[courseId], category, subCategory: "", isVisible: prev[courseId]?.isVisible ?? false }
        }));
    };

    const handleSubCategoryChange = (courseId: string, subCategory: string) => {
        setMappings(prev => ({
            ...prev,
            [courseId]: { ...prev[courseId], subCategory, isVisible: prev[courseId]?.isVisible ?? false }
        }));
    };

    const handleVisibilityChange = (courseId: string, isVisible: boolean) => {
        setMappings(prev => ({
            ...prev,
            [courseId]: { ...prev[courseId], isVisible }
        }));
    };

    const handleSaveMapping = async (courseId: string) => {
        const mapping = mappings[courseId];
        if (!mapping || !mapping.category || !mapping.subCategory) {
            toast.error("Please select both category and subcategory");
            return;
        }

        setSaving(true);
        try {
            const course = erpCourses.find(c => c.levelId === courseId);
            const dataToSave = {
                erpCourseId: courseId,
                courseName: course ? `${course.course} - ${course.level}` : "",
                category: mapping.category,
                subCategory: mapping.subCategory,
                isVisible: mapping.isVisible ?? false
            };

            const { ok } = await erpCourseApi.saveMapping(dataToSave);
            
            if (ok) {
                toast.success("Mapping saved successfully");
            } else {
                toast.error("Failed to save mapping to database");
            }
        } catch (error) {
            console.error("Error saving mapping:", error);
            toast.error("Failed to save mapping");
        } finally {
            setSaving(false);
        }
    };

    const filteredCourses = erpCourses.filter(course =>
        course.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.level?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.levelId?.toString().includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">ERP Courses Mapping</h2>
                    <p className="text-muted-foreground">Map external ERP courses to frontend categories.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                <div className="flex justify-between items-center">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search ERP courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course ID</TableHead>
                                <TableHead>ERP Course Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Sub Category</TableHead>
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
                            ) : filteredCourses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No courses found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCourses.map((course) => {
                                    const currentMapping = mappings[course.levelId] || { category: "", subCategory: "" };
                                    const courseSubCategories = subCategories.filter(
                                        sc => sc.parent === allCategories.find(c => c.name === currentMapping.category)?._id
                                    );

                                    return (
                                        <TableRow key={course.levelId}>
                                            <TableCell className="font-medium text-xs">{course.courseId} / {course.levelId}</TableCell>
                                            <TableCell>{course.course} - {course.level}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={currentMapping.category}
                                                    onValueChange={(val) => handleCategoryChange(course.levelId, val)}
                                                >
                                                    <SelectTrigger className="w-[200px]">
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {mainCategories.map((cat) => (
                                                            <SelectItem key={cat._id} value={cat.name}>
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={currentMapping.subCategory}
                                                    onValueChange={(val) => handleSubCategoryChange(course.levelId, val)}
                                                    disabled={!currentMapping.category}
                                                >
                                                    <SelectTrigger className="w-[200px]">
                                                        <SelectValue placeholder="Select Subcategory" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {courseSubCategories.map((subCat) => (
                                                            <SelectItem key={subCat._id} value={subCat.name}>
                                                                {subCat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={currentMapping.isVisible ?? false}
                                                    onCheckedChange={(checked) => handleVisibilityChange(course.levelId, checked)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedCourseForBatches(course);
                                                        setIsBatchModalOpen(true);
                                                    }}
                                                >
                                                    <Settings2 className="h-4 w-4 mr-1" /> Manage Batches
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSaveMapping(course.levelId)}
                                                    disabled={saving || !currentMapping.category || !currentMapping.subCategory}
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
            </div>

            <BatchVisibilityModal 
                isOpen={isBatchModalOpen}
                onClose={() => setIsBatchModalOpen(false)}
                course={selectedCourseForBatches}
            />
        </div>
    );
}

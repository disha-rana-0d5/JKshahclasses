import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, Users, Star, BookOpen, Search, X, SlidersHorizontal, ChevronDown, Filter, ArrowUpDown, Grid3x3, List, TrendingUp, Award, Play, Banknote, Coins, Gem } from "lucide-react";
import { BatchEnrollmentModal } from "./modals/BatchEnrollmentModal";
import { useCourseContext } from "../admin/context/CourseContext";
import { landingPageApi, batchApi, erpCourseApi } from "../api/api";
import { generateSlug } from "../admin/utils/slugify";
import { MerittoFormModal } from "./modals/MerittoFormModal";

export function CoursePage1() {
    const navigate = useNavigate();
    const { categoryId } = useParams<{ categoryId: string }>();
    const { allCourses, allCategories: categories, levels } = useCourseContext();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [selectedPriceRange, setSelectedPriceRange] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [batches, setBatches] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [showMerittoModal, setShowMerittoModal] = useState(false);

    const [apiCourses, setApiCourses] = useState<any[]>([]);

    useEffect(() => {
        document.title = "Courses";
        const loadData = async () => {
            try {
                const [batchRes, contentRes, courseRes, mappingRes] = await Promise.all([
                    batchApi.getBatches(),
                    landingPageApi.getLandingContent(),
                    erpCourseApi.fetchExternalERPCourses(),
                    erpCourseApi.getMappings()
                ]);
                if (batchRes.ok && batchRes.data.success) {
                    setBatches(batchRes.data.data);
                }
                if (contentRes.ok && contentRes.data.success) {
                    setBranches(contentRes.data.data.branches || []);
                }

                if (courseRes.ok && courseRes.data?.success) {
                    let visibleCourses = courseRes.data.data;
                    if (mappingRes.ok && mappingRes.data?.data) {
                        const mappingDict: Record<string, any> = {};
                        mappingRes.data.data.forEach((m: any) => {
                            mappingDict[m.erpCourseId] = m;
                        });
                        
                        visibleCourses = courseRes.data.data.filter((c: any) => {
                            const m = mappingDict[c.levelId];
                            return m && m.isVisible === true;
                        });
                    }
                    setApiCourses(visibleCourses);
                }
            } catch (error) {
                console.error("Failed to load enrollment data", error);
            }
        };
        loadData();
    }, []);

    // Redirect if category has no sub-categories
    useEffect(() => {
        if (categoryId && categories.length > 0 && allCourses.length > 0) {
            const currentCat = categories.find(c => c._id === categoryId) ||
                categories.find(c => c.name?.toLowerCase() === decodeURIComponent(categoryId).toLowerCase());

            if (currentCat) {
                const hasSubCategories = categories.some(c => c.parent === currentCat._id);
                if (!hasSubCategories) {
                    const course = allCourses.find(c => c.category === currentCat.name && c.status === "Active");
                    if (course) {
                        navigate(`/course/${course.slug || generateSlug(course.title)}`, { replace: true });
                    }
                }
            }
        }
    }, [categoryId, categories, allCourses, navigate]);

    const apiCategories = Array.from(new Set(apiCourses.map(c => c.course)));
    const apiLevels = Array.from(new Set(apiCourses.map(c => c.level)));

    const filteredCourses = apiCourses.filter(course => {
        // Category filter logic
        if (selectedCategory !== "all") {
            if (course.course !== selectedCategory) return false;
        }

        // Level filter
        if (selectedLevel !== "all" && course.level !== selectedLevel) return false;

        if (searchQuery && !course.course?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !course.level?.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        return true;
    });

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const currentCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset to first page when filters or search change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedLevel, selectedPriceRange, searchQuery, categoryId]);

    const handleEnrollClick = async (course: any) => {
        // Map the external course to match what the modal expects
        const mappedCourse = {
            ...course,
            title: `${course.course} - ${course.level}`,
            category: course.course,
            subCategory: course.level,
            price: "0",
            syllabusModules: []
        };
        setSelectedCourse(mappedCourse);
        setShowEnrollModal(true);

        try {
            // Fetch batch details, branch details, and visibility settings concurrently
            const [batchRes, branchRes, visibilityRes] = await Promise.all([
                erpCourseApi.fetchExternalERPBatchDetails(course.courseId, course.levelId),
                erpCourseApi.fetchExternalERPBranchDetails(),
                erpCourseApi.getBatchVisibilities()
            ]);

            let branchMap = new Map();
            if (branchRes.ok && branchRes.data?.success && Array.isArray(branchRes.data.data)) {
                branchRes.data.data.forEach((branch: any) => {
                    branchMap.set(branch.compId, branch.branchName);
                });
            }

            if (batchRes.ok && batchRes.data?.success && Array.isArray(batchRes.data.data)) {
                const uniqueBranchNames = new Set<string>();

                const visMap = new Map();
                if (visibilityRes.ok && visibilityRes.data?.success && Array.isArray(visibilityRes.data.data)) {
                    visibilityRes.data.data.forEach((v: any) => {
                        if (v.erpBatchId) visMap.set(v.erpBatchId, v.isVisible);
                    });
                }

                const mappedBatches = batchRes.data.data
                    .filter((b: any) => {
                        const batchId = b.batchId?.toString();
                        if (!batchId) return true;
                        return visMap.get(batchId) !== false; // Filter out explicitly hidden batches
                    })
                    .map((b: any) => {
                    let locationNames = ["Online / Center"];
                    if (b.applTo && typeof b.applTo === 'string') {
                        const compIds = b.applTo.split(',');
                        locationNames = compIds.map((id: string) => branchMap.get(id.trim())).filter(Boolean);
                        if (locationNames.length === 0) locationNames = ["Online / Center"];
                    }

                    locationNames.forEach((name: string) => uniqueBranchNames.add(name));

                    return {
                        _id: b.batchId?.toString() || Math.random().toString(),
                        startDate: b.stDate || b.syStDate || "TBD",
                        dayTiming: b.batch || "Standard Timing",
                        examAttempt: b.attempt || b.acr || "N/A",
                        language: "English",
                        mode: (b.batchType || "").toLowerCase() === "offline" ? "Face to Face" : (b.batchType || "").toLowerCase() === "online" ? "Live Online" : "Face to Face", // Map to tab mode based on batchType
                        location: locationNames, // Map to actual branch names array
                        batchId: b.batchId?.toString(),
                        attemptId: b.attemptId?.toString(),
                        courseId: b.course?.toString(),
                        levelId: b.level?.toString(),
                        categories: [course.course] // Match course category so it passes the filter
                    };
                });

                setBatches(mappedBatches);

                // Update dropdown with branches that actually have batches
                if (uniqueBranchNames.size > 0) {
                    setBranches(Array.from(uniqueBranchNames).map(name => ({ name })));
                } else {
                    setBranches([{ name: "Online / Center" }]);
                }
            } else {
                setBatches([]);
            }
        } catch (err) {
            console.error("Failed to fetch batch/branch details", err);
            setBatches([]);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-muted/30 via-white to-muted/20">
            {/* Modern Header with Glassmorphism */}
            <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-border/50">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl text-foreground">All Courses</h1>
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                                    {filteredCourses.length} Available
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Professional Certification Programs Designed for Success
                            </p>
                        </div>


                    </div>

                    {/* Modern Search & Filter Bar */}
                    <div className="flex flex-col gap-3">
                        {/* Advanced Search Bar */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative bg-white rounded-xl border-2 border-border/50 group-hover:border-primary/30 transition-all shadow-sm">
                                <div className="flex items-center gap-3 px-5 py-3">
                                    <Search className="w-5 h-5 text-primary flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for CA, CS, CMA courses, instructors, topics..."
                                        className="flex-1 bg-transparent focus:outline-none text-sm text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Search Tags */}
                        {/* <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Popular:</span>
              {["CA", "CS", "CMA", "Online"].map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(tag)}
                  className={`text-xs bg-white hover:bg-primary hover:text-white border border-border/50 hover:border-primary px-3 py-1 rounded-lg transition-all shadow-sm ${searchQuery === tag ? "bg-primary text-white border-primary" : "text-muted-foreground"}`}
                >
                  {tag}
                </button>
              ))}
            </div> */}
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Modern Floating Filter Panel */}
                    <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-72 flex-shrink-0`}>
                        <div className="sticky top-28 space-y-4">
                            {/* Quick Filters - Chips Style */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-border/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm text-foreground flex items-center gap-2 font-medium">
                                        <Filter className="w-4 h-4" />
                                        Filters
                                    </h3>
                                    <button
                                        className="text-xs text-primary hover:underline"
                                        onClick={() => {
                                            setSelectedCategory("all");
                                            setSelectedLevel("all");
                                            setSelectedPriceRange("all");
                                            setSearchQuery("");
                                        }}
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Exam Type / Category */}
                                <div className="mb-5">
                                    <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedCategory("all")}
                                            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedCategory === "all"
                                                ? "bg-primary text-white shadow-sm"
                                                : "bg-muted/50 hover:bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            All
                                        </button>
                                        {apiCategories.map((cat, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedCategory(cat as string)}
                                                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedCategory === cat
                                                    ? "bg-primary text-white shadow-sm"
                                                    : "bg-muted/50 hover:bg-muted text-muted-foreground"
                                                    }`}
                                            >
                                                {cat as string}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Level / Tags */}
                                <div className="mb-5">
                                    <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">Level</label>
                                    <div className="space-y-1.5">
                                        <button
                                            onClick={() => setSelectedLevel("all")}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${selectedLevel === "all"
                                                ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                                                : "hover:bg-muted/50 text-muted-foreground"
                                                }`}
                                        >
                                            All Levels
                                        </button>
                                        {apiLevels.map((level, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedLevel(level as string)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${selectedLevel === level
                                                    ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                                                    : "hover:bg-muted/50 text-muted-foreground"
                                                    }`}
                                            >
                                                {level as string}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* Popular Filters */}
                            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-5 border border-primary/10">
                                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    Trending Now
                                </h3>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Most Enrolled</span>
                                        <Award className="w-3 h-3 text-accent" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Highest Rated</span>
                                        <Star className="w-3 h-3 text-accent" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">New Batches</span>
                                        <Play className="w-3 h-3 text-accent" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Course Grid/List */}
                    <main className="flex-1 min-w-0">
                        {/* Sort Bar */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-xs h-8 bg-white">
                                    <ArrowUpDown className="w-3 h-3 mr-1" />
                                    Sort: Popular
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Showing <span className="text-foreground font-medium">{filteredCourses.length}</span> courses
                            </p>
                        </div>

                        {/* Modern Course Grid */}
                        <div className={viewMode === "grid" ? "grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5" : "space-y-4"}>
                            {currentCourses.map((course) => (
                                <div
                                    key={`${course.courseId}-${course.levelId}`}
                                    className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 flex flex-col p-6 h-full"
                                >
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                {course.course}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                            {course.level}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Comprehensive preparation program for {course.level} exams.
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-border/50">
                                        <Button
                                            onClick={() => handleEnrollClick(course)}
                                            className="w-full bg-primary hover:bg-primary/90 text-white font-medium shadow-md"
                                        >
                                            Enroll
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {filteredCourses.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-border shadow-sm">
                                    <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Filter className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground mb-1">No courses found</h3>
                                    <p className="text-sm text-muted-foreground mb-6">Try adjusting your filters or search query.</p>
                                    <Button variant="outline" onClick={() => {
                                        setSelectedCategory("all");
                                        setSelectedLevel("all");
                                        setSelectedPriceRange("all");
                                        setSearchQuery("");
                                    }}>
                                        Clear All Filters
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Modern Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white h-9 px-4"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        size="sm"
                                        variant={currentPage === page ? "default" : "outline"}
                                        className={currentPage === page ? "bg-primary text-white shadow-md h-9 w-9" : "bg-white h-9 w-9"}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white h-9 px-4"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Enroll Modal */}
            <BatchEnrollmentModal
                isOpen={showEnrollModal}
                onClose={() => {
                    setShowEnrollModal(false);
                    setSelectedCourse(null);
                }}
                course={selectedCourse}
                batches={batches}
                branches={branches}
            />

            {/* Meritto Form Modal */}
            <MerittoFormModal
                isOpen={showMerittoModal}
                onClose={() => setShowMerittoModal(false)}
            />
        </div>
    );
}
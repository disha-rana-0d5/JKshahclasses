import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, Users, Star, BookOpen, Search, X, SlidersHorizontal, ChevronDown, Filter, ArrowUpDown, Grid3x3, List, TrendingUp, Award, Play, Banknote, Coins, Gem } from "lucide-react";
import { BatchEnrollmentModal } from "./modals/BatchEnrollmentModal";
import { useCourseContext } from "../admin/context/CourseContext";
import { landingPageApi, batchApi } from "../api/api";

export function CoursesPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { allCourses, categories, levels } = useCourseContext();
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

  useEffect(() => {
    document.title = "Courses | JK Shah Classes";
    const loadData = async () => {
      try {
        const [batchRes, contentRes] = await Promise.all([
          batchApi.getBatches(),
          landingPageApi.getLandingContent()
        ]);
        if (batchRes.ok && batchRes.data.success) {
          setBatches(batchRes.data.data);
        }
        if (contentRes.ok && contentRes.data.success) {
          setBranches(contentRes.data.data.branches || []);
        }
      } catch (error) {
        console.error("Failed to load enrollment data", error);
      }
    };
    loadData();
  }, []);

  const filteredCourses = allCourses.filter(course => {
    if (course.status !== "Active") return false;

    // Category filter logic
    if (categoryId || selectedCategory !== "all") {
      let activeCatId = selectedCategory !== "all" ? categories.find(c => c.name === selectedCategory)?._id : undefined;

      if (categoryId) {
        const catById = categories.find(c => c._id === categoryId);
        if (catById) {
          activeCatId = catById._id;
        } else {
          const decodedName = decodeURIComponent(categoryId);
          const catByName = categories.find(c => c.name.toLowerCase() === decodedName.toLowerCase());
          if (catByName) {
            activeCatId = catByName._id;
          }
        }
      }

      if (activeCatId) {
        const activeCatName = categories.find(c => c._id === activeCatId)?.name;
        const subCatNames = categories.filter(c => c.parent === activeCatId).map(c => c.name);

        const allowedCategories = [activeCatName, ...subCatNames].filter(Boolean);
        if (!allowedCategories.includes(course.category)) return false;
      }
    }

    // Level filter
    if (selectedLevel !== "all" && course.level !== selectedLevel) return false;

    // Price range filter
    if (selectedPriceRange !== "all") {
      const price = course.price;
      if (selectedPriceRange === "under25k" && price >= 25000) return false;
      if (selectedPriceRange === "25k-35k" && (price < 25000 || price > 35000)) return false;
      if (selectedPriceRange === "above35k" && price <= 35000) return false;
    }

    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !course.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    return true;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const currentCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedLevel, selectedPriceRange, searchQuery, categoryId]);

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
                Professional certification programs designed for success
              </p>
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-white/50"
                  }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-white/50"
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-xs text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
                    >
                      {showFilters ? <X className="w-3 h-3" /> : <SlidersHorizontal className="w-3 h-3" />}
                      <span className="hidden sm:inline">{showFilters ? "Hide" : "Filters"}</span>
                    </button>
                  </div>
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
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedCategory === cat.name
                          ? "bg-primary text-white shadow-sm"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground"
                          }`}
                      >
                        {cat.name}
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
                    {levels.map((level) => (
                      <button
                        key={level._id}
                        onClick={() => setSelectedLevel(level.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${selectedLevel === level.name
                          ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                          : "hover:bg-muted/50 text-muted-foreground"
                          }`}
                      >
                        {level.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-2">
                  <h3 className="text-xs font-semibold text-slate-500/80 mb-4 block uppercase tracking-wider">Price Range</h3>
                  <div className="space-y-1.5">
                    {[
                      { id: "all", label: "All Prices", icon: "💰" },
                      { id: "under25k", label: "Under ₹25K", icon: "💵" },
                      { id: "25k-35k", label: "₹25K - ₹35K", icon: "💴" },
                      { id: "above35k", label: "Above ₹35K", icon: "💎" },
                    ].map((range) => (
                      <button
                        key={range.id}
                        onClick={() => setSelectedPriceRange(range.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-3 ${selectedPriceRange === range.id
                          ? "bg-primary/5 text-primary font-medium"
                          : "hover:bg-slate-50 text-slate-600"
                          }`}
                      >
                        <span className="text-sm leading-none">{range.icon}</span>
                        <span>{range.label}</span>
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
                  key={course._id}
                  onClick={() => navigate(`/course/${course.title.toLowerCase().replace(/ /g, '-')}`)}
                  className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 flex flex-col cursor-pointer"
                >
                  {/* Image with Overlay Info */}
                  <div className="relative h-44 overflow-hidden">
                    <ImageWithFallback
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top Tags */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                      <div className="flex gap-2">
                        <span className="bg-primary text-white px-2.5 py-1 rounded-md text-[10px] uppercase font-bold shadow-lg">
                          {course.category}
                        </span>
                        {course.level && (
                          <span className="bg-accent text-white px-2.5 py-1 rounded-md text-[10px] uppercase font-bold shadow-lg">
                            {course.level}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-foreground font-bold">{course.rating}</span>
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-2 text-white/90 text-[10px] mb-2 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                      </div>
                      {/* Discount Badge Removed */}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-foreground mb-0 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      {course.level && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-50 text-red-500 text-[11px] font-medium">
                          {course.level}
                        </span>
                      )}
                    </div>

                    {/* Faculty Info */}
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                      <img
                        src={course.facultyImage}
                        alt={course.facultyName}
                        className="w-8 h-8 rounded-full border border-border object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{course.facultyName}</p>
                        <p className="text-[10px] text-muted-foreground">{course.enrolledTotal}+ students</p>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(course.highlights || []).slice(0, 3).map((highlight, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3">
                      <Users className="w-3 h-3 text-primary/60" />
                      <span>{course.enrolledRecent} enrolled recently</span>
                    </div>

                    {/* Price & CTA */}
                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl text-primary font-bold">₹{course.price}</span>
                          {course.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">₹{course.originalPrice}</span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-md font-medium h-9 px-4" onClick={() => {
                        setSelectedCourse(course);
                        setShowEnrollModal(true);
                      }}>
                        Enroll
                      </Button>
                    </div>
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
    </div>
  );
}
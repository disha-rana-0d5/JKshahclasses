import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, Users, Star, BookOpen, Search, X, SlidersHorizontal, ChevronDown, Filter, ArrowUpDown, Grid3x3, List, TrendingUp, Award, Play, Banknote, Coins, Gem, Download } from "lucide-react";
import { BatchEnrollmentModal } from "./modals/BatchEnrollmentModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useCourseContext } from "../admin/context/CourseContext";
import { landingPageApi, batchApi } from "../api/api";
import { generateSlug } from "../admin/utils/slugify";
import { toast } from "sonner";
import { MerittoFormModal } from "./modals/MerittoFormModal";

export function CoursesPage() {
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const { allCourses, allCategories: categories, allLevels: levels } = useCourseContext();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [batches, setBatches] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const [enquireOpen, setEnquireOpen] = useState(false);
  const [pendingBrochure, setPendingBrochure] = useState<string | null>(null);

  useEffect(() => {
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

  useEffect(() => {
    const activeIdentifier = categorySlug;
    if (activeIdentifier && categories.length > 0) {
      let currentCat = categories.find(c => c._id === activeIdentifier || (c.slug || generateSlug(c.name)) === activeIdentifier);
      if (!currentCat) {
        const decodedName = decodeURIComponent(activeIdentifier);
        currentCat = categories.find(c => c.name.toLowerCase() === decodedName.toLowerCase());
      }
      
      if (currentCat) {
        document.title = currentCat.metaTitle || `${currentCat.name} Courses`;
        
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute("content", currentCat.metaDescription || "");

        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
          ogTitle = document.createElement('meta');
          ogTitle.setAttribute('property', 'og:title');
          document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute("content", currentCat.metaTitle || `${currentCat.name} Courses`);
        
        let ogDescription = document.querySelector('meta[property="og:description"]');
        if (!ogDescription) {
          ogDescription = document.createElement('meta');
          ogDescription.setAttribute('property', 'og:description');
          document.head.appendChild(ogDescription);
        }
        ogDescription.setAttribute("content", currentCat.metaDescription || "");

        return;
      }
    }
    
    document.title = "Courses";
  }, [categorySlug, categories]);

  // Redirect if category has no sub-categories removed as per request
  // useEffect(() => {
  //   const activeIdentifier = categorySlug || categoryId;
  //   if (activeIdentifier && categories.length > 0 && allCourses.length > 0) {
  //     const currentCat = categories.find(c => c._id === activeIdentifier || (c.slug || generateSlug(c.name)) === activeIdentifier) ||
  //       categories.find(c => c.name.toLowerCase() === decodeURIComponent(activeIdentifier).toLowerCase());

  //     if (currentCat) {
  //       const hasSubCategories = categories.some(c => c.parent === currentCat._id);
  //       if (!hasSubCategories) {
  //         const course = allCourses.find(c => c.category === currentCat.name && c.status === "Active");
  //         if (course) {
  //           navigate(`/course/${course.slug || generateSlug(course.title)}`, { replace: true });
  //         }
  //       }
  //     }
  //   }
  // }, [categorySlug, categories, allCourses, navigate]);

  const filteredCourses = allCourses.filter(course => {
    if (course.status !== "Active") return false;

    // Category filter logic
    const activeIdentifier = categorySlug;
    if (activeIdentifier || selectedCategory !== "all") {
      let activeCatId = selectedCategory !== "all" ? categories.find(c => c.name === selectedCategory)?._id : undefined;

      if (activeIdentifier) {
        const catByIdOrSlug = categories.find(c => c._id === activeIdentifier || (c.slug || generateSlug(c.name)) === activeIdentifier);
        if (catByIdOrSlug) {
          activeCatId = catByIdOrSlug._id;
        } else {
          const decodedName = decodeURIComponent(activeIdentifier);
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
  }).sort((a: any, b: any) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === "price_low") {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortBy === "price_high") {
      return (b.price || 0) - (a.price || 0);
    }
    // popular could sort by some enrollment metric if available, otherwise keep default
    return 0;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const currentCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedLevel, selectedPriceRange, searchQuery, categorySlug]);

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
                  {/* <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-xs text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
                    >
                      {showFilters ? <X className="w-3 h-3" /> : <SlidersHorizontal className="w-3 h-3" />}
                      <span className="hidden sm:inline">{showFilters ? "Hide" : "Filters"}</span>
                    </button>
                  </div> */}
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
                {/* <div className="mb-2">
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
                </div> */}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="text-xs h-8 bg-white outline-none focus-visible:ring-0 focus:ring-0">
                      <ArrowUpDown className="w-3 h-3 mr-1" />
                      Sort: {sortBy === "popular" ? "Popular" : sortBy === "newest" ? "Newest" : sortBy === "price_high" ? "Price: High to Low" : "Price: Low to High"}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => setSortBy("popular")}>Popular</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price_low")}>Price: Low to High</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price_high")}>Price: High to Low</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-xs text-muted-foreground">
                Showing <span className="text-foreground font-medium">{filteredCourses.length}</span> courses
              </p>
            </div>

            {/* Modern Course Grid */}
            <div className={viewMode === "grid" ? "grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5" : "space-y-4"}>
              {currentCourses.map((course, index) => (
                <div
                  key={course._id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-border cursor-pointer flex flex-col h-full"
                  onClick={() => navigate(`/course/${course.slug || generateSlug(course.title)}`)}
                >
                  <div className="relative aspect-[3/2] overflow-hidden shrink-0">
                    <ImageWithFallback
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold text-foreground">{index % 2 === 0 ? 4.8 : 4.9}</span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1 cursor-pointer">
                    <div className="mb-3">
                      <h3 className="text-base font-semibold mb-1 text-foreground line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                        {course.syllabusModules?.length > 0 && (
                          <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-semibold">
                            {course.syllabusModules.length} Levels
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{course.description}</p>

                    <div className="mt-auto flex gap-2 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs border-primary text-primary hover:bg-primary/10 hover:!text-primary cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (course.brochureUrl) {
                            setPendingBrochure(course.brochureUrl);
                            setEnquireOpen(true);
                          } else {
                            toast.info("Brochure coming soon");
                          }
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Brochure
                      </Button>
                      <Button
                        size="sm"
                        disabled
                        className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90 text-white cursor-not-allowed opacity-70"
                        onClick={(e) => {
                          e.stopPropagation();
                          // setSelectedCourse(course);
                          // setShowEnrollModal(true);
                        }}
                      >
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

      {showEnrollModal && selectedCourse && (
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
      )}

      <MerittoFormModal 
        isOpen={enquireOpen} 
        onClose={() => {
          setEnquireOpen(false);
          if (pendingBrochure) {
            window.open(pendingBrochure, '_blank');
            setPendingBrochure(null);
          }
        }} 
      />
    </div>
  );
}
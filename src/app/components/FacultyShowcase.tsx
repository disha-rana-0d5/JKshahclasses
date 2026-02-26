import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import {
  Award,
  BookOpen,
  Star,
  GraduationCap,
  Users,
  Trophy,
  Sparkles,
  ArrowRight,
  Quote,
  Play,
  TrendingUp,
  Crown,
  Zap,
  CheckCircle2,
  Target,
  MessageCircle,
  Video,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BookDemoModal } from "./modals/BookDemoModal";
import { VideoModal } from "./modals/VideoModal";
import { facultyApi, landingPageApi } from "../api/api";
import { toast } from "sonner";
import { FacultyCard } from "./FacultyCard";

interface Faculty {
  _id: string;
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

import { useLocation } from "react-router-dom";

export function FacultyShowcase() {
  const location = useLocation();
  const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<number>(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Filters and Pagination State
  const [selectedCourse, setSelectedCourse] = useState<string>("All");
  const [selectedBranch, setSelectedBranch] = useState<string>(location.state?.branchName || "All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Derive unique courses entirely from faculty data
  const uniqueCourses = useMemo(() => {
    const courses = new Set<string>();
    facultyMembers.forEach(f => f.coursesTaught?.forEach(c => courses.add(c)));
    return ["All", ...Array.from(courses).sort()];
  }, [facultyMembers]);

  // Derive unique branches realistically from landing page content branches
  const uniqueBranches = useMemo(() => {
    if (!content?.branches) return ["All"];
    const branchesWithFaculty = content.branches.filter((b: any) => b.faculties && b.faculties.length > 0);
    const branchNames = branchesWithFaculty.map((b: any) => b.name);
    return ["All", ...Array.from(new Set(branchNames)).sort() as string[]];
  }, [content]);

  // Top 3 Faculty Logic for Right Side Stack
  // Filter by branch first (like gridFacultyMembers) then sort
  const top4Faculties = useMemo(() => {
    let pool = [...facultyMembers];

    // Apply branch filter to Top Experts if a branch is explicitly selected
    if (selectedBranch !== "All") {
      if (location.state?.branchName === selectedBranch && location.state?.branchFaculties) {
        pool = pool.filter(f => location.state.branchFaculties.includes(f.name));
      } else {
        const branchObj = content?.branches?.find((b: any) => b.name === selectedBranch);
        if (branchObj && branchObj.faculties) {
          pool = pool.filter(f => branchObj.faculties.includes(f.name));
        }
      }
    } else if (location.state?.branchFaculties?.length > 0) {
      pool = pool.filter(f => location.state.branchFaculties.includes(f.name));
    }

    return pool
      .sort((a, b) => b.experience - a.experience)
      .slice(0, 3);
  }, [facultyMembers, selectedBranch, content, location.state]);

  // Base list influenced by branch URL state if ANY
  const baseFacultyMembers = useMemo(() => {
    return facultyMembers;
  }, [facultyMembers, location.state?.branchFaculties]);

  // Filtered List for the Grid Bottom Section
  const gridFacultyMembers = useMemo(() => {
    let result = baseFacultyMembers;

    if (selectedCourse !== "All") {
      result = result.filter(f => f.coursesTaught?.includes(selectedCourse));
    }

    if (selectedBranch !== "All") {
      if (location.state?.branchName === selectedBranch && location.state?.branchFaculties) {
        result = result.filter(f => location.state.branchFaculties.includes(f.name));
      } else {
        // Find the branch in content to see which faculties it has
        const branchObj = content?.branches?.find((b: any) => b.name === selectedBranch);
        if (branchObj && branchObj.faculties) {
          result = result.filter(f => branchObj.faculties.includes(f.name));
        }
      }
    }

    return result;
  }, [baseFacultyMembers, selectedCourse, selectedBranch, content, location.state]);

  // Pagination Logic
  const totalPages = Math.ceil(gridFacultyMembers.length / itemsPerPage);
  const paginatedFaculties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return gridFacultyMembers.slice(start, start + itemsPerPage);
  }, [gridFacultyMembers, currentPage, itemsPerPage]);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      await Promise.all([fetchFaculties(), fetchContent()]);
      setIsLoading(false);
    };
    loadAllData();
  }, []);

  useEffect(() => {
    document.title = "Our Expert Faculty | JK Shah Classes";
  }, []);

  useEffect(() => {
    if (top4Faculties.length > 0 && location.state?.facultyName) {
      const idx = top4Faculties.findIndex(f => f.name === location.state.facultyName);
      if (idx !== -1) {
        setSelectedFaculty(idx);
      }
    } else if (top4Faculties.length > 0) {
      // Set to 0 initially or when filter changes
      setSelectedFaculty(0);
    }
  }, [top4Faculties, location.state?.facultyName]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourse, selectedBranch]);

  const fetchContent = async () => {
    try {
      const { ok, data } = await landingPageApi.getLandingContent();
      if (ok) {
        setContent(data.data);
      }
    } catch (err) {
      console.error("Error fetching content:", err);
    }
  };

  const fetchFaculties = async () => {
    try {
      const { ok, data } = await facultyApi.getFaculties();
      if (ok && data.success) {
        setFacultyMembers(data.data);
      }
    } catch (err) {
      console.error("Error fetching faculty:", err);
      toast.error("Failed to load faculty members");
    }
  };

  const expertiseColors: Record<string, { bg: string; text: string; gradient: string }> = {
    "Accounts": { bg: "bg-blue-500/10", text: "text-blue-600", gradient: "from-blue-500 to-cyan-500" },
    "Law": { bg: "bg-purple-500/10", text: "text-purple-600", gradient: "from-purple-500 to-pink-500" },
    "Tax": { bg: "bg-amber-500/10", text: "text-amber-600", gradient: "from-amber-500 to-orange-500" },
    "Costing": { bg: "bg-emerald-500/10", text: "text-emerald-600", gradient: "from-emerald-500 to-teal-500" },
    "Economics": { bg: "bg-indigo-500/10", text: "text-indigo-600", gradient: "from-indigo-500 to-blue-500" },
    "Finance": { bg: "bg-rose-500/10", text: "text-rose-600", gradient: "from-rose-500 to-pink-500" }
  };

  const iconMap: Record<string, any> = {
    GraduationCap,
    Users,
    Trophy,
    TrendingUp,
    CheckCircle2,
    Award,
    Target
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading our world-class faculty...</p>
        </div>
      </div>
    );
  }

  if (facultyMembers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No faculty members found at the moment.</p>
        </div>
      </div>
    );
  }

  const selectedFacultyData = top4Faculties[selectedFaculty] || top4Faculties[0] || facultyMembers[0];
  const expertiseColor = expertiseColors[selectedFacultyData.expertise] || expertiseColors["Accounts"];
  const facultyPage = content?.facultyPage || {
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

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with Badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-200 px-5 py-2.5 rounded-full mb-6 relative">
            <Award className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-gray-900">
              {selectedBranch !== "All" ? `Faculty at ${selectedBranch}` : facultyPage.header.badge}
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            {facultyPage.header.titleLine1}{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">
                {selectedBranch !== "All" ? "Expert Minds" : facultyPage.header.titleHighlight}
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-amber-200 -rotate-1"></span>
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {facultyPage.header.description}
          </p>
        </div>

        {/* Full-width Filters & Split Layout Wrapper */}
        <div className="mb-20">

          {/* Filters - Now at the top */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-red-600" />
              <h3 className="text-xl font-bold text-gray-900">
                {selectedBranch !== "All" ? `Faculties for ${selectedBranch}` : 'Discover all Faculties'}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 w-16">Course:</span>
                <select
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 min-w-[150px]"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {uniqueCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 w-16">Branch:</span>
                <select
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 min-w-[150px]"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  {uniqueBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* New Split Layout: Left All Faculties, Right Top Faculties */}
          <div className="grid lg:grid-cols-12 gap-8">

            {/* Left Column: All Faculties Grid View */}
            <div className={`${top4Faculties.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col`}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 content-start">
                {paginatedFaculties.length > 0 ? (
                  paginatedFaculties.map((faculty) => (
                    <div
                      key={faculty._id}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        const topIdx = top4Faculties.findIndex(f => f._id === faculty._id);
                        if (topIdx !== -1) setSelectedFaculty(topIdx);
                      }}
                      className="cursor-pointer"
                    >
                      <FacultyCard
                        name={faculty.name}
                        designation={faculty.designation}
                        imageUrl={faculty.image}
                        experience={`${faculty.experience} Years`}
                        specialization={faculty.expertise}
                        rating={parseFloat(faculty.rating)}
                        studentsCount={parseInt(faculty.totalStudents.replace(/,/g, ''))}
                        coursesCount={faculty.coursesTaught?.length || 0}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto border border-gray-100 shadow-sm">
                      <p className="text-gray-500 font-medium">No faculty members match your selected filters.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => { setSelectedCourse("All"); setSelectedBranch("All"); }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        className={`w-10 h-10 rounded-full ${currentPage === i + 1 ? "bg-red-600 text-white hover:bg-red-700" : ""}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column: Top Faculties */}
            {top4Faculties.length > 0 && (
              <div className="lg:col-span-4 space-y-4">
                <div className="sticky top-24">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between bg-white px-2 py-1">
                    <span>
                      {selectedBranch !== "All" ? `Top Experts for ${selectedBranch}` : 'Top Highly Skilled Experts'}
                    </span>
                  </h3>

                  <div className="space-y-4">
                    {top4Faculties.map((faculty, idx) => {
                      const colors = expertiseColors[faculty.expertise] || expertiseColors["Accounts"];

                      return (
                        <div
                          key={faculty._id}
                          className="group relative bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col"
                        >
                          {/* Image Section */}
                          <div className="relative h-48 overflow-hidden">
                            <ImageWithFallback
                              src={faculty.image}
                              alt={faculty.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />

                            {/* Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                            <div className={`absolute inset-0 bg-gradient-to-tr ${colors.gradient} opacity-20 mix-blend-overlay`}></div>

                            {/* Floating Stats */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                              <div className={`bg-gradient-to-r ${colors.gradient} rounded-xl px-2 py-1.5 shadow-lg text-white backdrop-blur-md`}>
                                <p className="text-lg font-black leading-none text-center">{faculty.experience}+</p>
                                <p className="text-[9px] uppercase tracking-wider font-bold opacity-90 text-center mt-1">Years</p>
                              </div>
                            </div>

                            {/* Badges on Image Bottom */}
                            <div className="absolute bottom-3 left-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text} border border-current/20 backdrop-blur-md shadow-sm`}>
                                {faculty.expertise} Expert
                              </span>
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="p-4 flex-1 flex flex-col relative z-10 bg-white">
                            <h3 className="text-lg font-black text-gray-900 mb-0.5 line-clamp-1 group-hover:text-red-600 transition-colors">
                              {faculty.name}
                            </h3>
                            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                              {faculty.designation}
                            </p>

                            {/* Qualifications display */}
                            {faculty.qualifications && faculty.qualifications.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1 mb-3">
                                {faculty.qualifications.slice(0, 3).map((qual, qIdx) => (
                                  <span key={qIdx} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600`}>
                                    {qual}
                                  </span>
                                ))}
                                {faculty.qualifications.length > 3 && (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600`}>
                                    +{faculty.qualifications.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Mini Stats Icons */}
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100 mt-auto">
                              <div className="flex items-center gap-1.5 flex-1 justify-center">
                                <Users className={`w-3.5 h-3.5 ${colors.text}`} />
                                <span>{faculty.totalStudents}</span>
                              </div>
                              <div className="w-px h-5 bg-gray-200"></div>
                              <div className="flex items-center gap-1.5 flex-1 justify-center">
                                <BookOpen className={`w-3.5 h-3.5 ${colors.text}`} />
                                <span>{faculty.coursesTaught?.length || 0} Progs</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 p-6 sm:p-12 mb-20">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

          <div className="relative grid md:grid-cols-4 gap-8 text-center text-white">
            {facultyPage.stats.map((stat: any, idx: number) => {
              const Icon = iconMap[stat.iconName] || GraduationCap;
              return (
                <div key={idx} className="space-y-3">
                  <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-5xl font-black mb-1">{stat.value}</p>
                    <p className="text-lg font-semibold mb-1">{stat.label}</p>
                    <p className="text-sm opacity-80">{stat.sublabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-6 sm:p-12">
          <Crown className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            {facultyPage.cta.title}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {facultyPage.cta.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg group" onClick={() => setShowDemoModal(true)}>
              <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              {facultyPage.cta.demoBtnText}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-gray-900 px-8 py-6 text-lg rounded-xl" onClick={() => setShowVideoModal(true)}>
              <Video className="w-5 h-5 mr-2" />
              {facultyPage.cta.interviewBtnText}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-gray-200">
            {facultyPage.trustIndicators.map((item: any, idx: number) => {
              const Icon = iconMap[item.iconName] || CheckCircle2;
              return (
                <div key={idx} className="flex items-center gap-2 text-gray-600">
                  <Icon className="w-5 h-5 text-gray-900" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookDemoModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
      <VideoModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} videoTitle="Faculty Interview - World Class Teaching" />
    </section>
  );
}
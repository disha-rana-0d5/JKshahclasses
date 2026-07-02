"use client";

import { useState, useEffect, Fragment, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Clock,
  Users,
  BookOpen,
  Award,
  Star,
  StarHalf,
  Play,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Video,
  FileText,
  Headphones,
  Download,
  Share2,
  Heart,
  TrendingUp,
  Target,
  ArrowLeft,
  MapPin,
  Quote,
  Trophy,
  Medal,
  Phone,
  ArrowRight,
  Brain,
  ClipboardCheck,
  UserCheck,
  History,
  Presentation,
  Check,
  GraduationCap,
  Globe,
  Briefcase
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BatchEnrollmentModal } from "./modals/BatchEnrollmentModal";
import { VideoModal } from "./modals/VideoModal";
import { MerittoFormModal } from "./modals/MerittoFormModal";
import { landingPageApi, batchApi, alumniWorkAtApi } from "../api/api";
import { useCourseContext } from "../admin/context/CourseContext";
import { toast } from "sonner";
import { generateSlug } from "../admin/utils/slugify";
import { RankersSection } from "./RankersSection";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "./ui/carousel";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./ui/tabs";

interface SyllabusModule {
  title: string;
  topics: (string | {
    title: string;
    details: string;
    subjects?: { name: string; price: string | number }[];
  })[];
  duration: string;
}


const FaqTabs = ({ topics, idx }: { topics: any[], idx: number }) => {
  const tabsListRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (tabsListRef.current) {
      const scrollAmount = 200;
      tabsListRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex items-center gap-4 w-full mb-6">
      <style>{`
        .faq-tabs-scroll::-webkit-scrollbar {
          display: none;
        }
        .faq-tabs-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <button
        onClick={() => scroll('left')}
        className="bg-white shadow-md p-2 rounded-full border border-border hover:bg-muted transition-all flex items-center justify-center shrink-0"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4 text-foreground" />
      </button>

      <div
        ref={tabsListRef}
        className="faq-tabs-scroll flex-1 overflow-x-auto pb-2 px-1 bg-transparent h-auto flex-nowrap"
      >
        <TabsList className="flex bg-transparent h-auto p-0 gap-4 flex-nowrap w-fit mx-auto">
          {topics.map((topic: any, tIdx: number) => (
            <TabsTrigger
              key={tIdx}
              value={`topic-${idx}-${tIdx}`}
              className="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 border shadow-sm hover:shadow-lg data-[state=active]:bg-[#373081] data-[state=active]:border-[#373081] data-[state=active]:text-white data-[state=active]:shadow-md bg-white border-border text-foreground hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-transparent flex-shrink-0"
            >
              {topic.title || "General Information"}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <button
        onClick={() => scroll('right')}
        className="bg-white shadow-md p-2 rounded-full border border-border hover:bg-muted transition-all flex items-center justify-center shrink-0"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4 text-foreground" />
      </button>
    </div>
  );
};

// Premium Advantage Logo Component (Glowing Golden Circle)
const AdvantageLogo = ({ src }: { src: string }) => (
  <div className="relative w-full max-w-[150px] sm:max-w-[200px] lg:max-w-[260px] aspect-square flex items-center justify-center">
    {/* Outer Glow Spotlight (Subtle & Static) */}
    <div className="absolute inset-[-20%] bg-[#fbbf24]/20 rounded-full blur-[50px] animate-pulse" />

    <motion.div
      animate={{
        scale: [1, 1.05, 1, 1.1, 1],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative z-10 w-full h-full rounded-full bg-[#c4b57d] border-[3px] border-white/60 shadow-[0_0_30px_rgba(251,191,36,0.3)] flex items-center justify-center p-6 sm:p-8 overflow-hidden group"
    >
      {/* Inner Decorative Ring */}
      <div className="absolute inset-2 border border-white/30 rounded-full pointer-events-none" />

      <div className="relative w-full h-full">
        {/* Shimmer Effect Overlay */}
        <motion.div
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "easeInOut"
          }}
          className="absolute inset-x-0 inset-y-[-50%] bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-[25deg] z-10 pointer-events-none"
        />

        <ImageWithFallback
          src={src}
          alt="JK Shah Classes"
          className="w-full h-full object-contain filter drop-shadow-md"
        />
      </div>
    </motion.div>
  </div>
);


// Premium Advantage Card Component (Modern grid style)
const AdvantageCard = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.02 }}
    viewport={{ once: true }}
    className="relative w-full aspect-[3/1] sm:aspect-[2.5/1] lg:aspect-[3/1] flex flex-row items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-3xl bg-[#ebeaf2] border border-slate-200/20 shadow-lg group transition-all duration-500 overflow-hidden"
  >
    {/* Content */}
    <div className="relative z-10 flex items-center gap-4 text-left w-full">
      <div className="relative p-3 rounded-xl bg-transparent shrink-0">
        <Icon className="w-5 h-5 sm:w-8 sm:h-8 text-[#fbbf24] drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
      </div>
      <h4 className="text-[10px] sm:text-xs lg:text-[13px] font-bold text-slate-800 leading-tight tracking-wide uppercase flex-1">
        {title}
      </h4>
    </div>
  </motion.div>
);


const VideoDescription = ({ description }: { description: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  return (
    <div className="mt-2">
      <p className={`text-xs text-muted-foreground transition-all ${!isExpanded ? 'line-clamp-3' : ''}`}>
        {description}
      </p>
      {description.length > 100 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-primary mt-1 font-medium hover:underline focus:outline-none"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
};

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPathPrefix = location.pathname.split('/').slice(0, -1).join('/') + '/';
  const { allCourses: courses, allCategories: categories, courseTimelines, careerConfigs } = useCourseContext();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeAdvantage, setActiveAdvantage] = useState(0);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [expandedTopic, setExpandedTopic] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState<"overview" | "syllabus" | "faculty" | "reviews">("overview");
  const [showMerittoModal, setShowMerittoModal] = useState(true);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [pendingBrochure, setPendingBrochure] = useState<string | null>(null);
  const [testimonialApi, setTestimonialApi] = useState<CarouselApi>();

  // Show Meritto form when navigating to a new course
  useEffect(() => {
    setShowMerittoModal(true);
  }, [slug]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!testimonialApi) return;

    const intervalId = setInterval(() => {
      testimonialApi.scrollNext();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(intervalId);
  }, [testimonialApi]);
  const [selectedRelatedCourse, setSelectedRelatedCourse] = useState<any>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [reviewsVisibleCount, setReviewsVisibleCount] = useState(3);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [showWhyCareerMore, setShowWhyCareerMore] = useState(false);
  const [showWhyJKShahMore, setShowWhyJKShahMore] = useState(false);
  const [alumniApi, setAlumniApi] = useState<CarouselApi>();
  const [videoApi, setVideoApi] = useState<CarouselApi>();
  const [sidebarVideoApi, setSidebarVideoApi] = useState<CarouselApi>();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [alumniWorkAt, setAlumniWorkAt] = useState<any[]>([]);

  useEffect(() => {
    if (!alumniApi) return;

    const intervalId = setInterval(() => {
      alumniApi.scrollNext();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [alumniApi]);

  useEffect(() => {
    if (!sidebarVideoApi || !course?.videos || course.videos.length <= 1) return;

    const intervalId = setInterval(() => {
      sidebarVideoApi.scrollNext();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [sidebarVideoApi, course?.videos]);


  useEffect(() => {
    if (!videoApi) return;

    const intervalId = setInterval(() => {
      videoApi.scrollNext();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [videoApi]);

  const checkAuthAndEnroll = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const isStudent = !!token && user?.role === "student";

    if (!isStudent) {
      toast.error("Please login to enroll in courses");
      window.location.href = "https://new-online.jkshahclasses.com/";
      return false;
    }
    return true;
  };

  const handleBuyNow = (topic: any) => {
    if (!checkAuthAndEnroll()) return;
    setSelectedTopic(topic);
    setIsBuyNowOpen(true);
  };



  const handleAddToCart = () => {
    if (!checkAuthAndEnroll()) return;
    setSelectedTopic(null);
    setIsBuyNowOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
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
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch alumni work at logos — course-specific first, then category, then all
  useEffect(() => {
    if (!course) return;
    const fetchLogos = async () => {
      // 1. Try course-specific logos
      if (course._id) {
        const { ok, data } = await alumniWorkAtApi.getAll({ course: course._id, limit: 1000 });
        if (ok && data.success && data.data.length > 0) {
          setAlumniWorkAt(data.data);
          return;
        }
      }
      // 1.5 Try subcategory-filtered logos
      if (course.subCategory) {
        const { ok, data } = await alumniWorkAtApi.getAll({ subCategory: course.subCategory, limit: 1000 });
        if (ok && data.success && data.data.length > 0) {
          setAlumniWorkAt(data.data);
          return;
        }
      }
      // 2. Try category-filtered logos
      if (course.category) {
        const { ok, data } = await alumniWorkAtApi.getAll({ category: course.category, limit: 1000 });
        if (ok && data.success && data.data.length > 0) {
          setAlumniWorkAt(data.data);
          return;
        }
      }
      // 3. Fallback: all logos
      const { ok, data } = await alumniWorkAtApi.getAll({ limit: 1000 });
      if (ok && data.success) setAlumniWorkAt(data.data || []);
    };
    fetchLogos();
  }, [course]);



  useEffect(() => {
    if (slug) {
      if (["ca", "cs", "1", "2"].includes(slug.toLowerCase())) {
        let dummyTitle = "";
        let dummyDesc = "";

        switch (slug.toLowerCase()) {
          case "ca":
            dummyTitle = "Chartered Accountancy (CA) - Foundation to Final";
            dummyDesc = "Master the complexities of financial accounting, auditing, and taxation with our comprehensive CA program. We provide end-to-end guidance for Foundation, Intermediate, and Final levels.";
            break;
          case "cs":
            dummyTitle = "Company Secretary (CS) - Comprehensive Program";
            dummyDesc = "A specialized course focusing on corporate law, governance, and secretarial practices. Become a corporate leader with our expert-led CS training.";
            break;
          case "1":
            dummyTitle = "US CPA - Certified Public Accountant";
            dummyDesc = "Get globally recognized with the US CPA certification. Expert training for FAR, AUD, REG, and BEC exams with industry-leading mentors.";
            break;
          case "2":
            dummyTitle = "ACCA - Association of Chartered Certified Accountants";
            dummyDesc = "Become a global finance professional with ACCA. Comprehensive coverage of all 13 papers with flexible learning options and exam-focused approach.";
            break;
        }

        setCourse({
          _id: slug,
          title: dummyTitle,
          description: dummyDesc,
          price: slug === "ca" || slug === "cs" ? "25,000" : "1,50,000",
          originalPrice: slug === "ca" || slug === "cs" ? "35,000" : "1,80,000",
          discount: "25% OFF",
          rating: "4.9",
          enrolledTotal: "15,000+",
          duration: "12-18 Months",
          facultyName: "Dr. J.K. Shah",
          facultyDesignation: "Founder & Chairman",
          facultyBio: "A visionary in professional education with over 40 years of experience in shaping the careers of thousands of CAs across India.",
          whatYouLearn: [
            "Comprehensive coverage of the entire syllabus",
            "Exam-oriented teaching methodology",
            "Regular mock tests and personalized feedback",
            "Access to recorded sessions for revision",
            "Doubt-solving sessions with expert faculty",
            "Career guidance and placement support"
          ],
          videos: [
            {
              title: "Course Introduction",
              url: "https://www.youtube.com/watch?v=GetIm73J5j8",
              description: "In this comprehensive introduction, we cover the basics of the course structure, what you will learn, and how to make the most of your study time. This video provides a roadmap for your success and helps you understand the exam pattern and marking scheme."
            },
            {
              title: "Faculty Introduction",
              url: "https://www.youtube.com/watch?v=GetIm73J5j8",
              description: "Meet your expert faculty members who will guide you throughout your journey. Learn about their experience, teaching methodology, and how they have helped thousands of students achieve their dreams."
            }
          ],
          faqs: [
            {
              category: "General",
              topics: [
                {
                  title: "General Information",
                  questions: [
                    { question: "What is the duration of the course?", answer: "The course duration is 12-18 months depending on the level." },
                    { question: "Is there any refund policy?", answer: "Yes, we offer a 30-day money-back guarantee." }
                  ]
                }
              ]
            }
          ]
        });
        setLoading(false);
      } else if (courses.length > 0) {
        const foundCourse = courses.find(c =>
          generateSlug(c.title) === slug ||
          c.slug === slug ||
          c._id === slug
        );
        setCourse(foundCourse);
        setLoading(false);
      }
    }
  }, [slug, courses]);

  useEffect(() => {
    if (!course) return;

    // Find sub-category data for fallback
    const subCat = categories.find(c => c.name === course.subCategory && c.parent);

    // 1. Update Title
    // Priority: Course Meta Title > Course Title > SubCat Meta Title > Default
    const pageTitle = course.metaTitle || course.title || subCat?.metaTitle || "JK Shah Classes";
    document.title = `${pageTitle} | JK Shah Classes`;

    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }

    // Priority: Course Meta Desc > Course Desc (stripped) > SubCat Meta Desc > Default
    const plainDescription = course.description?.replace(/<[^>]*>?/gm, '') || "";
    const descriptionContent = course.metaDescription ||
      (plainDescription.substring(0, 160) + (plainDescription.length > 160 ? '...' : '')) ||
      subCat?.metaDescription ||
      "Join JK Shah Classes for the best CA, CS, and CMA coaching.";

    metaDescription.setAttribute('content', descriptionContent);

    // 3. Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }

    // Priority: Course Meta Keywords > SubCat Meta Keywords > Default
    const keywordsContent = course.metaKeywords || subCat?.metaKeywords || "CA, CS, CMA, Coaching, JK Shah Classes";
    metaKeywords.setAttribute('content', keywordsContent);

    // 4. Update OG Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', `${pageTitle} | JK Shah Classes`);

    // 5. Update OG Description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', descriptionContent);

    // Cleanup function
    return () => {
      document.title = "JK Shah Classes - India's Leading CA Coaching";
    };
  }, [course, categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-primary font-medium animate-pulse">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-muted/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/courses")} className="bg-primary hover:bg-primary/90 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse All Courses
          </Button>
        </div>
      </div>
    );
  }

  // Default data for fields that might not be populated yet
  const syllabusModules: SyllabusModule[] = course.syllabusModules?.length > 0
    ? [...course.syllabusModules].sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0)).map((mod: any) => ({
      ...mod,
      topics: [...(mod.topics || [])].sort((a: any, b: any) => {
        const seqA = typeof a === 'object' ? (a.sequence || 0) : 0;
        const seqB = typeof b === 'object' ? (b.sequence || 0) : 0;
        return seqA - seqB;
      })
    }))
    : [
      {
        title: "Module 1: Fundamentals of Accounting",
        topics: [
          "Introduction to Accounting Principles",
          "Double Entry System",
          "Journal, Ledger & Trial Balance",
          "Bank Reconciliation Statement",
          "Depreciation Accounting"
        ],
        duration: "4 weeks"
      }
    ];

  const facultyMembers = [
    {
      name: course.facultyName,
      designation: course.facultyDesignation || "CA, PhD, M.Com",
      specialization: course.facultySpecialization || "Financial Accounting & Audit",
      experience: course.facultyExperience || "20+ Years",
      students: course.facultyStudents || "5000+",
      rating: course.facultyRating?.toString() || "4.9",
      bio: course.facultyBio || "Experienced faculty with extensive teaching background",
      image: course.facultyImage
    }
  ];

  // Static definitions for Sidebar Icons
  const sidebarIcons = [
    { icon: FileText, defaultText: "Comprehensive Study Material" },
    { icon: BookOpen, defaultText: "Practice Questions Bank" },
    { icon: Headphones, defaultText: "24/7 Doubt Support" },
    { icon: Award, defaultText: "Completion Certificate" },
    { icon: Download, defaultText: "Downloadable Resources" }
  ];

  // Map dynamic data to static icons by index
  const courseFeatures = sidebarIcons.map((item, index) => ({
    icon: item.icon,
    text: (course.courseFeatures && course.courseFeatures[index]) || item.defaultText
  }));

  const reviews = course.reviewsList?.length > 0 ? course.reviewsList : [
    {
      name: "Priya Sharma",
      rating: 5,
      date: "2 weeks ago",
      text: "Excellent course structure and faculty. The study material is comprehensive and well-organized. Highly recommended!",
      achievement: "Cleared CA Inter - Both Groups",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
    }
  ];

  const subCat = categories.find(c => c.name === course.subCategory && c.parent);
  const mainCat = categories.find(c => c.name === course.category && !c.parent);
  const activeCategory = subCat || mainCat;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-muted/30 via-white to-primary/5 pt-4 pb-8 px-4 sm:pt-8 sm:pb-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Content - 8 columns */}
            <div className="lg:col-span-8">
              {/* Breadcrumb */}
              < div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4" >
                <Link to="/courses" className="hover:text-primary transition-colors">Courses</Link>
                <span>/</span>
                <Link to={`/courses/category/${categories.find(c => c.name === course.category)?._id}`} className="hover:text-primary transition-colors">{course.category}</Link>
                <span>/</span>
                <span className="text-foreground">{course.subCategory}</span>
              </div >

              {/* Course Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                  <Award className="w-3.5 h-3.5" />
                  Bestseller
                </span>
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Most Popular
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl mb-3 text-foreground leading-tight font-bold">
                {course.title}
              </h1>

              <div
                className="text-base text-muted-foreground mb-6 leading-relaxed max-w-3xl line-clamp-3 hover:line-clamp-none transition-all duration-300"
                dangerouslySetInnerHTML={{ __html: course.description || "" }}
              />

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2 max-w-[150px] sm:max-w-none">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm">
                    <span className="text-foreground">4.8</span>
                    <span className="text-muted-foreground"> (1,583 ratings)</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs sm:text-sm">{course.enrolledTotal || "4,520"} enrolled</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs sm:text-sm">{course.duration || "N/A"}</span>
                </div>
              </div>

              {/* Course Journey Timeline Image */}
              {
                (() => {
                  const timeline = courseTimelines.find(t => t.subCategory === course.subCategory || t.subCategory === course.category);
                  if (!timeline) return null;

                  return (
                    <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 border border-slate-100 group">
                      <ImageWithFallback
                        src={timeline.image}
                        alt={`${course.subCategory} Course Timeline`}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    </div>
                  );
                })()
              }


              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white h-11 px-6"
                  onClick={() => setShowVideoModal(true)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Course Overview
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none border-border text-foreground hover:bg-muted hover:!text-foreground h-11 px-6"
                    onClick={() => {
                      if (course.brochureUrl) {
                        setPendingBrochure(course.brochureUrl);
                        setEnquireOpen(true);
                      } else {
                        toast.info("Brochure coming soon");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Brochure
                  </Button>
                  {/* <Button variant="ghost" className="text-muted-foreground hover:text-foreground h-11 px-4">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary h-11 px-4">
                    <Heart className="w-4 h-4" />
                  </Button> */}
                </div>
              </div>
            </div >

            {/* Right Sidebar - Pricing Card - 4 columns */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-20">
                {/* Course Image / Video Carousel */}
                {course.videos && course.videos.length > 0 ? (
                  <div className="relative rounded-xl overflow-hidden shadow-lg mb-4 aspect-video">
                    <Carousel
                      setApi={setSidebarVideoApi}
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      className="w-full h-full"
                    >
                      <CarouselContent className="h-full -ml-0">
                        {course.videos.map((video: any, idx: number) => (
                          <CarouselItem
                            key={idx}
                            className="pl-0 h-full relative cursor-pointer group"
                            onClick={() => {
                              setSelectedVideo(video);
                              setShowVideoModal(true);
                            }}
                          >
                            <div className="relative w-full h-full aspect-video">
                              <ImageWithFallback
                                src={video.thumbnail || course.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-all group-hover:bg-black/35">
                                <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform shadow-lg">
                                  <Play className="w-8 h-8 text-primary fill-current" />
                                </div>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {course.videos.length > 1 && (
                        <>
                          <CarouselPrevious className="left-2 h-7 w-7 bg-white/80 hover:bg-white text-foreground" />
                          <CarouselNext className="right-2 h-7 w-7 bg-white/80 hover:bg-white text-foreground" />
                        </>
                      )}
                    </Carousel>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden shadow-lg mb-4 aspect-video">
                    <ImageWithFallback
                      src={course.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Pricing Card */}
                <div className="bg-white border-2 border-border rounded-xl p-6 shadow-sm">
                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl text-foreground">₹{course.price}</span>
                      {course.originalPrice && <span className="text-lg text-muted-foreground line-through">₹{course.originalPrice}</span>}
                    </div>
                    {/* <div className="flex items-center gap-2">
                      {course.discount && <span className="inline-block bg-accent/10 text-accent px-2 py-0.5 rounded text-sm">
                        {course.discount}
                      </span>}
                      <span className="text-sm text-muted-foreground">Limited time offer</span>
                    </div> */}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-2 mb-6">
                    {/* <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12" onClick={() => setShowEnrollModal(true)}>
                      Enroll
                    </Button> */}
                    <Button disabled variant="outline" className="w-full bg-primary hover:bg-primary/90 text-white h-12" onClick={handleAddToCart}>
                      Enroll
                    </Button>
                  </div>

                  {/* Course Includes */}
                  <div className="pt-6 border-t border-border">
                    <h4 className="text-sm mb-3 text-foreground">This course includes:</h4>
                    <div className="space-y-2.5">
                      {courseFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <feature.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Batch Info */}
                  {course.batchInfo && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-foreground mb-0.5">Next Batch Starts</p>
                          <p className="text-base text-primary">{course.batchInfo}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div >
          </div >
        </div >
      </section >

      {/* What You'll Learn - Full Width */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 sm:p-8 shadow-sm relative overflow-hidden group/highlights">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover/highlights:scale-150" />

            <h3 className="text-xl font-bold mb-4 text-[#373081] flex items-center gap-3">
              <div className="bg-[#2ba57d]/10 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-[#2ba57d]" />
              </div>
              What You'll Learn
            </h3>

            <hr className="mb-6 border-slate-100" />

            <div className="grid md:grid-cols-2 gap-4 relative z-10">
              {(course.whatYouLearn?.length > 0 ? course.whatYouLearn : [
                `Master all subjects of ${course.subCategory || course.title}`,
                "In-depth coverage of core principles",
                "Comprehensive preparation and guidance",
                "Strong foundation in advanced topics",
                "Regular mock tests and assessments",
                "Expert doubt-solving sessions"
              ]).map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-4 bg-[#2ba57d] p-3 sm:p-4 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all group/item">
                  <div className="bg-[#d8edc4] w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 flex items-center justify-center">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[#2ba57d]" strokeWidth={4} />
                  </div>
                  <span className="text-sm sm:text-base text-white font-semibold leading-tight">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Why CA and Why JKShah Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-[#f5f3ff] relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute left-0 top-0 w-full h-full opacity-40 pointer-events-none">
          <div className="absolute -left-20 -top-20 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -right-20 -bottom-20 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Side Cards - Increased to 7 columns */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {/* Why CA Card */}
              {(() => {
                const whyTitle = activeCategory?.whyTitle || `Why ${course.subCategory || course.category || "this course"}?`;
                const whyPointsToRender = (activeCategory?.whyPoints && activeCategory.whyPoints.some(p => p.trim() !== ""))
                  ? activeCategory.whyPoints.filter(p => p.trim() !== "")
                  : (activeCategory?.whyContent ? [activeCategory.whyContent] : []);
                const finalWhyPoints = whyPointsToRender.length > 0 ? whyPointsToRender : [
                  "High income potential",
                  "Global recognition by ICAI",
                  "Job security & independence",
                  "Strategic decision-making roles",
                  "Respected, influential profession",
                  "High income potential",
                  "Global recognition by ICAI",
                ];

                const whyJKShahTitle = activeCategory?.whyJKShahTitle || "Why JK Shah?";
                const whyJKShahPointsToRender = (activeCategory?.whyJKShahPoints && activeCategory.whyJKShahPoints.some(p => p.trim() !== ""))
                  ? activeCategory.whyJKShahPoints.filter(p => p.trim() !== "")
                  : (activeCategory?.whyJKShahContent ? [activeCategory.whyJKShahContent] : []);
                const finalWhyJKShahPoints = whyJKShahPointsToRender.length > 0 ? whyJKShahPointsToRender : [
                  "40+ years of excellence",
                  "Proven AIR-producing track record",
                  "Concept-first expert faculty",
                  "Structured test system"
                ];

                return (
                  <>
                    <div className="bg-white rounded-2xl shadow-lg shadow-purple-900/5 overflow-hidden flex flex-col border border-purple-100/50 group hover:shadow-xl transition-all duration-500">
                      <div
                        className="relative bg-[#f0eaff] px-4 pt-4 pb-7 flex items-center justify-center gap-3 transition-colors duration-500 group-hover:bg-[#373081]"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)' }}
                      >
                        <div className="bg-[#373081]/10 p-2 rounded-lg shrink-0 transition-colors duration-500 group-hover:bg-white/20">
                          <Trophy className="w-6 h-6 text-[#fbbf24] fill-[#fbbf24] transition-colors duration-500 group-hover:text-[#ffca28]" />
                        </div>
                        <h3 className="text-sm font-bold text-[#373081] tracking-tight transition-colors duration-500 group-hover:text-white">{whyTitle}</h3>
                      </div>
                      <div className="p-5 pt-3 flex-1 flex flex-col">
                        <ul className="space-y-1.5 mb-4">
                          {finalWhyPoints.map((item, i) => (
                            <li key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-300 ${i % 2 === 0 ? 'bg-[#f5f3ff]' : 'bg-white border border-purple-50/50'}`}>
                              <div className="shrink-0">
                                <div className="bg-[#fbbf24]/10 rounded-full p-0.5 border border-[#fbbf24]/30">
                                  <Check className="w-2.5 h-2.5 text-[#fbbf24]" strokeWidth={4} />
                                </div>
                              </div>
                              <span className="text-xs font-bold text-[#373081]/90 tracking-tight">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg shadow-purple-900/5 overflow-hidden flex flex-col border border-purple-100/50 group hover:shadow-xl transition-all duration-500">
                      <div
                        className="relative bg-[#f0eaff] px-4 pt-4 pb-7 flex items-center justify-center gap-3 transition-colors duration-500 group-hover:bg-[#373081]"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)' }}
                      >
                        <div className="bg-[#373081]/10 p-2 rounded-lg shrink-0 transition-colors duration-500 group-hover:bg-white/20">
                          <GraduationCap className="w-6 h-6 text-[#373081] fill-[#373081]/20 transition-colors duration-500 group-hover:text-white group-hover:fill-white/20" />
                        </div>
                        <h3 className="text-sm font-bold text-[#373081] tracking-tight transition-colors duration-500 group-hover:text-white">{whyJKShahTitle}</h3>
                      </div>
                      <div className="p-5 pt-3 flex-1 flex flex-col">
                        <ul className="space-y-1.5 mb-4">
                          {finalWhyJKShahPoints.map((item, i) => (
                            <li key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-300 ${i % 2 === 0 ? 'bg-[#f5f3ff]' : 'bg-white border border-purple-50/50'}`}>
                              <div className="shrink-0">
                                <div className="bg-[#fbbf24]/10 rounded-full p-0.5 border border-[#fbbf24]/30">
                                  <Check className="w-2.5 h-2.5 text-[#fbbf24]" strokeWidth={4} />
                                </div>
                              </div>
                              <span className="text-xs font-bold text-[#373081]/90 tracking-tight">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Right Side Banner - Reduced to 5 columns */}
            <div className="lg:col-span-5 bg-white/40 backdrop-blur-md rounded-2xl shadow-lg shadow-purple-900/5 p-6 sm:p-8 border border-white/50 flex flex-col justify-center relative group overflow-hidden">
              {(() => {
                const bannerTitle = activeCategory?.bannerTitle || `Empower your career with ${course.subCategory || course.category || "us"}.`;
                const bannerSubtitle = activeCategory?.bannerSubtitle || "Get there with JK Shah Classes.";
                const bannerBadges = activeCategory?.bannerBadges?.some(b => b.trim())
                  ? activeCategory.bannerBadges.filter(b => b.trim())
                  : ["High Income", "Global Reach", "Strategic Roles"];
                const bannerBadgeIcons = activeCategory?.bannerBadgeIcons || [];
                const bannerStats = activeCategory?.bannerStats?.some(s => s.value.trim() || s.label.trim())
                  ? activeCategory.bannerStats.filter(s => s.value.trim() || s.label.trim())
                  : [
                    { value: "20+", label: "Years Excellence" },
                    { value: "5K+", label: "AIRs" },
                    { value: "250K+", label: "Trained" }
                  ];

                return (
                  <div className="relative z-10 w-full">
                    <h2 className="text-base sm:text-2xl font-black text-[#373081] mb-1.5 leading-tight tracking-tight">
                      {bannerTitle}
                    </h2>
                    <p className="text-sm sm:text-base text-[#373081]/70 mb-8 font-medium">{bannerSubtitle}</p>

                    {/* Flow Diagram - more compact for 5-col width */}
                    <div className="flex items-start justify-between gap-1 sm:gap-2 mb-8 w-full">
                      {bannerBadges.map((badge, index) => (
                        <Fragment key={index}>
                          <div className="flex flex-col items-center gap-2 group/step shrink-0">
                            <div className="relative">
                              <div className={`absolute inset-0 ${index === 0 ? 'bg-orange-400' : index === 1 ? 'bg-indigo-400' : 'bg-purple-400'} blur-xl opacity-10`} />
                              <div className="relative p-2 sm:p-1">
                                {bannerBadgeIcons[index] ? (
                                  <img
                                    src={bannerBadgeIcons[index]}
                                    alt={badge}
                                    className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
                                  />
                                ) : (
                                  <>
                                    {index === 0 ? <Trophy className="w-10 h-10 sm:w-16 sm:h-16 text-orange-400 fill-orange-400" /> :
                                      index === 1 ? <Globe className="w-10 h-10 sm:w-16 sm:h-16 text-[#5249a8]" /> :
                                        <Briefcase className="w-10 h-10 sm:w-16 sm:h-16 text-[#5249a8]" />}
                                  </>
                                )}
                              </div>
                            </div>
                            <span className={`text-[9px] sm:text-[12px] font-black ${index === 2 ? 'text-[#5249a8]' : 'text-[#373081]'} text-center leading-none uppercase`}>
                              {badge.split(' ').map((word, i) => <Fragment key={i}>{word}<br /></Fragment>)}
                            </span>
                          </div>
                          {index < bannerBadges.length - 1 && (
                            <div className="flex-1 border-t-2 border-dashed border-[#373081]/40 relative mt-[28px] sm:mt-[36px] h-0 min-w-[20px]">
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                                <ArrowRight className="w-5 h-5 text-[#373081]/80 bg-white rounded-full shadow-sm" />
                              </div>
                            </div>
                          )}
                        </Fragment>
                      ))}
                    </div>

                    {/* Statistics Box - ultra compact */}
                    <div className="bg-white shadow-lg shadow-purple-900/5 rounded-full p-2 sm:p-5 flex items-center justify-between gap-1 border border-purple-50 group-hover:shadow-purple-900/10 transition-all duration-500 w-full whitespace-nowrap overflow-hidden">
                      {bannerStats.map((stat, index) => (
                        <Fragment key={index}>
                          <div className="flex flex-col items-center text-center px-1 sm:px-4 flex-1">
                            <motion.p
                              initial={{ scale: 0.5, opacity: 0 }}
                              whileInView={{ scale: 1, opacity: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: index * 0.1
                              }}
                              className="text-lg sm:text-3xl font-black text-[#fbbf24] leading-none mb-1"
                            >
                              {stat.value}
                            </motion.p>
                            <p className="text-[8px] sm:text-[10px] font-bold text-[#373081]/60 uppercase leading-none">{stat.label}</p>
                          </div>
                          {index < bannerStats.length - 1 && <div className="w-px h-8 bg-purple-100 shrink-0" />}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Course Syllabus Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/5 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Course Syllabus</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Comprehensive curriculum designed for your success</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-1 gap-8">
            <div className="lg:col-span-1">
              {/* Syllabus Tabs - Desktop Only */}
              <div className="hidden md:flex flex-wrap justify-center gap-4 pb-6 px-1">
                {syllabusModules.map((module, idx) => {
                  const isActive = expandedModule === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setExpandedModule(idx);
                        setExpandedTopic(0);
                      }}
                      className={`group flex-shrink-0 w-[220px] p-5 rounded-xl border transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-lg ${isActive
                        ? "bg-[#373081] border-[#373081] text-white shadow-md scale-105"
                        : "bg-white border-border text-foreground hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-transparent"
                        }`}
                    >
                      <h3 className={`text-sm font-bold leading-tight ${isActive ? "text-white" : "group-hover:text-white"}`}>
                        {module.title}
                      </h3>
                    </button>
                  );
                })}
              </div>

              {/* Selected Module Topics - Desktop Only */}
              {expandedModule !== null && syllabusModules[expandedModule] && (
                <div className="hidden md:block bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex flex-col items-center justify-center py-8 px-4 border-b border-border/50 bg-slate-50/50">
                    <h3 className="text-2xl font-bold text-[#373081] text-center">
                      {syllabusModules[expandedModule].title}
                    </h3>

                  </div>
                  {/* Topic Tabs Navigation */}
                  <div className="flex overflow-x-auto gap-1 pb-2 mb-8 border-b border-border/50 scrollbar-hide p-1">
                    {syllabusModules[expandedModule].topics.map((topic, tidx) => {
                      const isTopicActive = expandedTopic === tidx;
                      return (
                        <button
                          key={tidx}
                          onClick={() => setExpandedTopic(tidx)}
                          className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-bold transition-all ${isTopicActive
                            ? "bg-[#373081] text-white shadow-md scale-105"
                            : "text-muted-foreground hover:text-[#373081] hover:bg-white hover:shadow-sm"
                            }`}
                        >
                          {typeof topic === 'string' ? topic : topic.title}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Topic Content */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {(() => {
                      const topic = syllabusModules[expandedModule].topics[expandedTopic];
                      if (!topic) return null;

                      return (
                        <div className="grid lg:grid-cols-12 gap-8 items-start">
                          <div className="lg:col-span-12">
                            <div className="bg-muted/5 border border-border/40 rounded-2xl p-6 sm:p-8">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div>
                                  <h4 className="text-2xl font-bold text-foreground">
                                    {typeof topic === 'string' ? topic : topic.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">Detailed list of subjects and learning outcomes</p>
                                </div>
                                {typeof topic !== 'string' && topic.subjects && topic.subjects.length > 0 && (
                                  <Button
                                    disabled
                                    className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                    onClick={() => handleBuyNow(topic)}
                                  >
                                    Enroll
                                  </Button>
                                )}
                              </div>

                              <div className="flex flex-col gap-8">
                                {/* Subjects List */}
                                {typeof topic !== 'string' && topic.subjects && topic.subjects.length > 0 && (
                                  <div className="space-y-4">
                                    <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Subject Coverage</h5>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      {topic.subjects.map((sub: any, sidx: number) => {
                                        const sName = typeof sub === 'string' ? sub : sub.name;
                                        const sPrice = typeof sub === 'string' ? null : sub.price;

                                        return (
                                          <div key={sidx} className="flex items-center justify-between p-4 rounded-xl bg-white border border-border/60 hover:border-primary/30 transition-all duration-300 group/sub hover:shadow-md hover:-translate-y-1">
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover/sub:bg-primary transition-colors">
                                                <CheckCircle2 className="w-4 h-4 text-primary group-hover/sub:text-white transition-colors" />
                                              </div>
                                              <span className="text-slate-700 font-bold">{sName}</span>
                                            </div>
                                            {/* {sPrice && (
                                              <span className="text-primary font-black text-lg">₹{sPrice}</span>
                                            )} */}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Topic Details */}
                                {typeof topic !== 'string' && (topic.details) && (
                                  <div className="space-y-4">
                                    <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">In-depth Details</h5>
                                    {/* Custom styles for syllabus content tables */}
                                    <style>{`
                                      .syllabus-content table {
                                        width: 100% !important;
                                        table-layout: auto !important;
                                        border-collapse: collapse;
                                        margin: 1em 0;
                                      }
                                      .syllabus-content th, .syllabus-content td {
                                        border: 1px solid #cbd5e1;
                                        padding: 8px 12px;
                                      }
                                      .syllabus-content th {
                                        background-color: #f1f5f9;
                                        font-weight: 600;
                                        text-align: left;
                                      }
                                    `}</style>
                                    <div
                                      className="syllabus-content text-base text-slate-600 leading-relaxed prose prose-slate prose-sm max-w-none
                                        prose-p:text-slate-600 prose-p:font-medium prose-p:leading-relaxed
                                        prose-ul:text-slate-600 prose-li:text-slate-600"
                                      dangerouslySetInnerHTML={{ __html: topic.details }}
                                    />
                                  </div>
                                )}

                                {/* Fallback if it's just a string topic */}
                                {typeof topic === 'string' && (
                                  <div className="col-span-full">
                                    <div className="flex items-center gap-3 p-6 rounded-2xl bg-white border border-border shadow-sm">
                                      <div className="bg-primary/10 p-3 rounded-full">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                      </div>
                                      <p className="text-slate-700 font-medium">Comprehensive coverage of {topic} through expert-led lectures and study materials.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Mobile Syllabus - Accordion View */}
              <div className="md:hidden">
                <Accordion type="single" collapsible className="w-full space-y-4" onValueChange={() => setExpandedTopic(0)}>
                  {syllabusModules.map((module, idx) => (
                    <AccordionItem key={idx} value={`module-${idx}`} className="bg-white border border-border rounded-xl px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-4 text-left">
                          <div className="bg-red-50 text-red-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-sm leading-tight">
                              {module.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {module.duration}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2 pb-4 space-y-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full w-fit mb-3">
                            <BookOpen className="w-3.5 h-3.5" />
                            {module.topics.length} Topics
                          </div>
                          {/* Mobile Topic Tabs */}
                          <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide">
                            {module.topics.map((t, tidx) => (
                              <button
                                key={tidx}
                                onClick={() => setExpandedTopic(tidx)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${expandedTopic === tidx
                                  ? "bg-primary text-white shadow-sm"
                                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                                  }`}
                              >
                                {typeof t === 'string' ? t : t.title}
                              </button>
                            ))}
                          </div>

                          {/* Mobile Topic Content */}
                          {module.topics[expandedTopic] && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                              {(() => {
                                const topic = module.topics[expandedTopic];
                                return (
                                  <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <h4 className="text-sm font-bold text-foreground leading-tight">
                                        {typeof topic === 'string' ? topic : topic.title}
                                      </h4>
                                      {typeof topic !== 'string' && topic.subjects && topic.subjects.length > 0 && (
                                        <Button
                                          size="sm"
                                          className="h-8 px-3 text-[10px] font-bold"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleBuyNow(topic);
                                          }}
                                        >
                                          Buy Now
                                        </Button>
                                      )}
                                    </div>

                                    {typeof topic !== 'string' && topic.subjects && topic.subjects.length > 0 && (
                                      <div className="space-y-2">
                                        <ul className="space-y-2">
                                          {topic.subjects.map((sub: any, sidx: number) => {
                                            const sName = typeof sub === 'string' ? sub : sub.name;
                                            const sPrice = typeof sub === 'string' ? null : sub.price;
                                            return (
                                              <li key={sidx} className="flex items-center justify-between p-3 rounded-lg bg-white border border-border/60">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                  <span className="text-xs text-slate-700 font-medium">{sName}</span>
                                                </div>
                                                {sPrice && <span className="text-xs font-bold text-primary">₹{sPrice}</span>}
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      </div>
                                    )}

                                    {typeof topic !== 'string' && topic.details && (
                                      <div
                                        className="syllabus-content text-xs text-slate-600 leading-relaxed prose prose-slate prose-xs max-w-none p-3 rounded-lg bg-white border border-border/60"
                                        dangerouslySetInnerHTML={{ __html: topic.details }}
                                      />
                                    )}

                                    {typeof topic === 'string' && (
                                      <div className="p-3 rounded-lg bg-white border border-border/60 text-xs text-slate-600">
                                        Comprehensive coverage of {topic} through expert-led lectures and study materials.
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

            </div>

          </div>
        </div>
      </section >

      {/* The JK Shah Advantage Section - Reverted to Dark Theme Premium Design */}
      <section className="py-6 sm:py-8 lg:py-12 px-4 sm:px-8 lg:px-12 bg-[#0d0728] rounded-[2.5rem] relative overflow-hidden mx-4 sm:mx-12 lg:mx-24 my-8 shadow-2xl border border-white/10">
        {/* Decorative Background Glow (as requested) */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#373081]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white rounded-full blur-[100px]" />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* 3-Column Layout: Cards | Logo | Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

            {/* Left Column (3 cards) - Curved Inwards */}
            <div className="md:col-span-4 flex flex-col gap-4">
              {[
                { id: 0, defaultTitle: "LEARNING PEDAGOGY DEVELOPED OVER 4 DECADES", icon: Presentation, shift: "md:translate-x-6 lg:translate-x-12" },
                { id: 3, defaultTitle: "RIGOROUS AND PRECISE TEST SERIES", icon: ClipboardCheck, shift: "md:translate-x-0" },
                { id: 2, defaultTitle: "QUALIFIED PROFESSIONALS FOR TEACHING AS WELL AS NON-TEACHING FUNCTIONS", icon: History, shift: "md:translate-x-6 lg:translate-x-12" }
              ].map((item) => (
                <div key={item.id} className={item.shift}>
                  <AdvantageCard title={course.highlights?.[item.id] || item.defaultTitle} icon={item.icon} />
                </div>
              ))}
            </div>

            {/* Center Branding Area (Logo in Golden/Beige Circle) */}
            <div className="md:col-span-4 flex items-center justify-center py-6 md:py-0">
              <AdvantageLogo src="/uploads/2026/02/J K Shah_New logo 24-01.png" />
            </div>

            {/* Right Column (3 cards) - Curved Inwards */}
            <div className="md:col-span-4 flex flex-col gap-4">
              {[
                { id: 1, defaultTitle: "FOCUSED ON 100% CONCEPTUAL CLARITY", icon: Brain, shift: "md:-translate-x-6 lg:-translate-x-12" },
                { id: 4, defaultTitle: "DETAILED REVISION LECTURES ON COURSE COMPLETION", icon: TrendingUp, shift: "md:translate-x-0" },
                { id: 5, defaultTitle: "REGULAR DOUBT SOLVING SESSIONS", icon: Headphones, shift: "md:-translate-x-6 lg:-translate-x-12" }
              ].map((item) => (
                <div key={item.id} className={item.shift}>
                  <AdvantageCard title={course.highlights?.[item.id] || item.defaultTitle} icon={item.icon} />
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>


      {/* Who Should Enroll Section - Styled exactly like What You'll Learn */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 sm:p-8 shadow-sm relative overflow-hidden group/enroll">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover/enroll:scale-150" />

            <h3 className="text-xl font-bold mb-4 text-[#373081] flex items-center gap-3">
              <div className="bg-[#2ba57d]/10 p-2 rounded-lg">
                <UserCheck className="w-6 h-6 text-[#2ba57d]" />
              </div>
              Who Should Enroll?
            </h3>

            <hr className="mb-6 border-slate-100" />

            <div className="grid md:grid-cols-2 gap-4 relative z-10">
              {(course.whoShouldEnroll?.length > 0 ? course.whoShouldEnroll : [
                "Students aiming for professional excellence in Finance",
                "Aspirants preparing for competitive CA/CS/CMA exams",
                "Graduates seeking industry-ready professional skills",
                "Working professionals looking to upgrade their qualifications",
                "Individuals passionate about Taxation and Auditing",
                "Anyone seeking structured and expert-led professional guidance"
              ]).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-4 bg-[#2ba57d] p-3 sm:p-4 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all group/item">
                  <div className="bg-[#d8edc4] w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 flex items-center justify-center">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[#2ba57d]" strokeWidth={4} />
                  </div>
                  <span className="text-sm sm:text-base text-white font-semibold leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Work Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-border overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground inline-block relative">
              Our Alumni Work At
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full" />
            </h2>
          </div>

          <div className="relative group">
            <Carousel
              setApi={setAlumniApi}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4 flex items-center">
                {alumniWorkAt.map((company, idx) => (
                  <CarouselItem key={idx} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5">
                    <div className="p-4 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                      <ImageWithFallback
                        src={company.image}
                        alt={company.companyName}
                        className="h-12 w-auto object-contain max-w-full"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="-left-12 h-10 w-10" />
                <CarouselNext className="-right-12 h-10 w-10" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      <RankersSection
        category={course.category}
        subCategory={course.subCategory}
        title={`Top Achievers in ${course.subCategory || course.category || "this course"}`}
      />

      {/* Career Opportunities Section */}
      {
        (() => {
          const config = careerConfigs.find(c => c.subCategory === course.subCategory);
          if (!config) return null;

          return (
            <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative bg-white border-t border-border">

              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  {/* Left: Content */}
                  <div className="order-1">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6 sm:mb-10 leading-tight">
                      Career Opportunities <br />
                      <span className="text-[#373081]">After {course.subCategory || course.category || "Graduation"}</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4">
                      {config.opportunities.map((opp, idx) => (
                        <div key={idx} className="group relative">
                          <div className="bg-[#373081]/10 px-4 sm:px-5 py-3 sm:py-4 rounded-xl shadow-md border border-[#373081]/20 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden group/item">
                            <span className="text-xs sm:text-sm font-bold text-[#373081]">{opp}</span>
                            {/* Aesthetic Tab/Curve side decorator */}
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#373081] transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Visual Graphic */}
                  <div className="relative flex justify-center lg:justify-end order-2 mt-8 lg:mt-0">
                    <div className="relative w-full max-w-[480px]">
                      <div className="aspect-square rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white bg-slate-100 relative group">
                        <ImageWithFallback
                          src={config.image}
                          alt="Join our successful alumni"
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />

                        {/* Floating Achievement Card - Moved Inside for better stability */}
                        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 sm:gap-4 transform transition-all duration-500 group-hover:translate-y-[-4px]">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-lg sm:text-xl font-black text-[#373081]">Top Roles</p>
                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest sm:text-nowrap">Global Demand & High Growth</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()
      }

      {/* Student Testimonials Section */}
      {
        course.testimonials && course.testimonials.length > 0 && (
          <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-accent/5 border-t border-border">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                  Student Testimonials
                </h2>
                <div className="h-1 w-20 bg-[#373081] mx-auto rounded-full mb-4 opacity-20" />
                <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">Hear from our successful students who transformed their careers with JK Shah Classes</p>
              </div>

              <div className="relative px-4 sm:px-12">
                <Carousel
                  setApi={setTestimonialApi}
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {course.testimonials.flatMap((cat: any) => cat.items).map((item: any, idx: number) => (
                      <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1 h-full">
                          <div className="bg-white border border-border rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 h-full flex flex-col group/card relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover/card:scale-150" />

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-border shadow-sm flex-shrink-0 group-hover/card:border-[#373081] transition-colors">
                                <ImageWithFallback
                                  src={item.image || "/uploads/placeholder.png"}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                                <p className="text-xs text-[#373081] font-semibold line-clamp-1 uppercase tracking-wider">{item.designation}</p>
                              </div>
                            </div>

                            <div className="flex-1 relative z-10">
                              <Quote className="w-8 h-8 text-[#373081]/10 mb-4" />
                              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                                "{item.message}"
                              </p>
                            </div>

                            {item.CheckCircle2Url && (
                              <div className="mt-8 pt-6 border-t border-slate-100">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full rounded-xl border-slate-200 hover:bg-[#373081] hover:text-white transition-all gap-2"
                                  onClick={() => window.open(item.CheckCircle2Url, '_blank')}
                                >
                                  <Play className="w-4 h-4 fill-current" /> Watch Testimonial
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-4 sm:-left-12 h-8 w-8 sm:h-12 sm:w-12 bg-white shadow-lg border-slate-200 hover:bg-slate-50 transition-all" />
                  <CarouselNext className="-right-4 sm:-right-12 h-8 w-8 sm:h-12 sm:w-12 bg-white shadow-lg border-slate-200 hover:bg-slate-50 transition-all" />
                </Carousel>
              </div>
            </div>
          </section>
        )
      }

      {/* Course Videos Section */}
      {
        course.demoVideos && course.demoVideos.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/10 border-t border-border">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                  Course Demo Video
                </h2>
                <div className="h-1 w-20 bg-[#373081] mx-auto rounded-full mb-4 opacity-20" />
                <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">Preview what you'll learn in this course and get a head start on your journey</p>
              </div>

              <div className="relative px-12">
                <Carousel
                  setApi={setVideoApi}
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {[...course.demoVideos].reverse().map((video: any, idx: number) => {
                      // Helper to convert standard YouTube/Vimeo URLs to embed format
                      const getEmbedUrl = (url: string) => {
                        if (!url) return "";

                        // YouTube
                        if (url.includes("youtube.com/watch?v=")) {
                          return url.replace("watch?v=", "embed/");
                        }
                        if (url.includes("youtu.be/")) {
                          return url.replace("youtu.be/", "youtube.com/embed/");
                        }

                        // Vimeo
                        if (url.includes("vimeo.com/") && !url.includes("player.vimeo.com")) {
                          const vimeoId = url.split("/").pop();
                          return `https://player.vimeo.com/video/${vimeoId}`;
                        }

                        return url;
                      };

                      const embedUrl = getEmbedUrl(video.url);

                      return (
                        <CarouselItem key={idx} className="basis-full md:basis-1/2 lg:basis-1/2">
                          <div className="p-1">
                            <div className="bg-white border border-border rounded-xl shadow-sm hover:shadow-md transition-all">
                              <div className="aspect-video relative bg-black rounded-t-xl overflow-hidden">
                                {embedUrl.includes("youtube.com/embed/") || embedUrl.includes("player.vimeo.com") ? (
                                  <iframe
                                    src={embedUrl}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={video.title}
                                  ></iframe>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white flex-col gap-2">
                                    <Play className="w-12 h-12 text-primary" />
                                    <span className="text-xs text-muted-foreground">Video Preview</span>
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className="text-sm font-semibold text-foreground line-clamp-1">{video.title}</h3>
                                <VideoDescription description={video.description} />
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="-left-12 h-10 w-10" />
                  <CarouselNext className="-right-12 h-10 w-10" />
                </Carousel>
              </div>
            </div>
          </section>
        )
      }

      {/* Course FAQs Section */}
      {
        course.faqs && course.faqs.length > 0 && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-border">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-3">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">Find answers to common questions about this course</p>
              </div>

              <div className="space-y-12">
                {course.faqs.map((category: any, idx: number) => {
                  const topics = category.topics || (category.questions ? [{ title: "General", questions: category.questions }] : []);
                  return (
                    <div key={idx} className="space-y-8">
                      <Tabs defaultValue={`topic-${idx}-0`} className="w-full">
                        <FaqTabs topics={topics} idx={idx} />
                        {topics.map((topic: any, tIdx: number) => (
                          <TabsContent key={tIdx} value={`topic-${idx}-${tIdx}`}>
                            <Accordion type="single" collapsible className="w-full">
                              {topic.questions.map((faq: any, qIdx: number) => (
                                <AccordionItem key={qIdx} value={`item-${idx}-${tIdx}-${qIdx}`} className="border-b-0 mb-4 bg-muted/20 rounded-lg overflow-hidden">
                                  <AccordionTrigger className="text-base font-medium text-left hover:text-primary transition-colors hover:no-underline px-4 py-4">
                                    {faq.question}
                                  </AccordionTrigger>
                                  <AccordionContent className="text-muted-foreground leading-relaxed px-4 pb-4 bg-white">
                                    {faq.answer}
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )
      }

      {/* Related Courses Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Related Courses</h2>
          <div className="relative px-8 sm:px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {courses.filter(c => c.slug !== slug && c.category !== "11th - 12th Commerce" && c.status === "Active").map((relatedCourse, idx) => (
                  <CarouselItem key={relatedCourse._id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div
                      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-border cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`${currentPathPrefix}${generateSlug(relatedCourse.title)}`)}
              >
                <div className="relative aspect-[3/2] overflow-hidden shrink-0">
                  <ImageWithFallback
                    src={relatedCourse.image}
                    alt={relatedCourse.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-foreground">{idx % 2 === 0 ? "4.8" : "4.9"}</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 cursor-pointer">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold mb-1 text-foreground line-clamp-1 group-hover:text-primary transition-colors">{relatedCourse.title}</h3>
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {relatedCourse.duration}
                      </span>
                      {relatedCourse.syllabusModules?.length > 0 && (
                        <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-semibold">
                          {relatedCourse.syllabusModules.length} Levels
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{relatedCourse.description}</p>

                  <div className="mt-auto flex gap-2 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs border-primary text-primary hover:bg-primary/10 hover:!text-primary cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (relatedCourse.brochureUrl) {
                          setPendingBrochure(relatedCourse.brochureUrl);
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
                      className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90 text-white cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`${currentPathPrefix}${generateSlug(relatedCourse.title)}`);
                      }}
                    >
                      Know More
                    </Button>
                  </div>
                </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 sm:-left-12 h-10 w-10 bg-white shadow-md border-slate-200" />
              <CarouselNext className="-right-4 sm:-right-12 h-10 w-10 bg-white shadow-md border-slate-200" />
            </Carousel>
          </div>
        </div>
      </section>




      {/* Enroll Modal - Replaced with BatchEnrollmentModal */}
      <BatchEnrollmentModal
        isOpen={isBuyNowOpen}
        onClose={() => {
          setIsBuyNowOpen(false);
          setSelectedTopic(null);
          setSelectedRelatedCourse(null);
        }}
        course={selectedRelatedCourse || course}
        topic={selectedTopic}
        batches={batches}
        branches={branches}
      />

      <VideoModal
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setSelectedVideo(null);
        }}
        videoTitle={selectedVideo ? selectedVideo.title : (course.demoVideos?.[0]?.title || course.title)}
        videoUrl={selectedVideo ? selectedVideo.url : (course.demoVideos?.[0]?.url || course.videos?.[0]?.url)}
        description={selectedVideo ? selectedVideo.description : (course.demoVideos?.[0]?.description || course.videos?.[0]?.description)}
      />

      <MerittoFormModal 
        isOpen={enquireOpen || showMerittoModal} 
        onClose={() => {
          setEnquireOpen(false);
          setShowMerittoModal(false);
          if (pendingBrochure) {
            window.open(pendingBrochure, '_blank');
            setPendingBrochure(null);
          }
        }} 
      />
    </div>
  );
}
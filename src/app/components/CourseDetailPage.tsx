"use client";

import { useState, useEffect } from "react";
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
  Shield,
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
  Presentation
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BatchEnrollmentModal } from "./modals/BatchEnrollmentModal";
import { VideoModal } from "./modals/VideoModal";
import { landingPageApi, batchApi } from "../api/api";
import { useCourseContext } from "../admin/context/CourseContext";
import { toast } from "sonner";
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

interface SyllabusModule {
  title: string;
  topics: (string | {
    title: string;
    details: string;
    subjects?: { name: string; price: string | number }[];
  })[];
  duration: string;
}


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
  const { courses, categories, rankHolders, courseTimelines, careerConfigs } = useCourseContext();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [expandedTopic, setExpandedTopic] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState<"overview" | "syllabus" | "faculty" | "reviews">("overview");
  const [selectedRelatedCourse, setSelectedRelatedCourse] = useState<any>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [faqVisibleCount, setFaqVisibleCount] = useState(3);
  const [reviewsVisibleCount, setReviewsVisibleCount] = useState(3);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [showWhyMore, setShowWhyMore] = useState(false);
  const [alumniApi, setAlumniApi] = useState<CarouselApi>();
  const [rankApi, setRankApi] = useState<CarouselApi>();
  const [videoApi, setVideoApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!alumniApi) return;

    const intervalId = setInterval(() => {
      alumniApi.scrollNext();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [alumniApi]);

  useEffect(() => {
    if (!rankApi) return;

    const intervalId = setInterval(() => {
      rankApi.scrollNext();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [rankApi]);

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
      navigate("/login", { state: { from: location } });
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
          c.title.toLowerCase().replace(/ /g, '-') === slug ||
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

    // Cleanup function
    return () => {
      document.title = "JK Shah Classes - India's Leading CA Coaching";
    };
  }, [course, categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
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




  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-muted/30 via-white to-primary/5 pt-4 pb-8 px-4 sm:pt-8 sm:pb-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Content - 8 columns */}
            < div className="lg:col-span-8 sticky top-24" >
              {/* Breadcrumb */}
              < div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4" >
                <Link to="/courses" className="hover:text-primary transition-colors">Courses</Link>
                <span>/</span>
                <Link to={`/courses/category/${categories.find(c => c.name === course.category)?._id}`} className="hover:text-primary transition-colors">{course.category}</Link>
                <span>/</span>
                <span className="text-foreground">{course.subCategory}</span>
              </div >

              {/* Course Journey Timeline Image */}
              {
                (() => {
                  const timeline = courseTimelines.find(t => t.subCategory === course.subCategory);
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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl mb-3 text-foreground leading-tight">
                {course.title}
              </h1>

              <p className="text-base text-muted-foreground mb-6 leading-relaxed max-w-3xl">
                {course.description}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2 max-w-[150px] sm:max-w-none">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm">
                    <span className="text-foreground">{course.rating}</span>
                    <span className="text-muted-foreground hidden sm:inline"> (1,234 ratings)</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs sm:text-sm">{course.enrolledTotal} enrolled</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs sm:text-sm">{course.duration}</span>
                </div>
              </div>

              {/* Key Highlights */}
              <div className="bg-white border border-border rounded-xl p-6">
                <h3 className="text-base mb-4 text-foreground">What You'll Learn</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {(course.whatYouLearn?.length > 0 ? course.whatYouLearn : [
                    "Master all subjects of CA Foundation",
                    "In-depth coverage of Accounting principles",
                    "Comprehensive Business Laws & Tax preparation",
                    "Strong foundation in Economics & Mathematics",
                    "Regular mock tests and assessments",
                    "Expert doubt-solving sessions"
                  ]).map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white h-11 px-6"
                  onClick={() => setShowVideoModal(true)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo Lecture
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none border-border text-foreground hover:bg-muted hover:!text-foreground h-11 px-6"
                    onClick={() => {
                      const token = localStorage.getItem("token");
                      const userStr = localStorage.getItem("user");
                      const user = userStr ? JSON.parse(userStr) : null;
                      const isStudent = !!token && user?.role === "student";

                      if (!isStudent) {
                        toast.error("Please login to download brochure");
                        navigate("/login", { state: { from: location } });
                        return;
                      }

                      if (course.brochureUrl) {
                        window.open(course.brochureUrl, '_blank');
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
            < div className="lg:col-span-4" >
              <div className="sticky top-20">
                {/* Course Image */}
                <div
                  className="relative rounded-xl overflow-hidden shadow-lg mb-4 aspect-video cursor-pointer group"
                  onClick={() => setShowVideoModal(true)}
                >
                  <ImageWithFallback
                    src={course.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"}
                    alt="Course preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-all">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="w-8 h-8 text-primary fill-current" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="text-sm font-bold text-foreground">Preview Course</span>
                  </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-white border-2 border-border rounded-xl p-6 shadow-sm">
                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl text-foreground">₹{course.price}</span>
                      {course.originalPrice && <span className="text-lg text-muted-foreground line-through">₹{course.originalPrice}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {course.discount && <span className="inline-block bg-accent/10 text-accent px-2 py-0.5 rounded text-sm">
                        {course.discount}
                      </span>}
                      <span className="text-sm text-muted-foreground">Limited time offer</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-2 mb-6">
                    {/* <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12" onClick={() => setShowEnrollModal(true)}>
                      Enroll
                    </Button> */}
                    <Button variant="outline" className="w-full bg-primary hover:bg-primary/90 text-white h-12" onClick={handleAddToCart}>
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
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-start gap-3 mb-3">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-foreground mb-0.5">Next Batch Starts</p>
                        <p className="text-base text-primary">January 15, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-foreground mb-0.5">Money-back Guarantee</p>
                        <p className="text-xs text-muted-foreground">30-day full refund policy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div >
          </div >
        </div >
      </section >

      {/* Why CA and Why JKShah Section */}
      {
        (() => {
          // Find sub-category first, then fallback to category
          const subCat = categories.find(c => c.name === course?.subCategory && c.parent);
          const mainCat = categories.find(c => c.name === course?.category && !c.parent);
          const categoryData = subCat || mainCat;

          const whyTitle = categoryData?.whyTitle || "Why CA?";
          const whyContent = categoryData?.whyContent || "Choosing a career as a Chartered Accountant (CA) is one of the most prestigious and rewarding paths in the professional world. A CA degree opens doors to global career opportunities, offering unmatched prestige and a level of professional credibility that is recognized worldwide. Beyond the impressive high-earning potential, CAs enjoy immense financial stability and job security, as their expertise is indispensable in every industry. They play a critical role as the backbone of the economy, serving as trusted advisors in finance, taxation, auditing, and strategic planning. Whether in top multinationals, government bodies, or through independent practice, a career in CA provides a platform for lifelong growth and leadership.";
          const whyJKShahTitle = categoryData?.whyJKShahTitle || "Why JKShah Classes?";
          const whyJKShahContent = categoryData?.whyJKShahContent || "At J.K. Shah Classes, we don’t just teach; we shape the leaders of tomorrow. With over 38 years of unparalleled excellence in CA coaching, we have built a legacy of success that is second to none. Our record-breaking history of producing All India Rankers (AIRs) speaks for itself, consistent year after year. Our faculty team consists of the finest subject matter experts who simplify complex concepts through innovative teaching methodologies. We provide comprehensive study material that is meticulously curated to align with the latest ICAI patterns. With a pan-India presence and a commitment to personalized student support, JKShah Classes is the ultimate destination for CA aspirants seeking top-tier guidance and a proven pathway to success.";

          return (
            <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
              <div className="max-w-7xl mx-auto">
                <div className="relative">
                  {/* Desktop layout with vertical line */}
                  <div className="grid md:grid-cols-2 gap-0 items-start">
                    {/* Why Title column */}
                    <div className="space-y-4 md:pr-12">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-50 p-2 rounded-lg shrink-0">
                          <TrendingUp className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{whyTitle}</h3>
                      </div>
                      <div className={`text-sm text-muted-foreground leading-relaxed transition-all duration-300 ${!showWhyMore ? "line-clamp-5" : ""}`}>
                        {whyContent}
                      </div>
                    </div>

                    {/* Vertical Separator (hidden on mobile) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-100 -translate-x-1/2 mt-2 mb-10"></div>

                    {/* Why JKShah column */}
                    <div className="space-y-4 md:pl-12">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-50 p-2 rounded-lg shrink-0">
                          <Star className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{whyJKShahTitle}</h3>
                      </div>
                      <div className={`text-sm text-muted-foreground leading-relaxed transition-all duration-300 ${!showWhyMore ? "line-clamp-5" : ""}`}>
                        {whyJKShahContent}
                      </div>
                    </div>
                  </div>

                  {/* Read More Toggle */}
                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setShowWhyMore(!showWhyMore)}
                      className="text-red-600 hover:text-red-700 hover:bg-transparent font-medium gap-1.5 h-auto py-1 px-4"
                    >
                      {showWhyMore ? "Show Less" : "Read More"}
                      {showWhyMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          );
        })()
      }

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
              <div className="hidden md:flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x snap-mandatory px-1">
                {syllabusModules.map((module, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setExpandedModule(idx);
                      setExpandedTopic(0);
                    }}
                    className={`flex-shrink-0 w-[280px] md:w-[320px] p-4 rounded-xl border-2 transition-all text-left snap-start flex items-center gap-4 ${expandedModule === idx
                      ? "border-primary bg-white shadow-md ring-1 ring-primary/20"
                      : "border-border bg-white hover:border-primary/50 hover:bg-muted/10"
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0 transition-colors ${expandedModule === idx ? "bg-red-50 text-red-600" : "bg-red-50/50 text-red-600/70"
                      }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-bold truncate leading-tight mb-1 ${expandedModule === idx ? "text-foreground" : "text-muted-foreground"
                        }`}>
                        {module.title.toUpperCase()}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {module.duration}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Module Topics - Desktop Only */}
              {expandedModule !== null && syllabusModules[expandedModule] && (
                <div className="hidden md:block bg-white border-x border-b border-border rounded-b-2xl -mt-6 pt-8 pb-6 px-4 sm:pt-10 sm:pb-8 sm:px-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                    <h3 className="text-xl font-bold text-foreground">
                      {syllabusModules[expandedModule].title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                      <BookOpen className="w-3.5 h-3.5" />
                      {syllabusModules[expandedModule].topics.length} Topics
                    </div>
                  </div>
                  {/* Topic Tabs Navigation */}
                  <div className="flex overflow-x-auto gap-2 pb-2 mb-8 border-b border-border/50 scrollbar-hide">
                    {syllabusModules[expandedModule].topics.map((topic, tidx) => (
                      <button
                        key={tidx}
                        onClick={() => setExpandedTopic(tidx)}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all border-b-2 ${expandedTopic === tidx
                          ? "text-primary border-primary bg-primary/5"
                          : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
                          }`}
                      >
                        {typeof topic === 'string' ? topic : topic.title}
                      </button>
                    ))}
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
                                          <div key={sidx} className="flex items-center justify-between p-4 rounded-xl bg-white border border-border/60 hover:border-primary/30 transition-all group/sub">
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

      {/* Tabs Navigation */}
      < section className="sticky top-14 z-40 bg-white border-b border-border" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "faculty", label: "Faculty" },
              { id: "reviews", label: "Reviews" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-4 border-b-2 transition-all whitespace-nowrap ${selectedTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section >

      {/* Content Sections */}
      < section className="py-12 px-4 sm:px-6 lg:px-8" >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12">
              {/* Overview Tab */}
              {selectedTab === "overview" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl mb-4 text-foreground">Course Overview</h2>
                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                      {course.overview || course.description || "The CA Foundation Complete Course is meticulously designed to provide students with a comprehensive understanding of all fundamental subjects required to excel in the CA Foundation examination. This program covers Accounting, Business Laws, Business Mathematics, Logical Reasoning, and Business Economics in depth."}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl mb-4 text-foreground">Key Features</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {(() => {
                        const keyFeaturesConfig = [
                          {
                            icon: Presentation,
                            defaultTitle: "Learning Pedagogy developed over 4 decades",
                            defaultDesc: ""
                          },
                          {
                            icon: Brain,
                            defaultTitle: "Focused on 100% conceptual clarity",
                            defaultDesc: ""
                          },
                          {
                            icon: UserCheck,
                            defaultTitle: "Qualified professionals for teaching as well as non-teaching functions",
                            defaultDesc: ""
                          },
                          {
                            icon: ClipboardCheck,
                            defaultTitle: "Rigorous and precise test series",
                            defaultDesc: ""
                          },
                          {
                            icon: History,
                            defaultTitle: "Detailed revision lectures on course completion",
                            defaultDesc: ""
                          },
                          {
                            icon: Headphones,
                            defaultTitle: "24/7 doubt solving support",
                            defaultDesc: ""
                          }
                        ];

                        return keyFeaturesConfig.map((config, idx) => {
                          // If highlights exist, use them. 
                          // Assuming highlights[idx] contains "Title|Description" or just "Title"
                          // For now, let's assume the user enters the Title in the simplified Admin input.
                          const dynamicText = course.highlights && course.highlights[idx];
                          const title = dynamicText || config.defaultTitle;
                          const desc = dynamicText ? "" : config.defaultDesc;

                          return (
                            <div key={idx} className="bg-muted/30 rounded-lg p-4 border border-border">
                              <div className="bg-primary/10 rounded-lg p-3 w-fit mb-3">
                                <config.icon className="w-8 h-8 text-primary" />
                              </div>
                              <h4 className="text-sm mb-1 text-[#33a882] font-semibold">{title}</h4>
                              <p className="text-sm text-muted-foreground">{desc}</p>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl mb-4 text-foreground">Who Should Enroll</h3>
                    <div className="bg-muted/30 rounded-lg p-6 border border-border">
                      <ul className="space-y-2">
                        {(course.whoShouldEnroll?.length > 0 ? course.whoShouldEnroll : [
                          "Students who have completed Class 12th (Commerce/Non-Commerce)",
                          "Aspiring Chartered Accountants starting their CA journey",
                          "Working professionals looking to switch to finance careers",
                          "Anyone seeking comprehensive foundation-level commerce education"
                        ]).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}



              {/* Faculty Tab */}
              {selectedTab === "faculty" && (
                <div>
                  <h2 className="text-2xl mb-4 text-foreground">Meet Your Instructors</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Learn from industry experts with decades of teaching experience
                  </p>

                  <div className="space-y-6">
                    {facultyMembers.map((faculty, idx) => (
                      <div key={idx} className="bg-white border border-border rounded-lg overflow-hidden">
                        <div className="grid md:grid-cols-12 gap-6 p-6">
                          <div className="md:col-span-3">
                            <div className="relative aspect-square rounded-lg overflow-hidden">
                              <ImageWithFallback
                                src={faculty.image}
                                alt={faculty.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                                <Star className="w-3 h-3 fill-accent text-accent" />
                                <span className="text-xs text-foreground">{faculty.rating}</span>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-9">
                            <h3 className="text-xl mb-1 text-foreground">{faculty.name}</h3>
                            <p className="text-sm text-primary mb-3">{faculty.designation}</p>

                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                              {faculty.bio}
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Specialization</p>
                                <p className="text-sm text-foreground">{faculty.specialization}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Experience</p>
                                <p className="text-sm text-foreground">{faculty.experience}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Students Taught</p>
                                <p className="text-sm text-foreground">{faculty.students}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-xs">
                                View Profile
                              </Button>
                              <Button size="sm" variant="ghost" className="text-xs">
                                Watch Sample Lecture
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {selectedTab === "reviews" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl mb-1 text-foreground">Student Reviews</h2>
                      <p className="text-sm text-muted-foreground">Based on {reviews.length} verified review{reviews.length !== 1 ? 's' : ''}</p>
                    </div>
                    {/* <Button variant="outline" className="text-sm">
                      Write a Review
                    </Button> */}
                  </div>

                  {/* Rating Summary */}
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border border-border mb-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-5xl text-foreground mb-2">{course.rating || "4.9"}</div>
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(Number(course.rating || 4.9)) ? 'fill-accent text-accent' : 'text-muted'}`} />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">Course Rating</p>
                        </div>
                        <div className="flex-1">
                          {[5, 4, 3, 2, 1].map((stars) => (
                            <div key={stars} className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-muted-foreground w-8">{stars} star</span>
                              <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-accent h-full rounded-full"
                                  style={{ width: stars === 5 ? "85%" : stars === 4 ? "12%" : "3%" }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">
                                {stars === 5 ? "85%" : stars === 4 ? "12%" : "3%"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-border">
                          <p className="text-2xl text-foreground mb-0.5">98%</p>
                          <p className="text-xs text-muted-foreground">Pass Rate</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-border">
                          <p className="text-2xl text-foreground mb-0.5">2,456</p>
                          <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-border">
                          <p className="text-2xl text-foreground mb-0.5">450+</p>
                          <p className="text-xs text-muted-foreground">Rank Holders</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-border">
                          <p className="text-2xl text-foreground mb-0.5">4.9★</p>
                          <p className="text-xs text-muted-foreground">Avg Rating</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.slice(0, reviewsVisibleCount).map((review, idx) => (
                      <div key={idx} className="bg-white border border-border rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <ImageWithFallback
                            src={review.image || "/uploads/placeholder.png"}
                            alt={review.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-sm text-foreground mb-0.5">{review.name}</h4>
                                <p className="text-xs text-primary mb-1">{review.achievement}</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => {
                                      const fullStars = Math.floor(review.rating);
                                      const hasHalf = review.rating % 1 !== 0;

                                      if (i < fullStars) {
                                        return <Star key={i} className="w-3 h-3 fill-accent text-accent" />;
                                      } else if (i === fullStars && hasHalf) {
                                        return <StarHalf key={i} className="w-3 h-3 fill-accent text-accent" />;
                                      } else {
                                        return <Star key={i} className="w-3 h-3 text-gray-300" />;
                                      }
                                    })}
                                  </div>
                                  <span className="text-xs text-muted-foreground">{review.date}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {review.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {reviews.length > 3 && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        className="text-sm"
                        onClick={() => setReviewsVisibleCount(prev => prev > 3 ? 3 : reviews.length)}
                      >
                        {reviewsVisibleCount > 3 ? (
                          <>Show Less <ChevronUp className="w-4 h-4 ml-2" /></>
                        ) : (
                          <>Load More Reviews <ChevronDown className="w-4 h-4 ml-2" /></>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>


          </div>
        </div>
      </section >


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
                {[
                  { name: "Citibank", logo: "/assets/alumni/citibank.png" },
                  { name: "HDFC Securities", logo: "/assets/alumni/hdfc-securities.png" },
                  { name: "J.P. Morgan", logo: "/assets/alumni/jpmorgan.png" },
                  { name: "Accenture", logo: "/assets/alumni/accenture.png" },
                  { name: "KPMG", logo: "/assets/alumni/kpmg.png" },
                  // { name: "Punjab National Bank", logo: "/assets/alumni/pnb.png" },
                  // { name: "Bank of Baroda", logo: "/assets/alumni/bank-of-baroda.png" },
                  { name: "kot", logo: "/assets/alumni/kot.png" },
                  { name: "tata", logo: "/assets/alumni/tata.png" },
                  // { name: "rel", logo: "/assets/alumni/rel.png" },
                  { name: "9", logo: "/assets/alumni/1.png" },
                  { name: "1", logo: "/assets/alumni/9.png" },
                  { name: "2", logo: "/assets/alumni/2.png" },
                  { name: "3", logo: "/assets/alumni/3.png" },
                  { name: "4", logo: "/assets/alumni/4.png" },
                  { name: "5", logo: "/assets/alumni/5.png" },
                  { name: "6", logo: "/assets/alumni/6.png" },
                  { name: "7", logo: "/assets/alumni/7.png" },
                  { name: "8", logo: "/assets/alumni/8.png" },
                ].map((company, idx) => (
                  <CarouselItem key={idx} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5">
                    <div className="p-4 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                      <ImageWithFallback
                        src={company.logo}
                        alt={company.name}
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

      {/* Rank Holders Section */}
      {
        (() => {
          const relevantRanks = rankHolders.filter(r => r.category === course?.subCategory);
          if (relevantRanks.length === 0) return null;

          return (
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-border overflow-hidden">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-foreground inline-block relative">
                    Our Achievers
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full" />
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">Achieving excellence in {course?.subCategory}</p>
                </div>

                <div className="relative group px-1 sm:px-12">
                  <Carousel
                    setApi={setRankApi}
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {relevantRanks.map((rank, idx) => (
                        <CarouselItem key={idx} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                          <div className="p-1 h-full">
                            <div className="relative group bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                              {/* Purple Header with Name */}
                              <div className="bg-[#373081] p-4 text-center">
                                <h3 className="text-base font-black text-white line-clamp-1">{rank.name}</h3>
                              </div>

                              {/* Sub-header with Course and Year */}
                              <div className="bg-slate-50 py-2 border-b border-slate-100 flex items-center justify-center gap-2 px-2">
                                <span className="text-[10px] font-bold text-slate-600 truncate">{rank.course}</span>
                                <div className="w-px h-3 bg-slate-300 flex-shrink-0" />
                                <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{rank.session}</span>
                              </div>

                              {/* Image with Overlaid Rank Shields */}
                              <div className="relative aspect-[3/2] overflow-hidden">
                                <ImageWithFallback
                                  src={rank.image}
                                  alt={rank.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />

                                {/* Overlaid Shields */}
                                {rank.globalRank && rank.globalRank.trim() !== "" && (
                                  <div className="absolute bottom-2 left-2">
                                    <div className="relative scale-95 origin-bottom-left">
                                      <Shield className="w-18 h-18 text-amber-500 fill-amber-600 drop-shadow-2xl" strokeWidth={2.5} />
                                      <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                                        <span className="text-[8px] font-black text-white uppercase leading-none">Global</span>
                                        <span className="text-xl font-black text-white leading-none">{rank.globalRank}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {rank.indiaRank && rank.indiaRank.trim() !== "" && (
                                  <div className="absolute bottom-2 right-2">
                                    <div className="relative scale-95 origin-bottom-right">
                                      <Shield className="w-18 h-18 text-slate-400 fill-slate-700 drop-shadow-2xl" strokeWidth={2.5} />
                                      <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                                        <span className="text-[8px] font-black text-white uppercase leading-none">India</span>
                                        <span className="text-xl font-black text-white leading-none">{rank.indiaRank}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Pinned Category Ribbon */}
                              <div className="absolute top-0 right-0 z-20 overflow-hidden w-24 h-24 pointer-events-none">
                                <div className="absolute top-4 -right-10 bg-accent text-white py-1 w-36 text-[8px] font-black uppercase tracking-tighter text-center shadow-lg transform rotate-45 border-b border-white/20">
                                  {rank.category}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="hidden md:block">
                      <CarouselPrevious className="-left-12 h-10 w-10 bg-white border-2" />
                      <CarouselNext className="-right-12 h-10 w-10 bg-white border-2" />
                    </div>
                  </Carousel>
                </div>
              </div>
            </section>
          );
        })()
      }

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
                      <span className="text-[#373081]">After {course.subCategory}</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4">
                      {config.opportunities.map((opp, idx) => (
                        <div key={idx} className="group relative">
                          <div className="bg-white px-4 sm:px-5 py-3 sm:py-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden">
                            <span className="text-xs sm:text-sm font-bold text-slate-700">{opp}</span>
                            {/* <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center translate-x-8 group-hover:translate-x-0 transition-transform duration-300">
                            <ArrowRight className="w-3 h-3 text-primary" />
                          </div> */}

                            {/* Aesthetic Tab/Curve side decorator */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 group-hover:bg-primary transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Visual Graphic */}
                  <div className="relative flex justify-center lg:justify-end order-2 mt-8 lg:mt-0">
                    <div className="relative w-full max-w-[480px]">
                      <div className="aspect-[4/5] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white bg-slate-100 relative group">
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
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-accent/5 border-t border-border">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Student Testimonials</h2>
                  <p className="text-muted-foreground mt-1 text-sm">Hear from our successful students</p>
                </div>
              </div>

              <div className="relative px-4 sm:px-12">
                <Carousel className="w-full">
                  <CarouselContent>
                    {course.testimonials.flatMap((cat: any) => cat.items).map((item: any, idx: number) => (
                      <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1 h-full">
                          <div className="bg-white border border-border rounded-xl shadow-sm hover:shadow-md transition-all p-6 h-full flex flex-col">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border flex-shrink-0">
                                <ImageWithFallback
                                  src={item.image || "/uploads/placeholder.png"}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-foreground line-clamp-1">{item.name}</h4>
                                <p className="text-xs text-primary font-medium line-clamp-1">{item.designation}</p>
                              </div>
                            </div>

                            <div className="flex-1">
                              <Quote className="w-6 h-6 text-primary/20 mb-2" />
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                                {item.message}
                              </p>
                            </div>

                            {item.CheckCircle2Url && (
                              <div className="mt-4 pt-4 border-t border-border/50">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs gap-2"
                                  onClick={() => window.open(item.CheckCircle2Url, '_blank')}
                                >
                                  <Play className="w-3 h-3" /> Watch CheckCircle2
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-4 sm:-left-12 h-8 w-8 sm:h-10 sm:w-10" />
                  <CarouselNext className="-right-4 sm:-right-12 h-8 w-8 sm:h-10 sm:w-10" />
                </Carousel>
              </div>
            </div>
          </section>
        )
      }

      {/* Course Videos Section */}
      {
        course.videos && course.videos.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/10 border-t border-border">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Course Introduction Videos</h2>
                  <p className="text-muted-foreground mt-1 text-sm">Preview what you'll learn in this course</p>
                </div>
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
                    {[...course.videos].reverse().map((video: any, idx: number) => {
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
                {(() => {
                  let questionCount = 0;
                  const totalQuestionsCount = course.faqs.reduce((acc: number, cat: any) =>
                    acc + (cat.topics || (cat.questions ? [{ questions: cat.questions }] : [])).reduce((tAcc: number, top: any) =>
                      tAcc + (top.questions?.length || 0), 0), 0);

                  return (
                    <>
                      {course.faqs.map((category: any, idx: number) => {
                        if (questionCount >= faqVisibleCount) return null;

                        const categoryContent = (
                          <div key={idx} className="space-y-8">
                            {/* Category header removed as per user request */}

                            <div className="space-y-6">
                              {(category.topics || (category.questions ? [{ title: "General", questions: category.questions }] : [])).map((topic: any, tIdx: number) => {
                                if (questionCount >= faqVisibleCount) return null;

                                const remainingLimit = faqVisibleCount - questionCount;
                                const visibleQuestions = topic.questions.slice(0, remainingLimit);

                                if (visibleQuestions.length === 0) return null;
                                questionCount += visibleQuestions.length;

                                return (
                                  <div key={tIdx} className="space-y-4">
                                    {topic.title && topic.title !== "General" && (
                                      <h4 className="text-md font-semibold text-primary/80 px-2 border-l-2 border-primary/20 bg-primary/5 py-1 rounded-r-md">
                                        {topic.title}
                                      </h4>
                                    )}
                                    <Accordion type="single" collapsible className="w-full">
                                      {visibleQuestions.map((faq: any, qIdx: number) => (
                                        <AccordionItem key={qIdx} value={`item-${idx}-${tIdx}-${qIdx}`}>
                                          <AccordionTrigger className="text-base font-medium text-left hover:text-primary transition-colors hover:no-underline px-2">
                                            {faq.question}
                                          </AccordionTrigger>
                                          <AccordionContent className="text-muted-foreground leading-relaxed px-2">
                                            {faq.answer}
                                          </AccordionContent>
                                        </AccordionItem>
                                      ))}
                                    </Accordion>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );

                        return categoryContent;
                      })}

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                        {totalQuestionsCount > faqVisibleCount && (
                          <Button
                            variant="outline"
                            onClick={() => setFaqVisibleCount(prev => prev + 5)}
                            className="text-primary border-primary hover:bg-primary/5 font-semibold transition-all active:scale-95"
                          >
                            Read More ({Math.min(5, totalQuestionsCount - faqVisibleCount)} more questions) <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        )}

                        {faqVisibleCount > 3 && (
                          <Button
                            variant="ghost"
                            onClick={() => setFaqVisibleCount(3)}
                            className="text-muted-foreground hover:text-foreground transition-all"
                          >
                            Show Less <ChevronUp className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </section>
        )
      }

      {/* Related Courses Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Related Courses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {(courses.filter(c => c.slug !== slug && (c.category === course.category || c.subCategory === course.subCategory)).slice(0, 3).length > 0
              ? courses.filter(c => c.slug !== slug && (c.category === course.category || c.subCategory === course.subCategory)).slice(0, 3)
              : courses.filter(c => c.slug !== slug).slice(0, 3)
            ).map((relatedCourse, idx) => (
              <div
                key={relatedCourse._id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-border cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`${currentPathPrefix}${relatedCourse.title.toLowerCase().replace(/ /g, '-')}`)}
              >
                <div className="relative h-40 overflow-hidden shrink-0">
                  <ImageWithFallback
                    src={relatedCourse.image}
                    alt={relatedCourse.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span
                      className="bg-white/95 backdrop-blur-sm text-foreground px-2 py-0.5 rounded text-[10px] uppercase font-bold hover:bg-white cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/courses/category/${encodeURIComponent(relatedCourse.category)}`);
                      }}
                    >
                      {relatedCourse.category}
                    </span>
                    {relatedCourse.level && (
                      <span className="bg-accent text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                        {relatedCourse.level}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-foreground">{relatedCourse.rating}</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold mb-1 text-foreground line-clamp-1 group-hover:text-primary transition-colors">{relatedCourse.title}</h3>
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {relatedCourse.duration}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <img src={relatedCourse.facultyImage} className="w-8 h-8 rounded-full border border-border" />
                    <div className="flex flex-col">
                      <p className="text-xs font-medium text-foreground">{relatedCourse.facultyName}</p>
                      <p className="text-[10px] text-muted-foreground">{relatedCourse.enrolledTotal}+ enrolled students</p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-red-600 leading-none">₹{relatedCourse.price}</span>
                      {relatedCourse.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">₹{relatedCourse.originalPrice}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white h-8 text-xs px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!checkAuthAndEnroll()) return;
                        setSelectedRelatedCourse(relatedCourse);
                        setIsBuyNowOpen(true);
                      }}
                    >
                      Enroll
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Strip Section */}
      <section className="relative bg-[#373081] pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-12">
        {/* Central Icon Badge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white p-3 rounded-full border-4 border-[#373081] shadow-lg">
            <div className="bg-[#373081] p-2 rounded-full">
              <Phone className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-0">
            {[
              { label: "ACCA", phone: "+91 7022878870" },
              { label: "CA", phone: "+91 7406630894" },
              { label: "CS", phone: "+91 7022878869" },
              { label: "CMA", phone: "+91 7406630058" },
              { label: "AMF", phone: "+91 9916384201" },
            ].map((item, idx, arr) => (
              <div key={idx} className={`flex flex-col items-center justify-center text-center px-4 ${idx < arr.length - 1 ? 'md:border-r md:border-white/20' : ''}`}>
                <span className="text-[18px] text-white/70 uppercase tracking-widest font-bold mb-1">{item.label}</span>
                <span className="text-sm font-black text-white">{item.phone}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="sticky bottom-0 bg-white border-t border-border shadow-lg lg:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xl text-foreground">₹25,000</div>
              <div className="text-xs text-muted-foreground line-through">₹31,250</div>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleAddToCart}>
              Enroll
            </Button>
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
        onClose={() => setShowVideoModal(false)}
        videoTitle={`Demo Lecture - ${course.title}`}
        videoUrl={course.videos?.[0]?.url}
        description={course.videos?.[0]?.description}
      />
    </div >
  );
}
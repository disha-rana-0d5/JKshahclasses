import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap, TrendingUp, Users, Award, Star, Play, ArrowRight, CheckCircle2, Trophy, Clock, Target, Zap, Shield, Calendar, MapPin, Video, FileText, Headphones, Volume2, VolumeX } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BookDemoModal } from "./modals/BookDemoModal";
import { BatchEnrollmentModal } from "./modals/BatchEnrollmentModal";
import { VideoModal } from "./modals/VideoModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "./ui/carousel";
import { useCourseContext } from "../admin/context/CourseContext";
import { facultyApi, landingPageApi, batchApi } from "../api/api";
import { toast } from "sonner";
import { getVideoThumbnail } from "./ui/utils";
import { CollegeSection } from "./CollegeSection";

export function LandingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { courses } = useCourseContext();
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState("All");
    const [content, setContent] = useState<any>(null);
    const [batches, setBatches] = useState<any[]>([]);
    const [faculties, setFaculties] = useState<any[]>([]);
    const [api, setApi] = useState<CarouselApi>();
    const [heroApi, setHeroApi] = useState<CarouselApi>();
    const [alumniApi, setAlumniApi] = useState<CarouselApi>();
    const [videoApi, setVideoApi] = useState<CarouselApi>();
    const [trendingApi, setTrendingApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [heroCurrent, setHeroCurrent] = useState(0);
    const [heroCount, setHeroCount] = useState(0);
    const [activeHeroVideo, setActiveHeroVideo] = useState<any>(null);
    const [isMuted, setIsMuted] = useState(true);
    const bannerVideoRef = useRef<HTMLVideoElement>(null);

    // Calculate trending courses and derived categories
    // Calculate trending courses and derived categories
    const allActiveCourses = courses.filter(c => c.status === "Active");
    const visibleCategories = Array.from(new Set(allActiveCourses.map(c => c.category)));

    useEffect(() => {
        document.title = "JK Shah Classes - India's Leading CA Coaching";
    }, []);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const [contentRes, facultyRes, batchRes] = await Promise.all([
                    landingPageApi.getLandingContent(),
                    facultyApi.getFaculties(),
                    batchApi.getBatches()
                ]);

                if (contentRes.ok && contentRes.data.success) {
                    setContent(contentRes.data.data);
                }
                if (facultyRes.ok && facultyRes.data.success) {
                    setFaculties(facultyRes.data.data);
                }
                if (batchRes.ok && batchRes.data.success) {
                    setBatches(batchRes.data.data);
                }
            } catch (error) {
                console.error("Failed to load landing data", error);
            }
        };
        loadPageData();
    }, []);

    useEffect(() => {
        if (!api) return;
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    useEffect(() => {
        if (!heroApi) return;
        setHeroCount(heroApi.scrollSnapList().length);
        setHeroCurrent(heroApi.selectedScrollSnap() + 1);
        heroApi.on("select", () => {
            setHeroCurrent(heroApi.selectedScrollSnap() + 1);
        });

        const intervalId = setInterval(() => {
            heroApi.scrollNext();
        }, 4000);

        return () => clearInterval(intervalId);
    }, [heroApi]);

    useEffect(() => {
        if (!alumniApi) return;

        const intervalId = setInterval(() => {
            alumniApi.scrollNext();
        }, 3000);

        return () => clearInterval(intervalId);
    }, [alumniApi]);

    useEffect(() => {
        if (!videoApi) return;

        const intervalId = setInterval(() => {
            videoApi.scrollNext();
        }, 4000);

        return () => clearInterval(intervalId);
    }, [videoApi]);

    useEffect(() => {
        if (!trendingApi) return;
        const intervalId = setInterval(() => {
            trendingApi.scrollNext();
        }, 3000);
        return () => clearInterval(intervalId);
    }, [trendingApi]);

    if (!content) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex flex-col min-h-screen">
            <main>
                {/* About Section - Attractive Banner Style */}
                {content.aboutSection && (
                    <section className="relative bg-[#373081] mb-8 flex flex-col lg:flex-row min-h-[400px] overflow-hidden">
                        {/* Background Decorative Elements */}
                        <div className="absolute top-0 right-0 w-2/3 h-full bg-accent transform -skew-x-12 origin-top-right z-0 opacity-5"></div>
                        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl z-0 pointer-events-none"></div>
                        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl z-0 pointer-events-none"></div>

                        {/* Left Video/Image - Full Height & Slanted */}
                        <div className="group relative w-full lg:w-7/12 lg:absolute lg:top-0 lg:left-0 lg:h-full z-10 min-h-[350px] lg:min-h-0 [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] lg:[clip-path:polygon(0_0,100%_0,85%_100%,0_100%)] bg-black">
                            {content.aboutSection.videoUrl ? (
                                <video
                                    ref={bannerVideoRef}
                                    // src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    poster={content.aboutSection.image}
                                />
                            ) : (
                                <ImageWithFallback
                                    src={content.aboutSection.image}
                                    alt="About JK Shah Classes"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Inner gradient overlay for a richer look */}
                            <div className="absolute inset-0 bg-[#373081]/40 mix-blend-multiply pointer-events-none"></div>

                            {/* Mute/Unmute Button - centred, visible on hover */}
                            {content.aboutSection.videoUrl && (
                                <button
                                    onClick={() => {
                                        if (bannerVideoRef.current) {
                                            bannerVideoRef.current.muted = !bannerVideoRef.current.muted;
                                            setIsMuted(bannerVideoRef.current.muted);
                                        }
                                    }}
                                    className="absolute inset-0 m-auto w-14 h-14 z-30 flex items-center justify-center bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                                >
                                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                </button>
                            )}


                        </div>

                        {/* Right Content */}
                        <div className="w-full lg:w-5/12 lg:ml-auto flex items-center p-6 sm:p-8 lg:p-10 xl:p-12 relative z-10">
                            <div className="text-white max-w-2xl">
                                <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-bold mb-4 uppercase tracking-wider shadow-lg">
                                    <Star className="w-4 h-4 fill-accent" />
                                    <span>Discover JK Shah Classes</span>
                                </div>

                                <h2 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold mb-3 leading-tight text-white drop-shadow-sm">
                                    {content.aboutSection.title}
                                </h2>

                                <p className="text-sm lg:text-base text-white/90 mb-5 leading-relaxed font-light">
                                    {content.aboutSection.description}
                                </p>

                                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                                    {content.aboutSection.points?.map((point: string, idx: number) => (
                                        <div key={idx} className="flex items-start gap-3 group">
                                            <div className="bg-accent/20 rounded-full p-1 mt-0.5 group-hover:bg-accent/40 transition-colors">
                                                <CheckCircle2 className="w-4 h-4 text-accent" />
                                            </div>
                                            <p className="font-medium text-sm lg:text-base text-white/95">{point}</p>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    size="lg"
                                    className="bg-accent hover:bg-accent/90 text-[#373081] font-bold px-5 py-4 text-sm shadow-xl shadow-accent/20 transition-all hover:scale-105"
                                    onClick={() => navigate("/courses")}
                                >
                                    Explore Our Courses
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Course Categories - Compact Grid */}
                {/* <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl text-foreground mb-1">{content.popularPrograms?.title}</h2>
                                <p className="text-sm text-muted-foreground">{content.popularPrograms?.subtitle}</p>
                            </div>
                            <Button
                                variant="ghost"
                                className="text-primary"
                                onClick={() => navigate("/courses")}
                            >
                                View All →
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-6 gap-3">
                            {[
                                { title: "CA Foundation", icon: BookOpen, count: "8 Courses", color: "primary" },
                                { title: "CA Inter", icon: GraduationCap, count: "6 Courses", color: "accent" },
                                { title: "CA Final", icon: Award, count: "5 Courses", color: "primary" },
                                { title: "CS Executive", icon: Shield, count: "4 Courses", color: "accent" },
                                { title: "CS Professional", icon: TrendingUp, count: "5 Courses", color: "primary" },
                                { title: "CMA", icon: Target, count: "6 Courses", color: "accent" }
                            ].map((category, idx) => (
                                <div key={idx}
                                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer border border-transparent hover:border-primary"
                                    onClick={() => navigate(`/courses/category/${encodeURIComponent(category.title)}`)}
                                >
                                    <div className={`bg-${category.color}/10 rounded p-2 w-fit mb-2`}>
                                        <category.icon className={`w-5 h-5 text-${category.color}`} />
                                    </div>
                                    <h3 className="text-sm mb-1 text-foreground">{category.title}</h3>
                                    <p className="text-xs text-muted-foreground">{category.count}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section> */}

                {/* College Section */}
                <CollegeSection />

                {/* Hero Section - Asymmetric Split Design */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-white to-accent/5">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-12 gap-6 items-start">
                            {/* Left Content - 7 columns */}
                            <div className="lg:col-span-7">
                                <div className="inline-flex items-center gap-2 bg-accent text-white px-3 py-1.5 rounded-full text-sm mb-3">
                                    <Trophy className="w-3.5 h-3.5" />
                                    <span>{content.hero.badge}</span>
                                </div>

                                <h1 className="text-4xl lg:text-5xl mb-3 text-foreground leading-tight">
                                    {content.hero.title}
                                </h1>

                                <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                                    {content.hero.description}
                                </p>

                                {/* Quick Action Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <Button
                                        onClick={() => setShowVideoModal(true)}
                                        className="bg-primary hover:bg-primary/90 text-white h-auto py-3"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        {content.hero.ctaDemoText}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-2 border-primary text-primary hover:bg-primary/5 hover:!text-primary h-auto py-3"
                                        onClick={() => navigate("/courses")}
                                    >
                                        {content.hero.ctaCoursesText}
                                    </Button>
                                </div>

                                {/* Inline Stats */}
                                {/* <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-lg border border-border">
                                    {content.hero.stats?.map((stat: any, idx: number) => (
                                        <div key={idx} className="text-center border-r border-border last:border-0">
                                            <p className="text-2xl text-primary mb-0.5">{stat.value}</p>
                                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                                        </div>
                                    ))}
                                </div> */}
                            </div>

                            {/* Right Sidebar - 5 columns - Scrollable Videos */}
                            <div className="lg:col-span-5 space-y-4">
                                {/* <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 px-1">
                                    <Video className="w-4 h-4 text-primary" />
                                    Feature Highlights
                                </h3> */}

                                <div className="relative group">
                                    <Carousel
                                        opts={{
                                            align: "start",
                                            loop: true,
                                        }}
                                        className="w-full"
                                        setApi={setHeroApi}
                                    >
                                        <CarouselContent>
                                            {content.hero.videos?.slice(0, 5).map((video: any, idx: number) => (
                                                <CarouselItem key={idx} className="basis-full">
                                                    <div
                                                        className="group cursor-pointer"
                                                        onClick={() => {
                                                            setActiveHeroVideo(video);
                                                            setShowVideoModal(true);
                                                        }}
                                                    >
                                                        <div className="relative rounded-xl overflow-hidden shadow-md aspect-video">
                                                            <ImageWithFallback
                                                                src={video.thumbnail}
                                                                alt={`Video ${idx + 1}`}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg group-hover:scale-110 transition-transform">
                                                                    <Play className="w-5 h-5 text-primary fill-primary" />
                                                                </div>
                                                            </div>
                                                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white">
                                                                Demo {idx + 1}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="hidden group-hover:flex -left-4" />
                                        <CarouselNext className="hidden group-hover:flex -right-4" />
                                    </Carousel>

                                    {/* Pagination Dots */}
                                    <div className="flex justify-center gap-2 mt-4">
                                        {Array.from({ length: heroCount }).map((_, index) => (
                                            <button
                                                key={index}
                                                className={`h-2 rounded-full transition-all ${index + 1 === heroCurrent ? "bg-primary w-6" : "bg-primary/20 w-2 hover:bg-primary/40"
                                                    }`}
                                                onClick={() => heroApi?.scrollTo(index)}
                                                aria-label={`Go to slide ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Info Cards */}
                                <div className="grid grid-cols-2 gap-3">
                                    {content.hero.quickInfo?.map((info: any, idx: number) => {
                                        const Icon = idx === 0 ? Target : Users;
                                        const colorClass = idx === 0 ? "text-primary" : "text-accent";

                                        return (
                                            <div key={idx} className="bg-white border border-border rounded-lg p-3">
                                                <Icon className={`w-5 h-5 ${colorClass} mb-2`} />
                                                <p className="text-xs text-muted-foreground mb-0.5">{info.label}</p>
                                                <p className="text-sm text-foreground">{info.value}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Courses - Dense Card Layout */}
                <section className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl text-foreground">Trending Courses</h2>
                            <div className="flex gap-2 flex-wrap justify-end">
                                <Button
                                    size="sm"
                                    variant={activeFilter === "All" ? "default" : "ghost"}
                                    className="text-xs"
                                    onClick={() => setActiveFilter("All")}
                                >
                                    All
                                </Button>
                                {visibleCategories.map((category) => (
                                    <Button
                                        key={category}
                                        size="sm"
                                        variant={activeFilter === category ? "default" : "ghost"}
                                        className="text-xs"
                                        onClick={() => setActiveFilter(category)}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="relative group px-1 py-4 overflow-hidden">
                            <Carousel
                                opts={{
                                    align: "start",
                                    loop: true,
                                }}
                                setApi={setTrendingApi}
                                className="w-full"
                            >
                                <CarouselContent className="-ml-6">
                                    {allActiveCourses
                                        .filter(c => activeFilter === "All" || c.category === activeFilter)
                                        .map((course) => (
                                            <CarouselItem key={course._id} className="pl-6 md:basis-1/2 lg:basis-1/3 h-full">
                                                <div
                                                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-border cursor-pointer flex flex-col h-full"
                                                    onClick={() => navigate(`/course/${course.title.toLowerCase().replace(/ /g, '-')}`)}
                                                >
                                                    <div
                                                        className="relative h-40 overflow-hidden shrink-0"
                                                    >
                                                        <ImageWithFallback
                                                            src={course.image}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        <div className="absolute top-2 left-2 flex gap-2">
                                                            <span
                                                                className="bg-white/95 backdrop-blur-sm text-foreground px-2 py-0.5 rounded text-[10px] uppercase font-bold hover:bg-white cursor-pointer transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/courses/category/${encodeURIComponent(course.category)}`);
                                                                }}
                                                            >
                                                                {course.category}
                                                            </span>
                                                            {course.level && (
                                                                <span className="bg-accent text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                                                    {course.level}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
                                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs font-bold text-foreground">{course.rating}</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 flex flex-col flex-1">
                                                        <div className="mb-3">
                                                            <h3 className="text-base font-semibold mb-1 text-foreground line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                                                            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {course.duration}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 mb-4">
                                                            <img src={course.facultyImage} className="w-8 h-8 rounded-full border border-border" />
                                                            <div className="flex flex-col">
                                                                <p className="text-xs font-medium text-foreground">{course.facultyName}</p>
                                                                <p className="text-[10px] text-muted-foreground">{course.enrolledTotal}+ enrolled students</p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                                                            <div className="flex flex-col">
                                                                <span className="text-lg font-bold text-red-600 leading-none">₹{course.price}</span>
                                                                {course.originalPrice && (
                                                                    <span className="text-xs text-muted-foreground line-through">₹{course.originalPrice}</span>
                                                                )}
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="bg-primary hover:bg-primary/90 text-white h-8 text-xs px-4"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const token = localStorage.getItem("token");
                                                                    const userStr = localStorage.getItem("user");
                                                                    const user = userStr ? JSON.parse(userStr) : null;
                                                                    const isStudent = !!token && user?.role === "student";

                                                                    if (!isStudent) {
                                                                        toast.error("Please login to enroll in courses");
                                                                        navigate("/login", { state: { from: location } });
                                                                        return;
                                                                    }

                                                                    setSelectedCourse(course);
                                                                    setShowEnrollModal(true);
                                                                }}
                                                            >
                                                                Enroll
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                </CarouselContent>
                                <CarouselPrevious className="-left-4 lg:-left-12 hidden md:flex" />
                                <CarouselNext className="-right-4 lg:-right-12 hidden md:flex" />
                            </Carousel>
                            {allActiveCourses.filter(c => c.status === "Active").length === 0 && (
                                <div className="py-12 text-center bg-muted/20 rounded-lg border border-dashed border-border">
                                    <p className="text-muted-foreground">No trending courses available at the moment.</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center gap-2 mt-4">
                            {Array.from({ length: count }).map((_, index) => (
                                <button
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all ${index + 1 === current ? "bg-primary w-4" : "bg-gray-300"}`}
                                    onClick={() => api?.scrollTo(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Online Learning Experience Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-white to-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <div>
                                <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-3 py-1.5 rounded-full text-sm mb-4">
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>{content.onlineExperience.badge}</span>
                                </div>

                                <h2 className="text-3xl lg:text-4xl mb-3 text-foreground">
                                    {content.onlineExperience.title}
                                </h2>

                                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                                    {content.onlineExperience.description}
                                </p>

                                {/* Feature Grid */}
                                <div className="space-y-4 mb-6">
                                    {[
                                        {
                                            icon: Video,
                                            title: "Live Interactive Classes",
                                            desc: "Real-time teaching with faculty, not pre-recorded generic videos",
                                            color: "primary"
                                        },
                                        {
                                            icon: Clock,
                                            title: "Recorded Lecture Access",
                                            desc: "Revisit any lecture anytime with lifetime access to recordings",
                                            color: "primary"
                                        },
                                        {
                                            icon: Headphones,
                                            title: "Instant Doubt Resolution",
                                            desc: "Live Q&A sessions and dedicated doubt-clearing forums",
                                            color: "accent"
                                        },
                                        {
                                            icon: Calendar,
                                            title: "Structured Batch Schedules",
                                            desc: "Organized timetables designed by experts for optimal learning",
                                            color: "primary"
                                        }
                                    ].map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-4 group">
                                            <div className={`bg-${feature.color}/10 rounded-lg p-3 flex-shrink-0 group-hover:bg-${feature.color}/20 transition-colors`}>
                                                <feature.icon className={`w-5 h-5 text-${feature.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base text-foreground mb-1">{feature.title}</h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        className="bg-primary hover:bg-primary/90 text-white"
                                        onClick={() => navigate("/#")}
                                    >
                                        <Video className="w-4 h-4 mr-2" />
                                        Browse Live Sessions
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowVideoModal(true)}
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Watch Platform Demo
                                    </Button>
                                </div>
                            </div>

                            {/* Right Image */}
                            <div className="relative">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                    <ImageWithFallback
                                        src={content.onlineExperience.image}
                                        alt="Students attending live online class"
                                        className="w-full h-[500px] object-cover"
                                    />
                                    {/* Floating Stats */}
                                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-accent/10 rounded-full p-2">
                                                <Users className="w-4 h-4 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Live Now</p>
                                                <p className="text-lg text-foreground">1,234 Students</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 rounded-full p-2">
                                                <Star className="w-4 h-4 text-primary fill-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Avg. Rating</p>
                                                <p className="text-lg text-foreground">4.9/5.0</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10"></div>
                                <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-accent/10 rounded-full blur-3xl -z-10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Student Success Stories Section */}
                <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-accent/5">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-12 gap-6">
                            {/* Full Width Testimonials/Stories */}
                            <div className="lg:col-span-12">
                                <h3 className="text-2xl font-bold mb-6 text-foreground text-center">{content.testimonials.title}</h3>
                                {content.testimonials?.list?.length > 6 ? (
                                    <div className="px-0 lg:px-12">
                                        <Carousel
                                            opts={{
                                                align: "start",
                                                loop: true,
                                            }}
                                            className="w-full"
                                            setApi={setApi}
                                        >
                                            <CarouselContent>
                                                {Array.from({ length: Math.ceil((content.testimonials?.list?.length || 0) / 6) }).map((_, pageIdx) => (
                                                    <CarouselItem key={pageIdx} className="basis-full">
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                            {(content.testimonials?.list || []).slice(pageIdx * 6, (pageIdx + 1) * 6).map((testimonial: any, idx: number) => (
                                                                <div key={idx} className="bg-white rounded-lg p-3 md:p-4 shadow-sm h-full flex flex-col justify-between border border-border/50 hover:shadow-md transition-shadow">
                                                                    <div>
                                                                        <div className="flex items-start gap-3 mb-3">
                                                                            <ImageWithFallback
                                                                                src={testimonial.image}
                                                                                alt={testimonial.name}
                                                                                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-semibold text-foreground mb-0.5">{testimonial.name}</p>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Trophy className="w-3 h-3 text-accent flex-shrink-0" />
                                                                                    <p className="text-xs text-muted-foreground truncate">{testimonial.rank}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-0.5">
                                                                                {[...Array(5)].map((_, i) => (
                                                                                    <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground leading-relaxed italic">"{testimonial.text}"</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious className="!hidden lg:flex -left-4" />
                                            <CarouselNext className="!hidden lg:flex -right-4" />
                                        </Carousel>
                                        <div className="py-2 text-center text-sm text-muted-foreground">
                                            <div className="flex justify-center gap-2 mt-4">
                                                {Array.from({ length: count }).map((_, index) => (
                                                    <button
                                                        key={index}
                                                        className={`h-2 rounded-full transition-all ${index + 1 === current ? "bg-primary w-6" : "bg-primary/20 w-2 hover:bg-primary/40"
                                                            }`}
                                                        onClick={() => api?.scrollTo(index)}
                                                        aria-label={`Go to slide ${index + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(content.testimonials?.list || []).map((testimonial: any, idx: number) => (
                                            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm h-full border border-border/50 hover:shadow-md transition-shadow">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <ImageWithFallback
                                                        src={testimonial.image}
                                                        alt={testimonial.name}
                                                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-foreground mb-0.5">{testimonial.name}</p>
                                                        <div className="flex items-center gap-1">
                                                            <Trophy className="w-3 h-3 text-accent flex-shrink-0" />
                                                            <p className="text-xs text-muted-foreground truncate">{testimonial.rank}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed italic">"{testimonial.text}"</p>
                                            </div>
                                        ))}
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

                {/* Video Carousel Section */}
                {content.videoCarousel?.videos?.length > 0 && (
                    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-border overflow-hidden">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-foreground inline-block relative">
                                    {content.videoCarousel.title || "Watch Our Classes in Action"}
                                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full" />
                                </h2>
                                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                                    Experience our teaching methodology through these sample lectures and student interactions.
                                </p>
                            </div>

                            <div className="relative group px-1 sm:px-12">
                                <Carousel
                                    setApi={setVideoApi}
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-2 md:-ml-4">
                                        {content.videoCarousel.videos.map((video: any, idx: number) => (
                                            <CarouselItem key={idx} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                                                <div className="p-2 h-full">
                                                    <div
                                                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-border transition-all duration-300 hover:shadow-md h-full flex flex-col cursor-pointer group/card"
                                                        onClick={() => {
                                                            setActiveHeroVideo(video);
                                                            setShowVideoModal(true);
                                                        }}
                                                    >
                                                        <div className="relative aspect-video overflow-hidden bg-slate-100">
                                                            <ImageWithFallback
                                                                src={video.thumbnailUrl || getVideoThumbnail(video.videoUrl)}
                                                                alt={video.title}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors flex items-center justify-center">
                                                                <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover/card:scale-110">
                                                                    <Play className="w-6 h-6 fill-current" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 flex-1 flex flex-col items-center text-center">
                                                            <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover/card:text-primary transition-colors mb-2">
                                                                {video.title}
                                                            </h3>
                                                            {video.description && (
                                                                <div className="relative">
                                                                    <p className={`text-[11px] text-muted-foreground transition-all duration-300 ${video.isExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}>
                                                                        {video.description}
                                                                    </p>
                                                                    {video.description.length > 60 && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const newVideos = [...content.videoCarousel.videos];
                                                                                newVideos[idx] = { ...newVideos[idx], isExpanded: !newVideos[idx].isExpanded };
                                                                                setContent({
                                                                                    ...content,
                                                                                    videoCarousel: {
                                                                                        ...content.videoCarousel,
                                                                                        videos: newVideos
                                                                                    }
                                                                                });
                                                                            }}
                                                                            className="text-[10px] text-primary font-bold mt-1 hover:underline focus:outline-none"
                                                                        >
                                                                            {video.isExpanded ? 'Read Less' : 'Read More'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <div className="hidden md:block">
                                        <CarouselPrevious className="-left-12 h-10 w-10 border-2" />
                                        <CarouselNext className="-right-12 h-10 w-10 border-2" />
                                    </div>
                                </Carousel>
                            </div>
                        </div>
                    </section>
                )}

                {/* Learning Features - Bento Grid Style */}
                <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30" >
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl mb-4 text-foreground">Complete Learning Ecosystem</h2>

                        <div className="grid md:grid-cols-4 gap-3">
                            {[
                                { icon: Video, title: "Live Classes", desc: "Interactive sessions", color: "primary" },
                                { icon: FileText, title: "Study Material", desc: "Comprehensive notes", color: "accent" },
                                { icon: Headphones, title: "24/7 Support", desc: "Doubt clearing", color: "primary" },
                                { icon: Trophy, title: "Mock Tests", desc: "Regular practice", color: "accent" },
                            ].map((feature, idx) => (
                                <div key={idx} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                                    <div className={`bg-${feature.color}/10 rounded-lg p-2 w-fit mb-2`}>
                                        <feature.icon className={`w-5 h-5 text-${feature.color}`} />
                                    </div>
                                    <h3 className="text-sm mb-0.5 text-foreground">{feature.title}</h3>
                                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section >

                {/* CTA Section - Compact */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary via-primary/90 to-accent" >
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-6 items-center">
                            <div>
                                <h2 className="text-3xl mb-2 text-white">{content.footerCta.title}</h2>
                                <p className="text-base text-white/90">
                                    {content.footerCta.description}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    size="lg"
                                    className="bg-white text-primary hover:bg-white/90 flex-1"
                                    onClick={() => setShowDemoModal(true)}
                                >
                                    {content.footerCta.demoButtonText}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-transparent border-2 border-white text-white hover:bg-white/10 flex-1"
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

                                        if (content.footerCta.brochureUrl) {
                                            window.open(content.footerCta.brochureUrl, '_blank');
                                        } else {
                                            toast.info("Brochure coming soon!");
                                        }
                                    }}
                                >
                                    {content.footerCta.brochureButtonText}
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modals */}
            <BookDemoModal
                isOpen={showDemoModal}
                onClose={() => setShowDemoModal(false)}
            />
            <BatchEnrollmentModal
                isOpen={showEnrollModal}
                onClose={() => {
                    setShowEnrollModal(false);
                    setSelectedCourse(null);
                }}
                course={selectedCourse}
                batches={batches}
                branches={content?.branches || []}
            />
            <VideoModal
                isOpen={showVideoModal}
                onClose={() => {
                    setShowVideoModal(false);
                    setActiveHeroVideo(null);
                }}
                videoTitle={activeHeroVideo ? (activeHeroVideo.title || "JK Shah Classes - Feature Demo") : "JK Shah Classes - Demo Class"}
                videoUrl={activeHeroVideo ? (activeHeroVideo.videoUrl || activeHeroVideo.url) : content.onlineExperience?.videoUrl}
                description={activeHeroVideo?.description}
            />
        </div>
    );
}

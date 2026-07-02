import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap, TrendingUp, Users, Award, Star, Play, ArrowRight, CheckCircle2, Trophy, Clock, Target, Zap, Shield, Calendar, MapPin, Video, FileText, Headphones, Volume2, VolumeX, Download, Book, Filter } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BranchEnquiryModal } from "./modals/BranchEnquiryModal";
import { BatchEnrollmentModal } from "./modals/BatchEnrollmentModal";
import { MerittoFormModal } from "./modals/MerittoFormModal";
import { VideoModal } from "./modals/VideoModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "./ui/carousel";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useCourseContext } from "../admin/context/CourseContext";
import { facultyApi, landingPageApi, batchApi, alumniWorkAtApi } from "../api/api";
import { toast } from "sonner";
import { getVideoThumbnail } from "./ui/utils";
import { CollegeSection } from "./CollegeSection";
import { generateSlug } from "../admin/utils/slugify";
import { RankersSection } from "./RankersSection";

export function LandingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { courses, allCategories } = useCourseContext();
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [enquireOpen, setEnquireOpen] = useState(false);
    const [pendingBrochure, setPendingBrochure] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState("All");
    const [content, setContent] = useState<any>(null);
    const [batches, setBatches] = useState<any[]>([]);
    const [faculties, setFaculties] = useState<any[]>([]);
    const [api, setApi] = useState<CarouselApi>();
    const [alumniApi, setAlumniApi] = useState<CarouselApi>();
    const [videoApi, setVideoApi] = useState<CarouselApi>();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
    const [isVideoPaused, setIsVideoPaused] = useState(false);
    const [trendingApi, setTrendingApi] = useState<CarouselApi>();
    const [featuresApi, setFeaturesApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [heroCurrent, setHeroCurrent] = useState(1);
    const [activeHeroVideo, setActiveHeroVideo] = useState<any>(null);
    const [isMuted, setIsMuted] = useState(true);
    const bannerVideoRef = useRef<HTMLVideoElement>(null);
    const [alumniWorkAt, setAlumniWorkAt] = useState<any[]>([]);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    // Calculate trending courses
    const allActiveCourses = courses.filter(c => c.status === "Active");

    // Extract testimonials from courses
    const courseTestimonials = allActiveCourses.flatMap(course =>
        course.testimonials ? course.testimonials.flatMap((cat: any) => cat.items || []) : []
    ).map((item: any) => ({
        name: item.name,
        rank: item.designation || item.rank || "Student",
        image: item.image,
        text: item.message || item.text,
    }));

    const displayTestimonials = courseTestimonials.length > 0
        ? courseTestimonials
        : (content?.testimonials?.list || []);

    // Get all main categories exactly as defined in the admin panel (excluding sub-categories)
    const sortedCategories = [...(allCategories || [])]
        .filter(c => !c.parent)
        .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    const visibleCategories = sortedCategories.map(c => c.name).filter(Boolean);

    useEffect(() => {
        document.title = "JK Shah Classes - India's Leading CA Coaching";
    }, []);

    useEffect(() => {
        const loadPageData = () => {
            try {
                // Fetch main content immediately so the Hero section loads instantly
                landingPageApi.getLandingContent().then(contentRes => {
                    if (contentRes.ok && contentRes.data.success) {
                        setContent(contentRes.data.data);
                    }
                }).catch(err => console.error("Failed to load content", err));

                // Fetch other sections independently so they don't block the main page load
                facultyApi.getFaculties({ limit: 1000 }).then(facultyRes => {
                    if (facultyRes.ok && facultyRes.data.success) {
                        setFaculties(facultyRes.data.data);
                    }
                }).catch(err => console.error("Failed to load faculties", err));

                batchApi.getBatches().then(batchRes => {
                    if (batchRes.ok && batchRes.data.success) {
                        setBatches(batchRes.data.data);
                    }
                }).catch(err => console.error("Failed to load batches", err));

                alumniWorkAtApi.getAll({ limit: 1000 }).then(workAtRes => {
                    if (workAtRes.ok && workAtRes.data.success) {
                        setAlumniWorkAt(workAtRes.data.data || []);
                    }
                }).catch(err => console.error("Failed to load alumni work at", err));

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
        if (!content?.hero?.videos) return;

        const intervalId = setInterval(() => {
            setHeroCurrent(prev => (prev % (content.hero.videos.length)) + 1);
        }, 6000);

        return () => clearInterval(intervalId);
    }, [content?.hero?.videos]);

    useEffect(() => {
        if (!alumniApi) return;

        const intervalId = setInterval(() => {
            alumniApi.scrollNext();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [alumniApi]);

    useEffect(() => {
        if (!videoApi || isVideoPaused) return;

        const intervalId = setInterval(() => {
            videoApi.scrollNext();
        }, 6000);

        return () => clearInterval(intervalId);
    }, [videoApi, isVideoPaused]);

    useEffect(() => {
        if (!trendingApi) return;
        const intervalId = setInterval(() => {
            trendingApi.scrollNext();
        }, 5000);
        return () => clearInterval(intervalId);
    }, [trendingApi]);

    useEffect(() => {
        if (!featuresApi) return;
        const intervalId = setInterval(() => {
            featuresApi.scrollNext();
        }, 3000);
        return () => clearInterval(intervalId);
    }, [featuresApi]);

    useEffect(() => {
        const handleIframeMessage = (event: MessageEvent) => {
            if (event.data && (event.data.event === 'loadedmetadata' || event.data.event === 'loadeddata')) {
                const sourceWindow = event.source as Window;
                if (sourceWindow && typeof sourceWindow.postMessage === 'function') {
                    sourceWindow.postMessage({ methodName: 'setMuted', argument: true }, '*');
                    sourceWindow.postMessage({ methodName: 'setLoop', argument: true }, '*');
                    sourceWindow.postMessage({ methodName: 'play' }, '*');
                }
            }
        };

        window.addEventListener('message', handleIframeMessage);

        if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.warn(
                "🚨 DRM VIDEO PLAYBACK ERROR 🚨\n\n" +
                "The embedded video player is using DRM (Digital Rights Management) to protect its content.\n" +
                "Modern browsers enforce strict security policies dictating that DRM decryption will ONLY work in a 'Secure Context' (meaning the page must be accessed over HTTPS or on localhost).\n\n" +
                "Because you are accessing this site via an HTTP IP address (" + window.location.origin + "), the browser is blocking the DRM keys, causing the video to fail to load.\n" +
                "Please access this site via HTTPS or localhost to fix this issue."
            );
        }

        return () => window.removeEventListener('message', handleIframeMessage);
    }, []);

    if (!content) return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-primary font-medium animate-pulse">Loading...</p>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen">
            <main>
                {/* About Section - Attractive Banner Style */}
                {content.aboutSection && (
                    <section className="relative bg-[#373081] mb-8 flex flex-col lg:flex-row lg:min-h-[400px] overflow-hidden">
                        {/* Background Decorative Elements */}
                        <div className="absolute top-0 right-0 w-2/3 h-full bg-accent transform -skew-x-12 origin-top-right z-0 opacity-5"></div>
                        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl z-0 pointer-events-none"></div>
                        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl z-0 pointer-events-none"></div>

                        {/* Left Video/Image - Full Height & Slanted */}
                        <div className="group relative w-full lg:w-7/12 lg:absolute lg:top-0 lg:left-0 lg:h-full z-10 aspect-video lg:aspect-auto lg:min-h-0 lg:[clip-path:polygon(0_0,100%_0,85%_100%,0_100%)] bg-black overflow-hidden">
                            {content.aboutSection.videoUrl ? (
                                <>
                                    <iframe
                                        id="main-hero-video-iframe"
                                        src="https://new-online.jkshahclasses.com/embed/JiJlSbqo69z/?access_token=9b89270e-efa5-429d-a1e1-2d4f228dd563&autoplay=1&muted=1"
                                        className="absolute pointer-events-none"
                                        style={{
                                            border: 0,
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            minWidth: '100%',
                                            minHeight: '100%',
                                            aspectRatio: '16/9',
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        frameBorder="0"
                                    />
                                </>
                            ) : (
                                <ImageWithFallback
                                    src={content.aboutSection.image}
                                    alt="About JK Shah Classes"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Inner gradient overlay for a richer look */}
                            <div className="absolute inset-0 bg-[#373081]/40 mix-blend-multiply pointer-events-none"></div>

                            {content.aboutSection.videoUrl && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const newMutedState = !isMuted;
                                        setIsMuted(newMutedState);
                                        const iframe = document.getElementById('main-hero-video-iframe') as HTMLIFrameElement;
                                        if (iframe && iframe.contentWindow) {
                                            iframe.contentWindow.postMessage({ methodName: 'setMuted', argument: newMutedState }, '*');
                                        }
                                    }}
                                    className="absolute bottom-4 left-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full backdrop-blur-sm transition-all cursor-pointer shadow-lg"
                                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                                >
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                            )}
                        </div>

                        {/* Right Content */}
                        <div className="w-full lg:w-5/12 lg:ml-auto flex items-center p-6 sm:p-8 lg:p-10 xl:p-12 relative z-10">
                            <div className="text-white max-w-2xl">
                                <div className="flex justify-center">
                                    <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-bold mb-4 uppercase tracking-wider shadow-lg">
                                        <Star className="w-4 h-4 fill-accent" />
                                        <span>Discover JK Shah Classes</span>
                                    </div>
                                </div>

                                <h2 className="text-xl lg:text-3xl xl:text-4xl font-extrabold mb-3 leading-tight text-white drop-shadow-sm">
                                    {content.aboutSection.title}
                                </h2>

                                <p className="text-[13px] lg:text-base text-white/90 mb-5 leading-relaxed font-light">
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

                {/* College Section */}
                <CollegeSection />

                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-white to-accent/5 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-7xl mx-auto min-h-[500px] relative">
                            <AnimatePresence mode="wait">
                                {content.hero.videos?.slice(0, 5).map((video: any, idx: number) => (
                                    heroCurrent === idx + 1 && (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: 0 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 0 }}
                                            transition={{ duration: 0.6, ease: "easeInOut" }}
                                            className="grid lg:grid-cols-12 gap-6 items-start"
                                        >
                                            {/* Left Content */}
                                            <div className="lg:col-span-7">
                                                <div className="inline-flex items-center gap-2 bg-accent text-white px-3 py-1.5 rounded-full text-sm mb-3">
                                                    <Trophy className="w-3.5 h-3.5" />
                                                    <span>{video.badge || content.hero.badge}</span>
                                                </div>

                                                <h1 className="text-2xl xs:text-3xl lg:text-5xl mb-3 text-foreground leading-tight">
                                                    {video.title || content.hero.title}
                                                </h1>

                                                <p className="text-sm lg:text-base text-muted-foreground mb-4 leading-relaxed">
                                                    {video.description || content.hero.description}
                                                </p>

                                                {/* Quick Action Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                                    {/* <Button
                                                        onClick={() => {
                                                            setActiveHeroVideo(video);
                                                            setShowVideoModal(true);
                                                        }}
                                                        className="bg-primary hover:bg-primary/90 text-white h-auto py-3"
                                                    >
                                                        <Play className="w-4 h-4 mr-2" />
                                                        {video.ctaDemoText || content.hero.ctaDemoText}
                                                    </Button> */}
                                                    <Button
                                                        className="bg-[#373081] hover:bg-[#373081]/90 text-white h-auto py-3"
                                                        onClick={() => navigate("/courses")}
                                                    >
                                                        {video.ctaCoursesText || content.hero.ctaCoursesText}
                                                    </Button>
                                                    {content.hero.brochureUrl && (
                                                        <Button
                                                            variant="outline"
                                                            className="h-auto py-3 border-[#373081] text-[#373081] hover:bg-[#373081] hover:text-white"
                                                            onClick={() => {
                                                                const url = content.hero.brochureUrl.startsWith('http')
                                                                    ? content.hero.brochureUrl
                                                                    : `${window.location.origin}${content.hero.brochureUrl}`;
                                                                setPendingBrochure(url);
                                                                setEnquireOpen(true);
                                                            }}
                                                        >
                                                            View Brochure
                                                        </Button>
                                                    )}
                                                </div>

                                                {/* Hero Stats */}
                                                {/* {(() => {
                                                    const statsItems = video.stats?.length
                                                        ? video.stats
                                                        : [{ value: '40+', label: 'Years Experience' }, { value: '50K+', label: 'Students' }, { value: '450+', label: 'Rank Holders' }];
                                                    return (
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {statsItems.map((stat: any, sIdx: number) => {
                                                                const Icon = sIdx === 0 ? Award : (sIdx === 1 ? Users : Trophy);
                                                                return (
                                                                    <div key={sIdx} className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-center">
                                                                        <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                                                                        <p className="text-base font-bold text-foreground leading-none mb-1">{stat.value}</p>
                                                                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{stat.label}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })()} */}
                                            </div>

                                            {/* Right Content - 5 columns */}
                                            <div className="lg:col-span-5 space-y-4">
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

                                                    </div>
                                                </div>

                                                {/* Quick Info Cards */}
                                                {(() => {
                                                    const quickInfoItems = video.quickInfo?.length
                                                        ? video.quickInfo
                                                        : [{ label: 'Next Batch', value: 'Starts Monday' }, { label: 'Seats', value: '15 Left Only' }];
                                                    return (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {quickInfoItems.map((info: any, qIdx: number) => {
                                                                const Icon = qIdx % 2 === 0 ? Target : Users;
                                                                const iconColor = qIdx % 2 === 0 ? "text-[#4F46E5]" : "text-[#F59E0B]";
                                                                return (
                                                                    <div key={qIdx} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                                                        <Icon className={`w-5 h-5 ${iconColor} mb-2`} />
                                                                        <p className="text-xs text-muted-foreground mb-0.5">{info.label}</p>
                                                                        <p className="text-sm font-semibold text-foreground">{info.value}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </AnimatePresence>

                            {/* Pagination Dots - Centered below */}
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: content.hero.videos?.slice(0, 5).length || 0 }).map((_, index) => (
                                    <button
                                        key={index}
                                        className={`h-2 rounded-full transition-all ${index + 1 === heroCurrent ? "bg-primary w-6" : "bg-primary/20 w-2 hover:bg-primary/40"
                                            }`}
                                        onClick={() => setHeroCurrent(index + 1)}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Courses - Dense Card Layout */}
                <section className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-row items-center justify-between gap-2 mb-4">
                            <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                                <h2 className="text-xl sm:text-2xl text-foreground font-bold truncate">Trending Courses</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto font-medium whitespace-nowrap shrink-0"
                                    onClick={() => navigate("/courses")}
                                >
                                    <span className="hidden xs:inline">View All</span> <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <div className="flex gap-2 items-center shrink-0 pr-1 sm:pr-0">
                                {/* Desktop Filters */}
                                <div className="hidden md:flex gap-2 flex-wrap justify-end">
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

                                {/* Mobile Filters Dropdown Icon */}
                                <div className="flex md:hidden mr-1">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200">
                                                <Filter className={`w-4 h-4 ${activeFilter !== "All" ? "text-primary" : "text-slate-500"}`} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem
                                                className={activeFilter === "All" ? "bg-primary/10 text-primary font-bold" : ""}
                                                onClick={() => setActiveFilter("All")}
                                            >
                                                All Categories
                                            </DropdownMenuItem>
                                            {visibleCategories.map((category) => (
                                                <DropdownMenuItem
                                                    key={category}
                                                    className={activeFilter === category ? "bg-primary/10 text-primary font-bold" : ""}
                                                    onClick={() => setActiveFilter(category)}
                                                >
                                                    {category}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>

                        <div className="relative px-1 py-4 overflow-hidden">
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
                                        .sort((a, b) => {
                                            const subCatA = allCategories?.find(cat => cat.name === a.subCategory);
                                            const seqA = subCatA?.sequence || 0;

                                            const subCatB = allCategories?.find(cat => cat.name === b.subCategory);
                                            const seqB = subCatB?.sequence || 0;

                                            if (seqA === seqB) {
                                                return ((a as any).sequence || 0) - ((b as any).sequence || 0) || a.title.localeCompare(b.title);
                                            }
                                            return seqA - seqB;
                                        })
                                        .map((course, index) => (
                                            <CarouselItem key={course._id} className="pl-6 md:basis-1/2 lg:basis-1/3 h-full">
                                                <div
                                                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-border cursor-pointer flex flex-col h-full"
                                                    onClick={() => navigate(`/course/${generateSlug(course.title)}`)}
                                                >
                                                    <div
                                                        className="relative aspect-[3/2] overflow-hidden shrink-0"
                                                    >
                                                        <ImageWithFallback
                                                            src={course.image}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />

                                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
                                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs font-bold text-foreground">{index % 2 === 0 ? "4.8" : "4.9"}</span>
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
                                                                className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90 text-white cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/course/${generateSlug(course.title)}`);
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

                <RankersSection title="Our Rank Holders" isLandingPage={true} />

                {/* Online Learning Experience Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-white to-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-start">
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
                                <div className="space-y-4 mb-8 lg:min-h-[380px]">
                                    {[
                                        {
                                            icon: Video,
                                            title: "Video library with industry best faculty",
                                            desc: "Unlimited access to high-quality recorded lectures",
                                            color: "primary"
                                        },
                                        {
                                            icon: Clock,
                                            title: "100% time bound syllabus completion",
                                            desc: "Structured study plan with milestone tracking",
                                            color: "primary"
                                        },
                                        {
                                            icon: Headphones,
                                            title: "Learning Pedagogy",
                                            desc: "Engaging and outcome-driven learning methods",
                                            color: "primary"
                                        },
                                        {
                                            icon: Calendar,
                                            title: "Focus on Conceptual Clarity",
                                            desc: "Build strong fundamentals for long-term success",
                                            color: "primary"
                                        }
                                    ].map((feature, idx) => {
                                        const isExpanded = expandedIndex === idx;
                                        return (
                                            <motion.div
                                                key={idx}
                                                layout
                                                initial={false}
                                                animate={isExpanded ? {
                                                    scale: 1.02,
                                                    boxShadow: "0 10px 30px -10px rgba(55, 48, 129, 0.15)",
                                                    backgroundColor: "rgba(255, 255, 255, 1)"
                                                } : {
                                                    scale: 1,
                                                    boxShadow: "0 0 0px rgba(0,0,0,0)",
                                                    backgroundColor: "rgba(255, 255, 255, 0)"
                                                }}
                                                whileHover={{ y: -2 }}
                                                whileTap={{ scale: 1.05, y: -8, zIndex: 50, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                                className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer border transition-colors ${isExpanded ? "border-primary/20 bg-white shadow-sm" : "border-transparent hover:bg-white/50"
                                                    }`}
                                                onMouseEnter={() => setExpandedIndex(idx)}
                                                onMouseLeave={() => setExpandedIndex(null)}
                                            >
                                                <div className={`bg-${feature.color}/10 rounded-xl p-3 flex-shrink-0 transition-colors ${isExpanded ? `bg-${feature.color}/20 text-${feature.color}` : `text-${feature.color}/70`}`}>
                                                    <feature.icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className={`text-base font-semibold transition-colors ${isExpanded ? "text-primary" : "text-foreground"}`}>
                                                            {feature.title}
                                                        </h3>
                                                        <motion.div
                                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className={`text-${feature.color}/40`}
                                                        >
                                                            <Zap className="w-3 h-3" />
                                                        </motion.div>
                                                    </div>

                                                    <AnimatePresence initial={false}>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                                animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                                                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                className="overflow-hidden"
                                                            >
                                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                                    {feature.desc}
                                                                </p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Hover underline slide effect */}
                                                    {!isExpanded && (
                                                        <motion.div
                                                            className="h-0.5 bg-primary/20 mt-1 origin-left"
                                                            initial={{ scaleX: 0 }}
                                                            whileHover={{ scaleX: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 1.05, y: -4 }}
                                    >
                                        <Button
                                            className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
                                            onClick={() => navigate("/courses")}
                                        >
                                            <Book
                                                className="w-4 h-4 mr-2" />
                                            Courses
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 1.05, y: -4 }}
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full sm:w-auto"
                                            onClick={() => window.open("https://www.youtube.com/@JKSC", "_blank")}
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            YouTube Link
                                        </Button>
                                    </motion.div>
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
                                    {/* <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-accent/10 rounded-full p-2">
                                                <Users className="w-4 h-4 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Live Now</p>
                                                <p className="text-lg text-foreground">1,234 Students</p>
                                            </div>
                                        </div>
                                    </div> */}

                                    {/* <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 rounded-full p-2">
                                                <Star className="w-4 h-4 text-primary fill-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Avg. Rating</p>
                                                <p className="text-lg text-foreground">4.9/5.0</p>
                                            </div>
                                        </div>
                                    </div> */}
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
                                <h3 className="text-2xl font-bold mb-6 text-foreground text-center">{content.testimonials?.title || "Student Success Stories"}</h3>
                                {displayTestimonials.length > 6 ? (
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
                                                {Array.from({ length: Math.ceil(displayTestimonials.length / 6) }).map((_, pageIdx) => (
                                                    <CarouselItem key={pageIdx} className="basis-full">
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                            {displayTestimonials.slice(pageIdx * 6, (pageIdx + 1) * 6).map((testimonial: any, idx: number) => (
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
                                        {displayTestimonials.map((testimonial: any, idx: number) => (
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
                                    onMouseEnter={() => setIsVideoPaused(true)}
                                    onMouseLeave={() => setIsVideoPaused(false)}
                                >
                                    <CarouselContent className="-ml-2 md:-ml-4">
                                        {content.videoCarousel.videos.map((video: any, idx: number) => (
                                            <CarouselItem key={idx} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                                                <div className="p-2 h-full">
                                                    <motion.div
                                                        layout
                                                        whileHover={{ y: -8 }}
                                                        whileTap={{ scale: 1.05 }}
                                                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border transition-all duration-300 hover:shadow-xl h-full flex flex-col cursor-pointer group/card relative"
                                                        onClick={() => {
                                                            setActiveHeroVideo(video);
                                                            setShowVideoModal(true);
                                                        }}
                                                    >
                                                        <div className="relative aspect-video overflow-hidden bg-slate-100">
                                                            <ImageWithFallback
                                                                src={video.thumbnailUrl || getVideoThumbnail(video.videoUrl)}
                                                                alt={video.title}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors flex items-center justify-center">
                                                                <div className="relative">
                                                                    {/* Pulsing Ripple Effect */}
                                                                    <motion.div
                                                                        animate={{
                                                                            scale: [1, 1.5],
                                                                            opacity: [0.5, 0]
                                                                        }}
                                                                        transition={{
                                                                            duration: 1.5,
                                                                            repeat: Infinity,
                                                                            ease: "easeOut"
                                                                        }}
                                                                        className="absolute inset-0 rounded-full bg-white/30"
                                                                    />
                                                                    <div className="w-14 h-14 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-xl transform transition-all duration-300 group-hover/card:scale-110 group-hover/card:bg-primary group-hover/card:text-white">
                                                                        <Play className="w-6 h-6 fill-current ml-1" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-5 flex-1 flex flex-col items-center text-center">
                                                            {/* <div className="inline-flex items-center gap-1.5 bg-primary/5 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold mb-3 uppercase tracking-wider">
                                                                <Video className="w-3 h-3" />
                                                                <span>Sample Class</span>
                                                            </div> */}
                                                            <h3 className="text-base font-bold text-foreground line-clamp-2 group-hover/card:text-primary transition-colors mb-3">
                                                                {video.title}
                                                            </h3>
                                                            {video.description && (
                                                                <div className="relative">
                                                                    <p className={`text-xs text-muted-foreground leading-relaxed transition-all duration-300 ${video.isExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}>
                                                                        {video.description}
                                                                    </p>
                                                                    {/* Read More button kept but styled subtler */}
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
                                                                            className="text-[10px] text-primary font-bold mt-2 hover:underline focus:outline-none opacity-60 hover:opacity-100 transition-opacity"
                                                                        >
                                                                            {video.isExpanded ? 'Read Less' : 'Read More'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Bottom Accent Line */}
                                                        <motion.div
                                                            className="absolute bottom-0 left-0 h-1 bg-primary"
                                                            initial={{ width: 0 }}
                                                            whileHover={{ width: "100%" }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    </motion.div>
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

                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            setApi={setFeaturesApi}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4 py-4">
                                {[
                                    { icon: Headphones, title: "Doubt Solving", color: "primary" },
                                    { icon: Trophy, title: "Best results in India", color: "accent" },
                                    { icon: Video, title: "Video library with industry best faculty", color: "primary" },
                                    { icon: BookOpen, title: "Detailed revision lectures", color: "accent" },
                                    { icon: CheckCircle2, title: "Comprehensive Syllabus Coverage", color: "primary" },
                                    { icon: FileText, title: "Exhaustive Study Material", color: "accent" },
                                    { icon: Clock, title: "100% time bound syllabus completion", color: "primary" },
                                    { icon: Users, title: "India's Best Faculty", color: "accent" },
                                    { icon: Calendar, title: "Systematic Planning of Syllabus", color: "primary" },
                                    { icon: Award, title: "Precise Test series program", color: "accent" },
                                    { icon: GraduationCap, title: "Learning Pedagogy", color: "primary" },
                                    { icon: Target, title: "Focus on Conceptual Clarity", color: "accent" },
                                ].map((feature, idx) => (
                                    <CarouselItem key={idx} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                        <motion.div
                                            variants={{
                                                hidden: { opacity: 0, y: 30 },
                                                visible: {
                                                    opacity: 1,
                                                    y: 0,
                                                    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
                                                }
                                            }}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, margin: "-50px" }}
                                            whileHover={{
                                                y: -12,
                                                transition: { duration: 0.3 }
                                            }}
                                            whileTap={{ scale: 1.05, y: -4 }}
                                            className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/10 relative overflow-hidden h-full flex flex-col cursor-pointer"
                                        >
                                            {/* Sublte Hover Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div className="relative z-10 flex flex-col h-full">
                                                <motion.div
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    className={`bg-${feature.color}/10 rounded-xl p-3 w-fit mb-4 group-hover:bg-${feature.color}/20 transition-colors duration-300`}
                                                >
                                                    <feature.icon className={`w-5 h-5 text-${feature.color}`} />
                                                </motion.div>
                                                <h3 className="text-[15px] font-bold mb-1.5 text-foreground group-hover:text-primary transition-colors duration-300 leading-tight flex-1">
                                                    {feature.title}
                                                </h3>
                                            </div>

                                            {/* Bottom Accent Decor */}
                                            <motion.div
                                                className="absolute bottom-0 left-0 h-0.5 bg-primary/20"
                                                initial={{ width: 0 }}
                                                whileHover={{ width: "100%" }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </motion.div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
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
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    whileTap={{
                                        scale: 1.08,
                                        boxShadow: "0 0 25px rgba(255, 255, 255, 0.6)"
                                    }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                    className="flex-1 w-full"
                                >
                                    <Button
                                        size="lg"
                                        className="bg-white text-primary hover:bg-white/90 w-full h-14 text-base font-bold shadow-lg"
                                        onClick={() => setShowDemoModal(true)}
                                    >
                                        {content.footerCta.demoButtonText}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -2 }}
                                    whileTap={{
                                        scale: 1.08,
                                        boxShadow: "0 0 25px rgba(255, 255, 255, 0.4)"
                                    }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                    className="flex-1 w-full"
                                >
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="bg-transparent border-2 border-white text-white hover:bg-white/10 w-full h-14 text-base font-bold"
                                        onClick={() => {
                                            if (content.footerCta.brochureUrl) {
                                                setPendingBrochure(content.footerCta.brochureUrl);
                                                setEnquireOpen(true);
                                            } else {
                                                toast.info("Brochure coming soon!");
                                            }
                                        }}
                                    >
                                        {content.footerCta.brochureButtonText}
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>
            </main >

            {/* Modals */}
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

            <BranchEnquiryModal
                isOpen={showDemoModal}
                onClose={() => setShowDemoModal(false)}
                branchName="JK Shah Classes"
                courses={courses.filter(c => c.status === "Active").map(c => c.title)}
            />
            < BatchEnrollmentModal
                isOpen={showEnrollModal}
                onClose={() => {
                    setShowEnrollModal(false);
                    setSelectedCourse(null);
                }}
                course={selectedCourse}
                batches={batches}
                branches={content?.branches || []}
            />
            < VideoModal
                isOpen={showVideoModal}
                onClose={() => {
                    setShowVideoModal(false);
                    setActiveHeroVideo(null);
                }}
                videoTitle={activeHeroVideo ? (activeHeroVideo.title || "JK Shah Classes - Feature Demo") : "JK Shah Classes - Demo Class"}
                videoUrl={activeHeroVideo ? (activeHeroVideo.videoUrl || activeHeroVideo.url) : content.onlineExperience?.videoUrl}
                description={activeHeroVideo?.description}
            />
        </div >
    );
}

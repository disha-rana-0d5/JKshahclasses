import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    ChevronLeft,
    Building2,
    Users,
    Award,
    CheckCircle2,
    Calendar,
    Layers,
    Monitor,
    BookOpen,
    GraduationCap
} from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { landingPageApi, batchApi, courseApi } from "../api/api";

import { toast } from "sonner";
import { Star, Download, ArrowRight } from "lucide-react";
import { generateSlug } from "../admin/utils/slugify";
import { MerittoFormModal } from "./modals/MerittoFormModal";

interface Branch {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    timings: string;
    image: string;
    mapUrl: string;
    courses: string[];
    facilities?: string[]; // Fallback for transition
    faculties?: string[];
    students: string;
}

interface Batch {
    _id: string;
    location: string;
    category?: string;
    categories?: string[];
    level: string;
    mode: string;
    startDate: string;
    dayTiming: string;
    examAttempt: string;
}

export function BranchDetailPage() {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const [branch, setBranch] = useState<Branch | null>(null);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBatchesLoading, setIsBatchesLoading] = useState(false);
    const [branchCourses, setBranchCourses] = useState<any[]>([]);
    const [isCoursesLoading, setIsCoursesLoading] = useState(false);

    const [enquireOpen, setEnquireOpen] = useState(false);
    const [pendingBrochure, setPendingBrochure] = useState<string | null>(null);

    useEffect(() => {
        const fetchBranch = async () => {
            try {
                setIsLoading(true);
                const { ok, data } = await landingPageApi.getLandingContent();
                if (ok && data.success && data.data.branches) {
                    const foundBranch = data.data.branches.find((b: Branch) =>
                        b.name.toLowerCase().replace(/\s+/g, '-') === slug
                    );
                    setBranch(foundBranch || null);
                    if (foundBranch) {
                        fetchBatches(foundBranch.name);
                        fetchBranchCourses(foundBranch.courses || []);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch branch details", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBranch();
    }, [slug]);

    async function fetchBatches(locationName: string) {
        try {
            setIsBatchesLoading(true);
            // Use filter param for exact matching on location and mode
            const filter = JSON.stringify({
                location: locationName,
                mode: 'Face to Face'
            });
            const { ok, data } = await batchApi.getBatches({ filter });
            if (ok && data.success) {
                setBatches(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch batches", error);
        } finally {
            setIsBatchesLoading(false);
        }
    }

    async function fetchBranchCourses(branchModuleNames: string[]) {
        if (!branchModuleNames || !branchModuleNames.length) return;
        try {
            setIsCoursesLoading(true);
            const { ok, data } = await courseApi.getCourses({ limit: 1000 });
            if (ok && data.success) {
                const allFetchedCourses = data.data;
                const activeCourses = allFetchedCourses.filter((c: any) => c.status === 'Active');

                // Track which branch course names were matched
                const matchedNames = new Set<string>();
                const normalizedBranchNames = branchModuleNames.map(n => n.toLowerCase().trim());

                const filtered = activeCourses.filter((course: any) => {
                    const cCat = (course.category || "").toLowerCase().trim();
                    const cSub = (course.subCategory || "").toLowerCase().trim();
                    const cTitle = (course.title || "").toLowerCase().trim();

                    const isMatch = normalizedBranchNames.some((name, idx) => {
                        const matches = name === cCat || name === cSub || name === cTitle;
                        if (matches) matchedNames.add(branchModuleNames[idx]);
                        return matches;
                    });
                    return isMatch;
                });

                // Create placeholder courses only for unmatched names that are NOT in the database at all (not even as Draft/Archived)
                const unmatchedCourses = branchModuleNames
                    .filter(name => {
                        if (matchedNames.has(name)) return false;
                        
                        const n = name.toLowerCase().trim();
                        const existsInDb = allFetchedCourses.some((c: any) => {
                            const cCat = (c.category || "").toLowerCase().trim();
                            const cSub = (c.subCategory || "").toLowerCase().trim();
                            const cTitle = (c.title || "").toLowerCase().trim();
                            return n === cCat || n === cSub || n === cTitle;
                        });
                        
                        return !existsInDb;
                    })
                    .map(name => ({
                        _id: `placeholder-${name}`,
                        title: name,
                        category: "Available Course",
                        description: `Comprehensive coaching available at this branch. Contact us for the latest curriculum, batch timings, and expert faculty details.`,
                        image: "https://images.unsplash.com/photo-1513258496099-48168024adb0?q=80&w=2670&auto=format&fit=crop",
                        duration: "Varies by branch",
                        rating: 4.8,
                        syllabusModules: []
                    }));

                setBranchCourses([...filtered, ...unmatchedCourses]);
            }
        } catch (error) {
            console.error("Failed to fetch branch courses", error);
        } finally {
            setIsCoursesLoading(false);
        }
    }    // Helper to get the correct course detail URL
    const getCourseTargetUrl = (course: any) => {
        const slug = (course.slug || generateSlug(course.title)) || "";
        const category = (course.category || "").toLowerCase();

        if (category.includes("india")) {
            return `/courses/india/${slug}`;
        } else if (category.includes("foreign")) {
            return `/courses/foreign/${slug}`;
        }

        return `/course/${slug}`;
    };

    useEffect(() => {
        if (branch) {
            document.title = `${branch.name}`;
        }
    }, [branch]);

    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        let cleanUrl = url.trim();
        
        // If it's an iframe, try to extract the src
        if (cleanUrl.startsWith('<iframe')) {
            const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) {
                cleanUrl = srcMatch[1];
            }
        }

        // If it's already an embed URL, return it
        if (cleanUrl.includes("/embed") || cleanUrl.includes("output=embed")) return cleanUrl;

        // 1. Try to extract hex-encoded coordinates (!3d and !4d) - High Precision
        const hexCoordMatch = cleanUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (hexCoordMatch && hexCoordMatch.length >= 3) {
            return `https://maps.google.com/maps?q=${hexCoordMatch[1]},${hexCoordMatch[2]}&hl=en&z=17&output=embed`;
        }

        // 2. Try to handle coordinates in @ format
        const match = cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match && match.length >= 3) {
            return `https://maps.google.com/maps?q=${match[1]},${match[2]}&hl=en&z=17&output=embed`;
        }

        // 3. Try to extract place name
        const placeMatch = cleanUrl.match(/\/place\/([^/?]+)/);
        if (placeMatch && placeMatch[1]) {
            return `https://maps.google.com/maps?q=${placeMatch[1]}&hl=en&z=17&output=embed`;
        }

        // Fallback: If it's a google maps link, try to ensure output=embed
        if (cleanUrl.includes("google.com/maps")) {
            const connector = cleanUrl.includes('?') ? '&' : '?';
            return `${cleanUrl}${connector}output=embed`;
        }
        
        return cleanUrl;
    };

    const getExternalMapUrl = (url: string, address: string) => {
        if (!url) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

        // If it's an iframe, try to get the src
        let cleanUrl = url;
        if (url.trim().startsWith('<iframe')) {
            const srcMatch = url.match(/src=["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) cleanUrl = srcMatch[1];
        }

        // If it's an embed URL, it's not great for directions, so use address as fallback
        if (cleanUrl.includes("/embed") || cleanUrl.includes("output=embed")) {
            // Try to extract coordinates if they exist
            const match = cleanUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/) || cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (match && match.length >= 3) {
                return `https://www.google.com/maps/search/?api=1&query=${match[1]},${match[2]}`;
            }
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        }

        return cleanUrl;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!branch) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2" id="branch-not-found">Branch Not Found</h1>
                <p className="text-muted-foreground mb-6">The branch you're looking for doesn't exist or has been moved.</p>
                <Link to="/branches">
                    <Button variant="outline" className="gap-2">
                        <ChevronLeft className="w-4 h-4" /> Back to All Branches
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-12">
            {/* Hero Section */}
            <section className="relative min-h-[350px] lg:min-h-[450px] py-4 sm:py-6 overflow-hidden flex items-center">
                <ImageWithFallback
                    src={branch.image}
                    alt={branch.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative w-full z-10 pt-4 sm:pt-6">
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                        <Link to="/branches" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors mb-3 drop-shadow-md text-sm">
                            <ChevronLeft className="w-3.5 h-3.5" /> Back to Branches
                        </Link>

                        <div className="grid lg:grid-cols-12 gap-10 items-center">
                            {/* Branch Info */}
                            <div className="lg:col-span-7">
                                <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-medium mb-4 border border-white/20">
                                    <MapPin className="w-3 h-3 sm:w-3.5 h-3.5" />
                                    <span>{branch.city}, {branch.state}</span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white mb-4 drop-shadow-xl font-extrabold leading-tight">{branch.name}</h1>
                                <p className="text-white/90 text-sm sm:text-xl max-w-2xl drop-shadow-lg leading-relaxed mb-8">{branch.address}</p>

                                <div className="flex flex-row flex-wrap gap-3 sm:gap-4">
                                    <Button size="lg" className="bg-primary text-white hover:bg-primary/90 shadow-2xl px-6 sm:px-8" onClick={() => window.open(getExternalMapUrl(branch.mapUrl, `${branch.name} ${branch.address}`), '_blank')} id="get-directions-hero">
                                        Get Directions
                                    </Button>
                                    <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20 shadow-2xl px-6 sm:px-8" onClick={() => window.location.href = `tel:${branch.phone}`}>
                                        Call Branch
                                    </Button>
                                </div>
                            </div>

                            {/* Enquiry Form */}
                            <div className="lg:col-span-5">
                                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 transform hover:scale-[1.01] transition-transform duration-300">
                                    <div className="flex flex-col items-center justify-center text-center py-4">
                                        <div className="bg-primary/10 p-4 rounded-full text-primary mb-4">
                                            <Mail className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 leading-none mb-3">Interested in this branch?</h3>
                                        <p className="text-sm text-gray-500 mb-6">Admissions are currently open for upcoming batches. Send a quick enquiry to get all the details.</p>
                                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white w-full max-w-xs font-bold shadow-lg" onClick={() => setEnquireOpen(true)}>
                                            Enquire Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-8 sm:gap-12">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-7 space-y-12">
                            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                                <div className="space-y-4 sm:space-y-6">
                                    <h3 className="text-lg sm:text-xl font-bold border-b pb-2">Contact Details</h3>
                                    <div className="space-y-2.5 sm:space-y-4">
                                        <div className="flex items-center gap-2.5 sm:gap-4">
                                            <div className="bg-primary/5 p-2 sm:p-3 rounded-lg text-primary">
                                                <Phone className="w-3.5 h-3.5 sm:w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider">Phone</p>
                                                <a href={`tel:${branch.phone}`} className="text-sm sm:text-lg font-bold hover:text-primary transition-colors">{branch.phone}</a>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 sm:gap-4 overflow-hidden">
                                            <div className="bg-primary/5 p-2 sm:p-3 rounded-lg text-primary flex-shrink-0">
                                                <Mail className="w-3.5 h-3.5 sm:w-5 h-5" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider">Email</p>
                                                <a href={`mailto:${branch.email}`} className="text-sm sm:text-lg font-bold hover:text-primary transition-colors truncate block">{branch.email}</a>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 sm:gap-4">
                                            <div className="bg-primary/5 p-2 sm:p-3 rounded-lg text-primary">
                                                <Clock className="w-3.5 h-3.5 sm:w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider">Office Hours</p>
                                                <p className="text-sm sm:text-lg font-medium">{branch.timings}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 sm:space-y-6">
                                    <h3 className="text-lg sm:text-xl font-bold border-b pb-2">Branch Stats</h3>
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div className="bg-muted/30 p-3 sm:p-4 rounded-xl text-center">
                                            <Users className="w-6 h-6 sm:w-8 h-8 text-primary mx-auto mb-1.5 sm:mb-2" />
                                            <p className="text-xl sm:text-2xl font-bold">{branch.students}</p>
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">Active Students</p>
                                        </div>
                                        {/* <div className="bg-muted/30 p-3 sm:p-4 rounded-xl text-center">
                                            <Award className="w-6 h-6 sm:w-8 h-8 text-primary mx-auto mb-1.5 sm:mb-2" />
                                            <p className="text-xl sm:text-2xl font-bold">ICAI</p>
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">Approved</p>
                                        </div> */}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <h3 className="text-lg sm:text-xl font-bold border-b pb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 sm:w-5 h-5 text-primary" />
                                    Upcoming Batches
                                </h3>
                                {isBatchesLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : batches.length > 0 ? (
                                    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-muted/50 border-b border-border">
                                                <tr>
                                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">Course Category</th>
                                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">Level</th>
                                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">Starts On</th>
                                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">Attempt</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {batches.map((batch) => (
                                                    <tr key={batch._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-4 text-sm font-bold text-foreground">
                                                            <div className="flex flex-wrap gap-1">
                                                                {batch.categories?.join(", ") || batch.category}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-muted-foreground">{batch.level}</td>
                                                        <td className="px-4 py-4 text-sm">
                                                            <p className="font-semibold text-foreground">{batch.startDate}</p>
                                                            <p className="text-xs text-muted-foreground">{batch.dayTiming}</p>
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-medium text-primary uppercase">{batch.examAttempt}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="bg-muted/20 rounded-xl p-8 text-center border border-dashed border-border">
                                        <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-muted-foreground">No upcoming batches currently scheduled for this location.</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <h3 className="text-lg sm:text-xl font-bold border-b pb-2 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 sm:w-5 h-5 text-primary" />
                                    Available Courses
                                </h3>
                                {isCoursesLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : branchCourses.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {branchCourses.map((course, index) => {
                                            const hasDetailPage = !course._id?.toString().includes('placeholder');
                                            return (
                                                <div
                                                    key={course._id}
                                                    className={`bg-white rounded-lg overflow-hidden shadow-sm transition-all group border border-border flex flex-col h-full ${hasDetailPage ? 'hover:shadow-lg cursor-pointer' : 'cursor-default'}`}
                                                    onClick={() => hasDetailPage && navigate(getCourseTargetUrl(course))}
                                                >
                                                    <div className="relative aspect-[3/2] overflow-hidden shrink-0">
                                                        <ImageWithFallback
                                                            src={course.image}
                                                            alt={course.title}
                                                            className={`w-full h-full object-cover transition-transform duration-300 ${hasDetailPage ? 'group-hover:scale-105' : ''}`}
                                                        />
                                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
                                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs font-bold text-foreground">{index % 2 === 0 ? "4.8" : "4.9"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 flex flex-col flex-1">
                                                        <div className="mb-3">
                                                            <h3 className={`text-base font-semibold mb-1 text-foreground line-clamp-1 transition-colors leading-tight ${hasDetailPage ? 'group-hover:text-primary' : ''}`}>{course.title}</h3>
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

                                                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed italic">
                                                            {course.description}
                                                        </p>

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
                                                                className={`flex-1 h-8 text-xs bg-primary text-white transition-all ${hasDetailPage ? 'hover:bg-primary/90 cursor-pointer' : 'opacity-60 cursor-default'}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (hasDetailPage) {
                                                                        navigate(getCourseTargetUrl(course));
                                                                    }
                                                                }}
                                                            >
                                                                {hasDetailPage ? 'Know More' : 'Details Soon'}
                                                                {hasDetailPage && <ArrowRight className="w-3 h-3 ml-2" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-muted/20 rounded-2xl p-12 text-center border-2 border-dashed border-border/50">
                                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <GraduationCap className="w-8 h-8 text-primary" />
                                        </div>
                                        <h4 className="text-lg font-bold text-foreground mb-2">No Courses Listed Yet</h4>
                                        <p className="text-muted-foreground max-w-sm mx-auto">Specific course details for this branch are currently being updated. Please contact the branch directly for immediate assistance.</p>
                                        <Button className="mt-6" variant="outline" onClick={() => window.location.href = `tel:${branch.phone}`}>
                                            <Phone className="w-4 h-4 mr-2" /> Call Branch
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {branch.faculties && branch.faculties.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        Expert Faculties
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {branch.faculties.map((faculty, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg border border-primary/10 transition-all hover:border-primary/30">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                    {faculty.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium">{faculty}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Right Column - Map & Enquiry */}
                        <div className="lg:col-span-5 relative">
                            <div className="sticky top-24 space-y-6">

                                <div className="bg-white rounded-2xl border-4 border-muted p-2 shadow-2xl overflow-hidden aspect-square lg:aspect-auto lg:h-[400px]">
                                    <iframe
                                        src={getEmbedUrl(branch.mapUrl)}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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

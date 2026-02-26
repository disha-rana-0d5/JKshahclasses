import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import { landingPageApi, batchApi } from "../api/api";

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
    const { slug } = useParams<{ slug: string }>();
    const [branch, setBranch] = useState<Branch | null>(null);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBatchesLoading, setIsBatchesLoading] = useState(false);

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

    const fetchBatches = async (locationName: string) => {
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
    };

    useEffect(() => {
        if (branch) {
            document.title = `${branch.name} | JK Shah Classes`;
        }
    }, [branch]);

    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        if (url.trim().startsWith('<iframe')) {
            const srcMatch = url.match(/src=["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) return srcMatch[1];
        }
        if (url.includes("/embed")) return url;
        const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match && match.length >= 3) {
            return `https://maps.google.com/maps?q=${match[1]},${match[2]}&hl=en&z=16&output=embed`;
        }
        return url;
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
            <section className="relative h-[400px] overflow-hidden">
                <ImageWithFallback
                    src={branch.image}
                    alt={branch.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-end">
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
                        <Link to="/branches" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 drop-shadow-md">
                            <ChevronLeft className="w-4 h-4" /> Back to Branches
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-white/20">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{branch.city}, {branch.state}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl text-white mb-2 drop-shadow-xl">{branch.name}</h1>
                                <p className="text-white/80 text-lg max-w-2xl drop-shadow-lg">{branch.address}</p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <Button size="lg" className="bg-primary text-white hover:bg-primary/90 shadow-xl" onClick={() => window.open(getExternalMapUrl(branch.mapUrl, `${branch.name} ${branch.address}`), '_blank')} id="get-directions">
                                    Get Directions
                                </Button>
                                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 shadow-xl" onClick={() => window.location.href = `tel:${branch.phone}`}>
                                    Call {branch.phone}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-7 space-y-12">
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold border-b pb-2">Contact Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/5 p-3 rounded-lg text-primary">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Phone</p>
                                                <a href={`tel:${branch.phone}`} className="text-lg font-bold hover:text-primary transition-colors">{branch.phone}</a>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/5 p-3 rounded-lg text-primary">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email</p>
                                                <a href={`mailto:${branch.email}`} className="text-lg font-bold hover:text-primary transition-colors">{branch.email}</a>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/5 p-3 rounded-lg text-primary">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Office Hours</p>
                                                <p className="text-lg font-medium">{branch.timings}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold border-b pb-2">Branch Stats</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/30 p-4 rounded-xl text-center">
                                            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                                            <p className="text-2xl font-bold">{branch.students}</p>
                                            <p className="text-xs text-muted-foreground">Active Students</p>
                                        </div>
                                        <div className="bg-muted/30 p-4 rounded-xl text-center">
                                            <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                                            <p className="text-2xl font-bold">ICAI</p>
                                            <p className="text-xs text-muted-foreground">Approved center</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Upcoming Batches at this Branch
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
                                                    <th className="px-4 py-3 text-sm font-semibold text-muted-foreground whitespace-nowrap">Course Category</th>
                                                    <th className="px-4 py-3 text-sm font-semibold text-muted-foreground whitespace-nowrap">Level</th>
                                                    <th className="px-4 py-3 text-sm font-semibold text-muted-foreground whitespace-nowrap">Starts On</th>
                                                    <th className="px-4 py-3 text-sm font-semibold text-muted-foreground whitespace-nowrap">Attempt</th>
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

                            <div className="space-y-6">
                                <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-primary" />
                                    Available Courses
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {(branch.courses || branch.facilities || []).map((course, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border border-border transition-all hover:border-primary/30">
                                            <CheckCircle2 className="w-5 h-5 text-accent" />
                                            <span className="text-sm font-medium italic">{course}</span>
                                        </div>
                                    ))}
                                </div>
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

                        {/* Right Column - Map */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-24 space-y-6">
                                <div className="bg-white rounded-2xl border-4 border-muted p-2 shadow-2xl overflow-hidden aspect-square lg:aspect-auto lg:h-[600px]">
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
                                <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="bg-white p-3 rounded-full shadow-md text-primary">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">About {branch.name}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Located in the heart of {branch.city}, our {branch.name} branch is fully equipped to help you achieve your professional goals.
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full h-12 bg-white hover:bg-muted font-bold shadow-sm" onClick={() => window.open(getExternalMapUrl(branch.mapUrl, `${branch.name} ${branch.address}`), '_blank')}>
                                        View on Google Maps
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

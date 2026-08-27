import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { landingPageApi } from "../../api/api";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, X } from "lucide-react";
import { ImageUpload } from "../../components/ImageUpload";
import { FileUpload } from "../../components/FileUpload";

export function LandingPageManagement() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState<any>(null);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const { ok, data } = await landingPageApi.getLandingContent();
            if (ok && data.success) {
                const fetchedContent = data.data;
                // Initialize hero stats if missing/empty
                if (!fetchedContent.hero.stats || fetchedContent.hero.stats.length === 0) {
                    fetchedContent.hero.stats = [
                        { value: '98%', label: 'Success Rate' },
                        { value: '50K+', label: 'Students' },
                        { value: '450+', label: 'Rank Holders' }
                    ];
                }

                // Initialize quick info if missing/empty
                if (!fetchedContent.hero.quickInfo || fetchedContent.hero.quickInfo.length === 0) {
                    fetchedContent.hero.quickInfo = [
                        { label: 'Next Batch', value: 'Jan 15, 2024' },
                        { label: 'Limited Seats', value: '45 Left' }
                    ];
                }
                // Initialize whyChooseUs if missing/empty
                if (!fetchedContent.whyChooseUs?.statsGrid || fetchedContent.whyChooseUs.statsGrid.length === 0) {
                    fetchedContent.whyChooseUs = {
                        ...fetchedContent.whyChooseUs,
                        statsGrid: [
                            { value: "50,000+", label: "Students", color: "primary" },
                            { value: "98%", label: "Success", color: "accent" },
                            { value: "450+", label: "Rankers", color: "primary" },
                            { value: "35+", label: "Branches", color: "accent" }
                        ],
                        featuresList: [
                            "Expert Faculty with 15+ Years Experience",
                            "Comprehensive Study Material & Notes",
                            "Regular Mock Tests & Assessments",
                            "Doubt Clearing Sessions",
                            "Online + Offline Classes",
                            "Placement Assistance"
                        ],
                        featuresTitle: fetchedContent.whyChooseUs?.featuresTitle || "What You Get"
                    };
                }

                // Initialize onlineExperience if missing fields
                if (fetchedContent.onlineExperience) {
                    if (!fetchedContent.onlineExperience.videoUrl) {
                        fetchedContent.onlineExperience.videoUrl = "https://www.youtube.com/watch?v=3V1NGxcVdkI";
                    }
                }

                // Initialize testimonials if missing/empty
                if (!fetchedContent.testimonials?.list || fetchedContent.testimonials.list.length === 0) {
                    fetchedContent.testimonials = {
                        ...fetchedContent.testimonials,
                        list: [
                            {
                                name: "Priya Sharma",
                                rank: "AIR 45, CA Final",
                                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
                                text: "The faculty's expertise and personalized attention helped me secure top rank."
                            },
                            {
                                name: "Rahul Desai",
                                rank: "Distinction, CS Executive",
                                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
                                text: "Comprehensive material and mock tests gave me confidence to clear in first attempt."
                            },
                            {
                                name: "Anjali Patel",
                                rank: "AIR 122, CMA Inter",
                                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
                                text: "Blended learning approach helped me balance work and studies perfectly."
                            },
                            {
                                name: "Karan Mehta",
                                rank: "Distinction, CA Foundation",
                                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
                                text: "Best decision for my career. Teachers are always available for doubt clearing."
                            }
                        ]
                    };
                }

                // Initialize hero videos if missing/empty
                if (!fetchedContent.hero.videos || fetchedContent.hero.videos.length === 0) {
                    fetchedContent.hero.videos = Array(5).fill(null).map(() => ({
                        thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
                        videoUrl: 'https://www.youtube.com/watch?v=3V1NGxcVdkI',
                        badge: fetchedContent.hero.badge || "Student's preferred choice.",
                        title: fetchedContent.hero.title || "Built Around Students. Proven by Results. Trusted for Careers.",
                        description: fetchedContent.hero.description || "Expert mentors. Structured learning. Proven outcomes across every commerce milestone.",
                        ctaDemoText: fetchedContent.hero.ctaDemoText || 'Watch Demo Class',
                        ctaCoursesText: fetchedContent.hero.ctaCoursesText || 'View Courses',
                        quickInfo: fetchedContent.hero.quickInfo || [
                            { label: 'Next Batch', value: 'Starts Monday' },
                            { label: 'Seats', value: '15 Left Only' }
                        ],
                        stats: fetchedContent.hero.stats || [
                            { value: '40+', label: 'Years Experience' },
                            { value: '50K+', label: 'Students' },
                            { value: '450+', label: 'Rank Holders' }
                        ]
                    }));
                } else {
                    // Update existing videos with default values if missing new fields
                    fetchedContent.hero.videos = fetchedContent.hero.videos.map((v: any) => ({
                        ...v,
                        badge: v.badge || fetchedContent.hero.badge || "Student's preferred choice.",
                        title: v.title || fetchedContent.hero.title || "Built Around Students. Proven by Results. Trusted for Careers.",
                        description: v.description || fetchedContent.hero.description || "Expert mentors. Structured learning. Proven outcomes across every commerce milestone.",
                        ctaDemoText: v.ctaDemoText || fetchedContent.hero.ctaDemoText || 'Watch Demo Class',
                        ctaCoursesText: v.ctaCoursesText || fetchedContent.hero.ctaCoursesText || 'View Courses',
                        quickInfo: v.quickInfo || [
                            { label: 'Next Batch', value: 'Starts Monday' },
                            { label: 'Seats', value: '15 Left Only' }
                        ],
                        stats: v.stats || fetchedContent.hero.stats || [
                            { value: '40+', label: 'Years Experience' },
                            { value: '50K+', label: 'Students' },
                            { value: '450+', label: 'Rank Holders' }
                        ]
                    }));

                    if (fetchedContent.hero.videos.length < 5) {
                        const extra = Array(5 - fetchedContent.hero.videos.length).fill(null).map(() => ({
                            thumbnail: '',
                            videoUrl: '',
                            badge: fetchedContent.hero.badge || '',
                            title: fetchedContent.hero.title || '',
                            description: fetchedContent.hero.description || '',
                            ctaDemoText: fetchedContent.hero.ctaDemoText || '',
                            ctaCoursesText: fetchedContent.hero.ctaCoursesText || '',
                            quickInfo: [
                                { label: 'Next Batch', value: 'Starts Monday' },
                                { label: 'Seats', value: '15 Left Only' }
                            ],
                            stats: [
                                { value: '40+', label: 'Years Experience' },
                                { value: '50K+', label: 'Students' },
                                { value: '450+', label: 'Rank Holders' }
                            ]
                        }));
                        fetchedContent.hero.videos = [...fetchedContent.hero.videos, ...extra];
                    }
                }

                // Initialize announcement fields if missing
                if (fetchedContent.showAnnouncement === undefined) {
                    fetchedContent.showAnnouncement = true;
                }
                if (!fetchedContent.announcements || fetchedContent.announcements.length === 0) {
                    fetchedContent.announcements = [fetchedContent.announcementText || "Welcome to JK Shah Classes - India's Leading CA Coaching Institute!"];
                }
                if (!fetchedContent.announcementText) {
                    fetchedContent.announcementText = fetchedContent.announcements[0];
                }

                // Initialize aboutSection if missing
                if (!fetchedContent.aboutSection) {
                    fetchedContent.aboutSection = {
                        badge: 'About JK Shah Classes',
                        title: 'Empowering Future Professionals Since 1983',
                        description: 'For over four decades, JK Shah Classes has been at the forefront of CA, CS, and CMA coaching. Our commitment to excellence and student success has made us India\'s most trusted institute.',
                        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
                        videoUrl: '',
                        points: [
                            'Pioneers in professional coaching with 40+ years of legacy',
                            'Highest number of All India Rankers annually',
                            'Comprehensive study material tailored for exam success',
                            'Personalized mentorship and doubt-clearing sessions'
                        ]
                    };
                }

                // Initialize videoCarousel if missing
                if (!fetchedContent.videoCarousel) {
                    fetchedContent.videoCarousel = {
                        title: 'Watch Our Classes in Action',
                        videos: []
                    };
                }

                // Initialize faqs if missing
                if (!fetchedContent.faqs) {
                    fetchedContent.faqs = {
                        title: 'Frequently Asked Questions',
                        list: []
                    };
                }

                setContent(fetchedContent);
            } else {
                toast.error("Failed to load content");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { ok, data } = await landingPageApi.updateLandingContent(content);
            if (ok && data.success) {
                toast.success("Content updated successfully");
                // Re-fetch so initialization logic runs on the fresh data
                await fetchContent();
            } else {
                toast.error("Failed to update content");
            }
        } catch (error) {
            toast.error("Error saving content");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (path: string, value: any) => {
        const keys = path.split('.');
        setContent((prev: any) => {
            if (!prev) return prev;
            // Create a deep copy to ensure nested updates trigger re-renders and don't mutate
            const newState = JSON.parse(JSON.stringify(prev));
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!content) return null;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Landing Page Content</h2>
                    <p className="text-muted-foreground">Manage text, images, and sections of the homepage.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
                    <TabsTrigger className="data-[state=active]:bg-red-600 data-[state=active]:text-white" value="general">General</TabsTrigger>
                    <TabsTrigger className="data-[state=active]:bg-red-600 data-[state=active]:text-white" value="hero">Hero</TabsTrigger>
                    {/* <TabsTrigger className="data-[state=active]:bg-red-600 data-[state=active]:text-white" value="programs">Programs</TabsTrigger> */}
                    <TabsTrigger className="data-[state=active]:bg-red-600 data-[state=active]:text-white" value="about">About</TabsTrigger>
                    <TabsTrigger className="data-[state=active]:bg-red-600 data-[state=active]:text-white" value="online">Online Exp</TabsTrigger>
                    {/* <TabsTrigger className="data-[state=active]:bg-red-600 data-[state=active]:text-white" value="why">Why Us</TabsTrigger> */}
                    <TabsTrigger className="data-[state=active]:bg-red-600 data-[state=active]:text-white" value="testimonials">Stories</TabsTrigger>
                    <TabsTrigger className="data-[state=active]:bg-red-600 data-[state=active]:text-white" value="videoCarousel">Videos</TabsTrigger>
                    <TabsTrigger className="data-[state=active]:bg-red-600 data-[state=active]:text-white" value="faqs">FAQs</TabsTrigger>
                    <TabsTrigger className="data-[state=active]:bg-red-600 data-[state=active]:text-white" value="footer">Footer</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>TopBar</CardTitle>
                            <CardDescription>Configure site-wide elements like announcements.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <input
                                    type="checkbox"
                                    id="showAnnouncement"
                                    checked={content.showAnnouncement}
                                    onChange={(e) => updateField('showAnnouncement', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="showAnnouncement">Show Announcement Marquee</Label>
                            </div>
                            <div className="space-y-4">
                                <Label htmlFor="announcementText">Announcement Message (Scrolling Marquee)</Label>
                                <div className="space-y-3">
                                    <Input
                                        id="announcementText"
                                        value={content.announcementText || ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            updateField('announcementText', val);
                                            updateField('announcements', [val]);
                                        }}
                                        placeholder="Enter announcement message..."
                                    />
                                    <p className="text-[10px] text-muted-foreground">This message will scroll at the top of the website. Keep it concise for better visibility.</p>
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-4 mt-4">
                                <Label className="text-base font-semibold">SEO Meta Tags</Label>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="metaTitle">SEO Title</Label>
                                        <Input
                                            id="metaTitle"
                                            value={content.metaTitle || ""}
                                            onChange={(e) => updateField('metaTitle', e.target.value)}
                                            placeholder="Enter SEO Title"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="metaDescription">SEO Description</Label>
                                        <Textarea
                                            id="metaDescription"
                                            value={content.metaDescription || ""}
                                            onChange={(e) => updateField('metaDescription', e.target.value)}
                                            placeholder="Enter SEO Description"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="metaKeywords">SEO Keywords</Label>
                                        <Input
                                            id="metaKeywords"
                                            value={content.metaKeywords || ""}
                                            onChange={(e) => updateField('metaKeywords', e.target.value)}
                                            placeholder="e.g. CA Coaching, Professional Courses"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* About Section */}
                <TabsContent value="about" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>About Section</CardTitle>
                            <CardDescription>Configure the About section below Trending Courses.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Badge Text</Label>
                                    <Input
                                        value={content.aboutSection.badge}
                                        onChange={(e) => updateField('aboutSection.badge', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={content.aboutSection.title}
                                        onChange={(e) => updateField('aboutSection.title', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={content.aboutSection.description}
                                    onChange={(e) => updateField('aboutSection.description', e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Video URL (YouTube/Vimeo)</Label>
                                <Input
                                    value={content.aboutSection.videoUrl}
                                    onChange={(e) => updateField('aboutSection.videoUrl', e.target.value)}
                                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                                />
                                <p className="text-[10px] text-muted-foreground">The video will be shown on the left side of the section.</p>
                            </div>
                            <div className="space-y-4">
                                <Label>Key Points</Label>
                                <div className="space-y-3">
                                    {content.aboutSection.points?.map((point: string, index: number) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={point}
                                                onChange={(e) => {
                                                    const newPoints = [...content.aboutSection.points];
                                                    newPoints[index] = e.target.value;
                                                    updateField('aboutSection.points', newPoints);
                                                }}
                                                placeholder="Enter point..."
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    const newPoints = content.aboutSection.points.filter((_: any, i: number) => i !== index);
                                                    updateField('aboutSection.points', newPoints);
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            updateField('aboutSection.points', [...(content.aboutSection.points || []), ""]);
                                        }}
                                        className="w-full"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Point
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Hero Section */}
                <TabsContent value="hero" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hero Section</CardTitle>
                            <CardDescription>Main banner and introduction.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4 pb-4">
                                <h3 className="text-sm font-medium">Hero Global Settings</h3>
                                <div className="max-w-md">
                                    <FileUpload
                                        label="Hero Brochure PDF"
                                        value={content.hero.brochureUrl || ""}
                                        onChange={(url) => updateField('hero.brochureUrl', url)}
                                        accept=".pdf"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">This brochure will be available for download beside the View Courses button.</p>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium mb-4">Hero Videos (Exactly 5)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {content.hero.videos?.slice(0, 5).map((video: any, index: number) => (
                                        <div key={index} className="space-y-4 p-4 bg-muted/20 rounded-lg border relative">
                                            <div className="absolute -top-2 -left-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                                {index + 1}
                                            </div>
                                            <div className="space-y-2">
                                                <ImageUpload
                                                    label={`Thumbnail ${index + 1}`}
                                                    value={video.thumbnail || ""}
                                                    onChange={(url) => updateField(`hero.videos.${index}.thumbnail`, url)}
                                                    recommendedDimensions="1280 x 720 px (16:9)"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Badge {index + 1}</Label>
                                                    <Input
                                                        value={video.badge}
                                                        onChange={(e) => updateField(`hero.videos.${index}.badge`, e.target.value)}
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Title {index + 1}</Label>
                                                    <Input
                                                        value={video.title}
                                                        onChange={(e) => updateField(`hero.videos.${index}.title`, e.target.value)}
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Description {index + 1}</Label>
                                                    <Textarea
                                                        value={video.description}
                                                        onChange={(e) => updateField(`hero.videos.${index}.description`, e.target.value)}
                                                        className="h-16 text-xs"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px]">Demo Text</Label>
                                                        <Input
                                                            value={video.ctaDemoText}
                                                            onChange={(e) => updateField(`hero.videos.${index}.ctaDemoText`, e.target.value)}
                                                            className="h-7 text-xs"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px]">Courses Text</Label>
                                                        <Input
                                                            value={video.ctaCoursesText}
                                                            onChange={(e) => updateField(`hero.videos.${index}.ctaCoursesText`, e.target.value)}
                                                            className="h-7 text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Video URL {index + 1}</Label>
                                                    <Input
                                                        value={video.videoUrl}
                                                        onChange={(e) => updateField(`hero.videos.${index}.videoUrl`, e.target.value)}
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
                                                    <div className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Quick Info Items</div>
                                                    {video.quickInfo?.map((info: any, qIdx: number) => (
                                                        <div key={qIdx} className="space-y-1">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px]">Info {qIdx + 1} Label</Label>
                                                                <Input
                                                                    value={info.label}
                                                                    onChange={(e) => updateField(`hero.videos.${index}.quickInfo.${qIdx}.label`, e.target.value)}
                                                                    className="h-7 text-xs"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px]">Info {qIdx + 1} Value</Label>
                                                                <Input
                                                                    value={info.value}
                                                                    onChange={(e) => updateField(`hero.videos.${index}.quickInfo.${qIdx}.value`, e.target.value)}
                                                                    className="h-7 text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 pt-2 border-t mt-2">
                                                    <div className="col-span-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Hero Stats</div>
                                                    {video.stats?.map((stat: any, sIdx: number) => (
                                                        <div key={sIdx} className="space-y-1">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px]">Stat {sIdx + 1} Label</Label>
                                                                <Input
                                                                    value={stat.label}
                                                                    onChange={(e) => updateField(`hero.videos.${index}.stats.${sIdx}.label`, e.target.value)}
                                                                    className="h-7 text-xs"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px]">Stat {sIdx + 1} Value</Label>
                                                                <Input
                                                                    value={stat.value}
                                                                    onChange={(e) => updateField(`hero.videos.${index}.stats.${sIdx}.value`, e.target.value)}
                                                                    className="h-7 text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>





                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Programs Section */}
                {/* <TabsContent value="programs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Popular Programs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                    value={content.popularPrograms.title}
                                    onChange={(e) => updateField('popularPrograms.title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtitle</Label>
                                <Input
                                    value={content.popularPrograms.subtitle}
                                    onChange={(e) => updateField('popularPrograms.subtitle', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent> */}

                {/* Online Experience Section */}
                <TabsContent value="online" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Online Learning Experience</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Badge</Label>
                                <Input
                                    value={content.onlineExperience.badge}
                                    onChange={(e) => updateField('onlineExperience.badge', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={content.onlineExperience.title}
                                    onChange={(e) => updateField('onlineExperience.title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={content.onlineExperience.description}
                                    onChange={(e) => updateField('onlineExperience.description', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <ImageUpload
                                    label="Side Image"
                                    value={content.onlineExperience.image || ""}
                                    onChange={(url) => updateField('onlineExperience.image', url)}
                                    recommendedDimensions="800 x 600 px (4:3)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Platform Demo Video URL (YouTube/Vimeo)</Label>
                                <Input
                                    value={content.onlineExperience.videoUrl}
                                    onChange={(e) => updateField('onlineExperience.videoUrl', e.target.value)}
                                    placeholder="https://www.youtube.com/embed/..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Why Choose Us */}
                <TabsContent value="why" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Why Choose Us</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Main Title</Label>
                                <Input
                                    value={content.whyChooseUs.title}
                                    onChange={(e) => updateField('whyChooseUs.title', e.target.value)}
                                />
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium mb-4">Stats Grid (4 items)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {content.whyChooseUs.statsGrid?.map((stat: any, index: number) => (
                                        <div key={index} className="space-y-2 p-3 bg-muted/20 rounded-md border">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Value {index + 1}</Label>
                                                <Input
                                                    value={stat.value}
                                                    onChange={(e) => updateField(`whyChooseUs.statsGrid.${index}.value`, e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Label {index + 1}</Label>
                                                <Input
                                                    value={stat.label}
                                                    onChange={(e) => updateField(`whyChooseUs.statsGrid.${index}.label`, e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium">Features List ("What You Get")</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newList = [...(content.whyChooseUs.featuresList || [])];
                                            newList.push("New Feature");
                                            updateField('whyChooseUs.featuresList', newList);
                                        }}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Add Feature
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label>Features Title</Label>
                                    <Input
                                        value={content.whyChooseUs.featuresTitle}
                                        onChange={(e) => updateField('whyChooseUs.featuresTitle', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 mt-2">
                                    {content.whyChooseUs.featuresList?.map((feature: string, index: number) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={feature}
                                                onChange={(e) => updateField(`whyChooseUs.featuresList.${index}`, e.target.value)}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 shrink-0"
                                                onClick={() => {
                                                    const newList = content.whyChooseUs.featuresList.filter((_: any, i: number) => i !== index);
                                                    updateField('whyChooseUs.featuresList', newList);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="testimonials" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle>Student Success Stories</CardTitle>
                                <CardDescription>Manage student reviews and rankings displayed on the landing page.</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newList = [...(content.testimonials?.list || [])];
                                    newList.push({
                                        name: "New Student",
                                        rank: "Rank/Exam Details",
                                        text: "Student review text...",
                                        image: ""
                                    });
                                    updateField('testimonials.list', newList);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Story
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                    value={content.testimonials?.title || "Student Success Stories"}
                                    onChange={(e) => updateField('testimonials.title', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {content.testimonials?.list?.map((story: any, index: number) => (
                                    <div key={index} className="flex gap-4 p-4 bg-muted/20 rounded-lg border relative group">
                                        <div className="space-y-4 flex-1">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Student Name</Label>
                                                    <Input
                                                        value={story.name}
                                                        onChange={(e) => updateField(`testimonials.list.${index}.name`, e.target.value)}
                                                        placeholder="e.g. Priya Sharma"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Rank / Exam</Label>
                                                    <Input
                                                        value={story.rank}
                                                        onChange={(e) => updateField(`testimonials.list.${index}.rank`, e.target.value)}
                                                        placeholder="e.g. AIR 45, CA Final"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Review Text</Label>
                                                <Textarea
                                                    value={story.text}
                                                    onChange={(e) => updateField(`testimonials.list.${index}.text`, e.target.value)}
                                                    placeholder="The student's feedback..."
                                                />
                                            </div>
                                        </div>

                                        <div className="w-32 space-y-2">
                                            <ImageUpload
                                                label="Photo"
                                                value={story.image || ""}
                                                onChange={(url) => updateField(`testimonials.list.${index}.image`, url)}
                                                recommendedDimensions="200 x 200 px (1:1)"
                                            />
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                const newList = content.testimonials.list.filter((_: any, i: number) => i !== index);
                                                updateField('testimonials.list', newList);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                {(!content.testimonials?.list || content.testimonials.list.length === 0) && (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                        No stories added yet. Click "Add Story" to begin.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Video Carousel Section */}
                <TabsContent value="videoCarousel" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle>Video Carousel</CardTitle>
                                <CardDescription>Manage the video carousel displayed on the landing page.</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newList = [...(content.videoCarousel?.videos || [])];
                                    newList.push({
                                        title: "New Video",
                                        videoUrl: "",
                                        thumbnailUrl: ""
                                    });
                                    updateField('videoCarousel.videos', newList);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Video
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                    value={content.videoCarousel?.title || "Watch Our Classes in Action"}
                                    onChange={(e) => updateField('videoCarousel.title', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {content.videoCarousel?.videos?.map((video: any, index: number) => (
                                    <div key={index} className="flex gap-4 p-4 bg-muted/20 rounded-lg border relative group">
                                        <div className="space-y-4 flex-1">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Video Title</Label>
                                                    <Input
                                                        value={video.title}
                                                        onChange={(e) => updateField(`videoCarousel.videos.${index}.title`, e.target.value)}
                                                        placeholder="e.g. CA Inter Demo Class"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Video URL (YouTube/Vimeo)</Label>
                                                    <Input
                                                        value={video.videoUrl}
                                                        onChange={(e) => updateField(`videoCarousel.videos.${index}.videoUrl`, e.target.value)}
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={video.description}
                                                    onChange={(e) => updateField(`videoCarousel.videos.${index}.description`, e.target.value)}
                                                    placeholder="Brief description of the video content..."
                                                    rows={2}
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                const newList = content.videoCarousel.videos.filter((_: any, i: number) => i !== index);
                                                updateField('videoCarousel.videos', newList);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                {(!content.videoCarousel?.videos || content.videoCarousel.videos.length === 0) && (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                        No videos added yet. Click "Add Video" to begin.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>


                {/* Footer CTA */}
                <TabsContent value="footer" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Footer CTA</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={content.footerCta.title}
                                    onChange={(e) => updateField('footerCta.title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={content.footerCta.description}
                                    onChange={(e) => updateField('footerCta.description', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Primary Button Text</Label>
                                    <Input
                                        value={content.footerCta.demoButtonText}
                                        onChange={(e) => updateField('footerCta.demoButtonText', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Secondary Button Text</Label>
                                    <Input
                                        value={content.footerCta.brochureButtonText}
                                        onChange={(e) => updateField('footerCta.brochureButtonText', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <FileUpload
                                    label="Brochure PDF"
                                    value={content.footerCta.brochureUrl || ""}
                                    onChange={(url) => updateField('footerCta.brochureUrl', url)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FAQs Section */}
                <TabsContent value="faqs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                            <CardDescription>Manage the FAQs shown at the bottom of the landing page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                    value={content.faqs?.title || ""}
                                    onChange={(e) => updateField('faqs.title', e.target.value)}
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <Label className="text-base font-semibold">Questions and Answers</Label>
                                <div className="space-y-4">
                                    {content.faqs?.list?.map((faq: any, index: number) => (
                                        <div key={index} className="p-4 border rounded-md relative bg-muted/20">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => {
                                                    const newList = [...(content.faqs.list || [])];
                                                    newList.splice(index, 1);
                                                    updateField('faqs.list', newList);
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <div className="space-y-3 mt-4">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Question {index + 1}</Label>
                                                    <Input
                                                        value={faq.question}
                                                        onChange={(e) => updateField(`faqs.list.${index}.question`, e.target.value)}
                                                        placeholder="Enter question"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Answer {index + 1}</Label>
                                                    <Textarea
                                                        value={faq.answer}
                                                        onChange={(e) => updateField(`faqs.list.${index}.answer`, e.target.value)}
                                                        placeholder="Enter answer"
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const newList = [...(content.faqs?.list || []), { question: "", answer: "" }];
                                        updateField('faqs.list', newList);
                                    }}
                                    className="w-full mt-2"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add FAQ
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div >
    );
}

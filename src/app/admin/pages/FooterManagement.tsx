import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { landingPageApi } from "../../api/api";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Loader2, Save, Layers, Link as LinkIcon, Phone, Plus, Trash2, MessageSquare } from "lucide-react";

export function FooterManagement() {
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
                let fetchedContent = data.data;
                // Initialize default global footer if missing
                if (!fetchedContent.globalFooter) {
                    fetchedContent.globalFooter = {
                        description: 'Professional education platform empowering students in CA, CS, CMA courses with expert guidance.',
                        contactInfo: {
                            address: 'Multiple locations across Mumbai, Delhi, Bangalore, Pune, India',
                            phone: '+91 123 456 7890',
                            email: 'info@jkshah.com'
                        },
                        quickLinks: [
                            { name: "Home", path: "/" },
                            { name: "Courses", path: "/courses" },
                            { name: "Branches", path: "/branches" },
                            { name: "Faculty", path: "/faculty" },
                            { name: "Online Learning", path: "/live-sessions" },
                            { name: "Student Dashboard", path: "/" }
                        ],
                        popularCourses: [
                            { name: "CA Foundation", path: "/courses/ca-foundation" },
                            { name: "CA Intermediate", path: "/courses/ca-intermediate" },
                            { name: "CA Final", path: "/courses/ca-final" },
                            { name: "CS Executive", path: "/courses/cs-executive" },
                            { name: "CS Professional", path: "/courses/cs-professional" },
                            { name: "CMA Intermediate", path: "/courses/cma-intermediate" },
                            { name: "CMA Final", path: "/courses/cma-final" }
                        ],
                        stats: [
                            { value: "25k+", label: "Students" },
                            { value: "50+", label: "Courses" },
                            { value: "94%", label: "Success" }
                        ],
                        socialLinks: [
                            { platform: "Facebook", url: "#" },
                            { platform: "Twitter", url: "#" },
                            { platform: "Instagram", url: "#" },
                            { platform: "LinkedIn", url: "#" },
                            { platform: "YouTube", url: "#" }
                        ]
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
                toast.success("Footer content updated successfully");
                setContent(data.data);
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
            const newState = { ...prev };
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                // Ensure intermediate objects exist
                if (!current[keys[i]]) current[keys[i]] = {};
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
                    <h2 className="text-2xl font-bold tracking-tight">Footer Management</h2>
                    <p className="text-muted-foreground">Manage global footer links, contact info, and social details.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6">
                {/* About Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        <CardTitle>About Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Description Text</Label>
                            <Textarea
                                value={content.globalFooter?.description}
                                onChange={(e) => updateField('globalFooter.description', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media Links */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <CardTitle>Social Media Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {content.globalFooter?.socialLinks?.map((link: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-end p-2 border rounded-md bg-muted/20">
                                    <div className="flex-1 space-y-2">
                                        <Label>Platform</Label>
                                        <Select
                                            value={link.platform}
                                            onValueChange={(val) => updateField(`globalFooter.socialLinks.${idx}.platform`, val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Platform" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["Facebook", "Twitter", "Instagram", "LinkedIn", "YouTube", "Telegram", "WhatsApp"].map(p => (
                                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder={`https://${link.platform ? link.platform.toLowerCase() : 'example'}.com/...`}
                                            value={link.url}
                                            onChange={(e) => updateField(`globalFooter.socialLinks.${idx}.url`, e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="mb-0.5"
                                        onClick={() => {
                                            const newLinks = [...(content.globalFooter?.socialLinks || [])];
                                            newLinks.splice(idx, 1);
                                            updateField('globalFooter.socialLinks', newLinks);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const newLinks = [...(content.globalFooter?.socialLinks || [])];
                                newLinks.push({ platform: "Instagram", url: "" });
                                updateField('globalFooter.socialLinks', newLinks);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Social Link
                        </Button>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                                value={content.globalFooter?.contactInfo?.email}
                                onChange={(e) => updateField('globalFooter.contactInfo.email', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                value={content.globalFooter?.contactInfo?.phone}
                                onChange={(e) => updateField('globalFooter.contactInfo.phone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Address</Label>
                            <Input
                                value={content.globalFooter?.contactInfo?.address}
                                onChange={(e) => updateField('globalFooter.contactInfo.address', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links & Courses */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-primary" />
                        <CardTitle>Links & Courses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="font-semibold">Quick Links</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {content.globalFooter?.quickLinks?.map((link: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-end p-2 border rounded-md bg-muted/20">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">Link Label</Label>
                                            <Input
                                                value={link.name}
                                                onChange={(e) => updateField(`globalFooter.quickLinks.${idx}.name`, e.target.value)}
                                                className="h-8"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">Link Path</Label>
                                            <Input
                                                value={link.path}
                                                onChange={(e) => updateField(`globalFooter.quickLinks.${idx}.path`, e.target.value)}
                                                className="h-8"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 mb-0.5"
                                            onClick={() => {
                                                const newLinks = [...(content.globalFooter?.quickLinks || [])];
                                                newLinks.splice(idx, 1);
                                                updateField('globalFooter.quickLinks', newLinks);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newLinks = [...(content.globalFooter?.quickLinks || [])];
                                    newLinks.push({ name: "New Link", path: "/" });
                                    updateField('globalFooter.quickLinks', newLinks);
                                }}
                                className="mt-2"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Quick Link
                            </Button>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Label className="font-semibold">Popular Courses List</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {content.globalFooter?.popularCourses?.map((course: any, idx: number) => (
                                    <div key={idx} className="space-y-2 p-2 border rounded-md flex flex-col relative bg-muted/20">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 absolute top-1 right-1"
                                            onClick={() => {
                                                const newCourses = [...(content.globalFooter?.popularCourses || [])];
                                                newCourses.splice(idx, 1);
                                                updateField('globalFooter.popularCourses', newCourses);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                        <div className="space-y-1 mr-6">
                                            <Label className="text-xs">Course Name</Label>
                                            <Input
                                                value={typeof course === 'string' ? course : course.name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const currentPath = typeof course === 'string' ? "#" : course.path;
                                                    updateField(`globalFooter.popularCourses.${idx}`, { name: val, path: currentPath });
                                                }}
                                                className="h-8"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Course Path</Label>
                                            <Input
                                                value={typeof course === 'string' ? "#" : course.path}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const currentName = typeof course === 'string' ? course : course.name;
                                                    updateField(`globalFooter.popularCourses.${idx}`, { name: currentName, path: val });
                                                }}
                                                className="h-8"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newCourses = [...(content.globalFooter?.popularCourses || [])];
                                    newCourses.push({ name: "New Course", path: "/courses" });
                                    updateField('globalFooter.popularCourses', newCourses);
                                }}
                                className="mt-2"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Popular Course
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        <CardTitle>Footer Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                        {content.globalFooter?.stats?.map((stat: any, idx: number) => (
                            <div key={idx} className="space-y-2 p-3 border rounded bg-muted/20">
                                <div className="space-y-1">
                                    <Label className="text-xs">Value</Label>
                                    <Input
                                        value={stat.value}
                                        onChange={(e) => updateField(`globalFooter.stats.${idx}.value`, e.target.value)}
                                        className="h-8"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Label</Label>
                                    <Input
                                        value={stat.label}
                                        onChange={(e) => updateField(`globalFooter.stats.${idx}.label`, e.target.value)}
                                        className="h-8"
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

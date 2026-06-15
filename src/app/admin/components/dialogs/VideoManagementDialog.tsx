
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Course } from "../../context/CourseContext";
import { Plus, Trash2, Video } from "lucide-react";

import { Textarea } from "../../../components/ui/textarea";

interface VideoManagementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
    onSave: (courseId: string, videos: { title: string; url: string; description?: string; thumbnail?: string }[]) => Promise<void>;
}

export function VideoManagementDialog({ isOpen, onClose, course, onSave }: VideoManagementDialogProps) {
    const [videos, setVideos] = useState<{ title: string; url: string; description: string; thumbnail: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (course && course.videos && course.videos.length > 0) {
            setVideos(course.videos.map(v => ({
                title: v.title || "",
                url: v.url || "",
                description: v.description || "",
                thumbnail: v.thumbnail || ""
            })));
        } else {
            setVideos([{ title: "", url: "", description: "", thumbnail: "" }]);
        }
    }, [course]);

    const handleAddVideo = () => {
        if (videos.length >= 3) return;
        setVideos([...videos, { title: "", url: "", description: "", thumbnail: "" }]);
    };

    const handleRemoveVideo = (index: number) => {
        setVideos(videos.filter((_, idx) => idx !== index));
    };

    const handleVideoChange = (index: number, field: string, value: string) => {
        const updated = [...videos];
        updated[index] = { ...updated[index], [field]: value };
        setVideos(updated);
    };

    const handleSave = async () => {
        if (!course) return;

        // Filter out completely empty rows, validate partially filled rows
        const validVideos = videos.filter(v => v.title.trim() !== "" || v.url.trim() !== "");
        
        for (const v of validVideos) {
            if (v.title.trim() === "" || v.url.trim() === "") {
                // Return if one is filled but the other is empty
                return;
            }
        }

        setLoading(true);
        try {
            await onSave(course._id, validVideos);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-6">
                <DialogHeader className="pb-2 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle>Manage Demo Videos</DialogTitle>
                            <DialogDescription className="mt-1">
                                Set up to 3 demo videos for <span className="font-semibold">{course?.title}</span>.
                            </DialogDescription>
                        </div>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            disabled={videos.length >= 3} 
                            onClick={handleAddVideo}
                        >
                            <Plus className="mr-1.5 h-4 w-4" /> Add Video
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
                    {videos.map((video, idx) => (
                        <div key={idx} className="bg-muted/30 p-4 rounded-xl border border-border space-y-4 relative group">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider bg-[#373081]/10 text-[#373081] px-2 py-0.5 rounded-md">
                                    Video {idx + 1}
                                </span>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" 
                                    onClick={() => handleRemoveVideo(idx)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor={`video-title-${idx}`} className="text-xs font-semibold">Video Title</Label>
                                    <Input
                                        id={`video-title-${idx}`}
                                        className="bg-white text-sm"
                                        value={video.title}
                                        onChange={(e) => handleVideoChange(idx, "title", e.target.value)}
                                        placeholder="e.g. Introduction to Course"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor={`video-url-${idx}`} className="text-xs font-semibold">Video URL (YouTube/Vimeo)</Label>
                                    <Input
                                        id={`video-url-${idx}`}
                                        className="bg-white text-sm"
                                        value={video.url}
                                        onChange={(e) => handleVideoChange(idx, "url", e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor={`video-thumbnail-${idx}`} className="text-xs font-semibold">Thumbnail Image URL</Label>
                                    <Input
                                        id={`video-thumbnail-${idx}`}
                                        className="bg-white text-sm"
                                        value={video.thumbnail}
                                        onChange={(e) => handleVideoChange(idx, "thumbnail", e.target.value)}
                                        placeholder="https://example.com/thumbnail.jpg"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`video-description-${idx}`} className="text-xs font-semibold">Video Description</Label>
                                <Textarea
                                    id={`video-description-${idx}`}
                                    className="bg-white text-sm min-h-[60px]"
                                    value={video.description}
                                    onChange={(e) => handleVideoChange(idx, "description", e.target.value)}
                                    placeholder="Describe what students will learn in this video..."
                                />
                            </div>
                        </div>
                    ))}
                    {videos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-xl bg-muted/10">
                            <Video className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No videos added yet. Click Add Video to get started.</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-3 border-t border-border mt-auto">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

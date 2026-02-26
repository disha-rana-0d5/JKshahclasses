
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
    onSave: (courseId: string, videos: { title: string; url: string; description?: string }[]) => Promise<void>;
}

export function VideoManagementDialog({ isOpen, onClose, course, onSave }: VideoManagementDialogProps) {
    const [video, setVideo] = useState<{ title: string; url: string; description: string }>({ title: "", url: "", description: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (course && course.videos && course.videos.length > 0) {
            const existingVideo = course.videos[0];
            setVideo({
                title: existingVideo.title || "",
                url: existingVideo.url || "",
                description: existingVideo.description || ""
            });
        } else {
            setVideo({ title: "", url: "", description: "" });
        }
    }, [course]);

    const handleSave = async () => {
        if (!course) return;

        // Validation
        if (video.title.trim() === "" && video.url.trim() === "") {
            // Allow saving empty to clear the video
        } else if (video.title.trim() === "" || video.url.trim() === "") {
            // Basic validation - you might want to show an error toast here
            return;
        }

        const videosToSave = (video.title.trim() !== "" && video.url.trim() !== "") ? [video] : [];

        setLoading(true);
        try {
            await onSave(course._id, videosToSave);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Manage Demo Video</DialogTitle>
                    <DialogDescription>
                        Set the demo video for <span className="font-semibold">{course?.title}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="video-title">Video Title</Label>
                            <Input
                                id="video-title"
                                value={video.title}
                                onChange={(e) => setVideo({ ...video, title: e.target.value })}
                                placeholder="e.g. Introduction to Accounting"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="video-description">Video Description</Label>
                            <Textarea
                                id="video-description"
                                value={video.description}
                                onChange={(e) => setVideo({ ...video, description: e.target.value })}
                                placeholder="Describe what students will learn in this video..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="video-url">Video URL (YouTube or Direct Link)</Label>
                            <Input
                                id="video-url"
                                value={video.url}
                                onChange={(e) => setVideo({ ...video, url: e.target.value })}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Supports YouTube (Watch/Shorts/Embed) URLs.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

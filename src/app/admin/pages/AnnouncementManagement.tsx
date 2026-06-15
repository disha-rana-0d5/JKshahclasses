import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { Plus, Pencil, Trash2, Search, Loader2, FileText, ImageIcon } from "lucide-react";
import { announcementApi } from "../../api/api";
import { toast } from "sonner";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ImageUpload } from "../../components/ImageUpload";
import { FileUpload } from "../../components/FileUpload";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

export function AnnouncementManagement() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "general",
        isActive: true,
        attachments: [] as any[]
    });

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        try {
            const { ok, data } = await announcementApi.getAnnouncements();
            if (ok && data.success) {
                setAnnouncements(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch announcements:", error);
            toast.error("Failed to load announcements");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleOpenAdd = () => {
        setEditingAnnouncement(null);
        setFormData({
            title: "",
            content: "",
            type: "general",
            isActive: true,
            attachments: []
        });
        setIsAddDialogOpen(true);
    };

    const handleOpenEdit = (announcement: any) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type || "general",
            isActive: announcement.isActive,
            attachments: announcement.attachments || []
        });
        setIsAddDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAnnouncement) {
                const { ok, data } = await announcementApi.updateAnnouncement(editingAnnouncement._id, formData);
                if (ok && data.success) {
                    toast.success("Announcement updated successfully");
                }
            } else {
                const { ok, data } = await announcementApi.createAnnouncement(formData);
                if (ok && data.success) {
                    toast.success("Announcement created successfully");
                }
            }
            fetchAnnouncements();
            setIsAddDialogOpen(false);
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const confirmDelete = async () => {
        if (announcementToDelete) {
            try {
                const { ok } = await announcementApi.deleteAnnouncement(announcementToDelete);
                if (ok) {
                    toast.success("Announcement deleted successfully");
                    fetchAnnouncements();
                }
            } catch (error) {
                toast.error("Failed to delete announcement");
            } finally {
                setIsDeleteDialogOpen(false);
                setAnnouncementToDelete(null);
            }
        }
    };

    const filteredAnnouncements = announcements.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addAttachment = (type: 'image' | 'pdf', url: string) => {
        if (!url) return;
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, { name: type === 'image' ? 'Image Attachment' : 'PDF Document', url, fileType: type }]
        }));
    };

    const removeAttachment = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Announcements</h2>
                    <p className="text-muted-foreground">Manage dynamic announcements for the student resources page.</p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add Announcement
                </Button>
            </div>

            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search announcements..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="rounded-md border border-border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredAnnouncements.length > 0 ? (
                            filteredAnnouncements.map((announcement) => (
                                <TableRow key={announcement._id}>
                                    <TableCell className="font-medium">{announcement.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {announcement.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(announcement.publishDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={announcement.isActive ? "default" : "secondary"}>
                                            {announcement.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(announcement)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setAnnouncementToDelete(announcement._id);
                                                setIsDeleteDialogOpen(true);
                                            }}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No announcements found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Add New Announcement"}</DialogTitle>
                        <DialogDescription>
                            Create a detailed announcement with rich text and attachments.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="exam">Exams</SelectItem>
                                        <SelectItem value="class">Classes</SelectItem>
                                        <SelectItem value="result">Results</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Content</Label>
                            <div className="h-[250px] mb-12">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                    modules={modules}
                                    formats={formats}
                                    className="h-full"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Attachments</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <ImageUpload
                                    label="Add Image Attachment"
                                    value=""
                                    onChange={(url) => addAttachment('image', url)}
                                />
                                <FileUpload
                                    label="Add PDF Attachment"
                                    value=""
                                    onChange={(url) => addAttachment('pdf', url)}
                                />
                            </div>

                            {formData.attachments.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Current Attachments</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {formData.attachments.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-2 border rounded-xl bg-muted/20 group/item relative h-20 overflow-hidden">
                                                <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center shadow-sm text-primary overflow-hidden shrink-0 border border-border">
                                                    {file.fileType === 'image' ? (
                                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FileText className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-8">
                                                    <p className="text-xs font-bold truncate">{file.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">{file.fileType}</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm hover:text-destructive shadow-sm"
                                                    onClick={() => removeAttachment(idx)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="isActive">Active (Visible to users)</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Announcement</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this announcement.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

const X = ({ className, ...props }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { Plus, Trash2, Image as ImageIcon, Video } from "lucide-react";
import { ImageUpload } from "../../../components/ImageUpload";

import { Course, Category } from "../../context/CourseContext";

interface TestimonialManagementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
    categories: Category[];
    onSave: (courseId: string, testimonials: any[]) => Promise<void>;
}

export function TestimonialManagementDialog({ isOpen, onClose, course, categories, onSave }: TestimonialManagementDialogProps) {
    const [testimonialData, setTestimonialData] = useState<{ category: string; items: { name: string; message: string; image: string; designation: string }[] }[]>([]);
    const [newCategory, setNewCategory] = useState("");

    useEffect(() => {
        if (course && isOpen) {
            setTestimonialData(course.testimonials ? JSON.parse(JSON.stringify(course.testimonials)) : []); // Deep copy
            setNewCategory("");
        }
    }, [course, isOpen]);

    const handleSave = async () => {
        if (!course) return;

        // Ensure default image for all items
        const processedData = testimonialData.map(cat => ({
            ...cat,
            items: cat.items.map(item => ({
                ...item,
                image: item.image || "/placeholder.png"
            }))
        }));

        await onSave(course._id, processedData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Student Testimonials</DialogTitle>
                    <DialogDescription>
                        Add testimonials organized by categories for <span className="font-semibold text-primary">{course?.title}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex items-center gap-2 bg-muted/30 p-4 rounded-lg border border-border">
                        <div className="flex-1">
                            <Select value={newCategory} onValueChange={setNewCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category (e.g., Rankers, Inter)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(categories || []).map((cat) => (
                                        <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="Rankers">Rankers</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={() => {
                                if (newCategory.trim()) {
                                    if (!testimonialData.some(t => t.category === newCategory)) {
                                        setTestimonialData([...testimonialData, { category: newCategory.trim(), items: [] }]);
                                    }
                                    setNewCategory("");
                                }
                            }}
                            disabled={!newCategory.trim()}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Category Section
                        </Button>
                    </div>

                    {testimonialData.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No testimonials added yet. Add a category above to start.
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {testimonialData.map((section, secIdx) => (
                                <div key={secIdx} className="border border-border rounded-lg overflow-hidden">
                                    <div className="bg-muted px-4 py-3 flex items-center justify-between">
                                        <h3 className="font-semibold text-foreground">{section.category}</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setTestimonialData(testimonialData.filter((_, i) => i !== secIdx))}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="p-4 bg-white space-y-4">
                                        {section.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className="grid md:grid-cols-12 gap-4 p-4 bg-muted/10 rounded-lg border border-border/50 relative group">
                                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            const newData = [...testimonialData];
                                                            newData[secIdx].items = newData[secIdx].items.filter((_, i) => i !== itemIdx);
                                                            setTestimonialData(newData);
                                                        }}
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive bg-white shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="md:col-span-3 space-y-3">
                                                    <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-border relative">
                                                        {item.image ? (
                                                            <img src={item.image} className="w-full h-full object-cover" alt="Student" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                                <ImageIcon className="w-8 h-8 opacity-20" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <ImageUpload
                                                        label="Student Photo"
                                                        value={item.image || ""}
                                                        onChange={(url) => {
                                                            const newData = [...testimonialData];
                                                            newData[secIdx].items[itemIdx].image = url;
                                                            setTestimonialData(newData);
                                                        }}
                                                    />
                                                </div>

                                                <div className="md:col-span-9 space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Input
                                                            placeholder="Student Name"
                                                            value={item.name}
                                                            onChange={(e) => {
                                                                const newData = [...testimonialData];
                                                                newData[secIdx].items[itemIdx].name = e.target.value;
                                                                setTestimonialData(newData);
                                                            }}
                                                            className="font-medium"
                                                        />
                                                        <Input
                                                            placeholder="Designation / Rank (e.g. AIR 1)"
                                                            value={item.designation}
                                                            onChange={(e) => {
                                                                const newData = [...testimonialData];
                                                                newData[secIdx].items[itemIdx].designation = e.target.value;
                                                                setTestimonialData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <Textarea
                                                        placeholder="Testimonial Message"
                                                        value={item.message}
                                                        onChange={(e) => {
                                                            const newData = [...testimonialData];
                                                            newData[secIdx].items[itemIdx].message = e.target.value;
                                                            setTestimonialData(newData);
                                                        }}
                                                        className="min-h-[80px]"
                                                    />

                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const newData = [...testimonialData];
                                                newData[secIdx].items.push({
                                                    name: "",
                                                    message: "",
                                                    image: "/placeholder.png",
                                                    designation: "Student"
                                                });
                                                setTestimonialData(newData);
                                            }}
                                            className="w-full border-dashed"
                                        >
                                            <Plus className="w-3 h-3 mr-2" /> Add Student Testimonial
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Testimonials</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

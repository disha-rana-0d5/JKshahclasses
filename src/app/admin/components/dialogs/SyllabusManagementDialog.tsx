import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Plus, Trash2, IndianRupee, FileText, LayoutList, BookOpen, Clock, Settings2 } from "lucide-react";
import { Course } from "../../context/CourseContext";
import { TiptapEditor } from "../../../components/TiptapEditor";
import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area";
import { cn } from "../../../components/ui/utils";
import { Separator } from "../../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { FileUpload } from "../../../components/FileUpload";

interface SyllabusManagementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
    onSave: (courseId: string, data: { syllabusModules: any[] }) => Promise<void>;
}

export function SyllabusManagementDialog({ isOpen, onClose, course, onSave }: SyllabusManagementDialogProps) {
    const [syllabusModules, setSyllabusModules] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<string>("0");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (course && isOpen) {
            let modules = course.syllabusModules ? JSON.parse(JSON.stringify(course.syllabusModules)) : [];
            // Sort modules by sequence
            modules.sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0));

            // Sort topics within each module by sequence
            modules.forEach((mod: any) => {
                if (mod.topics && Array.isArray(mod.topics)) {
                    mod.topics.sort((a: any, b: any) => {
                        const seqA = typeof a === 'object' ? (a.sequence || 0) : 0;
                        const seqB = typeof b === 'object' ? (b.sequence || 0) : 0;
                        return seqA - seqB;
                    });
                }
            });

            setSyllabusModules(modules);
            if (modules.length > 0) {
                setActiveTab("0");
            }
        }
    }, [course, isOpen]);

    const handleSave = async () => {
        if (!course) return;
        setLoading(true);
        try {
            await onSave(course._id, { syllabusModules });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const addModule = () => {
        const newModules = [...syllabusModules, { title: "", topics: [], duration: "", sequence: syllabusModules.length + 1 }];
        setSyllabusModules(newModules);
        setActiveTab((newModules.length - 1).toString());
    };

    const removeModule = (mIdx: number) => {
        const newModules = syllabusModules.filter((_, i) => i !== mIdx);
        setSyllabusModules(newModules);
        if (parseInt(activeTab) >= newModules.length) {
            setActiveTab(Math.max(0, newModules.length - 1).toString());
        }
    };

    const updateModule = (mIdx: number, field: string, value: any) => {
        const newModules = [...syllabusModules];
        newModules[mIdx][field] = value;
        setSyllabusModules(newModules);
    };

    const addTopic = (mIdx: number) => {
        const newModules = [...syllabusModules];
        if (!newModules[mIdx].topics) newModules[mIdx].topics = [];
        const nextSeq = newModules[mIdx].topics.length + 1;
        newModules[mIdx].topics.push({ title: "", details: "", subjects: [], sequence: nextSeq });
        setSyllabusModules(newModules);
    };

    const removeTopic = (mIdx: number, tIdx: number) => {
        const newModules = [...syllabusModules];
        newModules[mIdx].topics = newModules[mIdx].topics.filter((_: any, i: number) => i !== tIdx);
        setSyllabusModules(newModules);
    };

    const updateTopic = (mIdx: number, tIdx: number, field: string, value: any) => {
        const newModules = [...syllabusModules];
        if (typeof newModules[mIdx].topics[tIdx] === 'string') {
            newModules[mIdx].topics[tIdx] = {
                title: field === 'title' ? value : newModules[mIdx].topics[tIdx],
                details: field === 'details' ? value : "",
                subjects: []
            };
        } else {
            newModules[mIdx].topics[tIdx][field] = value;
        }
        setSyllabusModules(newModules);
    };

    const addSubject = (mIdx: number, tIdx: number) => {
        const newModules = [...syllabusModules];
        let topic = newModules[mIdx].topics[tIdx];
        if (typeof topic === 'string') {
            topic = { title: topic, details: "", subjects: [] };
            newModules[mIdx].topics[tIdx] = topic;
        }
        if (!topic.subjects) {
            topic.subjects = [];
        }
        topic.subjects.push({ name: "", price: "" });
        setSyllabusModules(newModules);
    };

    const removeSubject = (mIdx: number, tIdx: number, sIdx: number) => {
        const newModules = [...syllabusModules];
        newModules[mIdx].topics[tIdx].subjects = newModules[mIdx].topics[tIdx].subjects.filter((_: any, i: number) => i !== sIdx);
        setSyllabusModules(newModules);
    };

    const updateSubject = (mIdx: number, tIdx: number, sIdx: number, field: string, value: any) => {
        const newModules = [...syllabusModules];
        const currentSubject = newModules[mIdx].topics[tIdx].subjects[sIdx];
        if (typeof currentSubject === 'string') {
            newModules[mIdx].topics[tIdx].subjects[sIdx] = {
                name: field === 'name' ? value : currentSubject,
                price: field === 'price' ? value : ""
            };
        } else {
            newModules[mIdx].topics[tIdx].subjects[sIdx][field] = value;
        }
        setSyllabusModules(newModules);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent hideCloseButton className="sm:max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50">
                <DialogHeader className="p-6 pb-2 bg-white border-b">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <DialogTitle className="text-xl">Course Syllabus Editor</DialogTitle>
                            </div>
                            <DialogDescription>
                                Manage modules and topics for <span className="font-semibold text-primary">{course?.title}</span>
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                            <Button onClick={handleSave} disabled={loading} className="px-6 bg-red-600 hover:bg-red-700 text-white shadow-md">
                                {loading ? "Saving..." : "Save All Changes"}
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0">
                    <div className="bg-white px-6 pt-4 border-b">
                        <div className="flex items-center gap-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <ScrollArea className="w-full whitespace-nowrap">
                                    <TabsList className="bg-transparent h-14 p-0 gap-2 border-b-0 flex w-max min-w-full justify-start items-center">
                                        {syllabusModules.map((module, mIdx) => (
                                            <TabsTrigger
                                                key={mIdx}
                                                value={mIdx.toString()}
                                                className="rounded-t-lg rounded-b-none border-x border-t border-transparent data-[state=active]:border-slate-200 data-[state=active]:bg-slate-50 data-[state=active]:text-primary px-6 h-10 transition-all font-medium text-slate-600 hover:text-primary flex-shrink-0"
                                            >
                                                {module.title || `Module ${mIdx + 1}`}
                                                <span
                                                    role="button"
                                                    className="ml-2 inline-flex items-center justify-center rounded-full h-5 w-5 text-red-500 opacity-30 hover:opacity-100 hover:bg-red-50 transition-all cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeModule(mIdx);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </span>
                                            </TabsTrigger>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={addModule}
                                            className="h-9 mx-4 border-dashed border-primary/50 text-primary hover:bg-primary/5 rounded-full px-4 flex-shrink-0"
                                        >
                                            <Plus className="h-4 w-4 mr-1.5" /> Add Module
                                        </Button>
                                    </TabsList>
                                    <ScrollBar orientation="horizontal" className="h-2.5 bg-slate-100 rounded-full" />
                                </ScrollArea>
                            </Tabs>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 bg-slate-50">
                        {syllabusModules.length > 0 ? (
                            <Tabs value={activeTab} className="h-full">
                                {syllabusModules.map((module, mIdx) => (
                                    <TabsContent key={mIdx} value={mIdx.toString()} className="h-full mt-0 focus-visible:ring-0">
                                        <ScrollArea className="h-full">
                                            <div className="p-8 max-w-4xl mx-auto space-y-8 pb-12">
                                                {/* Module Configuration */}
                                                <div className="bg-white p-6 rounded-xl border-2 border-red-500 shadow-sm space-y-4">
                                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                        <Settings2 className="h-4 w-4" />
                                                        <span className="text-xs font-bold uppercase tracking-wider">Module Settings</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div className="md:col-span-1 space-y-2">
                                                            <Label className="text-sm font-semibold text-red-600">Module Title</Label>
                                                            <Input
                                                                value={module.title}
                                                                onChange={(e) => updateModule(mIdx, 'title', e.target.value)}
                                                                placeholder="e.g. CA Foundation Registration & Fee"
                                                                className="bg-slate-50 border-red-200 text-red-700 focus:bg-white"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-semibold text-slate-700">Sequence</Label>
                                                            <Input
                                                                type="number"
                                                                value={module.sequence || 0}
                                                                onChange={(e) => updateModule(mIdx, 'sequence', parseInt(e.target.value) || 0)}
                                                                placeholder="0"
                                                                className="bg-slate-50 border-slate-200 focus:bg-white w-20"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5" /> Duration
                                                            </Label>
                                                            <Input
                                                                value={module.duration}
                                                                onChange={(e) => updateModule(mIdx, 'duration', e.target.value)}
                                                                placeholder="e.g. 5 Months"
                                                                className="bg-slate-50 border-slate-200 focus:bg-white"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator className="bg-slate-200 shadow-sm" />

                                                {/* Topics List */}
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <LayoutList className="h-5 w-5 text-slate-400" />
                                                            <h3 className="font-bold text-slate-800">Syllabus Topics</h3>
                                                        </div>
                                                        <Button onClick={() => addTopic(mIdx)} size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4">
                                                            <Plus className="h-4 w-4 mr-1.5" /> Add Topic
                                                        </Button>
                                                    </div>

                                                    {(!module.topics || module.topics.length === 0) ? (
                                                        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                                                            <p className="text-slate-400">No topics added to this module yet.</p>
                                                            <Button variant="link" onClick={() => addTopic(mIdx)} className="text-primary mt-2">
                                                                Add your first topic
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-6">
                                                            {module.topics.map((topic: any, tIdx: number) => (
                                                                <div key={tIdx} className="bg-white rounded-2xl border-2 border-red-500 shadow-sm overflow-hidden group hover:border-red-600 transition-all">
                                                                    <div className="bg-slate-50/80 p-4 border-b flex items-center justify-between">
                                                                        <div className="flex items-center gap-3 flex-1">
                                                                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                                                                                {tIdx + 1}
                                                                            </span>
                                                                            <Input
                                                                                type="number"
                                                                                className="w-16 bg-white border-red-200 h-8 text-xs font-bold text-red-600 px-2"
                                                                                value={typeof topic === 'object' ? (topic.sequence || 0) : 0}
                                                                                onChange={(e) => updateTopic(mIdx, tIdx, 'sequence', parseInt(e.target.value) || 0)}
                                                                                placeholder="Seq"
                                                                            />
                                                                            <Input
                                                                                className="border-none bg-transparent h-8 p-0 text-base font-bold text-red-600 focus-visible:ring-0 placeholder:text-red-300"
                                                                                value={typeof topic === 'string' ? topic : topic.title}
                                                                                onChange={(e) => updateTopic(mIdx, tIdx, 'title', e.target.value)}
                                                                                placeholder="Enter topic name..."
                                                                            />
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={() => removeTopic(mIdx, tIdx)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>

                                                                    <div className="p-6 space-y-6">
                                                                        {/* Subjects & Prices */}
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                                                    <IndianRupee className="h-3 w-3" /> Subjects & Pricing
                                                                                </Label>
                                                                                <Button variant="outline" size="sm" onClick={() => addSubject(mIdx, tIdx)} className="h-7 text-[10px] uppercase font-bold px-3 border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50">
                                                                                    <Plus className="h-3 w-3 mr-1" /> Add Item
                                                                                </Button>
                                                                            </div>

                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                {(topic.subjects || []).map((subject: any, sIdx: number) => (
                                                                                    <div key={sIdx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-transparent hover:border-slate-200 group/item transition-colors">
                                                                                        <Input
                                                                                            className="bg-white border-slate-200 h-8 text-sm flex-1"
                                                                                            value={typeof subject === 'string' ? subject : (subject.name || "")}
                                                                                            onChange={(e) => updateSubject(mIdx, tIdx, sIdx, 'name', e.target.value)}
                                                                                            placeholder="Subject"
                                                                                        />
                                                                                        <div className="relative w-28">
                                                                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                                                                            <Input
                                                                                                className="bg-white border-slate-200 h-8 pl-6 text-sm"
                                                                                                value={typeof subject === 'string' ? "" : (subject.price || "")}
                                                                                                onChange={(e) => updateSubject(mIdx, tIdx, sIdx, 'price', e.target.value)}
                                                                                                placeholder="Price"
                                                                                            />
                                                                                        </div>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-7 w-7 text-slate-400 p-0 hover:text-red-600 hover:bg-slate-100 opacity-0 group-hover/item:opacity-100"
                                                                                            onClick={() => removeSubject(mIdx, tIdx, sIdx)}
                                                                                        >
                                                                                            <Trash2 className="h-3 w-3" />
                                                                                        </Button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        <Separator className="bg-slate-100" />

                                                                        {/* Topic Details (Quill) */}
                                                                        <div className="space-y-3">
                                                                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                                                <FileText className="h-3 w-3" /> Description
                                                                            </Label>
                                                                            <TiptapEditor
                                                                                content={typeof topic === 'string' ? "" : (topic.details || "")}
                                                                                onChange={(content) => updateTopic(mIdx, tIdx, 'details', content)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white m-8 rounded-2xl border-2 border-dashed border-slate-200">
                                <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                                <h4 className="text-lg font-semibold text-slate-600">No Syllabus Modules</h4>
                                <p className="text-sm max-w-xs text-center mt-2">
                                    Start building your course structure by adding your first module.
                                </p>
                                <Button onClick={addModule} className="mt-6 bg-red-600 hover:bg-red-700 text-white rounded-full">
                                    <Plus className="mr-2 h-4 w-4" /> Add Your First Module
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <style>{`

                    [data-radix-scroll-area-scrollbar][data-orientation="horizontal"] {
                        height: 10px !important;
                        padding: 2px !important;
                        background: #f1f5f9 !important;
                        border-radius: 9999px;
                    }
                    [data-radix-scroll-area-thumb] {
                        background-color: #cbd5e1 !important;
                        border-radius: 9999px !important;
                    }
                    [data-radix-scroll-area-thumb]:hover {
                        background-color: #94a3b8 !important;
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}

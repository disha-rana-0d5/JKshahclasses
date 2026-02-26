"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { Clock, CheckCircle2 } from "lucide-react";

interface BatchEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: any;
    topic?: any; // If null, assumes full course
    batches: any[];
    branches: any[];
}

export function BatchEnrollmentModal({
    isOpen,
    onClose,
    course,
    topic,
    batches,
    branches
}: BatchEnrollmentModalProps) {
    const [selectedMode, setSelectedMode] = useState<"f2f" | "online" | "recorded">("f2f");
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    // Reset state when modal opens or topic changes
    useEffect(() => {
        if (isOpen) {
            setSelectedMode("f2f");
            setSelectedLocation("");
            setSelectedLanguage("");
            setSelectedBatchId(null);

            // Do not pre-select subjects as per user request
            setSelectedSubjects([]);
        }
    }, [isOpen, topic, course]);

    // If topic is not provided, we effectively treat the course itself as the topic (full course)
    // But we need to handle "subjects". If the course object doesn't have subjects structure same as topic,
    // we need to adapt or just show "Full Course" as a single subject.
    const getEffectiveTopic = () => {
        if (topic) return topic;

        let subjects = [];
        if (course?.syllabusModules) {
            const allSubjects = course.syllabusModules.flatMap((module: any) =>
                (module.topics || []).flatMap((t: any) =>
                    typeof t !== 'string' && t.subjects ? t.subjects : []
                )
            );
            // Remove duplicates
            const uniqueNames = new Set();
            subjects = allSubjects.filter((s: any) => {
                const name = typeof s === 'string' ? s : s.name;
                if (uniqueNames.has(name)) return false;
                uniqueNames.add(name);
                return true;
            });
        }

        if (subjects.length === 0) {
            subjects = [{ name: "Full Course Access", price: course?.price || "0" }];
        }

        return {
            title: course?.title,
            subjects: subjects
        };
    };

    const effectiveTopic = getEffectiveTopic();

    const getFilteredBatches = () => {
        if (!course) return [];
        const modeLabel = selectedMode === "f2f" ? "Face to Face" : selectedMode === "online" ? "Live Online" : "Recorded";

        return batches.filter(b => {
            const modeMatch = b.mode === modeLabel;

            const courseSubCat = course.subCategory || "";
            const courseCat = course.category || "";
            const courseLevel = course.level || "";

            // Check if either course category or subcategory matches any of the batch categories
            const batchCats: string[] = (b.categories && b.categories.length > 0) ? b.categories : (b.category ? [b.category] : []);
            const catMatch = batchCats.some((cat: string) => {
                const cCat = courseCat.toLowerCase();
                const cSubCat = courseSubCat.toLowerCase();
                const bCat = cat.toLowerCase();

                return (courseSubCat && bCat.includes(cSubCat)) ||
                    (courseCat && bCat.includes(cCat)) ||
                    (courseSubCat && cSubCat.includes(bCat)) ||
                    (courseCat && cCat.includes(bCat));
            });

            // If Face to Face, also filter by location
            if (selectedMode === "f2f") {
                if (!selectedLocation) return false;
                return modeMatch && catMatch && b.location === selectedLocation;
            }

            // If Live Online, filter by language if one is selected
            if (selectedMode === "online" && selectedLanguage) {
                return modeMatch && catMatch && b.language === selectedLanguage;
            }

            return modeMatch && catMatch;
        });
    };

    const handleSubjectToggle = (subjectName: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectName)
                ? prev.filter(s => s !== subjectName)
                : [...prev, subjectName]
        );
    };

    const calculateTotalPrice = () => {
        if (!effectiveTopic || !effectiveTopic.subjects) return 0;
        return effectiveTopic.subjects
            .filter((s: any) => selectedSubjects.includes(typeof s === 'string' ? s : s.name))
            .reduce((total: number, s: any) => total + (parseFloat(typeof s === 'string' ? "0" : (s.price || "0")) || 0), 0);
    };

    const handleProceed = () => {
        if (selectedSubjects.length === 0) {
            toast.error("Please select at least one subject");
            return;
        }
        const modeLabel = selectedMode === "f2f" ? "Face to Face" : selectedMode === "online" ? "Live Online" : "Recorded";
        const selectedBatch = batches.find(b => b._id === selectedBatchId);
        const batchInfo = selectedBatch ? ` (Batch: ${selectedBatch.startDate})` : "";

        if (!selectedBatchId && getFilteredBatches().length > 0) {
            // Optional: You can add a subtle confirmation or just proceed
            // The user said "dont keep that mandatory", so we just proceed.
        }

        toast.success(`Redirecting to checkout for ${selectedSubjects.length} subjects (${modeLabel})${batchInfo}...`);
        onClose();
    };

    if (!course) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95%] rounded-xl sm:max-w-[570px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900">Customise Your Selection</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Select the subjects you want to enroll in for {effectiveTopic.title}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h5 className="font-bold text-slate-800 mb-1">{effectiveTopic.title}</h5>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Multiple Subject Enrollment</p>
                    </div>

                    <Tabs defaultValue="f2f" className="w-full" value={selectedMode} onValueChange={(v: any) => { setSelectedMode(v); setSelectedBatchId(null); setSelectedLocation(""); setSelectedLanguage(""); }}>
                        <TabsList className="w-full grid grid-cols-3 h-10 p-1 bg-slate-100 rounded-lg">
                            <TabsTrigger value="f2f" className="text-[11px] font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white">Face to Face</TabsTrigger>
                            <TabsTrigger value="online" className="text-[11px] font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white">Live Online</TabsTrigger>
                            <TabsTrigger value="recorded" className="text-[11px] font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white">Recorded</TabsTrigger>
                        </TabsList>

                        <div className="mt-4 space-y-4">
                            {selectedMode === "f2f" && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Select Location</Label>
                                    <Select value={selectedLocation} onValueChange={(v) => { setSelectedLocation(v); setSelectedBatchId(null); }}>
                                        <SelectTrigger className="w-full bg-white border-2 border-slate-100 rounded-xl h-10">
                                            <SelectValue placeholder="Choose a branch..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.length > 0 ? (
                                                Array.from(new Set(branches.map(b => b.name))).map((name, i) => (
                                                    <SelectItem key={i} value={name as string}>{name as string}</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-locations" disabled>No locations available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {selectedMode === "online" && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Select Language <span className="text-slate-400 font-normal">(Optional)</span></Label>
                                    <Select value={selectedLanguage} onValueChange={(v) => { setSelectedLanguage(v); setSelectedBatchId(null); }}>
                                        <SelectTrigger className="w-full bg-white border-2 border-slate-100 rounded-xl h-10">
                                            <SelectValue placeholder="Choose a language..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="English">English</SelectItem>
                                            <SelectItem value="Hindi">Hindi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Batch Selection */}
                            <div className="space-y-2">
                                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Available Batches</h5>
                                {/* Desktop Table View */}
                                <div className="hidden md:block rounded-xl border-2 border-slate-100 overflow-hidden bg-white">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="text-[10px] font-bold h-8 uppercase">Start Date</TableHead>
                                                <TableHead className="text-[10px] font-bold h-8 uppercase">Day & Timing</TableHead>
                                                <TableHead className="text-[10px] font-bold h-8 uppercase">Attempt</TableHead>
                                                <TableHead className="text-[11px] font-bold h-8 text-right pr-4">Select</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {getFilteredBatches().length > 0 ? (
                                                getFilteredBatches().map((batch) => (
                                                    <TableRow
                                                        key={batch._id}
                                                        className={`cursor-pointer transition-colors ${selectedBatchId === batch._id ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                                                        onClick={() => setSelectedBatchId(batch._id)}
                                                    >
                                                        <TableCell className="py-2 text-xs font-bold text-primary">{batch.startDate}</TableCell>
                                                        <TableCell className="py-2 text-[11px] text-slate-600 font-medium">{batch.dayTiming}</TableCell>
                                                        <TableCell className="py-2">
                                                            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{batch.examAttempt}</span>
                                                            {batch.language && <span className="text-[9px] bg-primary/10 px-1.5 py-0.5 rounded text-primary font-bold uppercase ml-1">{batch.language}</span>}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-right pr-4">
                                                            <div className={`w-4 h-4 rounded-full border-2 ml-auto ${selectedBatchId === batch._id ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                                                                {selectedBatchId === batch._id && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-0.5" />}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-slate-400 text-xs italic">
                                                        {selectedMode === "f2f" && !selectedLocation ? "Please select a location first." : "No batches available for this selection."}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-2">
                                    {getFilteredBatches().length > 0 ? (
                                        getFilteredBatches().map((batch) => (
                                            <div
                                                key={batch._id}
                                                onClick={() => setSelectedBatchId(batch._id)}
                                                className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedBatchId === batch._id
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p className="text-xs font-bold text-primary mb-0.5">{batch.startDate}</p>
                                                        <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{batch.examAttempt}</span>
                                                        {batch.language && <span className="text-[9px] bg-primary/10 px-1.5 py-0.5 rounded text-primary font-bold uppercase ml-1">{batch.language}</span>}
                                                    </div>
                                                    <div className={`w-4 h-4 rounded-full border-2 ${selectedBatchId === batch._id ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                                                        {selectedBatchId === batch._id && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-0.5" />}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {batch.dayTiming}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                            {selectedMode === "f2f" && !selectedLocation ? "Please select a location first." : "No batches available for this selection."}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subjects Selection */}
                            <div className="space-y-2">
                                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Subjects</h5>
                                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {effectiveTopic.subjects?.map((subject: any, idx: number) => {
                                        const sName = typeof subject === 'string' ? subject : subject.name;
                                        const sPrice = typeof subject === 'string' ? "0" : (subject.price || "0");
                                        const isChecked = selectedSubjects.includes(sName);

                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center justify-between p-2.5 rounded-xl border-2 transition-all cursor-pointer ${isChecked ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                                onClick={() => handleSubjectToggle(sName)}
                                            >
                                                <div className="flex items-center gap-2 pointer-events-none">
                                                    <Checkbox
                                                        id={`subject-${idx}`}
                                                        checked={isChecked}
                                                        className="h-4 w-4 border-2"
                                                    />
                                                    <Label className="text-xs font-bold text-slate-700 cursor-pointer">{sName}</Label>
                                                </div>
                                                {parseFloat(sPrice) > 0 && (
                                                    <span className="text-xs font-bold text-primary">₹{sPrice}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Tabs>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-4 border-t pt-6">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-sm font-semibold text-slate-500">Selected Subjects: {selectedSubjects.length}</div>
                        <div className="text-2xl font-black text-primary">₹{calculateTotalPrice()}</div>
                    </div>
                    <Button
                        className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl transition-all active:scale-[0.98]"
                        onClick={handleProceed}
                    >
                        Proceed to Buy Now
                    </Button>
                    <p className="text-[10px] text-center text-slate-400 font-medium italic">
                        * GST will be calculated at the checkout page. No hidden charges.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

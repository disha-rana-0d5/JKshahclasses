import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

import { Course, Category } from "../../context/CourseContext";

interface FAQManagementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
    categories: Category[];
    onSave: (courseId: string, faqs: any[]) => Promise<void>;
}

export function FAQManagementDialog({ isOpen, onClose, course, categories, onSave }: FAQManagementDialogProps) {
    const [faqData, setFaqData] = useState<{ category: string; topics: { title: string; questions: { question: string; answer: string; }[] }[] }[]>([]);
    const [newFaqCategory, setNewFaqCategory] = useState("");

    useEffect(() => {
        if (course && isOpen) {
            let data = course.faqs ? JSON.parse(JSON.stringify(course.faqs)) : [];
            // Migration/Compatibility check: if old format (questions directly in category), move them to a default topic
            data = data.map((cat: any) => {
                if (cat.questions && !cat.topics) {
                    return {
                        category: cat.category,
                        topics: [{ title: "General", questions: cat.questions }]
                    };
                }
                return cat;
            });
            setFaqData(data);
            setNewFaqCategory("");
        }
    }, [course, isOpen]);

    const handleSave = async () => {
        if (!course) return;
        await onSave(course._id, faqData);
        onClose();
    };

    const addTopic = (catIdx: number) => {
        const newData = [...faqData];
        newData[catIdx].topics.push({ title: "New Topic", questions: [] });
        setFaqData(newData);
    };

    const removeTopic = (catIdx: number, topicIdx: number) => {
        const newData = [...faqData];
        newData[catIdx].topics = newData[catIdx].topics.filter((_, i) => i !== topicIdx);
        setFaqData(newData);
    };

    const updateTopicTitle = (catIdx: number, topicIdx: number, title: string) => {
        const newData = [...faqData];
        newData[catIdx].topics[topicIdx].title = title;
        setFaqData(newData);
    };

    const addQuestion = (catIdx: number, topicIdx: number) => {
        const newData = [...faqData];
        newData[catIdx].topics[topicIdx].questions.push({ question: "", answer: "" });
        setFaqData(newData);
    };

    const updateQuestion = (catIdx: number, topicIdx: number, qIdx: number, field: 'question' | 'answer', value: string) => {
        const newData = [...faqData];
        newData[catIdx].topics[topicIdx].questions[qIdx][field] = value;
        setFaqData(newData);
    };

    const removeQuestion = (catIdx: number, topicIdx: number, qIdx: number) => {
        const newData = [...faqData];
        newData[catIdx].topics[topicIdx].questions = newData[catIdx].topics[topicIdx].questions.filter((_, i) => i !== qIdx);
        setFaqData(newData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Course FAQs</DialogTitle>
                    <DialogDescription>
                        Add frequently asked questions organized by categories and topics for <span className="font-semibold text-primary">{course?.title}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex items-center gap-2 bg-muted/30 p-4 rounded-lg border border-border">
                        <div className="flex-1">
                            <Select value={newFaqCategory} onValueChange={setNewFaqCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category for FAQs" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(categories || []).map((cat) => (
                                        <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={() => {
                                if (newFaqCategory.trim()) {
                                    if (!faqData.some(f => f.category === newFaqCategory)) {
                                        setFaqData([...faqData, { category: newFaqCategory.trim(), topics: [] }]);
                                    }
                                    setNewFaqCategory("");
                                }
                            }}
                            disabled={!newFaqCategory.trim()}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Category
                        </Button>
                    </div>

                    {faqData.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No FAQs added yet. Select a category above to start.
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {faqData.map((category, catIdx) => (
                                <div key={catIdx} className="border-2 border-primary/20 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-primary/5 px-4 py-3 flex items-center justify-between border-b border-primary/10">
                                        <h3 className="font-bold text-lg text-primary">{category.category}</h3>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addTopic(catIdx)}
                                                className="h-8 border-primary/50 text-primary hover:bg-primary/5"
                                            >
                                                <Plus className="w-4 h-4 mr-1" /> Add Topic
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setFaqData(faqData.filter((_, i) => i !== catIdx))}
                                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white space-y-6">
                                        {category.topics.length === 0 && (
                                            <p className="text-center text-sm text-muted-foreground py-4">No topics added to this category.</p>
                                        )}
                                        {category.topics.map((topic, tIdx) => (
                                            <div key={tIdx} className="border border-border rounded-lg p-4 space-y-4 bg-slate-50/50">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={topic.title}
                                                        onChange={(e) => updateTopicTitle(catIdx, tIdx, e.target.value)}
                                                        placeholder="Topic Title (e.g., Eligibility, Fees)"
                                                        className="font-semibold bg-white"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeTopic(catIdx, tIdx)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="pl-4 space-y-3 border-l-2 border-primary/10">
                                                    {topic.questions.map((q, qIdx) => (
                                                        <div key={qIdx} className="flex gap-3 items-start p-3 bg-white rounded-lg border border-border shadow-sm">
                                                            <div className="flex-1 space-y-2">
                                                                <Input
                                                                    placeholder="Question"
                                                                    value={q.question}
                                                                    onChange={(e) => updateQuestion(catIdx, tIdx, qIdx, 'question', e.target.value)}
                                                                    className="font-medium h-9"
                                                                />
                                                                <Textarea
                                                                    placeholder="Answer"
                                                                    value={q.answer}
                                                                    onChange={(e) => updateQuestion(catIdx, tIdx, qIdx, 'answer', e.target.value)}
                                                                    className="text-sm min-h-[80px]"
                                                                />
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeQuestion(catIdx, tIdx, qIdx)}
                                                            >
                                                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => addQuestion(catIdx, tIdx)}
                                                        className="w-full h-8 text-xs border border-dashed border-border hover:border-primary/50 hover:text-primary hover:bg-white"
                                                    >
                                                        <Plus className="w-3 h-3 mr-2" /> Add Question to "{topic.title}"
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="bg-slate-50 p-4 -mx-6 -mb-6 mt-6 border-t">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} className="px-8 shadow-md">Save All FAQs</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

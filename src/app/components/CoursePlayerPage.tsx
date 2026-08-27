import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Download,
  MessageCircle,
  BookOpen,
  List,
  X,
  ThumbsUp,
  Flag
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
}

interface Note {
  timestamp: string;
  text: string;
}

export function CoursePlayerPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "notes" | "resources">("content");
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    document.title = "Course Player";
  }, []);

  const modules = [
    {
      id: 1,
      title: "Module 1: Introduction to Accounting",
      lessons: [
        { id: 1, title: "What is Accounting?", duration: "12:45", completed: true, locked: false },
        { id: 2, title: "Basic Accounting Concepts", duration: "18:30", completed: true, locked: false },
        { id: 3, title: "Accounting Principles", duration: "22:15", completed: false, locked: false },
        { id: 4, title: "Types of Accounts", duration: "15:40", completed: false, locked: false }
      ]
    },
    {
      id: 2,
      title: "Module 2: Double Entry System",
      lessons: [
        { id: 5, title: "Understanding Debit & Credit", duration: "25:20", completed: false, locked: false },
        { id: 6, title: "Journal Entries", duration: "32:10", completed: false, locked: false },
        { id: 7, title: "Ledger Posting", duration: "28:45", completed: false, locked: false }
      ]
    },
    {
      id: 3,
      title: "Module 3: Financial Statements",
      lessons: [
        { id: 8, title: "Trial Balance", duration: "20:15", completed: false, locked: true },
        { id: 9, title: "Profit & Loss Account", duration: "26:30", completed: false, locked: true },
        { id: 10, title: "Balance Sheet", duration: "24:50", completed: false, locked: true }
      ]
    }
  ];

  const currentLesson = {
    title: "Accounting Principles - Theory & Applications",
    module: "Module 1: Introduction to Accounting",
    duration: "22:15",
    instructor: "Dr. Rajesh Kumar",
    currentTime: "8:45",
    totalTime: "22:15"
  };

  const resources = [
    { name: "Lecture Notes - Accounting Principles.pdf", size: "2.4 MB", type: "PDF" },
    { name: "Practice Questions.pdf", size: "1.8 MB", type: "PDF" },
    { name: "Chapter Summary.pdf", size: "0.9 MB", type: "PDF" }
  ];

  const myNotes: Note[] = [
    { timestamp: "05:23", text: "Key point: Accounting is the language of business. Remember the 3 golden rules." },
    { timestamp: "12:47", text: "Important: Consistency principle must be followed across all periods." }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-base text-gray-900">{currentLesson.title}</h1>
                <p className="text-sm text-gray-500">{currentLesson.module}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                <ThumbsUp className="w-4 h-4 mr-1.5" />
                Helpful
              </Button>
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                <Flag className="w-4 h-4 mr-1.5" />
                Report Issue
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Left - Video Player */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Video Area */}
          <div className="flex-1 flex items-center justify-center bg-gray-900 relative">
            {/* Video Placeholder */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gray-800 rounded-full p-8 mb-4 inline-block">
                  {isPlaying ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white" />
                  )}
                </div>
                <p className="text-white text-sm">Video Player Area</p>
                <p className="text-gray-400 text-xs mt-1">1920x1080 HD Quality</p>
              </div>
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "39%" }} />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <span className="text-sm text-white">
                    {currentLesson.currentTime} / {currentLesson.totalTime}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Settings className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Maximize className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>22 min 15 sec</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>Lesson 3 of 45</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                  className="border-gray-300 text-gray-700"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  Take Notes
                </Button>
                <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                  Previous
                </Button>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white" size="sm">
                  Next Lesson
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-4 pt-4">
            <div className="flex gap-1">
              {[
                { id: "content", label: "Content", icon: List },
                { id: "notes", label: "My Notes", icon: FileText },
                { id: "resources", label: "Resources", icon: Download }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.id
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Course Content Tab */}
            {activeTab === "content" && (
              <div className="p-4 space-y-4">
                {modules.map((module) => (
                  <div key={module.id}>
                    <h3 className="text-sm text-gray-900 mb-2 px-2">{module.title}</h3>
                    <div className="space-y-1">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          disabled={lesson.locked}
                          className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${lesson.id === 3
                              ? "bg-gray-100 border border-gray-300"
                              : lesson.locked
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-gray-50"
                            }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {lesson.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            ) : lesson.locked ? (
                              <Circle className="w-4 h-4 text-gray-300" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm mb-0.5 ${lesson.id === 3 ? "text-gray-900" : "text-gray-700"}`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-gray-500">{lesson.duration}</p>
                          </div>
                          {lesson.id === 3 && (
                            <Play className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === "notes" && (
              <div className="p-4">
                {myNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-1">No notes yet</p>
                    <p className="text-xs text-gray-400">Click "Take Notes" to add your first note</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myNotes.map((note, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-blue-600 font-medium">{note.timestamp}</span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{note.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Note Section */}
                {showNotes && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <textarea
                      placeholder="Type your note here..."
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      rows={4}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white" size="sm">
                        Save Note
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNotes(false)}
                        className="border-gray-300 text-gray-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-sm text-gray-900 mb-1">Downloadable Resources</h3>
                  <p className="text-xs text-gray-500">Study materials for this lesson</p>
                </div>

                <div className="space-y-2">
                  {resources.map((resource, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="bg-red-100 rounded p-2 flex-shrink-0">
                        <FileText className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 mb-0.5">{resource.name}</p>
                        <p className="text-xs text-gray-500">{resource.size} • {resource.type}</p>
                      </div>
                      <button className="flex-shrink-0 p-2 hover:bg-white rounded transition-colors">
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-900 mb-1">💡 Study Tip</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Review the lecture notes before watching the video. Take your own notes during the lecture for better retention.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

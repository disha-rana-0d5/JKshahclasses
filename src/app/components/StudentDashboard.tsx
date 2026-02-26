import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Play,
  Clock,
  BookOpen,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Award,
  TrendingUp,
  Target,
  Video,
  FileText,
  BarChart3,
  Bell,
  User,
  LogOut,
  Settings,
  Download
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";

interface EnrolledCourse {
  id: number;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  nextLesson: string;
  duration: string;
}

interface UpcomingLecture {
  id: number;
  title: string;
  course: string;
  instructor: string;
  date: string;
  time: string;
  type: "live" | "recorded";
}

interface StudentDashboardProps {
  onNavigateToCoursePlayer?: () => void;
}

export function StudentDashboard({ onNavigateToCoursePlayer }: StudentDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "schedule">("overview");

  useEffect(() => {
    document.title = "Student Dashboard | JK Shah Classes";
  }, []);

  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const enrolledCourses: EnrolledCourse[] = [
    {
      id: 1,
      title: "CA Foundation - Accounting",
      instructor: "Dr. Rajesh Kumar",
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      progress: 65,
      totalLessons: 45,
      completedLessons: 29,
      lastAccessed: "2 hours ago",
      nextLesson: "Depreciation Methods",
      duration: "6 months"
    },
    {
      id: 2,
      title: "CA Foundation - Business Laws",
      instructor: "Prof. Anjali Mehta",
      thumbnail: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      progress: 42,
      totalLessons: 38,
      completedLessons: 16,
      lastAccessed: "Yesterday",
      nextLesson: "Contract Act - Essentials",
      duration: "6 months"
    },
    {
      id: 3,
      title: "CA Foundation - Mathematics",
      instructor: "Dr. Vikram Singh",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      progress: 78,
      totalLessons: 32,
      completedLessons: 25,
      lastAccessed: "3 days ago",
      nextLesson: "Probability Theory",
      duration: "6 months"
    }
  ];

  const upcomingLectures: UpcomingLecture[] = [
    {
      id: 1,
      title: "Depreciation Methods - Theory & Practice",
      course: "CA Foundation - Accounting",
      instructor: "Dr. Rajesh Kumar",
      date: "Today",
      time: "6:00 PM",
      type: "live"
    },
    {
      id: 2,
      title: "Contract Act - Case Studies",
      course: "CA Foundation - Business Laws",
      instructor: "Prof. Anjali Mehta",
      date: "Tomorrow",
      time: "7:00 PM",
      type: "live"
    },
    {
      id: 3,
      title: "Probability - Advanced Problems",
      course: "CA Foundation - Mathematics",
      instructor: "Dr. Vikram Singh",
      date: "Jan 2",
      time: "5:30 PM",
      type: "recorded"
    }
  ];

  const stats = [
    { label: "Hours Learned", value: "124", icon: Clock, color: "text-blue-600" },
    { label: "Lessons Completed", value: "70", icon: CheckCircle2, color: "text-blue-600" },
    { label: "Current Streak", value: "12 days", icon: TrendingUp, color: "text-blue-600" },
    { label: "Certificates", value: "2", icon: Award, color: "text-blue-600" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.name || "Student"}!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your courses today.</p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl text-gray-900 mb-0.5">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Continue Learning Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-gray-900">Continue Learning</h2>
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative h-36 overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <button
                    onClick={onNavigateToCoursePlayer}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="bg-white rounded-full p-3 shadow-lg">
                      <Play className="w-5 h-5 text-gray-900" />
                    </div>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-base text-gray-900 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{course.instructor}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Lesson Count */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                    <span className="text-gray-400">•</span>
                    <span>{course.lastAccessed}</span>
                  </div>

                  {/* Next Lesson */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Next Lesson</p>
                    <p className="text-sm text-gray-900">{course.nextLesson}</p>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={onNavigateToCoursePlayer}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-9 text-sm"
                  >
                    Continue Learning
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Lectures - 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-gray-900">Upcoming Live Lectures</h2>
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                View schedule
              </button>
            </div>

            <div className="space-y-3">
              {upcomingLectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Badge */}
                    <div className="flex-shrink-0 text-center bg-gray-50 rounded-lg p-3 min-w-[70px]">
                      <p className="text-xs text-gray-500 mb-0.5">
                        {lecture.date.split(" ")[0]}
                      </p>
                      <p className="text-base text-gray-900">{lecture.time}</p>
                    </div>

                    {/* Lecture Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="text-base text-gray-900">{lecture.title}</h3>
                        {lecture.type === "live" && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{lecture.course}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-3.5 h-3.5" />
                        <span>{lecture.instructor}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {lecture.type === "live" ? "Join" : "Watch"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <button className="w-full mt-3 py-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
              View All Scheduled Lectures
            </button>
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Study Goal */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base text-gray-900">Daily Goal</h3>
                <Target className="w-5 h-5 text-blue-600" />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">2.5 / 3 hours</span>
                  <span className="text-gray-900">83%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "83%" }} />
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Great progress! 30 minutes more to complete your daily goal.
              </p>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-base text-gray-900 mb-4">Recent Achievements</h3>

              <div className="space-y-3">
                {[
                  { title: "Completed Accounting Module 1", icon: CheckCircle2, date: "2 days ago" },
                  { title: "12 Day Learning Streak", icon: TrendingUp, date: "Today" },
                  { title: "100% Quiz Score", icon: Award, date: "5 days ago" }
                ].map((achievement, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <achievement.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 mb-0.5">{achievement.title}</p>
                      <p className="text-xs text-gray-500">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Resources */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-base text-gray-900 mb-4">Study Resources</h3>

              <div className="space-y-2">
                {[
                  { icon: FileText, label: "Download Notes", count: "12 PDFs" },
                  { icon: Video, label: "Recorded Lectures", count: "45 videos" },
                  { icon: BarChart3, label: "Practice Tests", count: "8 available" }
                ].map((resource, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <resource.icon className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-900">{resource.label}</p>
                        <p className="text-xs text-gray-500">{resource.count}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Button } from "../../components/ui/button";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    GraduationCap,
    ShoppingCart,
    FileText,
    Settings,
    LogOut,
    Bell,
    Briefcase,
    ClipboardList,
    PenTool,
    Image
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
    className?: string;
    onNavigate?: () => void;
}

export function AdminSidebarContent({ className = "", onNavigate }: AdminSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract the active page from the path (e.g. /admin/courses -> courses)
    const currentPath = location.pathname.split("/").pop() || "dashboard";

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        {
            id: "courses-group",
            label: "Course Management",
            icon: BookOpen,
            subItems: [
                { id: "courses", label: "All Courses (Add/Edit)", path: "courses" },
                { id: "faqs", label: "Course FAQs", path: "faqs" },
                { id: "videos", label: "Manage Video", path: "videos" },
                { id: "syllabus", label: "Manage Syllabus", path: "syllabus" },
                { id: "testimonials", label: "Student Testimonials", path: "testimonials" },
                { id: "rank-holders", label: "Rank Holders", path: "rank-holders" },
                { id: "categories", label: "Categories", path: "categories" },
                { id: "subcategories", label: "Sub Categories", path: "subcategories" },
                { id: "levels", label: "Levels", path: "levels" },
                { id: "timelines", label: "Manage Timelines", path: "timelines" },
                { id: "career-opps", label: "Career Opportunities", path: "career-opps" },
            ]

        },
        { id: "users", label: "User Management", icon: Users },
        { id: "orders", label: "Orders & Payments", icon: ShoppingCart },
        {
            id: "content-group",
            label: "CMS & Content",
            icon: FileText,
            subItems: [
                { id: "landing", label: "Landing Page", path: "content" },
                { id: "footer", label: "Footer Content", path: "content/footer" },
                { id: "branches", label: "Branch Content", path: "content/branches" },
                { id: "branch-enquiries", label: "Branch Enquiries", path: "branch-enquiries" },
                { id: "faculty", label: "Faculty Management", path: "faculty" },
            ]
        },
        { id: "blogs", label: "Blog Management", icon: PenTool },
        { id: "media", label: "Media Library", icon: Image },
        {
            id: "placement-group",
            label: "Placement",
            icon: Briefcase,
            subItems: [
                { id: "placements", label: "Placement Management", path: "placements" },
                { id: "applications", label: "Job Applications", path: "applications" }
            ]
        },
        {
            id: "careers-group",
            label: "Careers",
            icon: Briefcase,
            subItems: [
                { id: "career-listings", label: "Manage Openings", path: "career-listings" },
                { id: "career-applications", label: "View Applications", path: "career-applications" }
            ]
        },
        { id: "reports", label: "Reports & Notifications", icon: Bell },
    ];

    const [expandedItems, setExpandedItems] = useState<string[]>(["courses-group"]);

    const toggleExpand = (id: string) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleNavigation = (path: string) => {
        navigate(`/admin/${path}`);
        if (onNavigate) onNavigate();
    };

    return (
        <div className={`h-full flex flex-col bg-white ${className}`}>
            <div className="p-6 border-b border-border">
                <img
                    src="/logo-v2.png"
                    alt="JK Shah Admin"
                    className="h-10 w-auto object-contain mb-1"
                />
                <p className="text-xs text-muted-foreground">Management Portal</p>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {menuItems.map((item) => {
                        const hasSubItems = 'subItems' in item;
                        const isExpanded = expandedItems.includes(item.id);
                        const isActive = currentPath === item.id || (hasSubItems && item.subItems?.some(s => s.id === currentPath));

                        return (
                            <div key={item.id} className="space-y-1">
                                <Button
                                    variant={isActive && !hasSubItems ? "secondary" : "ghost"}
                                    className={`w-full justify-start ${isActive && !hasSubItems ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground'}`}
                                    onClick={() => {
                                        if (hasSubItems) {
                                            toggleExpand(item.id);
                                        } else {
                                            handleNavigation(item.id);
                                        }
                                    }}
                                >
                                    <item.icon className={`mr-2 h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {hasSubItems && (
                                        isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                                    )}
                                </Button>

                                {hasSubItems && isExpanded && (
                                    <div className="ml-6 space-y-1">
                                        {item.subItems?.map((sub) => {
                                            const isSubActive = currentPath === sub.id;
                                            return (
                                                <Button
                                                    key={sub.id}
                                                    variant={isSubActive ? "secondary" : "ghost"}
                                                    className={`w-full justify-start h-8 text-xs ${isSubActive ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground'}`}
                                                    onClick={() => handleNavigation(sub.path)}
                                                >
                                                    {sub.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                        // Handle logout
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        navigate("/admin/login");
                        window.location.reload(); // Quick reset state
                    }}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}

export function AdminSidebar() {
    return (
        <div className="hidden md:flex w-64 bg-white border-r border-border h-screen flex-col fixed left-0 top-0 z-50">
            <AdminSidebarContent />
        </div>
    );
}

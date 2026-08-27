import { AdminLayout } from "./layout/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { CourseManagement } from "./pages/CourseManagement";
import { FacultyManagement } from "./pages/FacultyManagement";
import { UserManagement } from "./pages/UserManagement";
import { OrderManagement } from "./pages/OrderManagement";
import { LandingPageManagement } from "./pages/LandingPageManagement";
import { Reports } from "./pages/Reports";
import { AnnouncementManagement } from "./pages/AnnouncementManagement";
import { CategoryManagement } from "./pages/CategoryManagement";
import { SubCategoryManagement } from "./pages/SubCategoryManagement";
import { LevelManagement } from "./pages/LevelManagement";
import { FooterManagement } from "./pages/FooterManagement";
import { BranchManagement } from "./pages/BranchManagement";
import { CourseFAQs } from "./pages/CourseFAQs";
import { CourseTestimonials } from "./pages/CourseTestimonials";
import { CourseVideos } from "./pages/CourseVideos";
import { CourseSyllabus } from "./pages/CourseSyllabus";
import { RankManagement } from "./pages/RankManagement";
import { TimelineManagement } from "./pages/TimelineManagement";
import { CareerOpportunityManagement } from "./pages/CareerOpportunityManagement";
import { PlacementManagement } from "./pages/PlacementManagement";
import { JobApplicationManagement } from "./pages/JobApplicationManagement";
import { BlogManagement } from "./pages/BlogManagement";
import { MediaManagement } from "./pages/MediaManagement";
import { CareerListingManagement } from "./pages/CareerListingManagement";
import { CareerApplicationManagement } from "./pages/CareerApplicationManagement";
import { BranchEnquiryManagement } from "./pages/BranchEnquiryManagement";
import { AlumniManagement } from "./pages/AlumniManagement";
import { AlumniWorkAtManagement } from "./pages/AlumniWorkAtManagement";
import { ProductManagement } from "./pages/ProductManagement";
import { ProductFacultyManagement } from "./pages/ProductFacultyManagement";
import { ProductCategoryManagement } from "./pages/ProductCategoryManagement";
import { ProductSubCategoryManagement } from "./pages/ProductSubCategoryManagement";
import { ProductAttributeManagement } from "./pages/ProductAttributeManagement";
import { ERPCoursesManagement } from "./pages/ERPCoursesManagement";
import TimeTableManagement from "./pages/TimeTableManagement";
import { AdmissionsManagement } from "./pages/AdmissionsManagement";
import ErpEnquiriesManagement from "./pages/ErpEnquiriesManagement";
import { Button } from "../components/ui/button";
import { Routes, Route, Navigate } from "react-router-dom";

// Placeholders for other pages
const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-500 mb-4">This module is currently under development.</p>
        <Button>Get Started</Button>
    </div>
);

export function AdminApp() {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const defaultRoute = user?.role === 'timetable_manager' ? 'timetables' : 'dashboard';

    return (
        <AdminLayout>
            <Routes>
                <Route path="/" element={<Navigate to={defaultRoute} replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="erp-enquiries" element={<ErpEnquiriesManagement />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route path="faqs" element={<CourseFAQs />} />
                <Route path="testimonials" element={<CourseTestimonials />} />
                <Route path="videos" element={<CourseVideos />} />
                <Route path="syllabus" element={<CourseSyllabus />} />
                <Route path="rank-holders" element={<RankManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="subcategories" element={<SubCategoryManagement />} />
                <Route path="levels" element={<LevelManagement />} />
                <Route path="timelines" element={<TimelineManagement />} />
                <Route path="career-opps" element={<CareerOpportunityManagement />} />
                <Route path="placements" element={<PlacementManagement />} />
                <Route path="applications" element={<JobApplicationManagement />} />
                <Route path="career-listings" element={<CareerListingManagement />} />
                <Route path="career-applications" element={<CareerApplicationManagement />} />
                <Route path="alumni" element={<AlumniManagement />} />
                <Route path="alumni-work-at" element={<AlumniWorkAtManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="product-faculty" element={<ProductFacultyManagement />} />
                <Route path="product-categories" element={<ProductCategoryManagement />} />
                <Route path="product-subcategories" element={<ProductSubCategoryManagement />} />
                <Route path="product-attributes" element={<ProductAttributeManagement />} />
                <Route path="erp-courses" element={<ERPCoursesManagement />} />
                <Route path="timetables" element={<TimeTableManagement />} />
                <Route path="faculty" element={<FacultyManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="admissions" element={<AdmissionsManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="content" element={<LandingPageManagement />} />
                <Route path="content/footer" element={<FooterManagement />} />
                <Route path="content/branches" element={<BranchManagement />} />
                <Route path="branch-enquiries" element={<BranchEnquiryManagement />} />
                <Route path="media" element={<MediaManagement />} />
                <Route path="blogs" element={<BlogManagement />} />
                <Route path="announcements" element={<AnnouncementManagement />} />
                <Route path="reports" element={<Reports />} />
            </Routes>
        </AdminLayout>
    );
}

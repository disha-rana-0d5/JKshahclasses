import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { CoursesPage } from "./components/CoursesPage";
import { CourseDetailPage } from "./components/CourseDetailPage";
import { BranchLocatorPage } from "./components/BranchLocatorPage";
import { BranchDetailPage } from "./components/BranchDetailPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { CoursePlayerPage } from "./components/CoursePlayerPage";
import { AdminApp } from "./admin/AdminApp";
import { LiveSessionsPage } from "./components/LiveSessionsPage";
import { FacultyShowcase } from "./components/FacultyShowcase";
import { ProfilePage } from "./components/ProfilePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { BookDemoModal } from "./components/modals/BookDemoModal";
import { VideoModal } from "./components/modals/VideoModal";
import { Toaster } from "./components/ui/sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLogin } from "./admin/pages/AdminLogin";
import { RankHoldersPage } from "./components/RankHoldersPage";
import { PrivacyPolicyPage } from "./components/PrivacyPolicyPage";
import { TermsAndConditionsPage } from "./components/TermsAndConditionsPage";
import { RefundPolicyPage } from "./components/RefundPolicyPage";
import { PlacementsPage } from "./components/PlacementsPage";
import { BlogPage } from "./components/BlogPage";
import { BlogDetailPage } from "./components/BlogDetailPage";
import CareersPage from "./components/CareersPage";
import { HistoryPage } from "./components/about/HistoryPage";
import { BottomContactStrip } from "./components/BottomContactStrip";

import { CourseProvider } from "./admin/context/CourseContext";

import { ScrollToTop } from "./components/ScrollToTop";

export default function App() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const location = useLocation();

  // Check if we are in admin or auth routes to hide standard nav/footer
  const hideNavFooter = location.pathname.startsWith("/admin") || location.pathname.startsWith("/login") || location.pathname.startsWith("/signup");

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      <Toaster position="top-center" richColors />
      <CourseProvider>
        {!hideNavFooter && <Navigation />}

        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/category/:categoryId" element={<CoursesPage />} />
            <Route path="/course/:slug" element={<CourseDetailPage />} />
            <Route path="/courses/india/:slug" element={<CourseDetailPage />} />
            <Route path="/courses/foreign/:slug" element={<CourseDetailPage />} />
            <Route path="/branches" element={<BranchLocatorPage />} />
            <Route path="/branch/:slug" element={<BranchDetailPage />} />
            <Route path="/about/history" element={<HistoryPage />} />
            <Route path="/rank-holders" element={<RankHoldersPage />} />
            <Route path="/faculty" element={<FacultyShowcase />} />
            <Route path="/placements" element={<PlacementsPage />} />
            <Route path="/careers" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <CareersPage />
              </ProtectedRoute>
            } />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/live-sessions" element={<LiveSessionsPage />} />
            <Route path="/student-dashboard" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/course-player" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <CoursePlayerPage />
              </ProtectedRoute>
            } />

            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsAndConditionsPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminApp />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </CourseProvider>

      {!hideNavFooter && <Footer />}

      {!hideNavFooter && location.pathname === "/" && <BottomContactStrip />}

      {/* Modals */}
      <BookDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
      <VideoModal
        isOpen={false}
        onClose={() => { }}
        videoTitle="Demo Video"
        videoUrl="https://www.youtube.com/watch?v=utKE30iEZ9Q"
      />

      {/* Floating Action Button for Demo */}
      {/* {!hideNavFooter && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all font-medium flex items-center gap-2 animate-bounce"
          >
            Book a Free Demo
          </button>
        </div>
      )} */}
    </div>
  );
}
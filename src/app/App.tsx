import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { lazy, Suspense } from "react";
import { LandingPage } from "./components/LandingPage";

const CoursesPage = lazy(() => import("./components/CoursesPage").then(m => ({ default: m.CoursesPage })));
const CoursePage1 = lazy(() => import("./components/CoursePage1").then(m => ({ default: m.CoursePage1 })));
const CourseDetailPage = lazy(() => import("./components/CourseDetailPage").then(m => ({ default: m.CourseDetailPage })));
const BranchLocatorPage = lazy(() => import("./components/BranchLocatorPage").then(m => ({ default: m.BranchLocatorPage })));
const BranchDetailPage = lazy(() => import("./components/BranchDetailPage").then(m => ({ default: m.BranchDetailPage })));
const StudentDashboard = lazy(() => import("./components/StudentDashboard").then(m => ({ default: m.StudentDashboard })));
const CoursePlayerPage = lazy(() => import("./components/CoursePlayerPage").then(m => ({ default: m.CoursePlayerPage })));
const AdminApp = lazy(() => import("./admin/AdminApp").then(m => ({ default: m.AdminApp })));
const LiveSessionsPage = lazy(() => import("./components/LiveSessionsPage").then(m => ({ default: m.LiveSessionsPage })));
const FacultyShowcase = lazy(() => import("./components/FacultyShowcase").then(m => ({ default: m.FacultyShowcase })));
const ProfilePage = lazy(() => import("./components/ProfilePage").then(m => ({ default: m.ProfilePage })));
const LoginPage = lazy(() => import("./pages/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("./pages/auth/SignupPage").then(m => ({ default: m.SignupPage })));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword").then(m => ({ default: m.ResetPassword })));
import { BookDemoModal } from "./components/modals/BookDemoModal";
import { VideoModal } from "./components/modals/VideoModal";
import { Toaster } from "./components/ui/sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
const AdminLogin = lazy(() => import("./admin/pages/AdminLogin").then(m => ({ default: m.AdminLogin })));
const RankHoldersPage = lazy(() => import("./components/RankHoldersPage").then(m => ({ default: m.RankHoldersPage })));
const PrivacyPolicyPage = lazy(() => import("./components/PrivacyPolicyPage").then(m => ({ default: m.PrivacyPolicyPage })));
const TermsAndConditionsPage = lazy(() => import("./components/TermsAndConditionsPage").then(m => ({ default: m.TermsAndConditionsPage })));
const RefundPolicyPage = lazy(() => import("./components/RefundPolicyPage").then(m => ({ default: m.RefundPolicyPage })));
const PlacementsPage = lazy(() => import("./components/PlacementsPage").then(m => ({ default: m.PlacementsPage })));
const BlogPage = lazy(() => import("./components/BlogPage").then(m => ({ default: m.BlogPage })));
const BlogDetailPage = lazy(() => import("./components/BlogDetailPage").then(m => ({ default: m.BlogDetailPage })));
const CareersPage = lazy(() => import("./components/CareersPage"));
const HistoryPage = lazy(() => import("./components/about/HistoryPage").then(m => ({ default: m.HistoryPage })));
const CSRPage = lazy(() => import("./components/about/CSRPage").then(m => ({ default: m.CSRPage })));
const AlumniPage = lazy(() => import("./components/AlumniPage").then(m => ({ default: m.AlumniPage })));
import { BottomContactStrip } from "./components/BottomContactStrip";
const ResourcesPage = lazy(() => import("./components/ResourcesPage").then(m => ({ default: m.ResourcesPage })));
const BooksPage = lazy(() => import("./components/BooksPage").then(m => ({ default: m.BooksPage })));
const TestSeriesPage = lazy(() => import("./components/TestSeriesPage").then(m => ({ default: m.TestSeriesPage })));
const BookDetailPage = lazy(() => import("./components/BookDetailPage").then(m => ({ default: m.BookDetailPage })));
const AnnouncementsPage = lazy(() => import("./components/AnnouncementsPage").then(m => ({ default: m.AnnouncementsPage })));
const CheckoutPage = lazy(() => import("./components/CheckoutPage").then(m => ({ default: m.CheckoutPage })));

import { CourseProvider } from "./admin/context/CourseContext";

import { ScrollToTop } from "./components/ScrollToTop";
import { CartProvider } from "./context/CartContext";

export default function App() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Remove the initial-loader overlay once React hydrates
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.style.opacity = "0";
      loader.style.transition = "opacity 0.5s ease-out";
      setTimeout(() => {
        loader.remove();
      }, 500);
    }
  }, []);


  // Check if we are in admin or auth routes to hide standard nav/footer
  const hideNavFooter = location.pathname.startsWith("/admin") || location.pathname.startsWith("/login") || location.pathname.startsWith("/signup");

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      <Toaster position="top-center" richColors />
      <CourseProvider>
        <CartProvider>
          {!hideNavFooter && <Navigation />}

          <main>
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses1" element={<CoursePage1 />} />
                <Route path="/courses/category/:categoryId" element={<CoursesPage />} />
                <Route path="/course/:slug" element={<CourseDetailPage />} />
                <Route path="/courses/india/:slug" element={<CourseDetailPage />} />
                <Route path="/courses/foreign/:slug" element={<CourseDetailPage />} />
                <Route path="/branches" element={<BranchLocatorPage />} />
                <Route path="/branch/:slug" element={<BranchDetailPage />} />
                <Route path="/about/history" element={<HistoryPage />} />
                <Route path="/about/csr" element={<CSRPage />} />
                <Route path="/ourachievers" element={<RankHoldersPage />} />
                <Route path="/alumni" element={<AlumniPage />} />
                <Route path="/faculty" element={<FacultyShowcase />} />
                <Route path="/placements" element={<PlacementsPage />} />
                <Route path="/careers" element={<CareersPage />} />
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
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/resources/books" element={<BooksPage />} />
                <Route path="/resources/test-series" element={<TestSeriesPage />} />
                <Route path="/resources/test-series/:slug" element={<BookDetailPage />} />
                <Route path="/resources/books/:slug" element={<BookDetailPage />} />
                <Route path="/resources/announcements" element={<AnnouncementsPage />} />
                <Route path="/checkout" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />

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
            </Suspense>
          </main>
        </CartProvider>
      </CourseProvider>

      {!hideNavFooter && <Footer />}

      {!hideNavFooter && <BottomContactStrip />}

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
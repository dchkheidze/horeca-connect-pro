import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Public Pages
import LandingPage from "@/pages/LandingPage";
import SuppliersPage from "@/pages/SuppliersPage";
import SupplierProfilePage from "@/pages/SupplierProfilePage";
import ServiceProvidersPage from "@/pages/ServiceProvidersPage";
import ServiceProviderProfilePage from "@/pages/ServiceProviderProfilePage";
import JobsPage from "@/pages/JobsPage";
import JobDetailPage from "@/pages/JobDetailPage";
import BlogPage from "@/pages/BlogPage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardRedirect from "@/pages/DashboardRedirect";

// Dashboard Pages
import RestaurantDashboard from "@/pages/dashboards/RestaurantDashboard";
import RestaurantJobs from "@/pages/restaurant/RestaurantJobs";
import RestaurantProfileEdit from "@/pages/restaurant/RestaurantProfileEdit";
import RestaurantApplications from "@/pages/restaurant/RestaurantApplications";
import RestaurantRFQs from "@/pages/restaurant/RestaurantRFQs";
import SupplierDashboard from "@/pages/dashboards/SupplierDashboard";
import SupplierProfileEdit from "@/pages/supplier/SupplierProfileEdit";
import SupplierOffers from "@/pages/supplier/SupplierOffers";
import SupplierRFQs from "@/pages/supplier/SupplierRFQs";
import ServiceProviderDashboard from "@/pages/dashboards/ServiceProviderDashboard";
import ServiceProviderProfileEdit from "@/pages/serviceprovider/ServiceProviderProfileEdit";
import ServiceProviderOffers from "@/pages/serviceprovider/ServiceProviderOffers";
import ServiceProviderRFQs from "@/pages/serviceprovider/ServiceProviderRFQs";
import JobSeekerDashboard from "@/pages/dashboards/JobSeekerDashboard";
import JobSeekerProfile from "@/pages/jobseeker/JobSeekerProfile";
import JobSeekerApplications from "@/pages/jobseeker/JobSeekerApplications";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminModeration from "@/pages/admin/AdminModeration";
import AdminContent from "@/pages/admin/AdminContent";
import AdminCategories from "@/pages/admin/AdminCategories";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes with layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/suppliers/:slug" element={<SupplierProfilePage />} />
              <Route path="/service-providers" element={<ServiceProvidersPage />} />
              <Route path="/service-providers/:slug" element={<ServiceProviderProfilePage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:slug" element={<JobDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
            </Route>

            {/* Auth routes (no layout) */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Restaurant dashboard routes (protected) */}
            <Route
              path="/r"
              element={
                <ProtectedRoute allowedRoles={["restaurant"]}>
                  <DashboardLayout role="restaurant" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<RestaurantDashboard />} />
              <Route path="rfqs" element={<RestaurantRFQs />} />
              <Route path="hr/jobs" element={<RestaurantJobs />} />
              <Route path="hr/applications" element={<RestaurantApplications />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="settings" element={<RestaurantProfileEdit />} />
            </Route>

            {/* Supplier dashboard routes (protected) */}
            <Route
              path="/s"
              element={
                <ProtectedRoute allowedRoles={["supplier"]}>
                  <DashboardLayout role="supplier" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<SupplierDashboard />} />
              <Route path="profile" element={<SupplierProfileEdit />} />
              <Route path="offers" element={<SupplierOffers />} />
              <Route path="rfqs" element={<SupplierRFQs />} />
              <Route path="settings" element={<div className="p-4">Settings - Coming Soon</div>} />
            </Route>

            {/* Service Provider dashboard routes (protected) */}
            <Route
              path="/sp"
              element={
                <ProtectedRoute allowedRoles={["serviceprovider"]}>
                  <DashboardLayout role="serviceprovider" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<ServiceProviderDashboard />} />
              <Route path="profile" element={<ServiceProviderProfileEdit />} />
              <Route path="offers" element={<ServiceProviderOffers />} />
              <Route path="rfqs" element={<ServiceProviderRFQs />} />
              <Route path="settings" element={<div className="p-4">Settings - Coming Soon</div>} />
            </Route>

            {/* Job Seeker dashboard routes (protected) */}
            <Route
              path="/j"
              element={
                <ProtectedRoute allowedRoles={["jobseeker"]}>
                  <DashboardLayout role="jobseeker" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<JobSeekerDashboard />} />
              <Route path="applications" element={<JobSeekerApplications />} />
              <Route path="profile" element={<JobSeekerProfile />} />
              <Route path="settings" element={<div className="p-4">Settings - Coming Soon</div>} />
            </Route>

            {/* Admin routes (protected - admin only) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

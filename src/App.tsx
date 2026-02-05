import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Public Pages
import LandingPage from "@/pages/LandingPage";
import SuppliersPage from "@/pages/SuppliersPage";
import SupplierProfilePage from "@/pages/SupplierProfilePage";
import JobsPage from "@/pages/JobsPage";
import JobDetailPage from "@/pages/JobDetailPage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardRedirect from "@/pages/DashboardRedirect";

// Dashboard Pages
import RestaurantDashboard from "@/pages/dashboards/RestaurantDashboard";
import SupplierDashboard from "@/pages/dashboards/SupplierDashboard";
import SupplierProfileEdit from "@/pages/supplier/SupplierProfileEdit";
import SupplierOffers from "@/pages/supplier/SupplierOffers";
import JobSeekerDashboard from "@/pages/dashboards/JobSeekerDashboard";

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
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:slug" element={<JobDetailPage />} />
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
              <Route path="suppliers" element={<div className="p-4">Supplier Management - Coming Soon</div>} />
              <Route path="jobs" element={<div className="p-4">Job Postings - Coming Soon</div>} />
              <Route path="settings" element={<div className="p-4">Settings - Coming Soon</div>} />
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
              <Route path="applications" element={<div className="p-4">Applications - Coming Soon</div>} />
              <Route path="profile" element={<div className="p-4">Profile - Coming Soon</div>} />
              <Route path="settings" element={<div className="p-4">Settings - Coming Soon</div>} />
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

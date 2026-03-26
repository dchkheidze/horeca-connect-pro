import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("restaurant" | "supplier" | "jobseeker")[];
}

const ROLE_DASHBOARDS: Record<string, string> = {
  restaurant: "/r/dashboard",
  supplier: "/s/dashboard",
  jobseeker: "/j/dashboard",
  admin: "/admin/dashboard",
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // Wait until auth + role are both resolved before making any routing decision
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not logged in — send to login, preserving the intended destination
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // FIX 1: user exists but role is null (user_roles insert failed during signup,
  // or email not yet confirmed). Send to onboarding to recover gracefully
  // instead of silently rendering a broken dashboard.
  if (!role) {
    return <Navigate to="/onboarding" replace />;
  }

  // FIX 2: Admins should never land on role-specific dashboards (/r, /s, /j)
  // because they have no restaurant/supplier/jobseeker row — the dashboard
  // would be empty. Previously the admin check set userRole=null which
  // bypassed the allowedRoles check entirely, letting admins render broken pages.
  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Correct role but wrong section — redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={ROLE_DASHBOARDS[role] || "/dashboard"} replace />;
  }

  return <>{children}</>;
}

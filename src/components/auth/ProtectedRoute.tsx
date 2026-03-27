import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("restaurant" | "supplier" | "jobseeker" | "serviceprovider")[];
}

const ROLE_DASHBOARDS: Record<string, string> = {
  restaurant: "/r/dashboard",
  supplier: "/s/dashboard",
  serviceprovider: "/sp/dashboard",
  jobseeker: "/j/dashboard",
  admin: "/admin/dashboard",
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!role) {
    return <Navigate to="/onboarding" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Check if user has ANY of the allowed roles
  if (allowedRoles && !allowedRoles.some((r) => roles.includes(r))) {
    return <Navigate to={ROLE_DASHBOARDS[role] || "/dashboard"} replace />;
  }

  return <>{children}</>;
}

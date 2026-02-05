import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("restaurant" | "supplier" | "jobseeker")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login, saving the attempted URL
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Get the non-admin role for comparison
  const userRole = role === "admin" ? null : role;

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // User doesn't have the required role, redirect to their dashboard
    const roleRedirects: Record<string, string> = {
      restaurant: "/r/dashboard",
      supplier: "/s/dashboard",
      jobseeker: "/j/dashboard",
    };
    return <Navigate to={roleRedirects[userRole] || "/dashboard"} replace />;
  }

  return <>{children}</>;
}

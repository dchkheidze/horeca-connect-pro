import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardRedirect() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (role) {
      const roleRedirects = {
        restaurant: "/r/dashboard",
        supplier: "/s/dashboard",
        jobseeker: "/j/dashboard",
      };
      navigate(roleRedirects[role], { replace: true });
    }
  }, [user, role, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-muted-foreground">Loading your dashboard...</div>
      </div>
    </div>
  );
}

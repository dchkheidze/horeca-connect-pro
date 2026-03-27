import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardRedirect() {
  const navigate = useNavigate();
  const { user, role, roles, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!role) return;

    const checkProfileAndRedirect = async () => {
      // Check all roles for missing profiles
      let anyMissing = false;

      for (const r of roles) {
        if (r === "admin") continue;
        let exists = false;
        if (r === "restaurant") {
          const { data } = await supabase.from("restaurants").select("id").eq("owner_user_id", user.id).maybeSingle();
          exists = !!data;
        } else if (r === "supplier") {
          const { data } = await supabase.from("suppliers").select("id").eq("owner_user_id", user.id).maybeSingle();
          exists = !!data;
        } else if (r === "serviceprovider") {
          const { data } = await supabase.from("service_providers").select("id").eq("owner_user_id", user.id).maybeSingle();
          exists = !!data;
        } else if (r === "jobseeker") {
          const { data } = await supabase.from("job_seekers").select("id").eq("user_id", user.id).maybeSingle();
          exists = !!data;
        }
        if (!exists) {
          anyMissing = true;
          break;
        }
      }

      if (anyMissing) {
        navigate("/onboarding", { replace: true });
        return;
      }

      const roleRedirects: Record<string, string> = {
        restaurant: "/r/dashboard",
        supplier: "/s/dashboard",
        serviceprovider: "/sp/dashboard",
        jobseeker: "/j/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(roleRedirects[role] || "/dashboard", { replace: true });
    };

    checkProfileAndRedirect();
  }, [user, role, roles, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-muted-foreground">Loading your dashboard...</div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardRedirect() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!role) return;

    // Check if profile exists for this role
    const checkProfileAndRedirect = async () => {
      let profileExists = false;

      if (role === "restaurant") {
        const { data } = await supabase
          .from("restaurants")
          .select("id")
          .eq("owner_user_id", user.id)
          .maybeSingle();
        profileExists = !!data;
      } else if (role === "supplier") {
        const { data } = await supabase
          .from("suppliers")
          .select("id")
          .eq("owner_user_id", user.id)
          .maybeSingle();
        profileExists = !!data;
      } else if (role === "serviceprovider") {
        const { data } = await supabase
          .from("service_providers")
          .select("id")
          .eq("owner_user_id", user.id)
          .maybeSingle();
        profileExists = !!data;
      } else if (role === "jobseeker") {
        const { data } = await supabase
          .from("job_seekers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        profileExists = !!data;
      }

      if (!profileExists) {
        // Redirect to onboarding
        navigate("/onboarding", { replace: true });
        return;
      }

      // Redirect to appropriate dashboard
      const roleRedirects: Record<string, string> = {
        restaurant: "/r/dashboard",
        supplier: "/s/dashboard",
        serviceprovider: "/sp/dashboard",
        jobseeker: "/j/dashboard",
      };
      navigate(roleRedirects[role], { replace: true });
    };

    checkProfileAndRedirect();
  }, [user, role, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-muted-foreground">Loading your dashboard...</div>
      </div>
    </div>
  );
}

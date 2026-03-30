import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantOnboarding } from "@/components/onboarding/RestaurantOnboarding";
import { SupplierOnboarding } from "@/components/onboarding/SupplierOnboarding";
import { ServiceProviderOnboarding } from "@/components/onboarding/ServiceProviderOnboarding";
import { JobSeekerOnboarding } from "@/components/onboarding/JobSeekerOnboarding";
import { RealEstateOnboarding } from "@/components/onboarding/RealEstateOnboarding";

export default function OnboardingPage() {
  const { user, roles, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [fullName, setFullName] = useState("");
  // Track which role onboarding steps still need to be completed
  const [pendingRoles, setPendingRoles] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (roles.length === 0) return;

    const checkProfiles = async () => {
      setCheckingProfile(true);

      // Get user's full name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      if (profileData?.full_name) {
        setFullName(profileData.full_name);
      }

      const missing: string[] = [];

      for (const r of roles) {
        if (r === "admin") continue;

        let exists = false;
        if (r === "restaurant") {
          const { data } = await supabase
            .from("restaurants")
            .select("id")
            .eq("owner_user_id", user.id)
            .maybeSingle();
          exists = !!data;
        } else if (r === "supplier") {
          const { data } = await supabase
            .from("suppliers")
            .select("id")
            .eq("owner_user_id", user.id)
            .maybeSingle();
          exists = !!data;
        } else if (r === "serviceprovider") {
          const { data } = await supabase
            .from("service_providers")
            .select("id")
            .eq("owner_user_id", user.id)
            .maybeSingle();
          exists = !!data;
        } else if (r === "jobseeker") {
          const { data } = await supabase
            .from("job_seekers")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();
          exists = !!data;
        } else if (r === "realestate") {
          const { data } = await supabase
            .from("real_estate_agents")
            .select("id")
            .eq("owner_user_id", user.id)
            .maybeSingle();
          exists = !!data;
        }

        if (!exists) missing.push(r);
      }

      if (missing.length === 0) {
        // All profiles exist, redirect to first role's dashboard
        const primaryRole = roles.find((r) => r !== "admin") || roles[0];
        const roleRedirects: Record<string, string> = {
          restaurant: "/r/dashboard",
          supplier: "/s/dashboard",
          serviceprovider: "/sp/dashboard",
          jobseeker: "/j/dashboard",
        };
        navigate(roleRedirects[primaryRole] || "/dashboard", { replace: true });
        return;
      }

      setPendingRoles(missing);
      setCurrentStepIndex(0);
      setCheckingProfile(false);
    };

    checkProfiles();
  }, [user, roles, authLoading, navigate]);

  const handleStepComplete = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= pendingRoles.length) {
      // All onboarding done — redirect
      const primaryRole = roles.find((r) => r !== "admin") || roles[0];
      const roleRedirects: Record<string, string> = {
        restaurant: "/r/dashboard",
        supplier: "/s/dashboard",
        serviceprovider: "/sp/dashboard",
        jobseeker: "/j/dashboard",
      };
      navigate(roleRedirects[primaryRole] || "/dashboard", { replace: true });
    } else {
      setCurrentStepIndex(nextIndex);
    }
  };

  if (authLoading || checkingProfile || !user || roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const currentRole = pendingRoles[currentStepIndex];
  const totalSteps = pendingRoles.length;

  const roleTitles: Record<string, string> = {
    restaurant: "Restaurant",
    supplier: "Supplier",
    serviceprovider: "Service Provider",
    jobseeker: "Job Seeker",
  };

  return (
    <div className="min-h-screen bg-secondary/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <span className="text-xl font-bold text-primary-foreground">H</span>
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            {totalSteps > 1
              ? `Step ${currentStepIndex + 1} of ${totalSteps}: Set up your ${roleTitles[currentRole]} profile`
              : "Help us personalize your experience"}
          </p>
        </div>

        {currentRole === "restaurant" && (
          <RestaurantOnboarding userId={user.id} onComplete={handleStepComplete} />
        )}

        {currentRole === "supplier" && (
          <SupplierOnboarding userId={user.id} onComplete={handleStepComplete} />
        )}

        {currentRole === "serviceprovider" && (
          <ServiceProviderOnboarding userId={user.id} onComplete={handleStepComplete} />
        )}

        {currentRole === "jobseeker" && (
          <JobSeekerOnboarding
            userId={user.id}
            fullName={fullName}
            onComplete={handleStepComplete}
          />
        )}
      </div>
    </div>
  );
}

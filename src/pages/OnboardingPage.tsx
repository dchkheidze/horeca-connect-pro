import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RestaurantOnboarding } from "@/components/onboarding/RestaurantOnboarding";
import { SupplierOnboarding } from "@/components/onboarding/SupplierOnboarding";
import { ServiceProviderOnboarding } from "@/components/onboarding/ServiceProviderOnboarding";
import { JobSeekerOnboarding } from "@/components/onboarding/JobSeekerOnboarding";

export default function OnboardingPage() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!role) {
      // Wait for role to load
      return;
    }

    // Check if profile already exists
    const checkProfile = async () => {
      setCheckingProfile(true);

      // Get user's full name from profiles table
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      if (profileData?.full_name) {
        setFullName(profileData.full_name);
      }

      let exists = false;

      if (role === "restaurant") {
        const { data } = await supabase
          .from("restaurants")
          .select("id")
          .eq("owner_user_id", user.id)
          .maybeSingle();
        exists = !!data;
      } else if (role === "supplier") {
        const { data } = await supabase
          .from("suppliers")
          .select("id")
          .eq("owner_user_id", user.id)
          .maybeSingle();
        exists = !!data;
      } else if (role === "serviceprovider") {
        const { data } = await supabase
          .from("service_providers")
          .select("id")
          .eq("owner_user_id", user.id)
          .maybeSingle();
        exists = !!data;
      } else if (role === "jobseeker") {
        const { data } = await supabase
          .from("job_seekers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        exists = !!data;
      }

      if (exists) {
        // Profile exists, redirect to dashboard
        const roleRedirects: Record<string, string> = {
          restaurant: "/r/dashboard",
          supplier: "/s/dashboard",
          serviceprovider: "/sp/dashboard",
          jobseeker: "/j/dashboard",
        };
        navigate(roleRedirects[role], { replace: true });
        return;
      }

      setProfileExists(false);
      setCheckingProfile(false);
    };

    checkProfile();
  }, [user, role, authLoading, navigate]);

  const handleComplete = () => {
    if (!role) return;

    const roleRedirects: Record<string, string> = {
      restaurant: "/r/dashboard",
      supplier: "/s/dashboard",
      serviceprovider: "/sp/dashboard",
      jobseeker: "/j/dashboard",
    };
    navigate(roleRedirects[role], { replace: true });
  };

  if (authLoading || checkingProfile || !user || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

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
            Help us personalize your experience
          </p>
        </div>

        {role === "restaurant" && (
          <RestaurantOnboarding userId={user.id} onComplete={handleComplete} />
        )}

        {role === "supplier" && (
          <SupplierOnboarding userId={user.id} onComplete={handleComplete} />
        )}

        {role === "serviceprovider" && (
          <ServiceProviderOnboarding userId={user.id} onComplete={handleComplete} />
        )}

        {role === "jobseeker" && (
          <JobSeekerOnboarding 
            userId={user.id} 
            fullName={fullName}
            onComplete={handleComplete} 
          />
        )}
      </div>
    </div>
  );
}

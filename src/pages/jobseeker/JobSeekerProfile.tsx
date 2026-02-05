import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Eye, EyeOff, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type VisibilityStatus = Database["public"]["Enums"]["visibility_status"];

const JOB_CATEGORIES = [
  "Chef / Cook",
  "Sous Chef",
  "Pastry Chef",
  "Line Cook",
  "Server / Waiter",
  "Bartender",
  "Host / Hostess",
  "Restaurant Manager",
  "Sommelier",
  "Dishwasher",
  "Barista",
  "Catering",
  "Hotel Front Desk",
  "Housekeeping",
  "Events Coordinator",
];

const SCHEDULE_TYPES = [
  "Full-time",
  "Part-time",
  "Weekends Only",
  "Evenings Only",
  "Flexible",
  "Contract",
  "Seasonal",
];

interface ProfileData {
  id: string;
  full_name: string;
  title: string | null;
  city: string | null;
  phone: string | null;
  about: string | null;
  job_categories: string[] | null;
  schedule_types: string[] | null;
  visibility_status: VisibilityStatus;
}

export default function JobSeekerProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    title: "",
    city: "",
    phone: "",
    about: "",
    job_categories: [] as string[],
    schedule_types: [] as string[],
    visibility_status: "PRIVATE" as VisibilityStatus,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("job_seekers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } else if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          title: data.title || "",
          city: data.city || "",
          phone: data.phone || "",
          about: data.about || "",
          job_categories: data.job_categories || [],
          schedule_types: data.schedule_types || [],
          visibility_status: data.visibility_status || "PRIVATE",
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);

    const { error } = await supabase
      .from("job_seekers")
      .update({
        full_name: formData.full_name,
        title: formData.title || null,
        city: formData.city || null,
        phone: formData.phone || null,
        about: formData.about || null,
        job_categories: formData.job_categories,
        schedule_types: formData.schedule_types,
        visibility_status: formData.visibility_status,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      job_categories: prev.job_categories.includes(category)
        ? prev.job_categories.filter((c) => c !== category)
        : [...prev.job_categories, category],
    }));
  };

  const toggleSchedule = (schedule: string) => {
    setFormData((prev) => ({
      ...prev,
      schedule_types: prev.schedule_types.includes(schedule)
        ? prev.schedule_types.filter((s) => s !== schedule)
        : [...prev.schedule_types, schedule],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No profile found. Please complete onboarding.</p>
        <Button className="mt-4" onClick={() => navigate("/onboarding")}>
          Go to Onboarding
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold lg:text-3xl">My Profile</h1>
          <p className="text-muted-foreground">Manage your candidate profile and preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visibility Toggle */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Visibility</CardTitle>
            <CardDescription>
              Control whether restaurants can discover your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {formData.visibility_status === "PUBLIC" ? (
                  <Eye className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.visibility_status === "PUBLIC"
                      ? "Restaurants can find and contact you"
                      : "Your profile is only visible to you"}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.visibility_status === "PUBLIC"}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    visibility_status: checked ? "PUBLIC" : "PRIVATE",
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Experienced Chef, Restaurant Manager"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">About Me</Label>
              <Textarea
                id="about"
                value={formData.about}
                onChange={(e) => setFormData((prev) => ({ ...prev, about: e.target.value }))}
                rows={4}
                placeholder="Tell employers about your experience, skills, and what you're looking for..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Interested Positions</CardTitle>
            <CardDescription>Select the types of positions you're interested in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {JOB_CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={formData.job_categories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                  {formData.job_categories.includes(category) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Preferences</CardTitle>
            <CardDescription>What kind of schedule works for you?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SCHEDULE_TYPES.map((schedule) => (
                <Badge
                  key={schedule}
                  variant={formData.schedule_types.includes(schedule) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSchedule(schedule)}
                >
                  {schedule}
                  {formData.schedule_types.includes(schedule) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !formData.full_name.trim()}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

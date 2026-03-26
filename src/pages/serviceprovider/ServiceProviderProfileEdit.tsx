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

const CATEGORY_OPTIONS = [
  "Consulting", "Cleaning", "Maintenance", "IT & Technology",
  "Marketing & Design", "Staffing & Recruitment", "Accounting & Finance",
  "Legal Services", "Training & Development", "Pest Control",
  "Interior Design", "Photography & Video",
];

const COVERAGE_AREAS = [
  "Local", "Regional", "National", "International",
  "Europe", "North America", "Asia Pacific",
];

interface ServiceProviderData {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  categories: string[];
  coverage_areas: string[];
  is_published: boolean;
}

export default function ServiceProviderProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<ServiceProviderData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    website: "",
    description: "",
    categories: [] as string[],
    coverage_areas: [] as string[],
    is_published: false,
  });

  useEffect(() => {
    const fetchProvider = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching service provider:", error);
        toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
      } else if (data) {
        setProvider(data);
        setFormData({
          name: data.name || "",
          city: data.city || "",
          address: data.address || "",
          phone: data.phone || "",
          website: data.website || "",
          description: data.description || "",
          categories: data.categories || [],
          coverage_areas: data.coverage_areas || [],
          is_published: data.is_published || false,
        });
      }
      setLoading(false);
    };

    fetchProvider();
  }, [user, toast]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    setSaving(true);

    const { error } = await supabase
      .from("service_providers")
      .update({
        name: formData.name,
        slug: generateSlug(formData.name),
        city: formData.city || null,
        address: formData.address || null,
        phone: formData.phone || null,
        website: formData.website || null,
        description: formData.description || null,
        categories: formData.categories,
        coverage_areas: formData.coverage_areas,
        is_published: formData.is_published,
      })
      .eq("id", provider.id);

    setSaving(false);

    if (error) {
      console.error("Error updating service provider:", error);
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Profile updated successfully" });
    }
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleCoverageArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      coverage_areas: prev.coverage_areas.includes(area)
        ? prev.coverage_areas.filter((a) => a !== area)
        : [...prev.coverage_areas, area],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No service provider profile found. Please complete onboarding.</p>
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
          <h1 className="font-heading text-2xl font-bold lg:text-3xl">Edit Profile</h1>
          <p className="text-muted-foreground">Update your service provider profile and visibility settings.</p>
        </div>
        <div className="flex items-center gap-2">
          {provider.is_published && (
            <Button variant="outline" asChild>
              <a href={`/service-providers/${provider.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                View Public Profile
              </a>
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
            <CardDescription>Control whether your profile is visible in the public directory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {formData.is_published ? (
                  <Eye className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_published
                      ? "Your profile is visible to everyone"
                      : "Your profile is hidden from the directory"}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_published: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="www.example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                placeholder="Describe your company, products, and services..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Select the categories that best describe your services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((category) => (
                <Badge
                  key={category}
                  variant={formData.categories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                  {formData.categories.includes(category) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage Areas</CardTitle>
            <CardDescription>Where do you provide services?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COVERAGE_AREAS.map((area) => (
                <Badge
                  key={area}
                  variant={formData.coverage_areas.includes(area) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCoverageArea(area)}
                >
                  {area}
                  {formData.coverage_areas.includes(area) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
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

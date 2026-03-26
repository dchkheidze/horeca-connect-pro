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

const CUISINE_TAGS = [
  "Italian", "French", "Japanese", "Chinese", "Mexican", "Indian",
  "Thai", "Mediterranean", "American", "Korean", "Vietnamese", "Greek",
  "Spanish", "Middle Eastern", "Brazilian", "Fusion", "Seafood", "Steakhouse",
  "Vegetarian", "Vegan", "Farm-to-Table", "Fine Dining", "Casual", "Fast Casual",
];

const PRICE_LEVELS = [
  { value: 1, label: "$", description: "Budget-friendly" },
  { value: 2, label: "$$", description: "Moderate" },
  { value: 3, label: "$$$", description: "Upscale" },
  { value: 4, label: "$$$$", description: "Fine dining" },
];

interface RestaurantData {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  cuisine_tags: string[] | null;
  price_level: number | null;
  is_published: boolean | null;
}

export default function RestaurantProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    website: "",
    description: "",
    cuisine_tags: [] as string[],
    price_level: null as number | null,
    is_published: false,
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching restaurant:", error);
        toast({
          title: "Error",
          description: "Failed to load restaurant profile",
          variant: "destructive",
        });
      } else if (data) {
        setRestaurant(data);
        setFormData({
          name: data.name || "",
          city: data.city || "",
          address: data.address || "",
          phone: data.phone || "",
          website: data.website || "",
          description: data.description || "",
          cuisine_tags: data.cuisine_tags || [],
          price_level: data.price_level,
          is_published: data.is_published || false,
        });
      }
      setLoading(false);
    };

    fetchRestaurant();
  }, [user, toast]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setSaving(true);

    const slug = generateSlug(formData.name);

    const { error } = await supabase
      .from("restaurants")
      .update({
        name: formData.name,
        slug,
        city: formData.city || null,
        address: formData.address || null,
        phone: formData.phone || null,
        website: formData.website || null,
        description: formData.description || null,
        cuisine_tags: formData.cuisine_tags,
        price_level: formData.price_level,
        is_published: formData.is_published,
      })
      .eq("id", restaurant.id);

    setSaving(false);

    if (error) {
      console.error("Error updating restaurant:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Restaurant profile updated successfully",
      });
    }
  };

  const toggleCuisineTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisine_tags: prev.cuisine_tags.includes(tag)
        ? prev.cuisine_tags.filter((t) => t !== tag)
        : [...prev.cuisine_tags, tag],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No restaurant profile found. Please complete onboarding.</p>
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
          <h1 className="font-heading text-2xl font-bold lg:text-3xl">Restaurant Profile</h1>
          <p className="text-muted-foreground">Update your restaurant details and visibility settings.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visibility Toggle */}
        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
            <CardDescription>
              Control whether your restaurant is visible in the public directory
            </CardDescription>
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
                      ? "Your restaurant is visible to everyone"
                      : "Your restaurant is hidden from the directory"}
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

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
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
                placeholder="Describe your restaurant, cuisine, and atmosphere..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Cuisine Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Cuisine & Style</CardTitle>
            <CardDescription>Select the cuisine types that describe your restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={formData.cuisine_tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCuisineTag(tag)}
                >
                  {tag}
                  {formData.cuisine_tags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Level */}
        <Card>
          <CardHeader>
            <CardTitle>Price Level</CardTitle>
            <CardDescription>What's your restaurant's price range?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRICE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      price_level: prev.price_level === level.value ? null : level.value,
                    }))
                  }
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    formData.price_level === level.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-heading text-xl font-bold">{level.label}</div>
                  <div className="text-xs text-muted-foreground">{level.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
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

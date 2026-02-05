import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const cuisineTags = [
  "Italian", "French", "Japanese", "Chinese", "Mexican", "Indian",
  "Thai", "Mediterranean", "American", "Korean", "Vietnamese", "Greek",
  "Spanish", "Middle Eastern", "Brazilian", "Fusion", "Seafood", "Steakhouse",
  "Vegetarian", "Vegan", "Farm-to-Table", "Fine Dining", "Casual", "Fast Casual"
];

const priceLevels = [
  { value: 1, label: "$", description: "Budget-friendly" },
  { value: 2, label: "$$", description: "Moderate" },
  { value: 3, label: "$$$", description: "Upscale" },
  { value: 4, label: "$$$$", description: "Fine dining" },
];

interface RestaurantOnboardingProps {
  userId: string;
  onComplete: () => void;
}

export function RestaurantOnboarding({ userId, onComplete }: RestaurantOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    website: "",
    description: "",
    cuisineTags: [] as string[],
    priceLevel: null as number | null,
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const toggleCuisineTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisineTags: prev.cuisineTags.includes(tag)
        ? prev.cuisineTags.filter((t) => t !== tag)
        : [...prev.cuisineTags, tag],
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      toast({ variant: "destructive", title: "Restaurant name is required" });
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    // Generate slug from restaurant name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

    const { error } = await supabase.from("restaurants").insert({
      owner_user_id: userId,
      name: formData.name,
      slug: slug,
      city: formData.city || null,
      address: formData.address || null,
      phone: formData.phone || null,
      website: formData.website || null,
      description: formData.description || null,
      cuisine_tags: formData.cuisineTags,
      price_level: formData.priceLevel,
      is_published: false,
    });

    setLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    toast({ title: "Profile created!", description: "Welcome to HoReCa Hub" });
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <Progress value={progress} className="h-2 mb-4" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>Restaurant Profile</span>
        </div>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Restaurant Information</h2>
                <p className="text-muted-foreground">Tell us about your restaurant</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Your Restaurant Name"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="city"
                        placeholder="City"
                        className="pl-10"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      placeholder="www.yourrestaurant.com"
                      className="pl-10"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your restaurant..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Cuisine & Style</h2>
                <p className="text-muted-foreground">Help suppliers understand your restaurant</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Cuisine Tags</Label>
                  <p className="text-sm text-muted-foreground">Select all that apply</p>
                  <div className="flex flex-wrap gap-2">
                    {cuisineTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={formData.cuisineTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleCuisineTag(tag)}
                      >
                        {tag}
                        {formData.cuisineTags.includes(tag) && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Price Level</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {priceLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priceLevel: level.value })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          formData.priceLevel === level.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-heading text-xl font-bold">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="font-heading text-2xl font-bold mb-2">You're all set!</h2>
              <p className="text-muted-foreground mb-8">
                Your restaurant profile is ready. Start connecting with suppliers.
              </p>
              <Button size="lg" onClick={handleComplete} disabled={loading}>
                {loading ? "Creating profile..." : "Go to Dashboard"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {currentStep < 3 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

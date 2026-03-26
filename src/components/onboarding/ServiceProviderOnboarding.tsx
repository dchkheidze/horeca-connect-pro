import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Building2, MapPin, Phone, Globe, Check, ArrowRight, ArrowLeft, X, Plus, Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const serviceCategories = [
  "Consulting", "Cleaning", "Maintenance", "IT & Technology",
  "Marketing & Design", "Staffing & Recruitment", "Accounting & Finance",
  "Legal Services", "Training & Development", "Pest Control",
  "Interior Design", "Photography & Video",
];

const coverageAreas = ["Local", "Regional", "National", "International"];

interface Offer { title: string; description: string; }

interface ServiceProviderOnboardingProps {
  userId: string;
  onComplete: () => void;
}

export function ServiceProviderOnboarding({ userId, onComplete }: ServiceProviderOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    companyName: "", city: "", address: "", phone: "", website: "", description: "",
    categories: [] as string[], coverageAreas: [] as string[],
  });

  const [offers, setOffers] = useState<Offer[]>([{ title: "", description: "" }]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleCoverage = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      coverageAreas: prev.coverageAreas.includes(area)
        ? prev.coverageAreas.filter((a) => a !== area)
        : [...prev.coverageAreas, area],
    }));
  };

  const addOffer = () => { if (offers.length < 3) setOffers([...offers, { title: "", description: "" }]); };
  const removeOffer = (index: number) => { setOffers(offers.filter((_, i) => i !== index)); };
  const updateOffer = (index: number, field: keyof Offer, value: string) => {
    const newOffers = [...offers]; newOffers[index][field] = value; setOffers(newOffers);
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.companyName.trim()) {
      toast({ variant: "destructive", title: "Company name is required" }); return;
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleComplete = async () => {
    setLoading(true);

    const slug = formData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

    const { data: providerData, error: providerError } = await supabase
      .from("service_providers")
      .insert({
        owner_user_id: userId, name: formData.companyName, slug,
        city: formData.city || null, address: formData.address || null,
        phone: formData.phone || null, website: formData.website || null,
        description: formData.description || null,
        categories: formData.categories, coverage_areas: formData.coverageAreas,
        is_published: false,
      })
      .select().single();

    if (providerError) {
      setLoading(false);
      toast({ variant: "destructive", title: "Error", description: providerError.message }); return;
    }

    const validOffers = offers.filter((o) => o.title.trim());
    if (validOffers.length > 0 && providerData) {
      await supabase.from("service_provider_offers").insert(
        validOffers.map((offer) => ({
          service_provider_id: providerData.id, title: offer.title,
          description: offer.description || null, type: "SERVICE" as const, is_active: true,
        }))
      );
    }

    setLoading(false);
    toast({ title: "Profile created!", description: "Welcome to HoReCa Hub" });
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div>
        <Progress value={progress} className="h-2 mb-4" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>Service Provider Profile</span>
        </div>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Company Information</h2>
                <p className="text-muted-foreground">Tell us about your company</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="companyName" placeholder="Your Company Name" className="pl-10" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="city" placeholder="City" className="pl-10" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="pl-10" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Street address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="website" placeholder="www.yourcompany.com" className="pl-10" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Tell us about your company..." rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Categories & Coverage</h2>
                <p className="text-muted-foreground">What services do you offer and where?</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Service Categories</Label>
                  <p className="text-sm text-muted-foreground">Select all that apply</p>
                  <div className="flex flex-wrap gap-2">
                    {serviceCategories.map((category) => (
                      <Badge key={category} variant={formData.categories.includes(category) ? "default" : "outline"} className="cursor-pointer transition-colors" onClick={() => toggleCategory(category)}>
                        {category}{formData.categories.includes(category) && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Coverage Area</Label>
                  <div className="flex flex-wrap gap-2">
                    {coverageAreas.map((area) => (
                      <Badge key={area} variant={formData.coverageAreas.includes(area) ? "default" : "outline"} className="cursor-pointer transition-colors" onClick={() => toggleCoverage(area)}>
                        {area}{formData.coverageAreas.includes(area) && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Your Services</h2>
                <p className="text-muted-foreground">Add up to 3 services you offer</p>
              </div>
              <div className="space-y-4">
                {offers.map((offer, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Service {index + 1}</span>
                      {offers.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeOffer(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                    </div>
                    <Input placeholder="Service title" value={offer.title} onChange={(e) => updateOffer(index, "title", e.target.value)} />
                    <Textarea placeholder="Short description" rows={2} value={offer.description} onChange={(e) => updateOffer(index, "description", e.target.value)} />
                  </div>
                ))}
                {offers.length < 3 && <Button type="button" variant="outline" className="w-full" onClick={addOffer}><Plus className="mr-2 h-4 w-4" />Add Another Service</Button>}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="font-heading text-2xl font-bold mb-2">You're all set!</h2>
              <p className="text-muted-foreground mb-8">Your service provider profile is ready. Start connecting with clients.</p>
              <Button size="lg" onClick={handleComplete} disabled={loading}>
                {loading ? "Creating profile..." : "Go to Dashboard"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
              <Button onClick={handleNext}>Continue<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

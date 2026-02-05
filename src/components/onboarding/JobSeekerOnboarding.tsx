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
  User, 
  MapPin, 
  Phone, 
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Briefcase
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const jobCategories = [
  "Kitchen", "Front of House", "Management", "Bar", "Hospitality",
  "Housekeeping", "Events", "Sommelier", "Pastry", "Catering"
];

const scheduleTypes = [
  "Full-time", "Part-time", "Flexible", "Weekends", "Evenings", "Seasonal"
];

interface JobSeekerOnboardingProps {
  userId: string;
  fullName?: string;
  onComplete: () => void;
}

export function JobSeekerOnboarding({ userId, fullName = "", onComplete }: JobSeekerOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: fullName,
    phone: "",
    city: "",
    headline: "",
    about: "",
    jobCategories: [] as string[],
    scheduleTypes: [] as string[],
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const toggleJobCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      jobCategories: prev.jobCategories.includes(category)
        ? prev.jobCategories.filter((c) => c !== category)
        : [...prev.jobCategories, category],
    }));
  };

  const toggleScheduleType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      scheduleTypes: prev.scheduleTypes.includes(type)
        ? prev.scheduleTypes.filter((t) => t !== type)
        : [...prev.scheduleTypes, type],
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.fullName.trim()) {
      toast({ variant: "destructive", title: "Full name is required" });
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

    const { error } = await supabase.from("candidates").insert({
      user_id: userId,
      full_name: formData.fullName,
      phone: formData.phone || null,
      city: formData.city || null,
      headline: formData.headline || null,
      about: formData.about || null,
      job_categories: formData.jobCategories,
      schedule_types: formData.scheduleTypes,
    });

    setLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }

    toast({ title: "Profile created!", description: "Start exploring opportunities" });
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <Progress value={progress} className="h-2 mb-4" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>Job Seeker Profile</span>
        </div>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Personal Information</h2>
                <p className="text-muted-foreground">Tell us about yourself</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Your Full Name"
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headline">Professional Headline</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="headline"
                      placeholder="e.g., Executive Chef with 10 years experience"
                      className="pl-10"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about">About You</Label>
                  <Textarea
                    id="about"
                    placeholder="Tell employers about your experience and skills..."
                    rows={4}
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Job Preferences</h2>
                <p className="text-muted-foreground">What are you looking for?</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Job Categories</Label>
                  <p className="text-sm text-muted-foreground">Select all that interest you</p>
                  <div className="flex flex-wrap gap-2">
                    {jobCategories.map((category) => (
                      <Badge
                        key={category}
                        variant={formData.jobCategories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleJobCategory(category)}
                      >
                        {category}
                        {formData.jobCategories.includes(category) && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Schedule Preference</Label>
                  <div className="flex flex-wrap gap-2">
                    {scheduleTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={formData.scheduleTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleScheduleType(type)}
                      >
                        {type}
                        {formData.scheduleTypes.includes(type) && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
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
                Your profile is ready. Start exploring job opportunities.
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  FileText,
  Check,
  ArrowRight,
  ArrowLeft 
} from "lucide-react";

const steps = [
  { id: 1, title: "Business Info" },
  { id: 2, title: "Contact Details" },
  { id: 3, title: "Complete" },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    location: "",
    phone: "",
    website: "",
    description: "",
  });
  const navigate = useNavigate();

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // In real app, this would save the onboarding data
    // For now, redirect to restaurant dashboard as example
    navigate("/r/dashboard");
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
            Help us personalize your experience
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 text-sm ${
                  step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    step.id < currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id === currentStep
                      ? "border-2 border-primary text-primary"
                      : "border-2 border-muted text-muted-foreground"
                  }`}
                >
                  {step.id < currentStep ? <Check className="h-3 w-3" /> : step.id}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessName"
                      placeholder="Your Restaurant or Company"
                      className="pl-10"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <select
                    id="businessType"
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  >
                    <option value="">Select type...</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="cafe">Café</option>
                    <option value="bar">Bar</option>
                    <option value="catering">Catering</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="City, State"
                      className="pl-10"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
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
                  <Label htmlFor="website">Website (optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="www.yourbusiness.com"
                      className="pl-10"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">About Your Business</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us a bit about your business..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
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
                  Your profile is ready. Start exploring HoReCa Hub.
                </p>
                <Button size="lg" onClick={handleComplete}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep < 3 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
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

        {currentStep < 3 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            You can always update this information later in settings.
          </p>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RealEstateOnboardingProps {
  userId: string;
  onComplete: () => void;
}

export function RealEstateOnboarding({ userId, onComplete }: RealEstateOnboardingProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast.error("Please enter your company or agent name");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("real_estate_agents").insert({
      owner_user_id: userId,
      company_name: formData.companyName.trim(),
      phone: formData.phone.trim() || null,
      city: formData.city.trim() || null,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to create profile: " + error.message);
      return;
    }

    toast.success("Real estate profile created!");
    onComplete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real Estate Agent Profile</CardTitle>
        <CardDescription>Set up your real estate listing account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company / Agent Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Prime Realty Georgia"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rePhone">Phone</Label>
            <Input
              id="rePhone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+995 ..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reCity">City</Label>
            <Input
              id="reCity"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Tbilisi"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Complete Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  Eye,
  EyeOff,
  ArrowRight,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface SupplierData {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  city: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  categories: string[] | null;
  coverage_areas: string[] | null;
}

interface ProfileCompletenessItem {
  label: string;
  completed: boolean;
}

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [offersCount, setOffersCount] = useState(0);
  const [activeOffersCount, setActiveOffersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch supplier
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("*")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (supplierError) {
        console.error("Error fetching supplier:", supplierError);
      } else if (supplierData) {
        setSupplier(supplierData);

        // Fetch offers count
        const { count: totalCount } = await supabase
          .from("supplier_offers")
          .select("*", { count: "exact", head: true })
          .eq("supplier_id", supplierData.id);

        const { count: activeCount } = await supabase
          .from("supplier_offers")
          .select("*", { count: "exact", head: true })
          .eq("supplier_id", supplierData.id)
          .eq("is_active", true);

        setOffersCount(totalCount || 0);
        setActiveOffersCount(activeCount || 0);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No supplier profile found.</p>
        <Button className="mt-4" asChild>
          <Link to="/onboarding">Complete Onboarding</Link>
        </Button>
      </div>
    );
  }

  // Calculate profile completeness
  const completenessItems: ProfileCompletenessItem[] = [
    { label: "Company name", completed: !!supplier.name },
    { label: "City", completed: !!supplier.city },
    { label: "Phone", completed: !!supplier.phone },
    { label: "Website", completed: !!supplier.website },
    { label: "Description", completed: !!supplier.description },
    { label: "Categories", completed: (supplier.categories?.length || 0) > 0 },
    { label: "Coverage areas", completed: (supplier.coverage_areas?.length || 0) > 0 },
    { label: "At least one offer", completed: offersCount > 0 },
  ];

  const completedCount = completenessItems.filter((item) => item.completed).length;
  const completenessPercent = Math.round((completedCount / completenessItems.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold lg:text-3xl">Welcome back!</h1>
          <p className="text-muted-foreground">Manage {supplier.name} and connect with restaurants.</p>
        </div>
        <Button asChild>
          <Link to="/s/profile">
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Status Banner */}
      <Card className={supplier.is_published ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {supplier.is_published ? (
                <Eye className="h-5 w-5 text-green-600" />
              ) : (
                <EyeOff className="h-5 w-5 text-amber-600" />
              )}
              <div>
                <p className="font-medium">
                  {supplier.is_published ? "Your profile is live" : "Your profile is hidden"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {supplier.is_published
                    ? "Restaurants can find you in the directory"
                    : "Make your profile public to appear in the directory"}
                </p>
              </div>
            </div>
            {supplier.is_published && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/suppliers/${supplier.slug}`} target="_blank" rel="noopener noreferrer">
                  View Public Profile
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Offers</p>
                <p className="font-heading text-2xl font-bold">{offersCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Offers</p>
                <p className="font-heading text-2xl font-bold">{activeOffersCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                {completenessPercent === 100 ? (
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profile Complete</p>
                <p className="font-heading text-2xl font-bold">{completenessPercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Completeness */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Completeness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{completedCount} of {completenessItems.length} completed</span>
                <span className="font-medium">{completenessPercent}%</span>
              </div>
              <Progress value={completenessPercent} className="h-2" />
            </div>

            <div className="space-y-2">
              {completenessItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={item.completed ? "text-muted-foreground" : ""}>
                    {item.label}
                  </span>
                  {!item.completed && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      Missing
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {completenessPercent < 100 && (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/s/profile">
                  Complete Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/s/profile">
                Edit Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/s/offers">
                Manage Offers ({offersCount})
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {supplier.is_published && (
              <Button variant="outline" className="justify-between" asChild>
                <a href={`/suppliers/${supplier.slug}`} target="_blank" rel="noopener noreferrer">
                  View Public Profile
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

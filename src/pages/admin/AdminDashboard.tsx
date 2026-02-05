import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Truck, Briefcase, FileText, Users } from "lucide-react";

interface DashboardStats {
  totalRestaurants: number;
  totalSuppliers: number;
  totalJobs: number;
  totalApplications: number;
  newUsersLast7Days: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRestaurants: 0,
    totalSuppliers: 0,
    totalJobs: 0,
    totalApplications: 0,
    newUsersLast7Days: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          restaurantsResult,
          suppliersResult,
          jobsResult,
          applicationsResult,
          usersResult,
        ] = await Promise.all([
          supabase.from("restaurants").select("id", { count: "exact", head: true }),
          supabase.from("suppliers").select("id", { count: "exact", head: true }),
          supabase.from("jobs").select("id", { count: "exact", head: true }),
          supabase.from("job_applications").select("id", { count: "exact", head: true }),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        setStats({
          totalRestaurants: restaurantsResult.count || 0,
          totalSuppliers: suppliersResult.count || 0,
          totalJobs: jobsResult.count || 0,
          totalApplications: applicationsResult.count || 0,
          newUsersLast7Days: usersResult.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const kpiCards = [
    {
      title: "Total Restaurants",
      value: stats.totalRestaurants,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Suppliers",
      value: stats.totalSuppliers,
      icon: Truck,
      color: "text-supplier",
      bgColor: "bg-supplier/10",
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: Briefcase,
      color: "text-jobseeker",
      bgColor: "bg-jobseeker/10",
    },
    {
      title: "Job Applications",
      value: stats.totalApplications,
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "New Users (7 days)",
      value: stats.newUsersLast7Days,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and key metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded" />
              ) : (
                <p className="text-2xl font-bold">{card.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/moderation"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary transition-colors"
            >
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Review Pending Restaurants</p>
                <p className="text-sm text-muted-foreground">
                  Approve or reject restaurant listings
                </p>
              </div>
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary transition-colors"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Manage Users</p>
                <p className="text-sm text-muted-foreground">
                  View and manage user roles
                </p>
              </div>
            </a>
            <a
              href="/admin/categories"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary transition-colors"
            >
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Manage Categories</p>
                <p className="text-sm text-muted-foreground">
                  Edit cuisines, categories, and cities
                </p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Authentication</span>
              <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage</span>
              <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Available
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

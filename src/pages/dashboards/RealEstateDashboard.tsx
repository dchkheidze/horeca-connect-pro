import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Plus, Settings, Eye, EyeOff } from "lucide-react";

export default function RealEstateDashboard() {
  const { user } = useAuth();
  const [totalListings, setTotalListings] = useState(0);
  const [publishedListings, setPublishedListings] = useState(0);
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [agentRes, totalRes, pubRes] = await Promise.all([
        supabase.from("real_estate_agents").select("company_name").eq("owner_user_id", user.id).maybeSingle(),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("owner_user_id", user.id),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("owner_user_id", user.id).eq("is_published", true),
      ]);
      setAgentName(agentRes.data?.company_name || "");
      setTotalListings(totalRes.count || 0);
      setPublishedListings(pubRes.count || 0);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome, {agentName || "Agent"}</h1>
        <p className="text-muted-foreground">Manage your property listings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalListings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{publishedListings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hidden</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalListings - publishedListings}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/re/listings?new=1">
              <Plus className="h-4 w-4 mr-2" />
              Add New Listing
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/re/listings">
              <Building2 className="h-4 w-4 mr-2" />
              Manage Listings
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/re/settings">
              <Settings className="h-4 w-4 mr-2" />
              Profile Settings
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

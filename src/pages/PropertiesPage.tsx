import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, MapPin, Maximize, Search, Lock } from "lucide-react";

interface Property {
  id: string;
  title: string;
  slug: string;
  listing_type: string;
  property_type: string;
  price: number | null;
  currency: string | null;
  area_sqm: number | null;
  city: string | null;
  cover_image: string | null;
  is_published: boolean | null;
  status: string | null;
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [listingFilter, setListingFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setHasSubscription(false);
        setLoading(false);
        return;
      }

      // Check subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      const hasSub = sub?.plan === "standard" || sub?.plan === "premium";
      setHasSubscription(hasSub);

      if (hasSub) {
        const { data } = await supabase
          .from("properties")
          .select("id, title, slug, listing_type, property_type, price, currency, area_sqm, city, cover_image, is_published, status")
          .eq("is_published", true)
          .eq("status", "ACTIVE")
          .order("created_at", { ascending: false });
        setProperties((data as Property[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
        <p className="text-muted-foreground mb-6">You need to be signed in to browse property listings.</p>
        <Button asChild><Link to="/auth/login">Sign in</Link></Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-16">
        <div className="animate-pulse text-muted-foreground text-center">Loading properties...</div>
      </div>
    );
  }

  if (!hasSubscription) {
    return (
      <div className="container py-16 text-center">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Upgrade Required</h1>
        <p className="text-muted-foreground mb-6">
          Property listings are available for Standard and Premium subscribers.
        </p>
        <Button asChild><Link to="/pricing">View Pricing Plans</Link></Button>
      </div>
    );
  }

  const filtered = properties.filter((p) => {
    if (listingFilter !== "ALL" && p.listing_type !== listingFilter) return false;
    if (typeFilter !== "ALL" && p.property_type !== typeFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.city?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Commercial Properties</h1>
        <p className="text-muted-foreground">Browse restaurants, cafes, hotels and more for sale or rent</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by title or city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={listingFilter} onValueChange={setListingFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Listings</SelectItem>
            <SelectItem value="SALE">For Sale</SelectItem>
            <SelectItem value="RENT">For Rent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="restaurant">Restaurant</SelectItem>
            <SelectItem value="cafe">Cafe</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="bakery">Bakery</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No properties found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} to={`/properties/${p.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="aspect-video bg-muted relative">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building2 className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <Badge className="absolute top-3 left-3" variant={p.listing_type === "SALE" ? "default" : "secondary"}>
                    {p.listing_type === "SALE" ? "For Sale" : "For Rent"}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{p.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {p.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {p.city}
                      </span>
                    )}
                    {p.area_sqm && (
                      <span className="flex items-center gap-1">
                        <Maximize className="h-3.5 w-3.5" /> {p.area_sqm} sqm
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">{p.property_type}</Badge>
                    {p.price && (
                      <span className="font-bold text-primary">
                        {p.price.toLocaleString()} {p.currency}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Building2, MapPin, Maximize, Search } from "lucide-react";

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
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [listingFilter, setListingFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, slug, listing_type, property_type, price, currency, area_sqm, city, cover_image")
        .eq("is_published", true)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false });
      setProperties((data as Property[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="container py-16">
        <div className="animate-pulse text-muted-foreground text-center">Loading properties...</div>
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

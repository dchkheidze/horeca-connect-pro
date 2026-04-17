import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Search, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UNSPLASH, pickImage } from "@/lib/unsplash";

interface Restaurant {
  id: string;
  slug: string | null;
  name: string;
  city: string | null;
  description: string | null;
  cuisine_tags: string[] | null;
  price_level: number | null;
  phone: string | null;
  website: string | null;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, slug, name, city, description, cuisine_tags, price_level, phone, website")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!error && data) setRestaurants(data as Restaurant[]);
      setLoading(false);
    };
    load();
  }, []);

  const cuisineFilters = Array.from(
    new Set(restaurants.flatMap((r) => r.cuisine_tags ?? []))
  ).slice(0, 10);

  const filtered = restaurants.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q) ||
      (r.city ?? "").toLowerCase().includes(q) ||
      (r.cuisine_tags ?? []).some((t) => t.toLowerCase().includes(q));
    const matchesCuisine =
      !selectedCuisine || (r.cuisine_tags ?? []).includes(selectedCuisine);
    return matchesQuery && matchesCuisine;
  });

  return (
    <div className="container py-12">
      <div className="mb-10 max-w-3xl">
        <h1 className="font-heading text-4xl font-bold text-foreground md:text-5xl">
          Restaurants
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Discover restaurants on Restgo. Browse, search, and connect.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, city, cuisine…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {cuisineFilters.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCuisine === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCuisine(null)}
          >
            All
          </Button>
          {cuisineFilters.map((c) => (
            <Button
              key={c}
              variant={selectedCuisine === c ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCuisine(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Utensils className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-heading text-lg font-semibold">No restaurants found</p>
              <p className="text-sm text-muted-foreground">
                Try clearing filters or come back later.
              </p>
            </div>
            {(searchQuery || selectedCuisine) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCuisine(null);
                }}
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Link
              key={r.id}
              to={`/restaurants/${r.slug ?? r.id}`}
              className="group"
            >
              <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={pickImage(UNSPLASH.directory, r.id)}
                    alt={r.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary">
                      {r.name}
                    </h3>
                    {r.price_level && (
                      <Badge variant="secondary" className="shrink-0">
                        {"$".repeat(r.price_level)}
                      </Badge>
                    )}
                  </div>
                  {r.city && (
                    <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {r.city}
                    </div>
                  )}
                  {r.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {r.description}
                    </p>
                  )}
                  {r.cuisine_tags && r.cuisine_tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {r.cuisine_tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

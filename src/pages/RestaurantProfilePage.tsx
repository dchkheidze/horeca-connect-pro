import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Phone, Globe, ArrowLeft, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UNSPLASH, pickImage } from "@/lib/unsplash";

interface Restaurant {
  id: string;
  slug: string | null;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  cuisine_tags: string[] | null;
  price_level: number | null;
}

export default function RestaurantProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("restaurants")
        .select(
          "id, slug, name, city, address, phone, website, description, cuisine_tags, price_level"
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      setRestaurant(data as Restaurant | null);
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container py-20 text-center">
        <Utensils className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold">Restaurant not found</h1>
        <p className="mt-2 text-muted-foreground">
          It may be unpublished or the link may be incorrect.
        </p>
        <Button asChild className="mt-6">
          <Link to="/restaurants">Browse restaurants</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/restaurants">
          <ArrowLeft className="mr-2 h-4 w-4" /> All restaurants
        </Link>
      </Button>

      <div className="mb-8 aspect-[21/9] overflow-hidden rounded-xl bg-muted">
        <img
          src={pickImage(UNSPLASH.directory, restaurant.id)}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                {restaurant.name}
              </h1>
              {restaurant.city && (
                <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {restaurant.city}
                  {restaurant.address ? `, ${restaurant.address}` : ""}
                </div>
              )}
            </div>
            {restaurant.price_level && (
              <Badge variant="secondary" className="text-base">
                {"$".repeat(restaurant.price_level)}
              </Badge>
            )}
          </div>

          {restaurant.cuisine_tags && restaurant.cuisine_tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {restaurant.cuisine_tags.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {restaurant.description && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">
                  {restaurant.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex items-center gap-2 text-foreground hover:text-primary"
                >
                  <Phone className="h-4 w-4" /> {restaurant.phone}
                </a>
              )}
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-foreground hover:text-primary"
                >
                  <Globe className="h-4 w-4" /> Visit website
                </a>
              )}
              {restaurant.address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{restaurant.address}</span>
                </div>
              )}
              {!restaurant.phone && !restaurant.website && !restaurant.address && (
                <p className="text-muted-foreground">No contact details provided.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

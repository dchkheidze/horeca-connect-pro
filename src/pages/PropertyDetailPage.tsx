import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Building2, MapPin, Maximize, Phone, Mail, Lock } from "lucide-react";

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
  address: string | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  cover_image: string | null;
  images: string[] | null;
  status: string | null;
  created_at: string;
}

export default function PropertyDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }

      const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle();
      const hasSub = sub?.plan === "standard" || sub?.plan === "premium";
      setHasSubscription(hasSub);

      if (hasSub) {
        const { data } = await supabase
          .from("properties")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .maybeSingle();
        setProperty(data as Property | null);
      }
      setLoading(false);
    };
    load();
  }, [slug, user]);

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
        <Button asChild><Link to="/auth/login">Sign in</Link></Button>
      </div>
    );
  }

  if (loading) {
    return <div className="container py-16 text-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  }

  if (!hasSubscription) {
    return (
      <div className="container py-16 text-center">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Upgrade Required</h1>
        <p className="text-muted-foreground mb-6">Property details are available for Standard and Premium subscribers.</p>
        <Button asChild><Link to="/pricing">View Pricing Plans</Link></Button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Property not found</h1>
        <Button asChild variant="outline"><Link to="/properties">Back to listings</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <Link to="/properties" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            {property.cover_image ? (
              <img src={property.cover_image} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Building2 className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
            <Badge className="absolute top-4 left-4" variant={property.listing_type === "SALE" ? "default" : "secondary"}>
              {property.listing_type === "SALE" ? "For Sale" : "For Rent"}
            </Badge>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-muted-foreground">
              <Badge variant="outline" className="capitalize">{property.property_type}</Badge>
              {property.city && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {property.city}</span>}
              {property.area_sqm && <span className="flex items-center gap-1"><Maximize className="h-4 w-4" /> {property.area_sqm} sqm</span>}
            </div>
          </div>

          {property.description && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
              </CardContent>
            </Card>
          )}

          {property.address && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-2">Location</h2>
                <p className="text-muted-foreground">{property.address}{property.city ? `, ${property.city}` : ""}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {property.price && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">{property.listing_type === "SALE" ? "Asking Price" : "Monthly Rent"}</p>
                <p className="text-3xl font-bold text-primary">{property.price.toLocaleString()} {property.currency}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold">Contact</h3>
              {property.contact_phone && (
                <a href={`tel:${property.contact_phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Phone className="h-4 w-4" /> {property.contact_phone}
                </a>
              )}
              {property.contact_email && (
                <a href={`mailto:${property.contact_email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Mail className="h-4 w-4" /> {property.contact_email}
                </a>
              )}
              {!property.contact_phone && !property.contact_email && (
                <p className="text-sm text-muted-foreground">No contact information provided.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

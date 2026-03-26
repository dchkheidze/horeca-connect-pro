import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Globe, ArrowLeft, Wrench, Package, Loader2 } from "lucide-react";

interface ServiceProvider {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  categories: string[] | null;
  coverage_areas: string[] | null;
}

interface ServiceProviderOffer {
  id: string;
  title: string;
  description: string | null;
  type: string;
  price_from: number | null;
  currency: string | null;
}

export default function ServiceProviderProfilePage() {
  const { slug } = useParams();
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [offers, setOffers] = useState<ServiceProviderOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!slug) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) { console.error("Error:", error); setLoading(false); return; }

      if (data) {
        setProvider(data);
        const { data: offersData } = await supabase
          .from("service_provider_offers")
          .select("id, title, description, type, price_from, currency")
          .eq("service_provider_id", data.id)
          .eq("is_active", true);
        if (offersData) setOffers(offersData);
      }
      setLoading(false);
    };
    fetchProvider();
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container py-12 text-center">
        <Wrench className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Service Provider not found</h1>
        <p className="text-muted-foreground mb-6">This profile doesn't exist or isn't publicly visible.</p>
        <Button asChild><Link to="/service-providers">Browse Service Providers</Link></Button>
      </div>
    );
  }

  return (
    <div className="py-8 lg:py-12">
      <div className="container">
        <Link to="/service-providers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Service Providers
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-accent/10 flex items-center justify-center border border-border">
                    <Wrench className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h1 className="font-heading text-2xl font-bold">{provider.name}</h1>
                    <p className="text-muted-foreground">{provider.categories?.[0] || "Service Provider"}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                      {provider.city && (
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{provider.city}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>About</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{provider.description || "No description available."}</p>
              </CardContent>
            </Card>

            {provider.categories && provider.categories.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.categories.map((cat) => <Badge key={cat} variant="secondary">{cat}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            )}

            {provider.coverage_areas && provider.coverage_areas.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Coverage Areas</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.coverage_areas.map((area) => <Badge key={area} variant="outline">{area}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            )}

            {offers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Services & Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {offers.map((offer) => (
                      <div key={offer.id} className="p-4 rounded-lg border border-border bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{offer.title}</h4>
                          <Badge variant="outline" className="text-xs">{offer.type}</Badge>
                        </div>
                        {offer.description && <p className="text-sm text-muted-foreground mb-2">{offer.description}</p>}
                        {offer.price_from && <p className="text-sm font-medium">From {offer.currency || "EUR"} {offer.price_from}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Contact Provider</h3>
                <p className="text-sm text-muted-foreground mb-6">Get in touch to discuss your requirements.</p>
                <div className="space-y-3 mb-6">
                  {provider.phone && (
                    <div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{provider.phone}</span></div>
                  )}
                  {provider.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{provider.website}</a>
                    </div>
                  )}
                  {provider.address && (
                    <div className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{provider.address}</span></div>
                  )}
                </div>
                <Button className="w-full" asChild>
                  <Link to="/auth/register">Request Quote</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin,
  Phone,
  Globe,
  ArrowLeft,
  Building2,
  Package,
  Loader2,
} from "lucide-react";

interface Supplier {
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

interface SupplierOffer {
  id: string;
  title: string;
  description: string | null;
  type: string;
  price_from: number | null;
  currency: string | null;
}

export default function SupplierProfilePage() {
  const { slug } = useParams();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [offers, setOffers] = useState<SupplierOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!slug) return;

      setLoading(true);

      // Fetch supplier
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (supplierError) {
        console.error("Error fetching supplier:", supplierError);
        setLoading(false);
        return;
      }

      if (supplierData) {
        setSupplier(supplierData);

        // Fetch offers for this supplier
        const { data: offersData, error: offersError } = await supabase
          .from("supplier_offers")
          .select("id, title, description, type, price_from, currency")
          .eq("supplier_id", supplierData.id)
          .eq("is_active", true);

        if (!offersError && offersData) {
          setOffers(offersData);
        }
      }

      setLoading(false);
    };

    fetchSupplier();
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container py-12 text-center">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Supplier not found</h1>
        <p className="text-muted-foreground mb-6">
          This supplier profile doesn't exist or isn't publicly visible.
        </p>
        <Button asChild>
          <Link to="/suppliers">Browse Suppliers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 lg:py-12">
      <div className="container">
        {/* Back Button */}
        <Link
          to="/suppliers"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Suppliers
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center border border-border">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h1 className="font-heading text-2xl font-bold">{supplier.name}</h1>
                    <p className="text-muted-foreground">
                      {supplier.categories?.[0] || "Supplier"}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                      {supplier.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {supplier.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {supplier.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            {/* Categories */}
            {supplier.categories && supplier.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {supplier.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Coverage Areas */}
            {supplier.coverage_areas && supplier.coverage_areas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Coverage Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {supplier.coverage_areas.map((area) => (
                      <Badge key={area} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Offers */}
            {offers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Products & Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{offer.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {offer.type}
                          </Badge>
                        </div>
                        {offer.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {offer.description}
                          </p>
                        )}
                        {offer.price_from && (
                          <p className="text-sm font-medium">
                            From {offer.currency || "EUR"} {offer.price_from}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Contact Supplier</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Get in touch to discuss your requirements and receive a quote.
                </p>

                <div className="space-y-3 mb-6">
                  {supplier.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={
                          supplier.website.startsWith("http")
                            ? supplier.website
                            : `https://${supplier.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {supplier.website}
                      </a>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.address}</span>
                    </div>
                  )}
                </div>

                <Button className="w-full" asChild>
                  <Link to="/auth/register?role=restaurant">Request Quote</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

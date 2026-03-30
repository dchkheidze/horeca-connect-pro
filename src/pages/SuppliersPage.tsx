import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Building2, ArrowRight, Loader2 } from "lucide-react";
import { UNSPLASH, pickImage } from "@/lib/unsplash";

interface Supplier {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  description: string | null;
  categories: string[] | null;
  phone: string | null;
  website: string | null;
}

const supplierCategoryFilters = [
  "All Categories",
  "Food & Beverages",
  "Fresh Produce",
  "Meat & Poultry",
  "Equipment & Supplies",
  "Cleaning & Sanitation",
  "Technology",
  "Linens & Uniforms",
];

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, slug, name, city, description, categories, phone, website")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching suppliers:", error);
      } else {
        setSuppliers(data || []);
      }
      setLoading(false);
    };

    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory =
      selectedCategory === "All Categories" ||
      (supplier.categories?.some((cat) =>
        cat.toLowerCase().includes(selectedCategory.toLowerCase())
      ) ?? false);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-8 lg:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold lg:text-4xl mb-2">
            Supplier Directory
          </h1>
          <p className="text-lg text-muted-foreground">
            Find trusted suppliers for your restaurant, hotel, or catering business.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {supplierCategoryFilters.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[2/1] overflow-hidden bg-muted flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/50" />
                </div>

                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border border-border">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold truncate">{supplier.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {supplier.categories?.[0] || "Supplier"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {supplier.description || "No description available"}
                  </p>

                  {supplier.city && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{supplier.city}</span>
                      </div>
                    </div>
                  )}

                  {supplier.categories && supplier.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {supplier.categories.slice(0, 3).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button className="w-full" variant="outline" asChild>
                    <Link to={`/suppliers/${supplier.slug}`}>
                      View Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">No suppliers found matching your criteria.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to join our supplier network!
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Categories");
                }}
              >
                Clear filters
              </Button>
              <Button asChild>
                <Link to="/auth/register?role=supplier">Become a Supplier</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

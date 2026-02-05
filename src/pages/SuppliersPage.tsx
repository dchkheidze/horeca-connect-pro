import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { suppliers, supplierCategories } from "@/data/mockData";
import { Search, MapPin, Star, ArrowRight } from "lucide-react";

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" || supplier.category === selectedCategory;
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
            {supplierCategories.map((category) => (
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

        {/* Results */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[2/1] overflow-hidden">
                <img
                  src={supplier.coverImage}
                  alt={supplier.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={supplier.logo}
                    alt={`${supplier.name} logo`}
                    className="h-12 w-12 rounded-lg object-cover border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold truncate">{supplier.name}</h3>
                    <p className="text-sm text-muted-foreground">{supplier.category}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {supplier.shortDescription}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{supplier.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-accent fill-accent" />
                    <span>{supplier.rating}</span>
                    <span className="text-muted-foreground/60">({supplier.reviewCount})</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {supplier.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

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

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No suppliers found matching your criteria.</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

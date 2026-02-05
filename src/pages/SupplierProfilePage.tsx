import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { suppliers } from "@/data/mockData";
import { 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  ArrowLeft, 
  CheckCircle2,
  MessageSquare 
} from "lucide-react";

export default function SupplierProfilePage() {
  const { slug } = useParams();
  const supplier = suppliers.find((s) => s.slug === slug);

  if (!supplier) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Supplier not found</h1>
        <Button asChild>
          <Link to="/suppliers">Back to Suppliers</Link>
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

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="aspect-[3/1] lg:aspect-[4/1]">
            <img
              src={supplier.coverImage}
              alt={supplier.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={supplier.logo}
                  alt={`${supplier.name} logo`}
                  className="h-16 w-16 lg:h-20 lg:w-20 rounded-xl border-2 border-background object-cover"
                />
                <div>
                  <h1 className="font-heading text-2xl lg:text-3xl font-bold text-background">
                    {supplier.name}
                  </h1>
                  <div className="flex items-center gap-4 mt-1 text-background/80">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {supplier.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      {supplier.rating} ({supplier.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <Button size="lg" variant="accent">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Supplier
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {supplier.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                  {supplier.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {supplier.services.map((service) => (
                    <div key={service} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a
                  href={`mailto:${supplier.contact.email}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>{supplier.contact.email}</span>
                </a>
                <a
                  href={`tel:${supplier.contact.phone}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span>{supplier.contact.phone}</span>
                </a>
                <a
                  href={`https://${supplier.contact.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="h-5 w-5" />
                  <span>{supplier.contact.website}</span>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-sm">
                  {supplier.category}
                </Badge>
              </CardContent>
            </Card>

            <Card className="hero-gradient text-primary-foreground">
              <CardContent className="p-6 text-center">
                <h3 className="font-heading font-semibold text-lg mb-2">
                  Interested in this supplier?
                </h3>
                <p className="text-sm text-primary-foreground/80 mb-4">
                  Sign up to send inquiries and request quotes.
                </p>
                <Button variant="accent" className="w-full" asChild>
                  <Link to="/auth/register?role=restaurant">Create Account</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

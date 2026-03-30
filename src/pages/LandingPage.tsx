import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Truck, Briefcase, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { UNSPLASH } from "@/lib/unsplash";

const roleCards = [
  {
    icon: Building2,
    title: "For Restaurants",
    description: "Find trusted suppliers, post jobs, and streamline your procurement. Connect with verified vendors who understand hospitality.",
    features: ["Access supplier marketplace", "Post job openings", "Manage vendor relationships"],
    cta: "Get started as a Restaurant",
    href: "/auth/register?role=restaurant",
    color: "bg-primary",
    image: UNSPLASH.restaurant,
  },
  {
    icon: Truck,
    title: "For Suppliers",
    description: "Reach restaurants and hotels actively looking for your products and services. Grow your B2B customer base.",
    features: ["List your business", "Connect with buyers", "Receive quote requests"],
    cta: "Join as a Supplier",
    href: "/auth/register?role=supplier",
    color: "bg-supplier",
    image: UNSPLASH.supplier,
  },
  {
    icon: Briefcase,
    title: "For Job Seekers",
    description: "Discover opportunities in hospitality. From executive chef positions to front-of-house roles at top establishments.",
    features: ["Browse curated jobs", "Easy applications", "Career resources"],
    cta: "Find Your Next Role",
    href: "/auth/register?role=jobseeker",
    color: "bg-jobseeker",
    image: UNSPLASH.jobseeker,
  },
];

const stats = [
  { value: "2,500+", label: "Verified Suppliers" },
  { value: "10,000+", label: "Active Jobs" },
  { value: "50,000+", label: "Restaurants" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0">
          <img
            src={UNSPLASH.hero}
            alt="Elegant restaurant interior"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-primary/80" />
        </div>
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl animate-fade-in">
              The B2B Marketplace for
              <span className="block mt-2">Hospitality Professionals</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Connect restaurants with trusted suppliers, discover top hospitality talent, 
              and grow your business in the HoReCa industry.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button size="xl" variant="accent" asChild>
                <Link to="/auth/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="hero-outline" asChild>
                <Link to="/suppliers">Browse Suppliers</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card py-8">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl font-bold text-primary lg:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="font-heading text-3xl font-bold lg:text-4xl">
              How can we help you today?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose your path and unlock the full potential of our B2B hospitality platform.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {roleCards.map((card, index) => (
              <Card
                key={card.title}
                className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-6">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${card.color} mb-6 -mt-12 relative z-10 shadow-lg`}>
                    <card.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  
                  <h3 className="font-heading text-xl font-semibold mb-3">{card.title}</h3>
                  <p className="text-muted-foreground mb-6">{card.description}</p>

                  <ul className="space-y-3 mb-8">
                    {card.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full group-hover:shadow-md transition-shadow" asChild>
                    <Link to={card.href}>
                      {card.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-secondary/50 py-16 lg:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Why HoReCa Hub?
              </span>
              <h2 className="font-heading text-3xl font-bold lg:text-4xl mb-6">
                Built specifically for the hospitality industry
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Unlike generic B2B platforms, HoReCa Hub understands the unique needs of restaurants, 
                hotels, and catering businesses. Our verified supplier network and curated job board 
                save you time and ensure quality.
              </p>

              <div className="space-y-4">
                {[
                  "Verified suppliers with industry certifications",
                  "Specialized job categories for hospitality roles",
                  "Direct communication with decision makers",
                  "Streamlined RFQ and ordering process",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={UNSPLASH.featured}
                  alt="Fine dining experience"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="rounded-xl bg-card/90 backdrop-blur-sm p-4 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Trusted by 50,000+ businesses</p>
                        <p className="text-sm text-muted-foreground">Across the hospitality industry</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="rounded-2xl hero-gradient p-8 lg:p-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-primary-foreground lg:text-4xl mb-4">
              Ready to grow your hospitality business?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of restaurants, suppliers, and hospitality professionals 
              already using HoReCa Hub to connect and grow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="accent" asChild>
                <Link to="/auth/register">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="hero-outline" asChild>
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

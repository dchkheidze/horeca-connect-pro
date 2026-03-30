import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    description: "Get started and explore the platform",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Basic business profile",
      "Browse marketplace",
      "Up to 3 active listings",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    id: "standard" as const,
    name: "Standard",
    description: "For growing businesses ready to scale",
    monthlyPrice: 90,
    annualPrice: 918, // 90 * 12 * 0.85
    features: [
      "Everything in Free",
      "Unlimited listings",
      "RFQ access & responses",
      "Priority in search results",
      "Email support",
    ],
    cta: "Choose Standard",
    popular: true,
  },
  {
    id: "premium" as const,
    name: "Premium",
    description: "Full access for established businesses",
    monthlyPrice: 150,
    annualPrice: 1530, // 150 * 12 * 0.85
    features: [
      "Everything in Standard",
      "Featured business badge",
      "Advanced analytics",
      "Dedicated account manager",
      "Priority support",
      "Custom branding options",
    ],
    cta: "Choose Premium",
    popular: false,
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"annual" | "monthly">("annual");

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient py-16 lg:py-24">
        <div className="container text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Choose the plan that fits your business. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-primary-foreground/10 p-1.5 backdrop-blur-sm">
            <button
              onClick={() => setBillingPeriod("annual")}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all",
                billingPeriod === "annual"
                  ? "bg-primary-foreground text-primary shadow-md"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              )}
            >
              Annual
              <Badge variant="secondary" className="ml-2 bg-accent text-accent-foreground text-xs">
                Save 15%
              </Badge>
            </button>
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all",
                billingPeriod === "monthly"
                  ? "bg-primary-foreground text-primary shadow-md"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              )}
            >
              Monthly
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const price = billingPeriod === "annual" ? plan.annualPrice : plan.monthlyPrice;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 animate-fade-in-up",
                    plan.popular
                      ? "border-primary shadow-xl scale-[1.02] lg:scale-105"
                      : "border-border/50 hover:border-primary/30 hover:shadow-lg"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="font-heading text-xl">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <span className="font-heading text-4xl font-bold">
                        {price === 0 ? "Free" : `${price} ₾`}
                      </span>
                      {price > 0 && (
                        <span className="text-muted-foreground text-sm ml-1">
                          / {billingPeriod === "annual" ? "year" : "month"}
                        </span>
                      )}
                      {billingPeriod === "annual" && price > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          That's {Math.round(price / 12)} ₾/month
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link to="/auth/register">
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-12">
            All prices are in Georgian Lari (₾). Applicable to Restaurant, Supplier, and Service Provider accounts.
          </p>
        </div>
      </section>
    </div>
  );
}

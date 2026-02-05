import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin,
  Clock,
  Banknote,
  ArrowLeft,
  Briefcase,
  Building2,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Job {
  id: string;
  slug: string;
  title: string;
  city: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  description: string | null;
  created_at: string;
  published_at: string | null;
  restaurant: {
    name: string;
    city: string | null;
    description: string | null;
  } | null;
}

export default function JobDetailPage() {
  const { slug } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      if (!slug) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          slug,
          title,
          city,
          employment_type,
          salary_min,
          salary_max,
          currency,
          description,
          created_at,
          published_at,
          restaurant:restaurants(name, city, description)
        `)
        .eq("slug", slug)
        .eq("status", "PUBLISHED")
        .maybeSingle();

      if (error) {
        console.error("Error fetching job:", error);
      } else {
        setJob(data);
      }
      setLoading(false);
    };

    fetchJob();
  }, [slug]);

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return "Salary negotiable";
    const curr = currency || "EUR";
    if (min && max) return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `From ${curr} ${min.toLocaleString()}`;
    if (max) return `Up to ${curr} ${max.toLocaleString()}`;
    return "Salary negotiable";
  };

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-12 text-center">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Job not found</h1>
        <p className="text-muted-foreground mb-6">
          This job posting doesn't exist or is no longer available.
        </p>
        <Button asChild>
          <Link to="/jobs">Browse Jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 lg:py-12">
      <div className="container">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center border border-border">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="font-heading text-2xl font-bold">{job.title}</h1>
                        <p className="text-lg text-muted-foreground">
                          {job.restaurant?.name || "Company"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          job.employment_type?.toLowerCase() === "full-time"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {job.employment_type || "Full-time"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                      {job.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Banknote className="h-4 w-4" />
                        {formatSalary(job.salary_min, job.salary_max, job.currency)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Posted{" "}
                        {formatDistanceToNow(new Date(job.published_at || job.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.description || "No description provided."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">
                  Apply for this position
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Create a profile to apply for this job and get notified about similar
                  opportunities.
                </p>
                <Button className="w-full mb-3" size="lg" asChild>
                  <Link to="/auth/register?role=jobseeker">Apply Now</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth/login">Sign in to Apply</Link>
                </Button>
              </CardContent>
            </Card>

            {job.restaurant && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    About {job.restaurant.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center border border-border mb-4">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.restaurant.description ||
                      `${job.restaurant.name} is a leading establishment in the hospitality industry, committed to excellence in service and employee development.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

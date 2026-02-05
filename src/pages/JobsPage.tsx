import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Clock, Banknote, ArrowRight, Briefcase, Loader2 } from "lucide-react";
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
  } | null;
}

const jobTypeFilters = ["All Types", "Full-time", "Part-time", "Contract", "Seasonal"];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
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
          restaurant:restaurants(name)
        `)
        .eq("status", "PUBLISHED")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error);
      } else {
        setJobs(data || []);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (job.restaurant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType =
      selectedType === "All Types" ||
      job.employment_type?.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return "Salary negotiable";
    const curr = currency || "EUR";
    if (min && max) return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `From ${curr} ${min.toLocaleString()}`;
    if (max) return `Up to ${curr} ${max.toLocaleString()}`;
    return "Salary negotiable";
  };

  return (
    <div className="py-8 lg:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold lg:text-4xl mb-2">
            Hospitality Jobs
          </h1>
          <p className="text-lg text-muted-foreground">
            Find your next opportunity in restaurants, hotels, and hospitality.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {jobTypeFilters.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type}
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
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="group hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border border-border flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-heading font-semibold text-lg">
                            {job.title}
                          </h3>
                          <Badge
                            variant={
                              job.employment_type?.toLowerCase() === "full-time"
                                ? "default"
                                : "secondary"
                            }
                            className="flex-shrink-0"
                          >
                            {job.employment_type || "Full-time"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {job.restaurant?.name || "Company"}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                            {formatDistanceToNow(
                              new Date(job.published_at || job.created_at),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" asChild className="lg:w-auto w-full">
                      <Link to={`/jobs/${job.slug}`}>
                        View Job
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">No jobs found matching your criteria.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Check back soon for new opportunities!
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("All Types");
                }}
              >
                Clear filters
              </Button>
              <Button asChild>
                <Link to="/auth/register?role=restaurant">Post a Job</Link>
              </Button>
            </div>
          </div>
        )}

        {/* CTA */}
        {!loading && filteredJobs.length > 0 && (
          <Card className="mt-12 hero-gradient text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="font-heading text-2xl font-bold mb-3">
                Looking to hire hospitality talent?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
                Post your job openings and reach thousands of qualified candidates in the HoReCa industry.
              </p>
              <Button variant="accent" size="lg" asChild>
                <Link to="/auth/register?role=restaurant">
                  Post a Job
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

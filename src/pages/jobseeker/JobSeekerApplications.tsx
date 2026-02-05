import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Briefcase, Calendar, MapPin, ExternalLink, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface Application {
  id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  created_at: string;
  job: {
    id: string;
    slug: string;
    title: string;
    city: string | null;
    employment_type: string | null;
    status: string;
    restaurant: {
      name: string;
    } | null;
  } | null;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  APPLIED: { label: "Applied", color: "bg-blue-500" },
  SHORTLISTED: { label: "Shortlisted", color: "bg-yellow-500" },
  INTERVIEW: { label: "Interview", color: "bg-purple-500" },
  OFFERED: { label: "Offered", color: "bg-green-500" },
  HIRED: { label: "Hired", color: "bg-green-700" },
  REJECTED: { label: "Rejected", color: "bg-red-500" },
};

export default function JobSeekerApplications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          status,
          cover_letter,
          created_at,
          job:jobs(
            id,
            slug,
            title,
            city,
            employment_type,
            status,
            restaurant:restaurants(name)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        setApplications(data || []);
      }
      setLoading(false);
    };

    fetchApplications();
  }, [user]);

  const getStatusBadge = (status: ApplicationStatus) => {
    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold lg:text-3xl">My Applications</h1>
          <p className="text-muted-foreground">Track the status of your job applications.</p>
        </div>
        <Button asChild>
          <Link to="/jobs">Browse Jobs</Link>
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-4">
              Start applying to jobs to see your applications here.
            </p>
            <Button asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border border-border flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-lg">
                          {app.job?.title || "Unknown Position"}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {app.job?.restaurant?.name || "Company"}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {app.job?.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {app.job.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied{" "}
                          {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                        </span>
                        {app.cover_letter && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Cover letter included
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {app.job?.status === "PUBLISHED" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/jobs/${app.job.slug}`}>
                          View Job
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {app.job?.status === "CLOSED" && (
                      <Badge variant="secondary">Job Closed</Badge>
                    )}
                  </div>
                </div>

                {/* Status Timeline Indicator */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{statusConfig[app.status].label}</span>
                    {app.status === "APPLIED" && (
                      <span className="text-muted-foreground">
                        — Waiting for employer review
                      </span>
                    )}
                    {app.status === "SHORTLISTED" && (
                      <span className="text-muted-foreground">
                        — Employer is interested
                      </span>
                    )}
                    {app.status === "INTERVIEW" && (
                      <span className="text-muted-foreground">
                        — Interview scheduled
                      </span>
                    )}
                    {app.status === "OFFERED" && (
                      <span className="text-muted-foreground">
                        — Congratulations! You received an offer
                      </span>
                    )}
                    {app.status === "HIRED" && (
                      <span className="text-muted-foreground">
                        — You got the job!
                      </span>
                    )}
                    {app.status === "REJECTED" && (
                      <span className="text-muted-foreground">
                        — This application was not successful
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

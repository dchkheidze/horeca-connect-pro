import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Briefcase, Calendar, FileText, ArrowLeft } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface Application {
  id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  created_at: string;
  job: {
    id: string;
    title: string;
    slug: string;
  };
  applicant: {
    id: string;
    full_name: string;
    title: string | null;
    city: string | null;
    phone: string | null;
    about: string | null;
  } | null;
}

interface Job {
  id: string;
  title: string;
}

const statusOptions: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "APPLIED", label: "Applied", color: "bg-blue-500" },
  { value: "SHORTLISTED", label: "Shortlisted", color: "bg-yellow-500" },
  { value: "INTERVIEW", label: "Interview", color: "bg-purple-500" },
  { value: "OFFERED", label: "Offered", color: "bg-green-500" },
  { value: "HIRED", label: "Hired", color: "bg-green-700" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-500" },
];

export default function RestaurantApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get("job");

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchData = async () => {
    if (!user) return;

    // First get restaurant id
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (restaurantError || !restaurant) {
      console.error("Error fetching restaurant:", restaurantError);
      setLoading(false);
      return;
    }

    // Fetch all jobs for filter dropdown
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("id, title")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });

    setJobs(jobsData || []);

    // Fetch applications
    let query = supabase
      .from("job_applications")
      .select(`
        id,
        status,
        cover_letter,
        created_at,
        job:jobs!inner(id, title, slug, restaurant_id)
      `)
      .order("created_at", { ascending: false });

    if (selectedJobId) {
      query = query.eq("job_id", selectedJobId);
    }

    const { data: applicationsData, error: applicationsError } = await query;

    if (applicationsError) {
      console.error("Error fetching applications:", applicationsError);
    } else {
      // Filter by restaurant and fetch applicant details
      const filteredApps = (applicationsData || []).filter(
        (app: any) => app.job?.restaurant_id === restaurant.id
      );

      // Fetch job seeker profiles for each application
      const appsWithProfiles = await Promise.all(
        filteredApps.map(async (app: any) => {
          // Get user_id from the application
          const { data: appData } = await supabase
            .from("job_applications")
            .select("user_id")
            .eq("id", app.id)
            .single();

          if (appData?.user_id) {
            const { data: profile } = await supabase
              .from("job_seekers")
              .select("id, full_name, title, city, phone, about")
              .eq("user_id", appData.user_id)
              .maybeSingle();

            return { ...app, applicant: profile };
          }

          return { ...app, applicant: null };
        })
      );

      setApplications(appsWithProfiles);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user, selectedJobId]);

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    const { error } = await supabase
      .from("job_applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    if (error) {
      console.error("Error updating status:", error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Status updated" });
      fetchData();
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const option = statusOptions.find((o) => o.value === status);
    return (
      <Badge className={option?.color || "bg-gray-500"}>
        {option?.label || status}
      </Badge>
    );
  };

  const handleJobFilter = (value: string) => {
    if (value === "all") {
      searchParams.delete("job");
    } else {
      searchParams.set("job", value);
    }
    setSearchParams(searchParams);
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/r/hr/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold lg:text-3xl">Applications</h1>
            <p className="text-muted-foreground">Review and manage job applications.</p>
          </div>
        </div>

        <Select value={selectedJobId || "all"} onValueChange={handleJobFilter}>
          <SelectTrigger className="w-[250px]">
            <Briefcase className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-4">
              {selectedJobId
                ? "No applications received for this job yet."
                : "Applications will appear here when candidates apply to your jobs."}
            </p>
            <Button asChild>
              <Link to="/r/hr/jobs">View Jobs</Link>
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
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-border flex-shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="font-heading font-semibold">
                          {app.applicant?.full_name || "Unknown Applicant"}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {app.applicant?.title || "Job Seeker"}{" "}
                        {app.applicant?.city && `• ${app.applicant.city}`}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {app.job.title}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied{" "}
                          {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                        </span>
                        {app.cover_letter && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Has cover letter
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(app);
                        setDetailsOpen(true);
                      }}
                    >
                      View Details
                    </Button>

                    <Select
                      value={app.status}
                      onValueChange={(value) =>
                        handleStatusChange(app.id, value as ApplicationStatus)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Application Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Application for {selectedApplication?.job.title}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6 py-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold">
                    {selectedApplication.applicant?.full_name || "Unknown"}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedApplication.applicant?.title || "Job Seeker"}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {selectedApplication.applicant?.city && (
                      <span>{selectedApplication.applicant.city}</span>
                    )}
                    {selectedApplication.applicant?.phone && (
                      <span>{selectedApplication.applicant.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(selectedApplication.status)}
                <span className="text-muted-foreground ml-auto">
                  Applied on{" "}
                  {format(new Date(selectedApplication.created_at), "MMMM d, yyyy")}
                </span>
              </div>

              {selectedApplication.applicant?.about && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedApplication.applicant.about}
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedApplication.cover_letter && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Cover Letter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedApplication.cover_letter}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2">
                <Select
                  value={selectedApplication.status}
                  onValueChange={(value) => {
                    handleStatusChange(selectedApplication.id, value as ApplicationStatus);
                    setSelectedApplication({
                      ...selectedApplication,
                      status: value as ApplicationStatus,
                    });
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

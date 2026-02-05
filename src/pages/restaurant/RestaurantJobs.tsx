import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  MoreVertical,
  Eye,
  EyeOff,
  Users,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type JobStatus = Database["public"]["Enums"]["job_status"];

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
  status: JobStatus;
  created_at: string;
  published_at: string | null;
  application_count?: number;
}

interface FormData {
  title: string;
  city: string;
  employment_type: string;
  salary_min: string;
  salary_max: string;
  currency: string;
  description: string;
}

const emptyFormData: FormData = {
  title: "",
  city: "",
  employment_type: "Full-time",
  salary_min: "",
  salary_max: "",
  currency: "EUR",
  description: "",
};

const employmentTypes = ["Full-time", "Part-time", "Contract", "Seasonal"];

export default function RestaurantJobs() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const fetchJobs = async () => {
    if (!user) return;

    // First get restaurant id
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (restaurantError) {
      console.error("Error fetching restaurant:", restaurantError);
      setLoading(false);
      return;
    }

    if (!restaurant) {
      setLoading(false);
      return;
    }

    setRestaurantId(restaurant.id);

    // Fetch jobs with application counts
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
    } else {
      // Get application counts for each job
      const jobsWithCounts = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { count } = await supabase
            .from("job_applications")
            .select("*", { count: "exact", head: true })
            .eq("job_id", job.id);
          return { ...job, application_count: count || 0 };
        })
      );
      setJobs(jobsWithCounts);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const generateSlug = (title: string) => {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `${base}-${Date.now().toString(36)}`;
  };

  const handleOpenCreate = () => {
    setEditingJob(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      city: job.city || "",
      employment_type: job.employment_type || "Full-time",
      salary_min: job.salary_min?.toString() || "",
      salary_max: job.salary_max?.toString() || "",
      currency: job.currency || "EUR",
      description: job.description || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!restaurantId || !formData.title.trim()) return;

    setSaving(true);

    const jobData = {
      restaurant_id: restaurantId,
      title: formData.title.trim(),
      city: formData.city.trim() || null,
      employment_type: formData.employment_type,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
      currency: formData.currency,
      description: formData.description.trim() || null,
    };

    if (editingJob) {
      const { error } = await supabase
        .from("jobs")
        .update(jobData)
        .eq("id", editingJob.id);

      if (error) {
        console.error("Error updating job:", error);
        toast({ title: "Error", description: "Failed to update job", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Job updated" });
        setDialogOpen(false);
        fetchJobs();
      }
    } else {
      const { error } = await supabase.from("jobs").insert({
        ...jobData,
        slug: generateSlug(formData.title),
        status: "DRAFT" as JobStatus,
      });

      if (error) {
        console.error("Error creating job:", error);
        toast({ title: "Error", description: "Failed to create job", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Job created as draft" });
        setDialogOpen(false);
        fetchJobs();
      }
    }

    setSaving(false);
  };

  const handleStatusChange = async (job: Job, newStatus: JobStatus) => {
    const updateData: { status: JobStatus; published_at?: string | null } = {
      status: newStatus,
    };

    if (newStatus === "PUBLISHED" && !job.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase.from("jobs").update(updateData).eq("id", job.id);

    if (error) {
      console.error("Error updating status:", error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Job ${newStatus.toLowerCase()}` });
      fetchJobs();
    }
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;

    const { error } = await supabase.from("jobs").delete().eq("id", jobToDelete.id);

    if (error) {
      console.error("Error deleting job:", error);
      toast({ title: "Error", description: "Failed to delete job", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Job deleted" });
      fetchJobs();
    }

    setDeleteDialogOpen(false);
    setJobToDelete(null);
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-600">Published</Badge>;
      case "CLOSED":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No restaurant profile found. Please complete onboarding.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold lg:text-3xl">Job Postings</h1>
          <p className="text-muted-foreground">Manage your job listings and attract candidates.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No job postings yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first job posting to start attracting candidates.
            </p>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border border-border flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-lg">{job.title}</h3>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {job.city && <span>{job.city}</span>}
                        <span>{job.employment_type || "Full-time"}</span>
                        <span>
                          Created{" "}
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/r/hr/applications?job=${job.id}`}>
                        <Users className="mr-2 h-4 w-4" />
                        Applications ({job.application_count || 0})
                      </Link>
                    </Button>

                    {job.status === "PUBLISHED" && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/jobs/${job.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(job)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {job.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(job, "PUBLISHED")}>
                            <Eye className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        {job.status === "PUBLISHED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(job, "CLOSED")}>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Close
                          </DropdownMenuItem>
                        )}
                        {job.status === "CLOSED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(job, "PUBLISHED")}>
                            <Eye className="mr-2 h-4 w-4" />
                            Reopen
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setJobToDelete(job);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job" : "Create New Job"}</DialogTitle>
            <DialogDescription>
              {editingJob
                ? "Update the job details."
                : "Fill in the details for your new job posting. It will be saved as a draft."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Head Chef, Restaurant Manager"
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g., Paris"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, employment_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="salary_min">Salary Min</Label>
                <Input
                  id="salary_min"
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, salary_min: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_max">Salary Max</Label>
                <Input
                  id="salary_max"
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, salary_max: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !formData.title.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingJob ? "Update" : "Create Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{jobToDelete?.title}"? This will also delete all
              applications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

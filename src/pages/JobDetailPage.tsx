import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { jobs } from "@/data/mockData";
import { 
  MapPin, 
  Clock, 
  Banknote, 
  ArrowLeft, 
  CheckCircle2,
  Briefcase,
  Building2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function JobDetailPage() {
  const { slug } = useParams();
  const job = jobs.find((j) => j.slug === slug);

  if (!job) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Job not found</h1>
        <Button asChild>
          <Link to="/jobs">Back to Jobs</Link>
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
                  <img
                    src={job.companyLogo}
                    alt={`${job.company} logo`}
                    className="h-16 w-16 rounded-xl object-cover border border-border"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="font-heading text-2xl font-bold">{job.title}</h1>
                        <p className="text-lg text-muted-foreground">{job.company}</p>
                      </div>
                      <Badge variant={job.type === "Full-time" ? "default" : "secondary"}>
                        {job.type}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Banknote className="h-4 w-4" />
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Posted {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
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
                <p className="text-muted-foreground leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Apply for this position</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Create a profile to apply for this job and get notified about similar opportunities.
                </p>
                <Button className="w-full mb-3" size="lg" asChild>
                  <Link to="/auth/register?role=jobseeker">Apply Now</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth/login">Sign in to Apply</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  About {job.company}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={job.companyLogo}
                  alt={`${job.company} logo`}
                  className="h-16 w-16 rounded-lg object-cover border border-border mb-4"
                />
                <p className="text-sm text-muted-foreground">
                  {job.company} is a leading establishment in the hospitality industry, 
                  committed to excellence in service and employee development.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

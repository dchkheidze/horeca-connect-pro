import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  FileText, 
  Eye, 
  CheckCircle,
  ArrowRight,
  Search
} from "lucide-react";

const stats = [
  { title: "Applications Sent", value: "12", icon: FileText, change: "3 this week" },
  { title: "Profile Views", value: "89", icon: Eye, change: "+15% this month" },
  { title: "Jobs Saved", value: "8", icon: Briefcase, change: "2 expiring soon" },
  { title: "Interview Invites", value: "3", icon: CheckCircle, change: "1 new" },
];

const applications = [
  { job: "Executive Chef", company: "The Grand Restaurant", status: "Under Review", date: "Jan 15" },
  { job: "Head Bartender", company: "The Copper Room", status: "Interview", date: "Jan 12" },
  { job: "Line Cook", company: "Bella Cucina", status: "Applied", date: "Jan 10" },
];

export default function JobSeekerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold lg:text-3xl">Job Seeker Dashboard</h1>
          <p className="text-muted-foreground">Track your applications and find new opportunities.</p>
        </div>
        <Button asChild>
          <Link to="/jobs">
            <Search className="mr-2 h-4 w-4" />
            Browse Jobs
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-jobseeker/10">
                  <stat.icon className="h-6 w-6 text-jobseeker" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="font-heading text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/j/applications">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((app, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{app.job}</p>
                    <p className="text-sm text-muted-foreground">{app.company}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        app.status === "Interview"
                          ? "default"
                          : app.status === "Under Review"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {app.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{app.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Boost Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/j/profile">
                Update Your Resume
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/jobs">
                Explore New Jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/j/settings">
                Job Alert Settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

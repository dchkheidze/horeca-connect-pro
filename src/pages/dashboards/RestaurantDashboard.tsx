import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Briefcase, 
  TrendingUp, 
  Users,
  ArrowRight,
  Plus
} from "lucide-react";

const stats = [
  { title: "Active Suppliers", value: "24", icon: Building2, change: "+3 this month" },
  { title: "Open Jobs", value: "5", icon: Briefcase, change: "2 pending review" },
  { title: "Applications", value: "47", icon: Users, change: "+12 this week" },
  { title: "Views", value: "1,234", icon: TrendingUp, change: "+8% vs last week" },
];

export default function RestaurantDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold lg:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/suppliers">
              Find Suppliers
            </Link>
          </Button>
          <Button asChild>
            <Link to="/r/jobs">
              <Plus className="mr-2 h-4 w-4" />
              Post a Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
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
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { text: "New application for Executive Chef position", time: "2 hours ago" },
                { text: "Quote received from Premium Foods Co.", time: "5 hours ago" },
                { text: "Job posting views increased by 20%", time: "Yesterday" },
                { text: "New message from CleanService Solutions", time: "2 days ago" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/suppliers">
                Browse Supplier Directory
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/r/jobs">
                Manage Job Postings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/r/settings">
                Update Business Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

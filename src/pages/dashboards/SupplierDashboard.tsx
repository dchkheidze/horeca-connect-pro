import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Eye,
  ArrowRight,
  Settings
} from "lucide-react";

const stats = [
  { title: "Profile Views", value: "2,456", icon: Eye, change: "+18% this month" },
  { title: "Inquiries", value: "34", icon: MessageSquare, change: "8 new this week" },
  { title: "Leads", value: "156", icon: Users, change: "+23 this month" },
  { title: "Conversion Rate", value: "12%", icon: TrendingUp, change: "+2% vs last month" },
];

export default function SupplierDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold lg:text-3xl">Supplier Dashboard</h1>
          <p className="text-muted-foreground">Manage your business and connect with restaurants.</p>
        </div>
        <Button asChild>
          <Link to="/s/profile">
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-supplier/10">
                  <stat.icon className="h-6 w-6 text-supplier" />
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
        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { company: "The Grand Restaurant", type: "Quote Request", time: "1 hour ago" },
                { company: "Urban Bistro", type: "Product Inquiry", time: "3 hours ago" },
                { company: "Seaside Hotel", type: "Quote Request", time: "Yesterday" },
                { company: "Café Milano", type: "General Inquiry", time: "2 days ago" },
              ].map((inquiry, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{inquiry.company}</p>
                    <p className="text-sm text-muted-foreground">{inquiry.type}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{inquiry.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Grow Your Business</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/s/profile">
                Complete Your Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/s/leads">
                View All Leads
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link to="/s/settings">
                Manage Settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

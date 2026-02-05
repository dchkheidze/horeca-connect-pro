import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Briefcase, 
  Settings, 
  LogOut,
  Menu,
  X 
} from "lucide-react";
import { useState } from "react";

interface DashboardLayoutProps {
  role: "restaurant" | "supplier" | "jobseeker";
}

const roleConfig = {
  restaurant: {
    title: "Restaurant Dashboard",
    prefix: "/r",
    color: "bg-primary",
    navItems: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/r/dashboard" },
      { icon: Building2, label: "Suppliers", href: "/r/suppliers" },
      { icon: Briefcase, label: "Jobs", href: "/r/jobs" },
      { icon: Settings, label: "Settings", href: "/r/settings" },
    ],
  },
  supplier: {
    title: "Supplier Dashboard",
    prefix: "/s",
    color: "bg-supplier",
    navItems: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/s/dashboard" },
      { icon: Users, label: "Leads", href: "/s/leads" },
      { icon: Building2, label: "Profile", href: "/s/profile" },
      { icon: Settings, label: "Settings", href: "/s/settings" },
    ],
  },
  jobseeker: {
    title: "Job Seeker Dashboard",
    prefix: "/j",
    color: "bg-jobseeker",
    navItems: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/j/dashboard" },
      { icon: Briefcase, label: "Applications", href: "/j/applications" },
      { icon: Users, label: "Profile", href: "/j/profile" },
      { icon: Settings, label: "Settings", href: "/j/settings" },
    ],
  },
};

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const location = useLocation();
  const config = roleConfig[role];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.color}`}>
            <span className="text-sm font-bold text-primary-foreground">H</span>
          </div>
          <span className="font-heading font-semibold">{config.title}</span>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {config.navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" asChild>
            <Link to="/">
              <LogOut className="h-5 w-5" />
              Sign out
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-lg lg:px-6">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg lg:hidden hover:bg-secondary"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Home
          </Link>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

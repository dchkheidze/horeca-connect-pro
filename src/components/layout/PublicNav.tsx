import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/jobs", label: "Jobs" },
];

export function PublicNav() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, isAdmin, signOut } = useAuth();

  const getDashboardLink = () => {
    if (!role) return "/dashboard";
    if (role === "admin") return "/admin/dashboard";
    const roleLinks: Record<string, string> = {
      restaurant: "/r/dashboard",
      supplier: "/s/dashboard",
      serviceprovider: "/sp/dashboard",
      jobseeker: "/j/dashboard",
    };
    return roleLinks[role] || "/dashboard";
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">H</span>
          </div>
          <span className="font-heading text-xl font-bold text-foreground">HoReCa Hub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-secondary ${
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" asChild className="text-destructive">
                  <Link to="/admin/dashboard">Admin</Link>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <Link to={getDashboardLink()}>Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden hover:bg-secondary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-3 text-sm font-medium transition-colors rounded-lg ${
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="px-4 py-3 text-sm font-medium text-destructive hover:bg-secondary rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to={getDashboardLink()}
                  className="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button variant="outline" onClick={handleSignOut} className="mt-2">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Button asChild className="mt-2">
                  <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    Get started
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

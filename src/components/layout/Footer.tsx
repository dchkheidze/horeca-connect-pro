import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">H</span>
              </div>
              <span className="font-heading text-lg font-bold">HoReCa Hub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The B2B marketplace connecting restaurants, suppliers, and hospitality professionals.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-heading font-semibold">For Businesses</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/suppliers" className="hover:text-foreground transition-colors">Find Suppliers</Link></li>
              <li><Link to="/auth/register" className="hover:text-foreground transition-colors">List Your Business</Link></li>
              <li><Link to="/jobs" className="hover:text-foreground transition-colors">Post Jobs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading font-semibold">For Job Seekers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/jobs" className="hover:text-foreground transition-colors">Browse Jobs</Link></li>
              <li><Link to="/auth/register" className="hover:text-foreground transition-colors">Create Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HoReCa Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

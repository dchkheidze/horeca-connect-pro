import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, this would check the user's role and redirect accordingly
    // For now, default to restaurant dashboard
    navigate("/r/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to dashboard...</p>
    </div>
  );
}

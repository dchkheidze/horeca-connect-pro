import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "restaurant" | "supplier" | "jobseeker" | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // FIX 1: setLoading(false) is now called INSIDE fetchUserRole,
  // after the role is known. This prevents ProtectedRoute from seeing
  // loading=false + role=null and incorrectly redirecting to login.
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);

      if (data && !error && data.length > 0) {
        const hasAdmin = data.some((r) => r.role === "admin");
        setIsAdmin(hasAdmin);
        const nonAdminRole = data.find((r) => r.role !== "admin");
        setRole((nonAdminRole?.role || data[0].role) as AppRole);
      } else {
        // No role found — user registered but onboarding incomplete
        setRole(null);
        setIsAdmin(false);
      }
    } catch {
      setRole(null);
      setIsAdmin(false);
    } finally {
      // Always mark loading done after role fetch attempt
      setLoading(false);
    }
  };

  useEffect(() => {
    // FIX 2: Use ONLY onAuthStateChange — removed the separate getSession() call
    // that was causing fetchUserRole to run twice on every page load.
    // onAuthStateChange fires with the existing session immediately on mount.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // setTimeout avoids a Supabase internal deadlock when calling
        // other Supabase queries inside onAuthStateChange
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      } else {
        // Logged out — clear everything and stop loading immediately
        setRole(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, selectedRole: AppRole) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });

    if (error) return { error };

    if (data.user) {
      // Create profile row
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ user_id: data.user.id, full_name: fullName });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }

      // Create role row
      // SECURITY NOTE: Move this to a Supabase server-side trigger or
      // edge function to prevent users from assigning themselves "admin"
      // via a modified client request.
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: data.user.id, role: selectedRole });

      if (roleError) {
        console.error("Error creating role:", roleError);
        return { error: roleError };
      }

      setRole(selectedRole);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    // onAuthStateChange handles clearing state after signOut fires,
    // but we clear eagerly here for instant UI response
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, isAdmin, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, UserCog } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: AppRole[];
  subscription_plan: string | null;
  subscription_billing: string | null;
}

const ALL_ROLES: AppRole[] = ["restaurant", "supplier", "serviceprovider", "jobseeker", "realestate", "admin"];

const roleColors: Record<AppRole, string> = {
  restaurant: "bg-primary/10 text-primary",
  supplier: "bg-supplier/10 text-supplier",
  serviceprovider: "bg-accent/10 text-accent-foreground",
  jobseeker: "bg-jobseeker/10 text-jobseeker",
  realestate: "bg-amber-100 text-amber-800",
  admin: "bg-destructive/10 text-destructive",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const [profilesRes, rolesRes, subsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, created_at").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("subscriptions").select("user_id, plan, billing_period"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const rolesByUser = (rolesRes.data || []).reduce((acc, { user_id, role }) => {
        if (!acc[user_id]) acc[user_id] = [];
        acc[user_id].push(role);
        return acc;
      }, {} as Record<string, AppRole[]>);

      const subsByUser = (subsRes.data || []).reduce((acc, { user_id, plan, billing_period }) => {
        acc[user_id] = { plan, billing_period };
        return acc;
      }, {} as Record<string, { plan: string; billing_period: string }>);

      const usersData: UserWithRoles[] = (profilesRes.data || []).map((profile) => ({
        id: profile.user_id,
        email: "",
        full_name: profile.full_name,
        created_at: profile.created_at,
        roles: rolesByUser[profile.user_id] || [],
        subscription_plan: subsByUser[profile.user_id]?.plan || null,
        subscription_billing: subsByUser[profile.user_id]?.billing_period || null,
      }));

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditRoles = (user: UserWithRoles) => {
    setEditingUser(user);
    setSelectedRoles([...user.roles]);
  };

  const handleRoleToggle = (role: AppRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;
    setSaving(true);

    try {
      const currentRoles = editingUser.roles;
      const rolesToAdd = selectedRoles.filter((r) => !currentRoles.includes(r));
      const rolesToRemove = currentRoles.filter((r) => !selectedRoles.includes(r));

      // Check if trying to remove admin role
      if (rolesToRemove.includes("admin")) {
        // Count total admins in system
        const { count, error: countError } = await supabase
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin");

        if (countError) throw countError;

        if (count && count <= 1) {
          toast.error("Cannot remove the last admin. Assign another admin first.");
          setSaving(false);
          return;
        }
      }

      // Remove roles
      for (const role of rolesToRemove) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", editingUser.id)
          .eq("role", role);

        if (error) throw error;
      }

      // Add roles
      for (const role of rolesToAdd) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: editingUser.id, role });

        if (error) throw error;
      }

      toast.success("Roles updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating roles:", error);
      toast.error("Failed to update roles");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
        <p className="text-muted-foreground">View and manage user roles</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {user.full_name || "No name"}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {user.id.slice(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className={roleColors[role]}
                            >
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No roles
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.subscription_plan ? (
                        <div className="flex flex-col gap-0.5">
                          <Badge
                            variant="secondary"
                            className={cn(
                              user.subscription_plan === "premium" && "bg-amber-100 text-amber-800",
                              user.subscription_plan === "standard" && "bg-blue-100 text-blue-800",
                              user.subscription_plan === "free" && "bg-muted text-muted-foreground"
                            )}
                          >
                            {user.subscription_plan}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">
                            {user.subscription_billing}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRoles(user)}
                      >
                        <UserCog className="h-4 w-4 mr-1" />
                        Edit Roles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">No users found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Roles Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Roles for {editingUser?.full_name || "User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select the roles you want to assign to this user.
            </p>
            <div className="space-y-3">
              {ALL_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-secondary transition-colors"
                >
                  <Checkbox
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={() => handleRoleToggle(role)}
                  />
                  <div>
                    <p className="font-medium capitalize">{role}</p>
                    <p className="text-xs text-muted-foreground">
                      {role === "admin" && "Full access to admin panel"}
                      {role === "restaurant" && "Can manage restaurant and jobs"}
                      {role === "supplier" && "Can manage supplier profile and offers"}
                      {role === "serviceprovider" && "Can manage service provider profile and offers"}
                      {role === "jobseeker" && "Can apply for jobs"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoles} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

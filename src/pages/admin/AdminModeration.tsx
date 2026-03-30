import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, Truck, Briefcase, ExternalLink, Home } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
type Job = Database["public"]["Tables"]["jobs"]["Row"];

export default function AdminModeration() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [restaurantsRes, suppliersRes, jobsRes, propertiesRes] = await Promise.all([
        supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
        supabase.from("suppliers").select("*").order("created_at", { ascending: false }),
        supabase.from("jobs").select("*").order("created_at", { ascending: false }),
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
      ]);

      if (restaurantsRes.data) setRestaurants(restaurantsRes.data);
      if (suppliersRes.data) setSuppliers(suppliersRes.data);
      if (jobsRes.data) setJobs(jobsRes.data);
      if (propertiesRes.data) setProperties(propertiesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load moderation data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleRestaurantPublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_published: !currentStatus } : r))
      );
      toast.success(`Restaurant ${!currentStatus ? "approved" : "unapproved"}`);
    } catch (error) {
      console.error("Error updating restaurant:", error);
      toast.error("Failed to update restaurant");
    }
  };

  const toggleSupplierPublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("suppliers")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_published: !currentStatus } : s))
      );
      toast.success(`Supplier ${!currentStatus ? "approved" : "unapproved"}`);
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Failed to update supplier");
    }
  };

  const updateJobStatus = async (id: string, status: "CLOSED" | "DRAFT") => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status } : j))
      );
      toast.success(`Job ${status === "CLOSED" ? "closed" : "unpublished"}`);
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job");
    }
  };

  const togglePropertyPublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ is_published: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      setProperties((prev: any[]) =>
        prev.map((p: any) => (p.id === id ? { ...p, is_published: !currentStatus } : p))
      );
      toast.success(`Property ${!currentStatus ? "published" : "unpublished"}`);
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property");
    }
  };

  const getJobStatusBadge = (status: string | null) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "CLOSED":
        return <Badge className="bg-muted text-muted-foreground">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Moderation</h1>
        <p className="text-muted-foreground">
          Approve or reject listings and manage content visibility
        </p>
      </div>

      <Tabs defaultValue="restaurants">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="restaurants" className="gap-2">
            <Building2 className="h-4 w-4" />
            Restaurants ({restaurants.length})
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Truck className="h-4 w-4" />
            Suppliers ({suppliers.length})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Jobs ({jobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="restaurants" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell className="font-medium">
                          {restaurant.name}
                        </TableCell>
                        <TableCell>{restaurant.city || "-"}</TableCell>
                        <TableCell>
                          {new Date(restaurant.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={restaurant.is_published || false}
                            onCheckedChange={() =>
                              toggleRestaurantPublished(
                                restaurant.id,
                                restaurant.is_published || false
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {restaurant.slug && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={`/restaurants/${restaurant.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {restaurants.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">No restaurants found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">
                          {supplier.name}
                        </TableCell>
                        <TableCell>{supplier.city || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {supplier.categories?.slice(0, 2).map((cat) => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                            {(supplier.categories?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(supplier.categories?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={supplier.is_published || false}
                            onCheckedChange={() =>
                              toggleSupplierPublished(
                                supplier.id,
                                supplier.is_published || false
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {supplier.slug && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={`/suppliers/${supplier.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {suppliers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">No suppliers found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.city || "-"}</TableCell>
                        <TableCell>{getJobStatusBadge(job.status)}</TableCell>
                        <TableCell>
                          {new Date(job.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {job.status === "PUBLISHED" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateJobStatus(job.id, "DRAFT")}
                              >
                                Unpublish
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => updateJobStatus(job.id, "CLOSED")}
                              >
                                Close
                              </Button>
                            </>
                          )}
                          {job.status === "DRAFT" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateJobStatus(job.id, "CLOSED")}
                            >
                              Close
                            </Button>
                          )}
                          {job.slug && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={`/jobs/${job.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {jobs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">No jobs found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

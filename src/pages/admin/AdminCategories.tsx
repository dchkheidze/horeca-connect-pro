import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UtensilsCrossed, Truck, Briefcase, MapPin } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  country?: string;
}

type CategoryType = "cuisines" | "supplier_categories" | "job_categories" | "cities";

const categoryConfig: Record<CategoryType, { label: string; icon: React.ComponentType<any> }> = {
  cuisines: { label: "Cuisines", icon: UtensilsCrossed },
  supplier_categories: { label: "Supplier Categories", icon: Truck },
  job_categories: { label: "Job Categories", icon: Briefcase },
  cities: { label: "Cities", icon: MapPin },
};

export default function AdminCategories() {
  const [activeTab, setActiveTab] = useState<CategoryType>("cuisines");
  const [categories, setCategories] = useState<Record<CategoryType, Category[]>>({
    cuisines: [],
    supplier_categories: [],
    job_categories: [],
    cities: [],
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    country: "Netherlands",
  });

  const fetchCategories = async () => {
    try {
      const [cuisinesRes, supplierCatsRes, jobCatsRes, citiesRes] = await Promise.all([
        supabase.from("cuisines").select("*").order("name"),
        supabase.from("supplier_categories").select("*").order("name"),
        supabase.from("job_categories").select("*").order("name"),
        supabase.from("cities").select("*").order("name"),
      ]);

      setCategories({
        cuisines: cuisinesRes.data || [],
        supplier_categories: supplierCatsRes.data || [],
        job_categories: jobCatsRes.data || [],
        cities: citiesRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingItem ? prev.slug : generateSlug(name),
    }));
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({ name: "", slug: "", country: "Netherlands" });
    setDialogOpen(true);
  };

  const openEditDialog = (item: Category) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      country: item.country || "Netherlands",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);

    try {
      const data: any = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
      };

      if (activeTab === "cities") {
        data.country = formData.country;
      }

      if (editingItem) {
        const { error } = await supabase
          .from(activeTab)
          .update(data)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success(`${categoryConfig[activeTab].label.slice(0, -1)} updated`);
      } else {
        const { error } = await supabase.from(activeTab).insert(data);

        if (error) throw error;
        toast.success(`${categoryConfig[activeTab].label.slice(0, -1)} created`);
      }

      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase.from(activeTab).delete().eq("id", id);

      if (error) throw error;
      toast.success("Deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  };

  const renderTable = (type: CategoryType) => {
    const items = categories[type];
    const isCity = type === "cities";

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{categoryConfig[type].label}</CardTitle>
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add {categoryConfig[type].label.slice(0, -1)}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No {categoryConfig[type].label.toLowerCase()} yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  {isCity && <TableHead>Country</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.slug}
                    </TableCell>
                    {isCity && (
                      <TableCell>{item.country || "Netherlands"}</TableCell>
                    )}
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Categories Management</h1>
        <p className="text-muted-foreground">
          Manage cuisines, supplier categories, job categories, and cities
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryType)}>
        <TabsList className="grid w-full grid-cols-4">
          {(Object.keys(categoryConfig) as CategoryType[]).map((type) => {
            const config = categoryConfig[type];
            return (
              <TabsTrigger key={type} value={type} className="gap-2">
                <config.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
                <span className="sm:hidden">{config.label.split(" ")[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(categoryConfig) as CategoryType[]).map((type) => (
          <TabsContent key={type} value={type} className="mt-4">
            {renderTable(type)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"} {categoryConfig[activeTab].label.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="url-friendly-slug"
              />
            </div>
            {activeTab === "cities" && (
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, country: e.target.value }))
                  }
                  placeholder="Country name"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

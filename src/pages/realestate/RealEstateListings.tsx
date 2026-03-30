import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";

const PROPERTY_TYPES = ["restaurant", "cafe", "hotel", "bakery", "other"];
const LISTING_TYPES = ["SALE", "RENT"];

interface Property {
  id: string;
  title: string;
  slug: string;
  listing_type: string;
  property_type: string;
  price: number | null;
  currency: string | null;
  area_sqm: number | null;
  city: string | null;
  address: string | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  cover_image: string | null;
  images: string[] | null;
  is_published: boolean | null;
  status: string | null;
  created_at: string;
}

const emptyForm = {
  title: "",
  listing_type: "SALE",
  property_type: "restaurant",
  price: "",
  currency: "GEL",
  area_sqm: "",
  city: "",
  address: "",
  description: "",
  contact_phone: "",
  contact_email: "",
  cover_image: "",
  is_published: false,
};

export default function RealEstateListings() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProperties = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });
    setProperties((data as Property[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, [user]);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("property-images").upload(path, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);
    setForm({ ...form, cover_image: urlData.publicUrl });
    setUploading(false);
    toast.success("Image uploaded");
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Property) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      listing_type: p.listing_type,
      property_type: p.property_type,
      price: p.price?.toString() || "",
      currency: p.currency || "GEL",
      area_sqm: p.area_sqm?.toString() || "",
      city: p.city || "",
      address: p.address || "",
      description: p.description || "",
      contact_phone: p.contact_phone || "",
      contact_email: p.contact_email || "",
      cover_image: p.cover_image || "",
      is_published: p.is_published || false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!user) return;
    setSaving(true);

    const payload = {
      owner_user_id: user.id,
      title: form.title.trim(),
      slug: generateSlug(form.title),
      listing_type: form.listing_type,
      property_type: form.property_type,
      price: form.price ? parseFloat(form.price) : null,
      currency: form.currency,
      area_sqm: form.area_sqm ? parseFloat(form.area_sqm) : null,
      city: form.city.trim() || null,
      address: form.address.trim() || null,
      description: form.description.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      contact_email: form.contact_email.trim() || null,
      cover_image: form.cover_image.trim() || null,
      is_published: form.is_published,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("properties").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("properties").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast.error("Failed to save: " + error.message);
      return;
    }
    toast.success(editingId ? "Property updated" : "Property created");
    setDialogOpen(false);
    fetchProperties();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Deleted");
    fetchProperties();
  };

  const togglePublished = async (id: string, current: boolean) => {
    const { error } = await supabase.from("properties").update({ is_published: !current }).eq("id", id);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, is_published: !current } : p)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Property Listings</h1>
          <p className="text-muted-foreground">Create and manage your property listings</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Listing
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No listings yet</p>
              <Button onClick={openCreate}>Create your first listing</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{p.property_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.listing_type === "SALE" ? "default" : "secondary"}>
                        {p.listing_type === "SALE" ? "For Sale" : "For Rent"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.price ? `${p.price.toLocaleString()} ${p.currency}` : "-"}
                    </TableCell>
                    <TableCell>{p.city || "-"}</TableCell>
                    <TableCell>
                      <Switch
                        checked={p.is_published || false}
                        onCheckedChange={() => togglePublished(p.id, p.is_published || false)}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Listing" : "New Listing"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Cozy cafe in Old Town" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <Select value={form.listing_type} onValueChange={(v) => setForm({ ...form, listing_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t === "SALE" ? "For Sale" : "For Rent"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select value={form.property_type} onValueChange={(v) => setForm({ ...form, property_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="150000" />
              </div>
              <div className="space-y-2">
                <Label>Area (sqm)</Label>
                <Input type="number" value={form.area_sqm} onChange={(e) => setForm({ ...form, area_sqm: e.target.value })} placeholder="120" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Tbilisi" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the property..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} placeholder="+995..." />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="agent@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://... or upload below" />
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("prop-img-upload")?.click()} disabled={uploading}>
                  <Upload className="h-4 w-4 mr-1" />
                  {uploading ? "Uploading..." : "Upload Image"}
                </Button>
                <input id="prop-img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
              {form.cover_image && (
                <img src={form.cover_image} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              <Label>Publish immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

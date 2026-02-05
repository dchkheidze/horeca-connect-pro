import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Package } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type OfferType = Database["public"]["Enums"]["offer_type"];

interface Offer {
  id: string;
  title: string;
  description: string | null;
  type: OfferType;
  price_from: number | null;
  currency: string | null;
  is_active: boolean;
}

interface FormData {
  title: string;
  description: string;
  type: OfferType;
  price_from: string;
  currency: string;
  is_active: boolean;
}

const emptyFormData: FormData = {
  title: "",
  description: "",
  type: "PRODUCT",
  price_from: "",
  currency: "EUR",
  is_active: true,
};

export default function SupplierOffers() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  const fetchOffers = async () => {
    if (!user) return;

    // First get supplier id
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (supplierError) {
      console.error("Error fetching supplier:", supplierError);
      setLoading(false);
      return;
    }

    if (!supplier) {
      setLoading(false);
      return;
    }

    setSupplierId(supplier.id);

    // Fetch offers
    const { data: offersData, error: offersError } = await supabase
      .from("supplier_offers")
      .select("*")
      .eq("supplier_id", supplier.id)
      .order("created_at", { ascending: false });

    if (offersError) {
      console.error("Error fetching offers:", offersError);
    } else {
      setOffers(offersData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, [user]);

  const handleOpenCreate = () => {
    setEditingOffer(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || "",
      type: offer.type,
      price_from: offer.price_from?.toString() || "",
      currency: offer.currency || "EUR",
      is_active: offer.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!supplierId || !formData.title.trim()) return;

    setSaving(true);

    const offerData = {
      supplier_id: supplierId,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      type: formData.type,
      price_from: formData.price_from ? parseFloat(formData.price_from) : null,
      currency: formData.currency,
      is_active: formData.is_active,
    };

    if (editingOffer) {
      // Update existing offer
      const { error } = await supabase
        .from("supplier_offers")
        .update(offerData)
        .eq("id", editingOffer.id);

      if (error) {
        console.error("Error updating offer:", error);
        toast({
          title: "Error",
          description: "Failed to update offer",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Offer updated" });
        setDialogOpen(false);
        fetchOffers();
      }
    } else {
      // Create new offer
      const { error } = await supabase.from("supplier_offers").insert(offerData);

      if (error) {
        console.error("Error creating offer:", error);
        toast({
          title: "Error",
          description: "Failed to create offer",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Offer created" });
        setDialogOpen(false);
        fetchOffers();
      }
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!offerToDelete) return;

    const { error } = await supabase
      .from("supplier_offers")
      .delete()
      .eq("id", offerToDelete.id);

    if (error) {
      console.error("Error deleting offer:", error);
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Offer deleted" });
      fetchOffers();
    }

    setDeleteDialogOpen(false);
    setOfferToDelete(null);
  };

  const handleToggleActive = async (offer: Offer) => {
    const { error } = await supabase
      .from("supplier_offers")
      .update({ is_active: !offer.is_active })
      .eq("id", offer.id);

    if (error) {
      console.error("Error toggling offer:", error);
      toast({
        title: "Error",
        description: "Failed to update offer status",
        variant: "destructive",
      });
    } else {
      fetchOffers();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!supplierId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No supplier profile found. Please complete onboarding.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold lg:text-3xl">Products & Services</h1>
          <p className="text-muted-foreground">Manage your offerings visible to restaurants.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Offer
        </Button>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No offers yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first product or service to showcase to restaurants.
            </p>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Offer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <Card key={offer.id} className={!offer.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{offer.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {offer.type}
                      </Badge>
                      {!offer.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {offer.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {offer.description}
                  </p>
                )}
                {offer.price_from && (
                  <p className="text-sm font-medium">
                    From {offer.currency || "EUR"} {offer.price_from}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={offer.is_active}
                      onCheckedChange={() => handleToggleActive(offer)}
                    />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(offer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setOfferToDelete(offer);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOffer ? "Edit Offer" : "Add New Offer"}</DialogTitle>
            <DialogDescription>
              {editingOffer
                ? "Update the details of your product or service."
                : "Add a new product or service to your offerings."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Fresh Organic Vegetables"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: OfferType) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCT">Product</SelectItem>
                  <SelectItem value="SERVICE">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe your product or service..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price_from">Price From</Label>
                <Input
                  id="price_from"
                  type="number"
                  step="0.01"
                  value={formData.price_from}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price_from: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
              <Label htmlFor="is_active">Active (visible to restaurants)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !formData.title.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingOffer ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Offer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{offerToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

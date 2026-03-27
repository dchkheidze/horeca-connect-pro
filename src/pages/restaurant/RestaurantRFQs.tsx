import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, FileText, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface RFQ {
  id: string;
  title: string;
  description: string | null;
  rfq_type: "GOODS" | "SERVICES";
  status: "OPEN" | "CLOSED" | "AWARDED";
  category: string | null;
  deadline: string | null;
  created_at: string;
  response_count?: number;
}

interface RFQResponse {
  id: string;
  responder_user_id: string;
  responder_type: string;
  message: string | null;
  price_estimate: number | null;
  currency: string | null;
  created_at: string;
}

interface FormData {
  title: string;
  description: string;
  rfq_type: "GOODS" | "SERVICES";
  category: string;
  deadline: string;
}

const emptyForm: FormData = {
  title: "",
  description: "",
  rfq_type: "GOODS",
  category: "",
  deadline: "",
};

export default function RestaurantRFQs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responsesDialogOpen, setResponsesDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [responses, setResponses] = useState<RFQResponse[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  const fetchRFQs = async () => {
    if (!user) return;
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (!restaurant) { setLoading(false); return; }
    setRestaurantId(restaurant.id);

    const { data, error } = await supabase
      .from("rfqs")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching RFQs:", error);
    } else {
      // Fetch response counts
      const rfqsWithCounts = await Promise.all(
        (data || []).map(async (rfq: any) => {
          const { count } = await supabase
            .from("rfq_responses")
            .select("*", { count: "exact", head: true })
            .eq("rfq_id", rfq.id);
          return { ...rfq, response_count: count || 0 };
        })
      );
      setRfqs(rfqsWithCounts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRFQs(); }, [user]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (rfq: RFQ) => {
    setEditingId(rfq.id);
    setFormData({
      title: rfq.title,
      description: rfq.description || "",
      rfq_type: rfq.rfq_type,
      category: rfq.category || "",
      deadline: rfq.deadline ? rfq.deadline.slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!restaurantId || !formData.title.trim()) return;
    setSaving(true);

    const payload = {
      restaurant_id: restaurantId,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      rfq_type: formData.rfq_type,
      category: formData.category.trim() || null,
      deadline: formData.deadline || null,
    };

    const { error } = editingId
      ? await supabase.from("rfqs").update(payload).eq("id", editingId)
      : await supabase.from("rfqs").insert(payload);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "RFQ updated" : "RFQ created" });
      setDialogOpen(false);
      fetchRFQs();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("rfqs").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "RFQ deleted" });
      setDeleteDialogOpen(false);
      fetchRFQs();
    }
  };

  const handleStatusChange = async (rfqId: string, newStatus: "OPEN" | "CLOSED" | "AWARDED") => {
    const { error } = await supabase.from("rfqs").update({ status: newStatus }).eq("id", rfqId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `RFQ ${newStatus.toLowerCase()}` });
      fetchRFQs();
    }
  };

  const handleViewResponses = async (rfqId: string) => {
    setResponsesLoading(true);
    setResponsesDialogOpen(true);
    const { data, error } = await supabase
      .from("rfq_responses")
      .select("*")
      .eq("rfq_id", rfqId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setResponses(data || []);
    }
    setResponsesLoading(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "OPEN": return <Badge className="bg-green-500/10 text-green-700 border-green-500/30">Open</Badge>;
      case "CLOSED": return <Badge variant="secondary">Closed</Badge>;
      case "AWARDED": return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/30">Awarded</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No restaurant profile found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold lg:text-3xl">Requests for Quotes</h1>
          <p className="text-muted-foreground">Create RFQs for goods and services you need.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create RFQ
        </Button>
      </div>

      {rfqs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No RFQs yet. Create your first request for quotes.</p>
            <Button className="mt-4" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create RFQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rfqs.map((rfq) => (
            <Card key={rfq.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-semibold text-lg">{rfq.title}</h3>
                      {statusBadge(rfq.status)}
                      <Badge variant="outline">{rfq.rfq_type === "GOODS" ? "Goods" : "Services"}</Badge>
                      {rfq.category && <Badge variant="secondary">{rfq.category}</Badge>}
                    </div>
                    {rfq.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{rfq.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {format(new Date(rfq.created_at), "MMM d, yyyy")}
                      </span>
                      {rfq.deadline && (
                        <span>Deadline: {format(new Date(rfq.deadline), "MMM d, yyyy")}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {rfq.response_count} {rfq.response_count === 1 ? "response" : "responses"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(rfq.response_count || 0) > 0 && (
                      <Button variant="outline" size="sm" onClick={() => handleViewResponses(rfq.id)}>
                        View Responses
                      </Button>
                    )}
                    {rfq.status === "OPEN" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(rfq)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(rfq.id, "CLOSED")}>
                          <XCircle className="mr-1 h-3 w-3" /> Close
                        </Button>
                      </>
                    )}
                    {rfq.status === "CLOSED" && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(rfq.id, "OPEN")}>
                        Reopen
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => { setDeleteId(rfq.id); setDeleteDialogOpen(true); }}
                    >
                      Delete
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit RFQ" : "Create RFQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Fresh produce supplier needed"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what you're looking for..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <Select value={formData.rfq_type} onValueChange={(v: "GOODS" | "SERVICES") => setFormData({ ...formData, rfq_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOODS">Goods</SelectItem>
                    <SelectItem value="SERVICES">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Food & Beverage"
                />
              </div>
            </div>
            <div>
              <Label>Deadline</Label>
              <Input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving || !formData.title.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RFQ?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the RFQ and all responses.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Responses Dialog */}
      <Dialog open={responsesDialogOpen} onOpenChange={setResponsesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Responses</DialogTitle>
          </DialogHeader>
          {responsesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : responses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No responses yet.</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {responses.map((resp) => (
                <Card key={resp.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{resp.responder_type === "supplier" ? "Supplier" : "Service Provider"}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(resp.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    {resp.price_estimate && (
                      <p className="font-medium">
                        Estimate: {resp.currency || "EUR"} {Number(resp.price_estimate).toLocaleString()}
                      </p>
                    )}
                    {resp.message && <p className="text-sm text-muted-foreground">{resp.message}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

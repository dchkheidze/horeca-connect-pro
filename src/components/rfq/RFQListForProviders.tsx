import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Clock, Send } from "lucide-react";
import { format } from "date-fns";

interface RFQ {
  id: string;
  title: string;
  description: string | null;
  rfq_type: "GOODS" | "SERVICES";
  status: string;
  category: string | null;
  deadline: string | null;
  created_at: string;
}

interface Props {
  rfqType: "GOODS" | "SERVICES";
  responderType: "supplier" | "serviceprovider";
  title?: string;
}

export function RFQListForProviders({ rfqType, responderType, title = "Open RFQs" }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [priceEstimate, setPriceEstimate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRFQs = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("rfqs")
        .select("*")
        .eq("rfq_type", rfqType)
        .eq("status", "OPEN")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching RFQs:", error);
      } else {
        setRfqs(data || []);

        // Check which RFQs user already responded to
        if (data && data.length > 0) {
          const { data: existingResponses } = await supabase
            .from("rfq_responses")
            .select("rfq_id")
            .eq("responder_user_id", user.id)
            .in("rfq_id", data.map((r: any) => r.id));

          if (existingResponses) {
            setRespondedIds(new Set(existingResponses.map((r: any) => r.rfq_id)));
          }
        }
      }
      setLoading(false);
    };

    fetchRFQs();
  }, [user, rfqType]);

  const handleRespond = (rfqId: string) => {
    setSelectedRfqId(rfqId);
    setMessage("");
    setPriceEstimate("");
    setRespondDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!user || !selectedRfqId) return;
    setSubmitting(true);

    const { error } = await supabase.from("rfq_responses").insert({
      rfq_id: selectedRfqId,
      responder_user_id: user.id,
      responder_type: responderType,
      message: message.trim() || null,
      price_estimate: priceEstimate ? parseFloat(priceEstimate) : null,
      currency: "EUR",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Response submitted!" });
      setRespondDialogOpen(false);
      setRespondedIds(new Set([...respondedIds, selectedRfqId]));
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rfqs.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No open requests at the moment.
            </p>
          ) : (
            <div className="space-y-4">
              {rfqs.map((rfq) => (
                <div
                  key={rfq.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{rfq.title}</h4>
                      {rfq.category && <Badge variant="secondary" className="text-xs">{rfq.category}</Badge>}
                    </div>
                    {rfq.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{rfq.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(rfq.created_at), "MMM d, yyyy")}
                      </span>
                      {rfq.deadline && (
                        <span>Deadline: {format(new Date(rfq.deadline), "MMM d, yyyy")}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    {respondedIds.has(rfq.id) ? (
                      <Badge className="bg-green-500/10 text-green-700 border-green-500/30">
                        Responded
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleRespond(rfq.id)}>
                        <Send className="mr-1 h-3 w-3" />
                        Respond
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Response</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Price Estimate (EUR)</Label>
              <Input
                type="number"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your offering..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitResponse} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

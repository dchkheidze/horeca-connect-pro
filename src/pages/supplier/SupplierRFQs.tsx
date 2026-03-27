import { RFQListForProviders } from "@/components/rfq/RFQListForProviders";

export default function SupplierRFQs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold lg:text-3xl">Requests for Quotes</h1>
        <p className="text-muted-foreground">Browse open RFQs from restaurants looking for goods.</p>
      </div>
      <RFQListForProviders rfqType="GOODS" responderType="supplier" title="Open Goods RFQs" />
    </div>
  );
}

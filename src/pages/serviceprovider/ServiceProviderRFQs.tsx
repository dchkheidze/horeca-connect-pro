import { RFQListForProviders } from "@/components/rfq/RFQListForProviders";

export default function ServiceProviderRFQs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold lg:text-3xl">Requests for Quotes</h1>
        <p className="text-muted-foreground">Browse open RFQs from restaurants looking for services.</p>
      </div>
      <RFQListForProviders rfqType="SERVICES" responderType="serviceprovider" title="Open Service RFQs" />
    </div>
  );
}

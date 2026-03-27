
-- RFQ type enum
CREATE TYPE public.rfq_type AS ENUM ('GOODS', 'SERVICES');

-- RFQ status enum  
CREATE TYPE public.rfq_status AS ENUM ('OPEN', 'CLOSED', 'AWARDED');

-- RFQs table
CREATE TABLE public.rfqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  rfq_type rfq_type NOT NULL DEFAULT 'GOODS',
  status rfq_status NOT NULL DEFAULT 'OPEN',
  category text,
  deadline timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RFQ responses table
CREATE TABLE public.rfq_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  responder_user_id uuid NOT NULL,
  responder_type text NOT NULL, -- 'supplier' or 'serviceprovider'
  message text,
  price_estimate numeric,
  currency text DEFAULT 'EUR',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_responses ENABLE ROW LEVEL SECURITY;

-- RFQ policies
-- Restaurant owners can manage their own RFQs
CREATE POLICY "Restaurant owners can insert rfqs" ON public.rfqs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants r WHERE r.id = rfqs.restaurant_id AND r.owner_user_id = auth.uid())
  );

CREATE POLICY "Restaurant owners can update their rfqs" ON public.rfqs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM restaurants r WHERE r.id = rfqs.restaurant_id AND r.owner_user_id = auth.uid())
  );

CREATE POLICY "Restaurant owners can delete their rfqs" ON public.rfqs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM restaurants r WHERE r.id = rfqs.restaurant_id AND r.owner_user_id = auth.uid())
  );

CREATE POLICY "Restaurant owners can view their rfqs" ON public.rfqs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM restaurants r WHERE r.id = rfqs.restaurant_id AND r.owner_user_id = auth.uid())
  );

-- Suppliers can view OPEN GOODS rfqs
CREATE POLICY "Suppliers can view open goods rfqs" ON public.rfqs
  FOR SELECT USING (
    status = 'OPEN' AND rfq_type = 'GOODS' AND
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'supplier')
  );

-- Service providers can view OPEN SERVICES rfqs
CREATE POLICY "Service providers can view open services rfqs" ON public.rfqs
  FOR SELECT USING (
    status = 'OPEN' AND rfq_type = 'SERVICES' AND
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'serviceprovider')
  );

-- Admins can view all rfqs
CREATE POLICY "Admins can view all rfqs" ON public.rfqs
  FOR SELECT USING (is_admin(auth.uid()));

-- RFQ Response policies
-- Suppliers and service providers can insert responses
CREATE POLICY "Suppliers and SPs can insert rfq_responses" ON public.rfq_responses
  FOR INSERT WITH CHECK (auth.uid() = responder_user_id);

-- Responders can view their own responses
CREATE POLICY "Responders can view their responses" ON public.rfq_responses
  FOR SELECT USING (auth.uid() = responder_user_id);

-- Restaurant owners can view responses to their RFQs
CREATE POLICY "Restaurant owners can view rfq responses" ON public.rfq_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rfqs rq
      JOIN restaurants r ON r.id = rq.restaurant_id
      WHERE rq.id = rfq_responses.rfq_id AND r.owner_user_id = auth.uid()
    )
  );

-- Updated_at trigger for rfqs
CREATE TRIGGER update_rfqs_updated_at
  BEFORE UPDATE ON public.rfqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Add serviceprovider to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'serviceprovider';

-- Create service_providers table (mirrors suppliers)
CREATE TABLE public.service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean DEFAULT false,
  name text NOT NULL,
  city text,
  address text,
  phone text,
  website text,
  description text,
  categories text[] DEFAULT '{}'::text[],
  coverage_areas text[] DEFAULT '{}'::text[],
  slug text
);

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_providers
CREATE POLICY "Owners can insert their service_provider" ON public.service_providers FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owners can update their service_provider" ON public.service_providers FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can view their service_provider" ON public.service_providers FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Anyone can view published service_providers" ON public.service_providers FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can view all service_providers" ON public.service_providers FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all service_providers" ON public.service_providers FOR UPDATE USING (is_admin(auth.uid()));

-- Create service_provider_offers table (mirrors supplier_offers)
CREATE TABLE public.service_provider_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  type public.offer_type DEFAULT 'SERVICE'::offer_type,
  price_from numeric,
  is_active boolean DEFAULT true,
  title text NOT NULL,
  description text,
  currency text DEFAULT 'EUR'::text
);

ALTER TABLE public.service_provider_offers ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_provider_offers
CREATE POLICY "Owners can insert their sp_offers" ON public.service_provider_offers FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM service_providers s WHERE s.id = service_provider_offers.service_provider_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Owners can update their sp_offers" ON public.service_provider_offers FOR UPDATE USING (EXISTS (SELECT 1 FROM service_providers s WHERE s.id = service_provider_offers.service_provider_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Owners can delete their sp_offers" ON public.service_provider_offers FOR DELETE USING (EXISTS (SELECT 1 FROM service_providers s WHERE s.id = service_provider_offers.service_provider_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Owners can view their sp_offers" ON public.service_provider_offers FOR SELECT USING (EXISTS (SELECT 1 FROM service_providers s WHERE s.id = service_provider_offers.service_provider_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Anyone can view active sp_offers from published providers" ON public.service_provider_offers FOR SELECT USING (is_active = true AND EXISTS (SELECT 1 FROM service_providers s WHERE s.id = service_provider_offers.service_provider_id AND s.is_published = true));

-- Create service_provider_categories table (mirrors supplier_categories)
CREATE TABLE public.service_provider_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  slug text NOT NULL
);

ALTER TABLE public.service_provider_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service_provider_categories" ON public.service_provider_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert service_provider_categories" ON public.service_provider_categories FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update service_provider_categories" ON public.service_provider_categories FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete service_provider_categories" ON public.service_provider_categories FOR DELETE USING (is_admin(auth.uid()));

-- Add updated_at trigger for service_providers
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

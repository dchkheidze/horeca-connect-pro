
-- 1. Add realestate to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'realestate';

-- 2. Create properties table
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  listing_type text NOT NULL,
  property_type text NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  price numeric,
  currency text DEFAULT 'GEL',
  area_sqm numeric,
  city text,
  address text,
  contact_phone text,
  contact_email text,
  cover_image text,
  images text[] DEFAULT '{}'::text[],
  is_published boolean DEFAULT false,
  status text DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Updated_at trigger
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Helper function to check subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = _user_id
      AND plan IN ('standard', 'premium')
  )
$$;

-- 5. Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
CREATE POLICY "Owners can view their properties"
  ON public.properties FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Subscribers can view published properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (is_published = true AND public.has_active_subscription(auth.uid()));

CREATE POLICY "Admins can view all properties"
  ON public.properties FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Owners can insert their properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update their properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins can update all properties"
  ON public.properties FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Owners can delete their properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = owner_user_id);

-- 7. Storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- 8. Storage RLS policies
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Users can update their property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images');

CREATE POLICY "Users can delete their property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images');

-- 9. Create real_estate_agents table for onboarding
CREATE TABLE public.real_estate_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  company_name text NOT NULL,
  phone text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.real_estate_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their agent profile"
  ON public.real_estate_agents FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can insert their agent profile"
  ON public.real_estate_agents FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update their agent profile"
  ON public.real_estate_agents FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins can view all agent profiles"
  ON public.real_estate_agents FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_real_estate_agents_updated_at
  BEFORE UPDATE ON public.real_estate_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

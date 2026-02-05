-- ============================================
-- B2B HoReCa Platform Database Schema Migration
-- ============================================

-- 1. CREATE ENUMS
-- ============================================
CREATE TYPE offer_type AS ENUM ('PRODUCT', 'SERVICE');
CREATE TYPE job_status AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
CREATE TYPE application_status AS ENUM ('APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'HIRED');
CREATE TYPE visibility_status AS ENUM ('PRIVATE', 'PUBLIC');

-- 2. UPDATE RESTAURANTS TABLE
-- ============================================
-- Add new columns
ALTER TABLE public.restaurants 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Rename user_id to owner_user_id
ALTER TABLE public.restaurants RENAME COLUMN user_id TO owner_user_id;

-- Drop old RLS policies (they reference user_id)
DROP POLICY IF EXISTS "Users can insert their own restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Users can view their own restaurant" ON public.restaurants;

-- Create new RLS policies
CREATE POLICY "Owners can insert their restaurant"
ON public.restaurants FOR INSERT
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update their restaurant"
ON public.restaurants FOR UPDATE
USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can view their restaurant"
ON public.restaurants FOR SELECT
USING (auth.uid() = owner_user_id);

CREATE POLICY "Anyone can view published restaurants"
ON public.restaurants FOR SELECT
USING (is_published = true);

-- 3. RENAME supplier_profiles TO suppliers
-- ============================================
-- First drop foreign key constraints and policies
DROP POLICY IF EXISTS "Users can delete their own supplier offers" ON public.supplier_offers;
DROP POLICY IF EXISTS "Users can insert their own supplier offers" ON public.supplier_offers;
DROP POLICY IF EXISTS "Users can update their own supplier offers" ON public.supplier_offers;
DROP POLICY IF EXISTS "Users can view their own supplier offers" ON public.supplier_offers;

DROP POLICY IF EXISTS "Users can insert their own supplier profile" ON public.supplier_profiles;
DROP POLICY IF EXISTS "Users can update their own supplier profile" ON public.supplier_profiles;
DROP POLICY IF EXISTS "Users can view their own supplier profile" ON public.supplier_profiles;

-- Rename the table
ALTER TABLE public.supplier_profiles RENAME TO suppliers;

-- Rename columns in suppliers
ALTER TABLE public.suppliers RENAME COLUMN company_name TO name;
ALTER TABLE public.suppliers RENAME COLUMN user_id TO owner_user_id;

-- Add new columns to suppliers
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Create RLS policies for suppliers
CREATE POLICY "Owners can insert their supplier"
ON public.suppliers FOR INSERT
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update their supplier"
ON public.suppliers FOR UPDATE
USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can view their supplier"
ON public.suppliers FOR SELECT
USING (auth.uid() = owner_user_id);

CREATE POLICY "Anyone can view published suppliers"
ON public.suppliers FOR SELECT
USING (is_published = true);

-- 4. UPDATE SUPPLIER_OFFERS TABLE
-- ============================================
-- Update foreign key to reference renamed table
ALTER TABLE public.supplier_offers
  DROP CONSTRAINT IF EXISTS supplier_offers_supplier_id_fkey;

ALTER TABLE public.supplier_offers
  ADD CONSTRAINT supplier_offers_supplier_id_fkey
  FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;

-- Add new columns
ALTER TABLE public.supplier_offers
  ADD COLUMN IF NOT EXISTS type offer_type DEFAULT 'PRODUCT',
  ADD COLUMN IF NOT EXISTS price_from DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create RLS policies for supplier_offers
CREATE POLICY "Owners can insert their offers"
ON public.supplier_offers FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.suppliers s
  WHERE s.id = supplier_offers.supplier_id AND s.owner_user_id = auth.uid()
));

CREATE POLICY "Owners can update their offers"
ON public.supplier_offers FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.suppliers s
  WHERE s.id = supplier_offers.supplier_id AND s.owner_user_id = auth.uid()
));

CREATE POLICY "Owners can delete their offers"
ON public.supplier_offers FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.suppliers s
  WHERE s.id = supplier_offers.supplier_id AND s.owner_user_id = auth.uid()
));

CREATE POLICY "Owners can view their offers"
ON public.supplier_offers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.suppliers s
  WHERE s.id = supplier_offers.supplier_id AND s.owner_user_id = auth.uid()
));

CREATE POLICY "Anyone can view active offers from published suppliers"
ON public.supplier_offers FOR SELECT
USING (
  is_active = true AND
  EXISTS (
    SELECT 1 FROM public.suppliers s
    WHERE s.id = supplier_offers.supplier_id AND s.is_published = true
  )
);

-- 5. CREATE JOBS TABLE
-- ============================================
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  city TEXT,
  employment_type TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'EUR',
  description TEXT,
  status job_status DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  published_at TIMESTAMPTZ
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can insert jobs"
ON public.jobs FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.restaurants r
  WHERE r.id = jobs.restaurant_id AND r.owner_user_id = auth.uid()
));

CREATE POLICY "Restaurant owners can update their jobs"
ON public.jobs FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.restaurants r
  WHERE r.id = jobs.restaurant_id AND r.owner_user_id = auth.uid()
));

CREATE POLICY "Restaurant owners can delete their jobs"
ON public.jobs FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.restaurants r
  WHERE r.id = jobs.restaurant_id AND r.owner_user_id = auth.uid()
));

CREATE POLICY "Restaurant owners can view their jobs"
ON public.jobs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.restaurants r
  WHERE r.id = jobs.restaurant_id AND r.owner_user_id = auth.uid()
));

CREATE POLICY "Anyone can view published jobs"
ON public.jobs FOR SELECT
USING (status = 'PUBLISHED');

-- 6. RENAME CANDIDATES TO JOB_SEEKERS
-- ============================================
DROP POLICY IF EXISTS "Users can insert their own candidate profile" ON public.candidates;
DROP POLICY IF EXISTS "Users can update their own candidate profile" ON public.candidates;
DROP POLICY IF EXISTS "Users can view their own candidate profile" ON public.candidates;

ALTER TABLE public.candidates RENAME TO job_seekers;

-- Rename headline to title
ALTER TABLE public.job_seekers RENAME COLUMN headline TO title;

-- Add visibility_status column
ALTER TABLE public.job_seekers
  ADD COLUMN IF NOT EXISTS visibility_status visibility_status DEFAULT 'PRIVATE';

-- Create RLS policies for job_seekers
CREATE POLICY "Users can insert their profile"
ON public.job_seekers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their profile"
ON public.job_seekers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
ON public.job_seekers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Restaurants can view public job seekers"
ON public.job_seekers FOR SELECT
USING (
  visibility_status = 'PUBLIC' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'restaurant'
  )
);

-- 7. CREATE JOB_APPLICATIONS TABLE
-- ============================================
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status application_status DEFAULT 'APPLIED',
  cover_letter TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(job_id, user_id)
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job seekers can apply to jobs"
ON public.job_applications FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'jobseeker'
  )
);

CREATE POLICY "Job seekers can view their applications"
ON public.job_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Restaurant owners can view applications for their jobs"
ON public.job_applications FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.jobs j
  JOIN public.restaurants r ON r.id = j.restaurant_id
  WHERE j.id = job_applications.job_id AND r.owner_user_id = auth.uid()
));

CREATE POLICY "Restaurant owners can update application status"
ON public.job_applications FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.jobs j
  JOIN public.restaurants r ON r.id = j.restaurant_id
  WHERE j.id = job_applications.job_id AND r.owner_user_id = auth.uid()
));

-- 8. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_published ON public.restaurants(is_published);
CREATE INDEX IF NOT EXISTS idx_suppliers_slug ON public.suppliers(slug);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_published ON public.suppliers(is_published);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_restaurant_id ON public.jobs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
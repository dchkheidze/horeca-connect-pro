-- =============================================================
-- HoReCa Connect Pro — Full Database Schema
-- Generated from all migrations. Run this on a fresh Supabase
-- project via the SQL editor to bootstrap the entire database.
-- =============================================================

-- =============================================================
-- 1. ENUM TYPES
-- =============================================================

CREATE TYPE public.app_role AS ENUM (
  'restaurant',
  'supplier',
  'jobseeker',
  'admin',
  'serviceprovider',
  'realestate'
);

CREATE TYPE public.offer_type AS ENUM ('PRODUCT', 'SERVICE');
CREATE TYPE public.job_status AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
CREATE TYPE public.application_status AS ENUM ('APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'HIRED');
CREATE TYPE public.visibility_status AS ENUM ('PRIVATE', 'PUBLIC');
CREATE TYPE public.rfq_type AS ENUM ('GOODS', 'SERVICES');
CREATE TYPE public.rfq_status AS ENUM ('OPEN', 'CLOSED', 'AWARDED');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'standard', 'premium');
CREATE TYPE public.subscription_billing AS ENUM ('monthly', 'annual');


-- =============================================================
-- 2. UTILITY FUNCTIONS
-- =============================================================

-- Trigger function: auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Security definer: check if user has a given role (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer: get primary role of a user
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Security definer: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'::app_role
  )
$$;

-- Security definer: check if user has a paid subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID)
RETURNS BOOLEAN
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


-- =============================================================
-- 3. TABLES
-- =============================================================

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── user_roles ────────────────────────────────────────────────
CREATE TABLE public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ── subscriptions ─────────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL,
  plan           public.subscription_plan    NOT NULL DEFAULT 'free',
  billing_period public.subscription_billing NOT NULL DEFAULT 'annual',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id)
);

-- ── restaurants ───────────────────────────────────────────────
CREATE TABLE public.restaurants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  city          TEXT,
  address       TEXT,
  phone         TEXT,
  website       TEXT,
  description   TEXT,
  cuisine_tags  TEXT[] DEFAULT '{}',
  price_level   INTEGER CHECK (price_level >= 1 AND price_level <= 4),
  slug          TEXT UNIQUE,
  is_published  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── suppliers ─────────────────────────────────────────────────
CREATE TABLE public.suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  city          TEXT,
  address       TEXT,
  phone         TEXT,
  website       TEXT,
  description   TEXT,
  categories    TEXT[] DEFAULT '{}',
  coverage_areas TEXT[] DEFAULT '{}',
  slug          TEXT UNIQUE,
  is_published  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── supplier_offers ───────────────────────────────────────────
CREATE TABLE public.supplier_offers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  type        public.offer_type DEFAULT 'PRODUCT',
  price_from  DECIMAL(10, 2),
  currency    TEXT DEFAULT 'EUR',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── supplier_categories ───────────────────────────────────────
CREATE TABLE public.supplier_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── service_providers ─────────────────────────────────────────
CREATE TABLE public.service_providers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  name          TEXT NOT NULL,
  city          TEXT,
  address       TEXT,
  phone         TEXT,
  website       TEXT,
  description   TEXT,
  categories    TEXT[] DEFAULT '{}',
  coverage_areas TEXT[] DEFAULT '{}',
  slug          TEXT,
  is_published  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── service_provider_offers ───────────────────────────────────
CREATE TABLE public.service_provider_offers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  type                public.offer_type DEFAULT 'SERVICE',
  price_from          NUMERIC,
  currency            TEXT DEFAULT 'EUR',
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── service_provider_categories ───────────────────────────────
CREATE TABLE public.service_provider_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── jobs ──────────────────────────────────────────────────────
CREATE TABLE public.jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  city            TEXT,
  employment_type TEXT,
  salary_min      INTEGER,
  salary_max      INTEGER,
  currency        TEXT DEFAULT 'EUR',
  description     TEXT,
  status          public.job_status DEFAULT 'DRAFT',
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── job_categories ────────────────────────────────────────────
CREATE TABLE public.job_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── job_seekers ───────────────────────────────────────────────
CREATE TABLE public.job_seekers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  phone             TEXT,
  city              TEXT,
  title             TEXT,
  about             TEXT,
  job_categories    TEXT[] DEFAULT '{}',
  schedule_types    TEXT[] DEFAULT '{}',
  visibility_status public.visibility_status DEFAULT 'PRIVATE',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── job_applications ──────────────────────────────────────────
CREATE TABLE public.job_applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL,
  status       public.application_status DEFAULT 'APPLIED',
  cover_letter TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, user_id)
);

-- ── rfqs ──────────────────────────────────────────────────────
CREATE TABLE public.rfqs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  rfq_type      public.rfq_type   NOT NULL DEFAULT 'GOODS',
  status        public.rfq_status NOT NULL DEFAULT 'OPEN',
  category      TEXT,
  deadline      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── rfq_responses ─────────────────────────────────────────────
CREATE TABLE public.rfq_responses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id            UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  responder_user_id UUID NOT NULL,
  responder_type    TEXT NOT NULL, -- 'supplier' or 'serviceprovider'
  message           TEXT,
  price_estimate    NUMERIC,
  currency          TEXT DEFAULT 'EUR',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── properties ────────────────────────────────────────────────
CREATE TABLE public.properties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  listing_type  TEXT NOT NULL,
  property_type TEXT NOT NULL,
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL,
  description   TEXT,
  price         NUMERIC,
  currency      TEXT DEFAULT 'GEL',
  area_sqm      NUMERIC,
  city          TEXT,
  address       TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  cover_image   TEXT,
  images        TEXT[] DEFAULT '{}',
  is_published  BOOLEAN DEFAULT false,
  status        TEXT DEFAULT 'ACTIVE',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── real_estate_agents ────────────────────────────────────────
CREATE TABLE public.real_estate_agents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  company_name  TEXT NOT NULL,
  phone         TEXT,
  city          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── cuisines ──────────────────────────────────────────────────
CREATE TABLE public.cuisines (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── cities ────────────────────────────────────────────────────
CREATE TABLE public.cities (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  country    TEXT DEFAULT 'Netherlands',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── posts ─────────────────────────────────────────────────────
CREATE TABLE public.posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  content     TEXT,
  excerpt     TEXT,
  status      TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  author_id   UUID REFERENCES auth.users(id),
  category    TEXT,
  cover_image TEXT,
  is_featured BOOLEAN DEFAULT false,
  read_time   INTEGER DEFAULT 5,
  tags        TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── knowledge_categories ──────────────────────────────────────
CREATE TABLE public.knowledge_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name   TEXT NOT NULL DEFAULT 'BookOpen',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================================================
-- 4. ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE public.profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_offers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_offers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_seekers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_responses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_agents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuisines                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_categories      ENABLE ROW LEVEL SECURITY;

-- ── profiles policies ─────────────────────────────────────────
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));

-- ── user_roles policies ───────────────────────────────────────
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own role"
  ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE USING (public.is_admin(auth.uid()));

-- ── subscriptions policies ────────────────────────────────────
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all subscriptions"
  ON public.subscriptions FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert all subscriptions"
  ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- ── restaurants policies ──────────────────────────────────────
CREATE POLICY "Owners can view their restaurant"
  ON public.restaurants FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can insert their restaurant"
  ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owners can update their restaurant"
  ON public.restaurants FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Anyone can view published restaurants"
  ON public.restaurants FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can view all restaurants"
  ON public.restaurants FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all restaurants"
  ON public.restaurants FOR UPDATE USING (public.is_admin(auth.uid()));

-- ── suppliers policies ────────────────────────────────────────
CREATE POLICY "Owners can view their supplier"
  ON public.suppliers FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can insert their supplier"
  ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owners can update their supplier"
  ON public.suppliers FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Anyone can view published suppliers"
  ON public.suppliers FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can view all suppliers"
  ON public.suppliers FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all suppliers"
  ON public.suppliers FOR UPDATE USING (public.is_admin(auth.uid()));

-- ── supplier_offers policies ──────────────────────────────────
CREATE POLICY "Owners can view their offers"
  ON public.supplier_offers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Owners can insert their offers"
  ON public.supplier_offers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Owners can update their offers"
  ON public.supplier_offers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Owners can delete their offers"
  ON public.supplier_offers FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Anyone can view active offers from published suppliers"
  ON public.supplier_offers FOR SELECT
  USING (is_active = true AND EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.is_published = true));

-- ── supplier_categories policies ──────────────────────────────
CREATE POLICY "Anyone can view supplier_categories"
  ON public.supplier_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert supplier_categories"
  ON public.supplier_categories FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update supplier_categories"
  ON public.supplier_categories FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete supplier_categories"
  ON public.supplier_categories FOR DELETE USING (public.is_admin(auth.uid()));

-- ── service_providers policies ────────────────────────────────
CREATE POLICY "Owners can view their service_provider"
  ON public.service_providers FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can insert their service_provider"
  ON public.service_providers FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owners can update their service_provider"
  ON public.service_providers FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Anyone can view published service_providers"
  ON public.service_providers FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can view all service_providers"
  ON public.service_providers FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all service_providers"
  ON public.service_providers FOR UPDATE USING (public.is_admin(auth.uid()));

-- ── service_provider_offers policies ─────────────────────────
CREATE POLICY "Owners can view their sp_offers"
  ON public.service_provider_offers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.service_providers s WHERE s.id = service_provider_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Owners can insert their sp_offers"
  ON public.service_provider_offers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.service_providers s WHERE s.id = service_provider_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Owners can update their sp_offers"
  ON public.service_provider_offers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.service_providers s WHERE s.id = service_provider_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Owners can delete their sp_offers"
  ON public.service_provider_offers FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.service_providers s WHERE s.id = service_provider_id AND s.owner_user_id = auth.uid()));
CREATE POLICY "Anyone can view active sp_offers from published providers"
  ON public.service_provider_offers FOR SELECT
  USING (is_active = true AND EXISTS (SELECT 1 FROM public.service_providers s WHERE s.id = service_provider_id AND s.is_published = true));

-- ── service_provider_categories policies ──────────────────────
CREATE POLICY "Anyone can view service_provider_categories"
  ON public.service_provider_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert service_provider_categories"
  ON public.service_provider_categories FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update service_provider_categories"
  ON public.service_provider_categories FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete service_provider_categories"
  ON public.service_provider_categories FOR DELETE USING (public.is_admin(auth.uid()));

-- ── jobs policies ─────────────────────────────────────────────
CREATE POLICY "Restaurant owners can view their jobs"
  ON public.jobs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Restaurant owners can insert jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Restaurant owners can update their jobs"
  ON public.jobs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Restaurant owners can delete their jobs"
  ON public.jobs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Anyone can view published jobs"
  ON public.jobs FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Admins can view all jobs"
  ON public.jobs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all jobs"
  ON public.jobs FOR UPDATE USING (public.is_admin(auth.uid()));

-- ── job_categories policies ───────────────────────────────────
CREATE POLICY "Anyone can view job_categories"
  ON public.job_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert job_categories"
  ON public.job_categories FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update job_categories"
  ON public.job_categories FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete job_categories"
  ON public.job_categories FOR DELETE USING (public.is_admin(auth.uid()));

-- ── job_seekers policies ──────────────────────────────────────
CREATE POLICY "Users can view their own profile"
  ON public.job_seekers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their profile"
  ON public.job_seekers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their profile"
  ON public.job_seekers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Restaurants can view public job seekers"
  ON public.job_seekers FOR SELECT
  USING (
    visibility_status = 'PUBLIC' AND
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'restaurant')
  );

-- ── job_applications policies ─────────────────────────────────
CREATE POLICY "Job seekers can apply to jobs"
  ON public.job_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'jobseeker')
  );
CREATE POLICY "Job seekers can view their applications"
  ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Restaurant owners can view applications for their jobs"
  ON public.job_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.restaurants r ON r.id = j.restaurant_id
    WHERE j.id = job_id AND r.owner_user_id = auth.uid()
  ));
CREATE POLICY "Restaurant owners can update application status"
  ON public.job_applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.restaurants r ON r.id = j.restaurant_id
    WHERE j.id = job_id AND r.owner_user_id = auth.uid()
  ));

-- ── rfqs policies ─────────────────────────────────────────────
CREATE POLICY "Restaurant owners can view their rfqs"
  ON public.rfqs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Restaurant owners can insert rfqs"
  ON public.rfqs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Restaurant owners can update their rfqs"
  ON public.rfqs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Restaurant owners can delete their rfqs"
  ON public.rfqs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Suppliers can view open goods rfqs"
  ON public.rfqs FOR SELECT
  USING (status = 'OPEN' AND rfq_type = 'GOODS' AND
         EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'supplier'));
CREATE POLICY "Service providers can view open services rfqs"
  ON public.rfqs FOR SELECT
  USING (status = 'OPEN' AND rfq_type = 'SERVICES' AND
         EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'serviceprovider'));
CREATE POLICY "Admins can view all rfqs"
  ON public.rfqs FOR SELECT USING (public.is_admin(auth.uid()));

-- ── rfq_responses policies ────────────────────────────────────
CREATE POLICY "Suppliers and SPs can insert rfq_responses"
  ON public.rfq_responses FOR INSERT WITH CHECK (auth.uid() = responder_user_id);
CREATE POLICY "Responders can view their responses"
  ON public.rfq_responses FOR SELECT USING (auth.uid() = responder_user_id);
CREATE POLICY "Restaurant owners can view rfq responses"
  ON public.rfq_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.rfqs rq
    JOIN public.restaurants r ON r.id = rq.restaurant_id
    WHERE rq.id = rfq_id AND r.owner_user_id = auth.uid()
  ));

-- ── properties policies ───────────────────────────────────────
CREATE POLICY "Owners can view their properties"
  ON public.properties FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can insert their properties"
  ON public.properties FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owners can update their properties"
  ON public.properties FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can delete their properties"
  ON public.properties FOR DELETE USING (auth.uid() = owner_user_id);
CREATE POLICY "Anyone can view published properties"
  ON public.properties FOR SELECT TO public
  USING (is_published = true AND status = 'ACTIVE');
CREATE POLICY "Admins can view all properties"
  ON public.properties FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all properties"
  ON public.properties FOR UPDATE USING (public.is_admin(auth.uid()));

-- ── real_estate_agents policies ───────────────────────────────
CREATE POLICY "Owners can view their agent profile"
  ON public.real_estate_agents FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can insert their agent profile"
  ON public.real_estate_agents FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owners can update their agent profile"
  ON public.real_estate_agents FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Admins can view all agent profiles"
  ON public.real_estate_agents FOR SELECT USING (public.is_admin(auth.uid()));

-- ── cuisines policies ─────────────────────────────────────────
CREATE POLICY "Anyone can view cuisines"
  ON public.cuisines FOR SELECT USING (true);
CREATE POLICY "Admins can insert cuisines"
  ON public.cuisines FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update cuisines"
  ON public.cuisines FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete cuisines"
  ON public.cuisines FOR DELETE USING (public.is_admin(auth.uid()));

-- ── cities policies ───────────────────────────────────────────
CREATE POLICY "Anyone can view cities"
  ON public.cities FOR SELECT USING (true);
CREATE POLICY "Admins can insert cities"
  ON public.cities FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update cities"
  ON public.cities FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete cities"
  ON public.cities FOR DELETE USING (public.is_admin(auth.uid()));

-- ── posts policies ────────────────────────────────────────────
CREATE POLICY "Anyone can view published posts"
  ON public.posts FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Admins can view all posts"
  ON public.posts FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert posts"
  ON public.posts FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update posts"
  ON public.posts FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete posts"
  ON public.posts FOR DELETE USING (public.is_admin(auth.uid()));

-- ── knowledge_categories policies ────────────────────────────
CREATE POLICY "Anyone can view knowledge_categories"
  ON public.knowledge_categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage knowledge_categories"
  ON public.knowledge_categories FOR ALL TO public
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));


-- =============================================================
-- 5. TRIGGERS (updated_at + new user handler)
-- =============================================================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_seekers_updated_at
  BEFORE UPDATE ON public.job_seekers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rfqs_updated_at
  BEFORE UPDATE ON public.rfqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_real_estate_agents_updated_at
  BEFORE UPDATE ON public.real_estate_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-provision profile, roles, and free subscription on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _full_name text;
  _roles     text[];
  _role      text;
BEGIN
  _full_name := NEW.raw_user_meta_data ->> 'full_name';
  _roles     := ARRAY(SELECT json_array_elements_text((NEW.raw_user_meta_data ->> 'roles')::json));

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, _full_name);

  FOREACH _role IN ARRAY _roles
  LOOP
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role::app_role);
  END LOOP;

  -- Auto-create free subscription
  INSERT INTO public.subscriptions (user_id, plan, billing_period)
  VALUES (NEW.id, 'free', 'annual');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================
-- 6. INDEXES
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_restaurants_slug        ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_published ON public.restaurants(is_published);
CREATE INDEX IF NOT EXISTS idx_suppliers_slug           ON public.suppliers(slug);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_published   ON public.suppliers(is_published);
CREATE INDEX IF NOT EXISTS idx_jobs_slug                ON public.jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_status              ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_restaurant_id       ON public.jobs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id  ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status             ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug               ON public.posts(slug);


-- =============================================================
-- 7. STORAGE BUCKETS
-- =============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

-- property-images storage policies
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');
CREATE POLICY "Users can update their property images"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-images');
CREATE POLICY "Users can delete their property images"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-images');

-- post-images storage policies
CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'post-images');
CREATE POLICY "Admins can upload post images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-images' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can update post images"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'post-images' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete post images"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'post-images' AND public.is_admin(auth.uid()));


-- =============================================================
-- 8. SEED DATA
-- =============================================================

INSERT INTO public.knowledge_categories (name, slug, description, icon_name, sort_order) VALUES
  ('Operations & Management',     'operations-management',     'Best practices for running efficient restaurant operations',                  'Settings',    1),
  ('Finance & Cost Control',      'finance-cost-control',      'Financial management, budgeting, and cost optimization strategies',           'TrendingUp',  2),
  ('HR & Staff Management',       'hr-staff-management',       'Hiring, training, retention, and team management insights',                  'Users',       3),
  ('Menu Engineering & Kitchen',  'menu-engineering-kitchen',  'Menu design, recipe costing, and kitchen workflow optimization',             'ChefHat',     4),
  ('Suppliers & Procurement',     'suppliers-procurement',     'Sourcing, vendor management, and procurement best practices',                'Package',     5),
  ('Marketing & Growth',          'marketing-growth',          'Digital marketing, branding, and customer acquisition tactics',              'Megaphone',   6),
  ('Customer Experience',         'customer-experience',       'Service excellence, reviews, and guest satisfaction strategies',             'Heart',       7),
  ('Legal & Compliance',          'legal-compliance',          'Regulations, licensing, food safety, and legal requirements',                'Shield',      8),
  ('Technology & Digitalization', 'technology-digitalization', 'POS systems, digital tools, and tech adoption for restaurants',             'Laptop',      9),
  ('Case Studies',                'case-studies',              'Real-world success stories and lessons from the industry',                   'FileText',   10);

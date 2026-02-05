-- Create cuisines table for restaurant categories
CREATE TABLE public.cuisines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_categories table
CREATE TABLE public.supplier_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_categories table
CREATE TABLE public.job_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cities table
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  country TEXT DEFAULT 'Netherlands',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table for content management
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  author_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create is_admin helper function
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

-- Cuisines policies
CREATE POLICY "Anyone can view cuisines" ON public.cuisines FOR SELECT USING (true);
CREATE POLICY "Admins can insert cuisines" ON public.cuisines FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update cuisines" ON public.cuisines FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete cuisines" ON public.cuisines FOR DELETE USING (public.is_admin(auth.uid()));

-- Supplier categories policies
CREATE POLICY "Anyone can view supplier_categories" ON public.supplier_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert supplier_categories" ON public.supplier_categories FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update supplier_categories" ON public.supplier_categories FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete supplier_categories" ON public.supplier_categories FOR DELETE USING (public.is_admin(auth.uid()));

-- Job categories policies
CREATE POLICY "Anyone can view job_categories" ON public.job_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert job_categories" ON public.job_categories FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update job_categories" ON public.job_categories FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete job_categories" ON public.job_categories FOR DELETE USING (public.is_admin(auth.uid()));

-- Cities policies
CREATE POLICY "Anyone can view cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Admins can insert cities" ON public.cities FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update cities" ON public.cities FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete cities" ON public.cities FOR DELETE USING (public.is_admin(auth.uid()));

-- Posts policies
CREATE POLICY "Anyone can view published posts" ON public.posts FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Admins can view all posts" ON public.posts FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert posts" ON public.posts FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update posts" ON public.posts FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete posts" ON public.posts FOR DELETE USING (public.is_admin(auth.uid()));

-- Admin policies for user_roles table
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.is_admin(auth.uid()));

-- Admin policies for existing tables (moderation)
CREATE POLICY "Admins can view all restaurants" ON public.restaurants FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all restaurants" ON public.restaurants FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all suppliers" ON public.suppliers FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all suppliers" ON public.suppliers FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all jobs" ON public.jobs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all jobs" ON public.jobs FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));

-- Trigger for posts updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_slug ON public.posts(slug);
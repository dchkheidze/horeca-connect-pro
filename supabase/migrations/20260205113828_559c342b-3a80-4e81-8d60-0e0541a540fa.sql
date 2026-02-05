-- Create restaurants table for restaurant profiles
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  description TEXT,
  cuisine_tags TEXT[] DEFAULT '{}',
  price_level INTEGER CHECK (price_level >= 1 AND price_level <= 4),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_profiles table
CREATE TABLE public.supplier_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  description TEXT,
  categories TEXT[] DEFAULT '{}',
  coverage_areas TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_offers table
CREATE TABLE public.supplier_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.supplier_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidates table for job seekers
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  headline TEXT,
  about TEXT,
  job_categories TEXT[] DEFAULT '{}',
  schedule_types TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants
CREATE POLICY "Users can view their own restaurant"
ON public.restaurants FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own restaurant"
ON public.restaurants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own restaurant"
ON public.restaurants FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for supplier_profiles
CREATE POLICY "Users can view their own supplier profile"
ON public.supplier_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplier profile"
ON public.supplier_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplier profile"
ON public.supplier_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for supplier_offers (based on supplier ownership)
CREATE POLICY "Users can view their own supplier offers"
ON public.supplier_offers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.supplier_profiles sp 
    WHERE sp.id = supplier_id AND sp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own supplier offers"
ON public.supplier_offers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.supplier_profiles sp 
    WHERE sp.id = supplier_id AND sp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own supplier offers"
ON public.supplier_offers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.supplier_profiles sp 
    WHERE sp.id = supplier_id AND sp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own supplier offers"
ON public.supplier_offers FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.supplier_profiles sp 
    WHERE sp.id = supplier_id AND sp.user_id = auth.uid()
  )
);

-- RLS Policies for candidates
CREATE POLICY "Users can view their own candidate profile"
ON public.candidates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own candidate profile"
ON public.candidates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidate profile"
ON public.candidates FOR UPDATE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_profiles_updated_at
BEFORE UPDATE ON public.supplier_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
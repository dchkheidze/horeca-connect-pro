
-- Create subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'standard', 'premium');
CREATE TYPE public.subscription_billing AS ENUM ('monthly', 'annual');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan subscription_plan NOT NULL DEFAULT 'free',
  billing_period subscription_billing NOT NULL DEFAULT 'annual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one subscription per user
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own subscription
CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Admins can update all subscriptions
CREATE POLICY "Admins can update all subscriptions"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

-- Auto-create free subscription for new users via trigger update
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _full_name text;
  _roles text[];
  _role text;
BEGIN
  _full_name := NEW.raw_user_meta_data ->> 'full_name';
  _roles := ARRAY(SELECT json_array_elements_text((NEW.raw_user_meta_data ->> 'roles')::json));

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
$function$;


-- Create knowledge_categories table
CREATE TABLE public.knowledge_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon_name text NOT NULL DEFAULT 'BookOpen',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view knowledge_categories"
  ON public.knowledge_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage knowledge_categories"
  ON public.knowledge_categories FOR ALL
  TO public
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Add new columns to posts table
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS read_time integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];

-- Seed the 10 knowledge categories
INSERT INTO public.knowledge_categories (name, slug, description, icon_name, sort_order) VALUES
  ('Operations & Management', 'operations-management', 'Best practices for running efficient restaurant operations', 'Settings', 1),
  ('Finance & Cost Control', 'finance-cost-control', 'Financial management, budgeting, and cost optimization strategies', 'TrendingUp', 2),
  ('HR & Staff Management', 'hr-staff-management', 'Hiring, training, retention, and team management insights', 'Users', 3),
  ('Menu Engineering & Kitchen', 'menu-engineering-kitchen', 'Menu design, recipe costing, and kitchen workflow optimization', 'ChefHat', 4),
  ('Suppliers & Procurement', 'suppliers-procurement', 'Sourcing, vendor management, and procurement best practices', 'Package', 5),
  ('Marketing & Growth', 'marketing-growth', 'Digital marketing, branding, and customer acquisition tactics', 'Megaphone', 6),
  ('Customer Experience', 'customer-experience', 'Service excellence, reviews, and guest satisfaction strategies', 'Heart', 7),
  ('Legal & Compliance', 'legal-compliance', 'Regulations, licensing, food safety, and legal requirements', 'Shield', 8),
  ('Technology & Digitalization', 'technology-digitalization', 'POS systems, digital tools, and tech adoption for restaurants', 'Laptop', 9),
  ('Case Studies', 'case-studies', 'Real-world success stories and lessons from the industry', 'FileText', 10);

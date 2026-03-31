
DROP POLICY "Subscribers can view published properties" ON public.properties;

CREATE POLICY "Anyone can view published properties"
ON public.properties
FOR SELECT
TO public
USING (is_published = true AND status = 'ACTIVE');

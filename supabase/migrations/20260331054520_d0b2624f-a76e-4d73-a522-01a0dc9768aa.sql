CREATE POLICY "Admins can insert all subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));
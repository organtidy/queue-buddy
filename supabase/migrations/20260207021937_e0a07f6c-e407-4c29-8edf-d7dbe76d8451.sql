
-- Block all direct access to admin_credentials (only RPC functions can access it via SECURITY DEFINER)
CREATE POLICY "No direct read access"
  ON public.admin_credentials
  FOR SELECT
  USING (false);

CREATE POLICY "No direct insert access"
  ON public.admin_credentials
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update access"
  ON public.admin_credentials
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

CREATE POLICY "No direct delete access"
  ON public.admin_credentials
  FOR DELETE
  USING (false);

-- Restrict push_subscriptions SELECT to prevent token theft
DROP POLICY IF EXISTS "Anyone can view push subscriptions" ON public.push_subscriptions;

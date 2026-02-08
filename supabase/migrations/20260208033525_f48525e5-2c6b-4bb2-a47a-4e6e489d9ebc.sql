
-- Fix push_subscriptions RLS policies: change from RESTRICTIVE to PERMISSIVE
-- and add missing SELECT/UPDATE policies for upsert to work

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can insert push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can delete push subscriptions" ON public.push_subscriptions;

-- Create PERMISSIVE policies (required for access to work)
CREATE POLICY "Allow anonymous insert" ON public.push_subscriptions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous select" ON public.push_subscriptions
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous delete" ON public.push_subscriptions
  FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anonymous update" ON public.push_subscriptions
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

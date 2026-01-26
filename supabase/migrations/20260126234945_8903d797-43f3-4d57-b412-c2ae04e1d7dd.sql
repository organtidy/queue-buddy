-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view queue state" ON public.queue_state;
DROP POLICY IF EXISTS "Authenticated users can update queue state" ON public.queue_state;

-- Create permissive policies (default is PERMISSIVE)
CREATE POLICY "Public read access"
ON public.queue_state
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can update"
ON public.queue_state
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
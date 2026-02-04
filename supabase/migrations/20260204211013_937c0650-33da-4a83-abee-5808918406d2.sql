-- Fix admin controls: allow public (anon) updates to queue_state
-- Current setup allows public SELECT but only authenticated UPDATE, causing PATCH 204 with 0 rows updated.

-- Ensure RLS is enabled (kept as-is)
ALTER TABLE public.queue_state ENABLE ROW LEVEL SECURITY;

-- Add a permissive UPDATE policy for public/anon users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'queue_state'
      AND policyname = 'Public update access'
  ) THEN
    EXECUTE 'CREATE POLICY "Public update access" ON public.queue_state FOR UPDATE TO public USING (true) WITH CHECK (true)';
  END IF;
END $$;
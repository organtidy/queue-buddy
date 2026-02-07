
-- Create the pin_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.pin_attempts (
  attempt_key text PRIMARY KEY,
  attempt_count integer NOT NULL DEFAULT 0,
  last_attempt timestamp with time zone NOT NULL DEFAULT now(),
  locked_until timestamp with time zone
);

-- Block all direct access via RLS
ALTER TABLE public.pin_attempts ENABLE ROW LEVEL SECURITY;

-- No RLS policies = no direct access. Only SECURITY DEFINER functions can touch it.

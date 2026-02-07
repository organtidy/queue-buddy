
-- 1. Create separate table for admin credentials (NOT publicly accessible)
CREATE TABLE public.admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_pin text NOT NULL DEFAULT '1234',
  secret_phrase text NOT NULL DEFAULT 'barbearia'
);

ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
-- NO RLS policies = no public access at all

-- 2. Copy existing credentials from queue_state
INSERT INTO public.admin_credentials (admin_pin, secret_phrase)
SELECT COALESCE(admin_pin, '1234'), COALESCE(secret_phrase, 'barbearia')
FROM public.queue_state
LIMIT 1;

-- 3. Remove sensitive columns from queue_state
ALTER TABLE public.queue_state DROP COLUMN IF EXISTS admin_pin;
ALTER TABLE public.queue_state DROP COLUMN IF EXISTS secret_phrase;

-- 4. Create SECURITY DEFINER functions for PIN operations (bypass RLS safely)

CREATE OR REPLACE FUNCTION public.validate_admin_pin(pin_input text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_credentials WHERE admin_pin = pin_input
  );
$$;

CREATE OR REPLACE FUNCTION public.validate_secret_phrase(phrase_input text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_credentials WHERE lower(secret_phrase) = lower(phrase_input)
  );
$$;

CREATE OR REPLACE FUNCTION public.reset_admin_pin(phrase_input text, new_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_credentials WHERE lower(secret_phrase) = lower(phrase_input)) THEN
    RETURN false;
  END IF;
  UPDATE admin_credentials SET admin_pin = new_pin;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_admin_pin_authenticated(current_pin text, new_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_credentials WHERE admin_pin = current_pin) THEN
    RETURN false;
  END IF;
  UPDATE admin_credentials SET admin_pin = new_pin;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_secret_phrase_authenticated(current_pin text, new_phrase text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_credentials WHERE admin_pin = current_pin) THEN
    RETURN false;
  END IF;
  UPDATE admin_credentials SET secret_phrase = new_phrase;
  RETURN true;
END;
$$;

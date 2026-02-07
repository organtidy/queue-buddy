
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
  UPDATE admin_credentials SET admin_pin = new_pin WHERE lower(secret_phrase) = lower(phrase_input);
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
  UPDATE admin_credentials SET admin_pin = new_pin WHERE admin_pin = current_pin;
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
  UPDATE admin_credentials SET secret_phrase = new_phrase WHERE admin_pin = current_pin;
  RETURN true;
END;
$$;

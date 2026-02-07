
-- Drop the old function (return type changed from boolean to jsonb)
DROP FUNCTION IF EXISTS public.validate_admin_pin(text);

-- Recreate with rate limiting
CREATE OR REPLACE FUNCTION public.validate_admin_pin(pin_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_key_val text;
  current_attempts integer;
  locked_time timestamp with time zone;
  is_valid boolean;
BEGIN
  attempt_key_val := 'global_pin';

  -- Clean up old attempts (older than 1 hour)
  DELETE FROM pin_attempts WHERE last_attempt < now() - interval '1 hour';

  -- Check if locked
  SELECT locked_until, attempt_count INTO locked_time, current_attempts
  FROM pin_attempts WHERE attempt_key = attempt_key_val;

  IF locked_time IS NOT NULL AND locked_time > now() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'locked', true,
      'retry_after', EXTRACT(EPOCH FROM (locked_time - now()))::integer
    );
  END IF;

  -- Validate PIN
  SELECT EXISTS (SELECT 1 FROM admin_credentials WHERE admin_pin = pin_input) INTO is_valid;

  IF NOT is_valid THEN
    INSERT INTO pin_attempts (attempt_key, attempt_count, last_attempt)
    VALUES (attempt_key_val, 1, now())
    ON CONFLICT (attempt_key) DO UPDATE
    SET
      attempt_count = CASE
        WHEN pin_attempts.last_attempt < now() - interval '15 minutes' THEN 1
        ELSE pin_attempts.attempt_count + 1
      END,
      last_attempt = now(),
      locked_until = CASE
        WHEN pin_attempts.attempt_count >= 4 THEN now() + interval '30 minutes'
        ELSE NULL
      END;

    SELECT attempt_count INTO current_attempts FROM pin_attempts WHERE attempt_key = attempt_key_val;

    RETURN jsonb_build_object(
      'valid', false,
      'locked', current_attempts >= 5,
      'attempts_remaining', GREATEST(0, 5 - current_attempts)
    );
  END IF;

  -- Success - clear attempts
  DELETE FROM pin_attempts WHERE attempt_key = attempt_key_val;

  RETURN jsonb_build_object('valid', true, 'locked', false);
END;
$$;

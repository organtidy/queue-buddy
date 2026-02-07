
CREATE OR REPLACE FUNCTION public.admin_update_queue(pin_input text, updates jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public._verify_pin(pin_input) THEN
    RETURN false;
  END IF;

  UPDATE queue_state SET
    current_count = CASE WHEN updates ? 'current_count' THEN (updates->>'current_count')::integer ELSE current_count END,
    is_open = CASE WHEN updates ? 'is_open' THEN (updates->>'is_open')::boolean ELSE is_open END,
    avg_wait_time = CASE WHEN updates ? 'avg_wait_time' THEN (updates->>'avg_wait_time')::integer ELSE avg_wait_time END,
    manual_wait_time = CASE WHEN updates ? 'manual_wait_time' THEN (updates->>'manual_wait_time')::integer ELSE manual_wait_time END,
    message_green = CASE WHEN updates ? 'message_green' THEN updates->>'message_green' ELSE message_green END,
    message_yellow = CASE WHEN updates ? 'message_yellow' THEN updates->>'message_yellow' ELSE message_yellow END,
    message_red = CASE WHEN updates ? 'message_red' THEN updates->>'message_red' ELSE message_red END,
    cut_durations = CASE WHEN updates ? 'cut_durations' THEN updates->'cut_durations' ELSE cut_durations END,
    last_updated = now()
  WHERE true;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_professional(pin_input text, prof_id uuid, updates jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public._verify_pin(pin_input) THEN
    RETURN false;
  END IF;

  UPDATE professionals SET
    clients_queue = CASE WHEN updates ? 'clients_queue' THEN (updates->>'clients_queue')::integer ELSE clients_queue END,
    current_client_time = CASE WHEN updates ? 'current_client_time' THEN updates->>'current_client_time' ELSE current_client_time END,
    next_clients = CASE WHEN updates ? 'next_clients' THEN updates->'next_clients' ELSE next_clients END
  WHERE id = prof_id;

  RETURN true;
END;
$$;

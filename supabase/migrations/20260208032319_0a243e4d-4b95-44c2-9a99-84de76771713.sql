
-- Create a database webhook trigger that fires when queue_state changes
-- We use pg_net to call the edge function directly from the database

-- Enable the pg_net extension for HTTP calls from the database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function that calls the edge function when count changes
CREATE OR REPLACE FUNCTION public.notify_queue_change()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url text;
  supabase_anon_key text;
BEGIN
  -- Only notify if current_count actually changed
  IF OLD.current_count IS DISTINCT FROM NEW.current_count THEN
    edge_function_url := 'https://rwwwxrfxxgpcmegljjcw.supabase.co/functions/v1/send-push-notification';
    supabase_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3d3d4cmZ4eGdwY21lZ2xqamN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzOTA3ODUsImV4cCI6MjA4NDk2Njc4NX0.i0CHpQAKfDTqKX_YTtuidkY2hq1rThE2XxqhJGs0IW0';
    
    PERFORM extensions.http_post(
      edge_function_url,
      jsonb_build_object(
        'old_count', OLD.current_count,
        'new_count', NEW.current_count
      )::text,
      'application/json'::text,
      ARRAY[
        extensions.http_header('Authorization', 'Bearer ' || supabase_anon_key),
        extensions.http_header('apikey', supabase_anon_key)
      ]::extensions.http_header[]
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS on_queue_count_change ON public.queue_state;
CREATE TRIGGER on_queue_count_change
  AFTER UPDATE ON public.queue_state
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_queue_change();

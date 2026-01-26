-- Create queue_state table
CREATE TABLE public.queue_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_count integer NOT NULL DEFAULT 0,
  is_open boolean NOT NULL DEFAULT false,
  avg_wait_time integer NOT NULL DEFAULT 30,
  last_updated timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.queue_state ENABLE ROW LEVEL SECURITY;

-- Public can read (customers can see the queue)
CREATE POLICY "Anyone can view queue state"
ON public.queue_state
FOR SELECT
USING (true);

-- Only authenticated users (barber) can update
CREATE POLICY "Authenticated users can update queue state"
ON public.queue_state
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert initial state row
INSERT INTO public.queue_state (current_count, is_open, avg_wait_time)
VALUES (0, false, 30);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_state;
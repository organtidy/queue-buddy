-- Create professionals table
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  current_client_time TEXT,
  next_clients JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view professionals"
ON public.professionals
FOR SELECT
USING (true);

-- Authenticated update/insert/delete
CREATE POLICY "Authenticated users can manage professionals"
ON public.professionals
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Public update for queue management (barber controls without login)
CREATE POLICY "Anyone can update professionals queue"
ON public.professionals
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Insert initial professionals
INSERT INTO public.professionals (name, color) VALUES 
  ('João', '#3B82F6'),
  ('Jacson', '#22C55E');
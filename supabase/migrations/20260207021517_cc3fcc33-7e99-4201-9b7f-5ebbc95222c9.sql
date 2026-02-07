
-- Table to store push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint text NOT NULL UNIQUE,
  keys_p256dh text NOT NULL,
  keys_auth text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (no auth required for this app)
CREATE POLICY "Anyone can insert push subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Anyone can view their own subscription (by endpoint)
CREATE POLICY "Anyone can view push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (true);

-- Anyone can delete their subscription
CREATE POLICY "Anyone can delete push subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  USING (true);

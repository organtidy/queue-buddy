-- Add custom message fields to queue_state table
ALTER TABLE public.queue_state
ADD COLUMN IF NOT EXISTS manual_wait_time integer,
ADD COLUMN IF NOT EXISTS message_green text DEFAULT 'Vem que tá tranquilo!',
ADD COLUMN IF NOT EXISTS message_yellow text DEFAULT 'Movimento moderado',
ADD COLUMN IF NOT EXISTS message_red text DEFAULT 'Fila cheia, aguarde em casa';

-- Add comment for clarity
COMMENT ON COLUMN public.queue_state.manual_wait_time IS 'Optional manual wait time override (in minutes)';
COMMENT ON COLUMN public.queue_state.message_green IS 'Custom message for low queue (green status)';
COMMENT ON COLUMN public.queue_state.message_yellow IS 'Custom message for moderate queue (yellow status)';
COMMENT ON COLUMN public.queue_state.message_red IS 'Custom message for full queue (red status)';
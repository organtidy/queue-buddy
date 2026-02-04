-- Add cut_durations to queue_state for storing the last 10 cut durations
ALTER TABLE queue_state 
ADD COLUMN IF NOT EXISTS cut_durations JSONB DEFAULT '[]'::jsonb;

-- Add current_client_time to professionals for tracking when the current client started
-- Note: This column already exists as TEXT, we need to use it as a timestamp string
-- The column 'current_client_time' already exists, so we'll use it for storing ISO timestamps
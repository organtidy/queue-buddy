-- Add admin_pin and secret_phrase to queue_state
ALTER TABLE queue_state 
ADD COLUMN IF NOT EXISTS admin_pin TEXT DEFAULT '1234',
ADD COLUMN IF NOT EXISTS secret_phrase TEXT DEFAULT 'barbearia';

-- Add clients_queue to professionals (number of clients waiting for each professional)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS clients_queue INTEGER DEFAULT 0;
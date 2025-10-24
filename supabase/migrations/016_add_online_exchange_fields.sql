-- Add online exchange fields to transactions table
-- This migration adds support for online/virtual transactions

-- Add delivery fields (for delivery transactions)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_method TEXT;

-- Add online exchange fields (for online/virtual transactions)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS online_platform TEXT,
ADD COLUMN IF NOT EXISTS online_contact TEXT,
ADD COLUMN IF NOT EXISTS online_instructions TEXT;

-- Add transaction type field to distinguish between meetup, delivery, and online
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'meetup' 
CHECK (transaction_type IN ('meetup', 'delivery', 'online'));

-- Add comments for documentation
COMMENT ON COLUMN transactions.delivery_address IS 'Address for delivery transactions';
COMMENT ON COLUMN transactions.delivery_method IS 'Method of delivery (e.g., LBC, J&T Express)';
COMMENT ON COLUMN transactions.online_platform IS 'Platform for online transactions (e.g., Discord, Zoom)';
COMMENT ON COLUMN transactions.online_contact IS 'Contact information for online transactions';
COMMENT ON COLUMN transactions.online_instructions IS 'Instructions for online exchange';
COMMENT ON COLUMN transactions.transaction_type IS 'Type of transaction: meetup, delivery, or online';

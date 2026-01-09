-- Add gas fee warning tracking to user_data table
ALTER TABLE user_data 
ADD COLUMN has_seen_gas_fee_warning BOOLEAN DEFAULT FALSE;

-- Update RLS policies if needed (user_data should already have proper RLS)
-- Users can only read/update their own data
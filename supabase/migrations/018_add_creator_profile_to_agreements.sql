-- Add creator profile columns to agreements table (similar to transactions)
ALTER TABLE agreements
ADD COLUMN IF NOT EXISTS creator_name TEXT,
ADD COLUMN IF NOT EXISTS creator_email TEXT,
ADD COLUMN IF NOT EXISTS creator_avatar_url TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_agreements_creator_id ON agreements(creator_id);

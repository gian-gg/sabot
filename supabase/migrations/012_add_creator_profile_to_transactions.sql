-- Add creator profile fields to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS creator_name TEXT,
ADD COLUMN IF NOT EXISTS creator_email TEXT,
ADD COLUMN IF NOT EXISTS creator_avatar_url TEXT;

-- Add comment explaining these fields
COMMENT ON COLUMN transactions.creator_name IS 'Cached creator name for quick access';
COMMENT ON COLUMN transactions.creator_email IS 'Cached creator email for quick access';
COMMENT ON COLUMN transactions.creator_avatar_url IS 'Cached creator avatar URL for quick access';

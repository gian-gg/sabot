-- Add invitee profile fields to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS invitee_name TEXT,
ADD COLUMN IF NOT EXISTS invitee_email TEXT,
ADD COLUMN IF NOT EXISTS invitee_avatar_url TEXT;

-- Add comment
COMMENT ON COLUMN transactions.invitee_name IS 'Cached invitee name from better-auth session';
COMMENT ON COLUMN transactions.invitee_email IS 'Cached invitee email from better-auth session';
COMMENT ON COLUMN transactions.invitee_avatar_url IS 'Cached invitee avatar URL from better-auth session';

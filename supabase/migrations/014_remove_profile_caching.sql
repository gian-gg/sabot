-- Rollback: Remove profile caching columns from transactions table
-- This reverts migrations 012 and 013

ALTER TABLE transactions
DROP COLUMN IF EXISTS creator_name,
DROP COLUMN IF EXISTS creator_email,
DROP COLUMN IF EXISTS creator_avatar_url,
DROP COLUMN IF EXISTS invitee_name,
DROP COLUMN IF EXISTS invitee_email,
DROP COLUMN IF EXISTS invitee_avatar_url;

-- Migration: Rename Agreement Participant Columns
-- Description: Rename name, email, and avatar columns to match transaction_participants naming convention
-- Author: Sabot Development Team
-- Date: 2025-12-04

-- ============================================================================
-- RENAME COLUMNS IN AGREEMENT_PARTICIPANTS TABLE
-- ============================================================================

-- Rename 'name' to 'participant_name'
ALTER TABLE agreement_participants
RENAME COLUMN name TO participant_name;

-- Rename 'email' to 'participant_email'
ALTER TABLE agreement_participants
RENAME COLUMN email TO participant_email;

-- Rename 'avatar' to 'participant_avatar_url'
ALTER TABLE agreement_participants
RENAME COLUMN avatar TO participant_avatar_url;

-- ============================================================================
-- UPDATE COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN agreement_participants.participant_name IS 'Name of the agreement participant';
COMMENT ON COLUMN agreement_participants.participant_email IS 'Email of the agreement participant';
COMMENT ON COLUMN agreement_participants.participant_avatar_url IS 'Avatar URL of the agreement participant';

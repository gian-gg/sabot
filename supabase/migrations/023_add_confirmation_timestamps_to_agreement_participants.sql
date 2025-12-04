-- Migration: Add Confirmation and Signing Columns to Agreement Participants
-- Description: Add confirmed_at, has_signed, and signed_at columns to agreement_participants table
-- Author: Sabot Development Team
-- Date: 2025-12-04

-- ============================================================================
-- ADD MISSING COLUMNS TO AGREEMENT_PARTICIPANTS
-- ============================================================================

-- Add confirmed_at column (when participant confirmed the agreement)
ALTER TABLE agreement_participants
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Add has_signed column (boolean flag: did participant digitally sign?)
ALTER TABLE agreement_participants
ADD COLUMN IF NOT EXISTS has_signed BOOLEAN DEFAULT FALSE;

-- Add signed_at column (when participant digitally signed the agreement)
ALTER TABLE agreement_participants
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN agreement_participants.confirmed_at IS 'Timestamp when participant confirmed the agreement';
COMMENT ON COLUMN agreement_participants.has_signed IS 'Boolean flag: has participant digitally signed the agreement?';
COMMENT ON COLUMN agreement_participants.signed_at IS 'Timestamp when participant digitally signed the agreement';

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agreement_participants_confirmed_at ON agreement_participants(confirmed_at);
CREATE INDEX IF NOT EXISTS idx_agreement_participants_has_signed ON agreement_participants(has_signed);
CREATE INDEX IF NOT EXISTS idx_agreement_participants_signed_at ON agreement_participants(signed_at);

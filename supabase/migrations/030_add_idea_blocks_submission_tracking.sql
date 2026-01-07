-- Migration: Add idea blocks submission tracking to agreement_participants table
-- Created: 2026-01-07T08:44:05.520Z

-- Add columns to track idea blocks submission status
ALTER TABLE agreement_participants 
ADD COLUMN idea_blocks_submitted BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN idea_blocks_submitted_at TIMESTAMP WITH TIME ZONE;

-- Create index for performance when querying submission status
CREATE INDEX idx_agreement_participants_idea_blocks_submitted 
ON agreement_participants(agreement_id, idea_blocks_submitted);

-- Add comments for documentation
COMMENT ON COLUMN agreement_participants.idea_blocks_submitted 
IS 'Tracks whether this participant has submitted their idea blocks';

COMMENT ON COLUMN agreement_participants.idea_blocks_submitted_at 
IS 'Timestamp when the participant submitted their idea blocks';

-- Optional: Update existing records to have idea_blocks_submitted = false (already default)
-- This ensures consistency for existing data
UPDATE agreement_participants 
SET idea_blocks_submitted = FALSE 
WHERE idea_blocks_submitted IS NULL;
-- Rollback Migration: Remove idea blocks submission tracking from agreement_participants table
-- Created: 2026-01-07T08:44:05.520Z
-- This script reverses the changes made in 030_add_idea_blocks_submission_tracking.sql

-- Drop the index
DROP INDEX IF EXISTS idx_agreement_participants_idea_blocks_submitted;

-- Remove the columns
ALTER TABLE agreement_participants 
DROP COLUMN IF EXISTS idea_blocks_submitted,
DROP COLUMN IF EXISTS idea_blocks_submitted_at;
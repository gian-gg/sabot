-- Migration: Migrate JSONB Deliverables to Normalized Table
-- Description: Convert existing JSONB deliverables in escrows table to normalized deliverables table
-- Author: Sabot Development Team
-- Date: 2025-01-27

-- ============================================================================
-- MIGRATE EXISTING JSONB DELIVERABLES
-- ============================================================================

-- Run the migration function to convert JSONB deliverables to normalized table
SELECT migrate_jsonb_deliverables();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify migration results
DO $$
DECLARE
  jsonb_count INTEGER;
  normalized_count INTEGER;
  escrow_count INTEGER;
BEGIN
  -- Count JSONB deliverables
  SELECT COUNT(*) INTO jsonb_count
  FROM escrows 
  WHERE deliverables IS NOT NULL 
  AND jsonb_array_length(deliverables) > 0;
  
  -- Count normalized deliverables
  SELECT COUNT(*) INTO normalized_count
  FROM deliverables;
  
  -- Count escrows with deliverables
  SELECT COUNT(DISTINCT escrow_id) INTO escrow_count
  FROM deliverables;
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '  Escrows with JSONB deliverables: %', jsonb_count;
  RAISE NOTICE '  Normalized deliverables created: %', normalized_count;
  RAISE NOTICE '  Escrows with normalized deliverables: %', escrow_count;
  
  -- Verify data integrity
  IF jsonb_count > 0 AND normalized_count = 0 THEN
    RAISE WARNING 'Migration may have failed - no normalized deliverables created';
  ELSIF jsonb_count > 0 AND normalized_count < jsonb_count THEN
    RAISE WARNING 'Migration incomplete - some deliverables may not have been migrated';
  ELSE
    RAISE NOTICE 'Migration appears successful';
  END IF;
END;
$$;

-- ============================================================================
-- CLEANUP (OPTIONAL)
-- ============================================================================

-- Uncomment the following lines to remove JSONB deliverables after successful migration
-- WARNING: This will permanently delete the JSONB data
-- Only run this after verifying the migration was successful

-- ALTER TABLE escrows DROP COLUMN deliverables;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION migrate_jsonb_deliverables IS 'Migrates existing JSONB deliverables to normalized table structure';

-- Migration: Add AI Analysis Data to Escrows
-- Description: Add ai_analysis_data column to escrows table to store AI analysis results
-- Author: Sabot Development Team
-- Date: 2025-01-27

-- ============================================================================
-- ADD AI ANALYSIS DATA COLUMN
-- ============================================================================

-- Add ai_analysis_data column to escrows table
ALTER TABLE escrows 
ADD COLUMN IF NOT EXISTS ai_analysis_data JSONB;

-- Add comment explaining the column
COMMENT ON COLUMN escrows.ai_analysis_data IS 'AI analysis data from transaction screenshots stored as JSONB';

-- ============================================================================
-- CREATE INDEX FOR PERFORMANCE
-- ============================================================================

-- Create index for querying escrows by AI analysis data
CREATE INDEX IF NOT EXISTS idx_escrows_ai_analysis_data 
ON escrows USING GIN (ai_analysis_data);

-- ============================================================================
-- ADD HELPER FUNCTIONS
-- ============================================================================

-- Function to extract AI analysis summary from escrow
CREATE OR REPLACE FUNCTION get_escrow_ai_summary(escrow_id UUID)
RETURNS JSONB AS $$
DECLARE
  analysis_data JSONB;
  summary JSONB;
BEGIN
  -- Get AI analysis data from escrow
  SELECT ai_analysis_data INTO analysis_data
  FROM escrows
  WHERE id = escrow_id;
  
  -- If no analysis data, return null
  IF analysis_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Create summary with key metrics
  summary := jsonb_build_object(
    'total_analyses', jsonb_array_length(analysis_data),
    'has_analysis', jsonb_array_length(analysis_data) > 0,
    'analysis_timestamp', (analysis_data->0->>'created_at'),
    'confidence_scores', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', analysis->>'user_id',
          'confidence', (analysis->'analysis_data'->>'confidence')::numeric
        )
      )
      FROM jsonb_array_elements(analysis_data) AS analysis
    )
  );
  
  RETURN summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATE RLS POLICIES
-- ============================================================================

-- Ensure RLS policies allow access to ai_analysis_data
-- (No changes needed as existing policies cover all columns)

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_escrow_ai_summary IS 'Extracts AI analysis summary from escrow data for quick access to key metrics';

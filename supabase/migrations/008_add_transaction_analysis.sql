-- Create transaction_analyses table
CREATE TABLE IF NOT EXISTS transaction_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  screenshot_id UUID NOT NULL REFERENCES transaction_screenshots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(transaction_id, screenshot_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_analyses_transaction ON transaction_analyses(transaction_id);
CREATE INDEX IF NOT EXISTS idx_analyses_screenshot ON transaction_analyses(screenshot_id);

-- Enable RLS
ALTER TABLE transaction_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view analyses from their transactions"
  ON transaction_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transaction_participants
      WHERE transaction_participants.transaction_id = transaction_analyses.transaction_id
      AND transaction_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analyses"
  ON transaction_analyses FOR INSERT
  WITH CHECK (true); -- Allow system to insert analysis results
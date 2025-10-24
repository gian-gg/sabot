-- Create blockchain_agreements table
CREATE TABLE IF NOT EXISTS blockchain_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  agreement_hash TEXT NOT NULL,
  tx_hash TEXT,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blockchain_agreements_agreement ON blockchain_agreements(agreement_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_agreements_hash ON blockchain_agreements(agreement_hash);

-- Add trigger for updated_at
CREATE TRIGGER update_blockchain_agreements_updated_at
  BEFORE UPDATE ON blockchain_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE blockchain_agreements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view blockchain agreements they're part of"
  ON blockchain_agreements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agreements a
      LEFT JOIN agreement_participants ap ON a.id = ap.agreement_id
      WHERE a.id = blockchain_agreements.agreement_id
      AND (a.creator_id = auth.uid() OR ap.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create blockchain agreements they're part of"
  ON blockchain_agreements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements a
      LEFT JOIN agreement_participants ap ON a.id = ap.agreement_id
      WHERE a.id = blockchain_agreements.agreement_id
      AND (a.creator_id = auth.uid() OR ap.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update blockchain agreements they're part of"
  ON blockchain_agreements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agreements a
      LEFT JOIN agreement_participants ap ON a.id = ap.agreement_id
      WHERE a.id = blockchain_agreements.agreement_id
      AND (a.creator_id = auth.uid() OR ap.user_id = auth.uid())
    )
  );
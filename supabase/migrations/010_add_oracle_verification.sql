-- Oracle Verification System
-- Stores automatic oracle verification results for escrow deliverables

-- Create oracle_verifications table
CREATE TABLE oracle_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID REFERENCES escrows(id) NOT NULL,
  blockchain_escrow_id INTEGER,
  oracle_type TEXT NOT NULL CHECK (oracle_type IN ('ipfs', 'ai')),
  verified BOOLEAN NOT NULL,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  proof_hash TEXT NOT NULL,
  notes TEXT,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_oracle_verifications_escrow ON oracle_verifications(escrow_id);
CREATE INDEX idx_oracle_verifications_blockchain ON oracle_verifications(blockchain_escrow_id);
CREATE INDEX idx_oracle_verifications_created ON oracle_verifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE oracle_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view oracle verifications for their escrows
CREATE POLICY "Parties can view oracle verifications"
  ON oracle_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrows
      WHERE escrows.id = oracle_verifications.escrow_id
      AND (
        escrows.initiator_id = auth.uid() 
        OR escrows.participant_id = auth.uid() 
        OR escrows.arbiter_id = auth.uid()
      )
    )
  );

-- RLS Policy: Service role can insert oracle verifications
CREATE POLICY "Service can insert oracle verifications"
  ON oracle_verifications FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() IS NULL);

-- Comment for documentation
COMMENT ON TABLE oracle_verifications IS 'Stores automatic oracle verification results for FileDeliverable and Service escrow types';
COMMENT ON COLUMN oracle_verifications.oracle_type IS 'Type of oracle verification: ipfs for file verification, ai for service/quality verification';
COMMENT ON COLUMN oracle_verifications.confidence_score IS 'Verification confidence score 0-100, AI verifications require ≥80 to pass';
COMMENT ON COLUMN oracle_verifications.blockchain_tx_hash IS 'Transaction hash of the oracle verification submission to smart contract';


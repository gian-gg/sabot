-- Escrow Proofs Table
-- Stores proof submissions for escrow deliverables

-- Create escrow_proofs table
CREATE TABLE escrow_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID REFERENCES escrows(id) NOT NULL,
  deliverable_id UUID REFERENCES deliverables(id) NOT NULL,
  proof_hash TEXT NOT NULL,
  proof_description TEXT,
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_escrow_proofs_escrow ON escrow_proofs(escrow_id);
CREATE INDEX idx_escrow_proofs_deliverable ON escrow_proofs(deliverable_id);
CREATE INDEX idx_escrow_proofs_submitted_by ON escrow_proofs(submitted_by);
CREATE INDEX idx_escrow_proofs_submitted_at ON escrow_proofs(submitted_at DESC);

-- Enable Row Level Security
ALTER TABLE escrow_proofs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view proofs for their escrows
CREATE POLICY "Parties can view escrow proofs"
  ON escrow_proofs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrows
      WHERE escrows.id = escrow_proofs.escrow_id
      AND (
        escrows.initiator_id = auth.uid() 
        OR escrows.participant_id = auth.uid() 
        OR escrows.arbiter_id = auth.uid()
      )
    )
  );

-- RLS Policy: Users can insert proofs for their escrows
CREATE POLICY "Parties can insert escrow proofs"
  ON escrow_proofs FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM escrows
      WHERE escrows.id = escrow_proofs.escrow_id
      AND (
        escrows.initiator_id = auth.uid() 
        OR escrows.participant_id = auth.uid()
      )
    )
  );

-- Comment for documentation
COMMENT ON TABLE escrow_proofs IS 'Stores proof submissions for escrow deliverables';
COMMENT ON COLUMN escrow_proofs.proof_hash IS 'Hash or identifier of the submitted proof (IPFS CID, bank receipt hash, etc.)';
COMMENT ON COLUMN escrow_proofs.proof_description IS 'Optional description of the proof submitted';

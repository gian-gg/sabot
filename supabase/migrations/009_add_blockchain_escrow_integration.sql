-- Migration: Add Blockchain Escrow Integration
-- Description: Add fields to link Supabase escrows with blockchain escrows
-- Author: Sabot Development Team
-- Date: 2025-10-21

-- ============================================================================
-- ADD BLOCKCHAIN ESCROW FIELDS
-- ============================================================================

-- Add blockchain integration fields to escrows table
ALTER TABLE escrows 
ADD COLUMN IF NOT EXISTS blockchain_escrow_id INTEGER,
ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS blockchain_agreement_id INTEGER,
ADD COLUMN IF NOT EXISTS blockchain_created_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS blockchain_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_blockchain_escrow BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blockchain_status TEXT,
ADD COLUMN IF NOT EXISTS blockchain_value_hash TEXT,
ADD COLUMN IF NOT EXISTS blockchain_proof_hash TEXT;

-- Create index for faster blockchain escrow lookups
CREATE INDEX IF NOT EXISTS idx_escrows_blockchain_id ON escrows(blockchain_escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrows_blockchain_tx ON escrows(blockchain_tx_hash);
CREATE INDEX IF NOT EXISTS idx_escrows_is_blockchain ON escrows(is_blockchain_escrow);

-- ============================================================================
-- ADD BLOCKCHAIN EVENT LOG TABLE
-- ============================================================================

-- Table to track blockchain escrow events
CREATE TABLE IF NOT EXISTS blockchain_escrow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID REFERENCES escrows(id) ON DELETE CASCADE,
  blockchain_escrow_id INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'EscrowCreated',
    'EscrowJoined', 
    'ProofSubmitted',
    'EscrowConfirmed',
    'EscrowReleased',
    'EscrowDisputed',
    'ArbiterProposed',
    'ArbiterApproved',
    'ArbiterActivated',
    'EscrowResolved',
    'EscrowCancelled'
  )),
  transaction_hash TEXT NOT NULL,
  block_number BIGINT,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for blockchain events
CREATE INDEX IF NOT EXISTS idx_blockchain_events_escrow ON blockchain_escrow_events(escrow_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_blockchain_escrow ON blockchain_escrow_events(blockchain_escrow_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_tx ON blockchain_escrow_events(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_type ON blockchain_escrow_events(event_type);

-- ============================================================================
-- RLS POLICIES FOR BLOCKCHAIN EVENTS
-- ============================================================================

-- Enable RLS
ALTER TABLE blockchain_escrow_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view events for escrows they're part of
CREATE POLICY "Users can view their escrow events"
  ON blockchain_escrow_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrows e
      WHERE e.id = blockchain_escrow_events.escrow_id
      AND (
        e.initiator_id = auth.uid()
        OR e.participant_id = auth.uid()
      )
    )
  );

-- Policy: System can insert events
CREATE POLICY "System can insert blockchain events"
  ON blockchain_escrow_events
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to sync blockchain status to escrow
CREATE OR REPLACE FUNCTION sync_blockchain_escrow_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the escrow status based on blockchain events
  IF NEW.event_type = 'EscrowCompleted' OR NEW.event_type = 'EscrowReleased' THEN
    UPDATE escrows
    SET 
      status = 'completed',
      blockchain_status = 'completed',
      blockchain_updated_at = now()
    WHERE id = NEW.escrow_id;
  ELSIF NEW.event_type = 'EscrowDisputed' THEN
    UPDATE escrows
    SET 
      status = 'disputed',
      blockchain_status = 'disputed',
      blockchain_updated_at = now()
    WHERE id = NEW.escrow_id;
  ELSIF NEW.event_type = 'EscrowCancelled' THEN
    UPDATE escrows
    SET 
      status = 'cancelled',
      blockchain_status = 'cancelled',
      blockchain_updated_at = now()
    WHERE id = NEW.escrow_id;
  ELSIF NEW.event_type = 'EscrowJoined' THEN
    UPDATE escrows
    SET 
      status = 'active',
      blockchain_status = 'active',
      blockchain_updated_at = now()
    WHERE id = NEW.escrow_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically sync status
CREATE TRIGGER sync_blockchain_status_trigger
  AFTER INSERT ON blockchain_escrow_events
  FOR EACH ROW
  EXECUTE FUNCTION sync_blockchain_escrow_status();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN escrows.blockchain_escrow_id IS 'ID of the escrow in the blockchain smart contract';
COMMENT ON COLUMN escrows.blockchain_tx_hash IS 'Transaction hash of the escrow creation on blockchain';
COMMENT ON COLUMN escrows.blockchain_agreement_id IS 'ID of the agreement in the blockchain smart contract';
COMMENT ON COLUMN escrows.is_blockchain_escrow IS 'Whether this escrow is managed on blockchain';
COMMENT ON COLUMN escrows.blockchain_status IS 'Current status from the blockchain smart contract';
COMMENT ON COLUMN escrows.blockchain_value_hash IS 'Hash of the deliverable value stored on blockchain';
COMMENT ON COLUMN escrows.blockchain_proof_hash IS 'Hash of the delivery proof stored on blockchain';

COMMENT ON TABLE blockchain_escrow_events IS 'Log of all blockchain escrow events for tracking and auditing';
COMMENT ON COLUMN blockchain_escrow_events.event_data IS 'JSON data from the blockchain event';


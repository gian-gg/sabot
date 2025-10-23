-- Migration: Create Escrow Tables
-- Description: Tables for managing escrow-protected transactions in Sabot
-- Author: Sabot Development Team
-- Date: 2025-10-21

-- ============================================================================
-- ESCROW TABLES
-- ============================================================================

-- Main escrow table
CREATE TABLE IF NOT EXISTS escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links to existing entities (optional)
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  agreement_id UUID, -- Future: link to agreements table
  
  -- Type and status
  type TEXT NOT NULL CHECK (type IN ('cash', 'item', 'service', 'digital', 'document', 'mixed')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'active', 'awaiting_confirmation', 'completed', 
    'disputed', 'arbiter_review', 'cancelled', 'expired'
  )),
  
  -- Parties
  initiator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  title TEXT NOT NULL,
  description TEXT,
  
  -- Deliverable details (separated by party, payment types have amounts)
  -- Each deliverable JSON: {id, type, description, quantity?, value?, currency?, party_responsible}
  -- party_responsible: 'initiator' | 'participant'
  -- Payment types (cash, digital_transfer) must have value and currency
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_completion_date TIMESTAMPTZ,
  
  -- Confirmation tracking
  initiator_confirmation TEXT NOT NULL DEFAULT 'pending' CHECK (initiator_confirmation IN ('pending', 'confirmed', 'disputed')),
  participant_confirmation TEXT NOT NULL DEFAULT 'pending' CHECK (participant_confirmation IN ('pending', 'confirmed', 'disputed')),
  initiator_confirmed_at TIMESTAMPTZ,
  participant_confirmed_at TIMESTAMPTZ,
  
  -- Arbiter/Oracle
  arbiter_requested BOOLEAN DEFAULT FALSE,
  arbiter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  arbiter_proposed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  arbiter_initiator_approved BOOLEAN DEFAULT FALSE,
  arbiter_participant_approved BOOLEAN DEFAULT FALSE,
  arbiter_decision TEXT CHECK (arbiter_decision IN ('release', 'refund', 'split', 'pending')),
  arbiter_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  terms_hash TEXT, -- For blockchain integration
  blockchain_tx_id TEXT -- Future blockchain transaction ID
);

-- Escrow events/timeline table
CREATE TABLE IF NOT EXISTS escrow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'participant_joined', 'status_changed',
    'initiator_confirmed', 'participant_confirmed',
    'arbiter_requested', 'arbiter_assigned', 'arbiter_decision',
    'completed', 'cancelled', 'disputed'
  )),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Escrow evidence/attachments table (for disputes)
CREATE TABLE IF NOT EXISTS escrow_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  description TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_escrows_initiator ON escrows(initiator_id);
CREATE INDEX IF NOT EXISTS idx_escrows_participant ON escrows(participant_id);
CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(status);
CREATE INDEX IF NOT EXISTS idx_escrows_created_at ON escrows(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_events_escrow ON escrow_events(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_evidence_escrow ON escrow_evidence(escrow_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on escrow updates
CREATE TRIGGER update_escrows_updated_at
  BEFORE UPDATE ON escrows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Automatically create 'created' event when escrow is created
CREATE OR REPLACE FUNCTION create_escrow_created_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO escrow_events (escrow_id, event_type, actor_id)
  VALUES (NEW.id, 'created', NEW.initiator_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER escrow_created_event
  AFTER INSERT ON escrows
  FOR EACH ROW
  EXECUTE FUNCTION create_escrow_created_event();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_evidence ENABLE ROW LEVEL SECURITY;

-- Escrows policies
-- Users can view escrows where they are initiator, participant, or arbiter
CREATE POLICY "Users can view their escrows"
  ON escrows FOR SELECT
  USING (
    auth.uid() = initiator_id 
    OR auth.uid() = participant_id 
    OR auth.uid() = arbiter_id
  );

-- Users can create new escrows
CREATE POLICY "Users can create escrows"
  ON escrows FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

-- Users can update escrows where they are involved
CREATE POLICY "Users can update their escrows"
  ON escrows FOR UPDATE
  USING (
    auth.uid() = initiator_id 
    OR auth.uid() = participant_id 
    OR auth.uid() = arbiter_id
  );

-- Escrow events policies
-- Users can view events for escrows they're involved in
CREATE POLICY "Users can view escrow events"
  ON escrow_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrows
      WHERE escrows.id = escrow_events.escrow_id
      AND (
        escrows.initiator_id = auth.uid()
        OR escrows.participant_id = auth.uid()
        OR escrows.arbiter_id = auth.uid()
      )
    )
  );

-- System can insert events (handled by triggers and API)
CREATE POLICY "System can create escrow events"
  ON escrow_events FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- Escrow evidence policies
-- Users can view evidence for escrows they're involved in
CREATE POLICY "Users can view escrow evidence"
  ON escrow_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrows
      WHERE escrows.id = escrow_evidence.escrow_id
      AND (
        escrows.initiator_id = auth.uid()
        OR escrows.participant_id = auth.uid()
        OR escrows.arbiter_id = auth.uid()
      )
    )
  );

-- Users can upload evidence to their escrows
CREATE POLICY "Users can upload escrow evidence"
  ON escrow_evidence FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM escrows
      WHERE escrows.id = escrow_evidence.escrow_id
      AND (
        escrows.initiator_id = auth.uid()
        OR escrows.participant_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if both parties have confirmed
CREATE OR REPLACE FUNCTION check_escrow_completion(escrow_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE escrows
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = escrow_uuid
    AND initiator_confirmation = 'confirmed'
    AND participant_confirmation = 'confirmed'
    AND status = 'awaiting_confirmation';
END;
$$ LANGUAGE plpgsql;

-- Function to get escrow statistics for a user
CREATE OR REPLACE FUNCTION get_user_escrow_stats(user_uuid UUID)
RETURNS TABLE (
  total_escrows BIGINT,
  active_escrows BIGINT,
  completed_escrows BIGINT,
  disputed_escrows BIGINT,
  total_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_escrows,
    COUNT(*) FILTER (WHERE status IN ('active', 'awaiting_confirmation'))::BIGINT as active_escrows,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_escrows,
    COUNT(*) FILTER (WHERE status IN ('disputed', 'arbiter_review'))::BIGINT as disputed_escrows,
    COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as total_value
  FROM escrows
  WHERE initiator_id = user_uuid OR participant_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STORAGE BUCKET FOR EVIDENCE
-- ============================================================================

-- Create storage bucket for escrow evidence (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('escrow-evidence', 'escrow-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for escrow evidence
CREATE POLICY "Users can upload evidence to their escrows"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'escrow-evidence'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view evidence from their escrows"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'escrow-evidence'
    AND EXISTS (
      SELECT 1 FROM escrow_evidence
      WHERE escrow_evidence.file_path = storage.objects.name
      AND escrow_evidence.escrow_id IN (
        SELECT id FROM escrows
        WHERE initiator_id = auth.uid()
          OR participant_id = auth.uid()
          OR arbiter_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE escrows IS 'Main table for escrow-protected transactions';
COMMENT ON TABLE escrow_events IS 'Timeline of events for each escrow transaction';
COMMENT ON TABLE escrow_evidence IS 'Evidence and attachments for escrow disputes';
COMMENT ON FUNCTION check_escrow_completion IS 'Automatically completes escrow when both parties confirm';
COMMENT ON FUNCTION get_user_escrow_stats IS 'Returns escrow statistics for a specific user';




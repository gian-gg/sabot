-- Migration: Add Missing Transaction Columns
-- Description: Add missing columns to transactions table for delivery and online exchange
-- Author: Sabot Development Team
-- Date: 2025-01-27

-- ============================================================================
-- ADD MISSING COLUMNS TO TRANSACTIONS TABLE
-- ============================================================================

-- Add delivery-related columns
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_method TEXT;

-- Add online exchange columns
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS online_platform TEXT,
ADD COLUMN IF NOT EXISTS online_contact TEXT,
ADD COLUMN IF NOT EXISTS online_instructions TEXT;

-- Add category and condition columns
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Add comments for the new columns
COMMENT ON COLUMN transactions.delivery_address IS 'Delivery address for shipping transactions';
COMMENT ON COLUMN transactions.delivery_method IS 'Delivery method (e.g., standard shipping, express)';
COMMENT ON COLUMN transactions.online_platform IS 'Online platform used for the transaction';
COMMENT ON COLUMN transactions.online_contact IS 'Online contact information';
COMMENT ON COLUMN transactions.online_instructions IS 'Special instructions for online exchange';
COMMENT ON COLUMN transactions.category IS 'Item category (e.g., Electronics, Fashion)';
COMMENT ON COLUMN transactions.condition IS 'Item condition (e.g., New, Used, Refurbished)';
COMMENT ON COLUMN transactions.quantity IS 'Number of items in the transaction';

-- ============================================================================
-- CREATE ESCROWS TABLE
-- ============================================================================

-- Create escrows table
CREATE TABLE IF NOT EXISTS escrows (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    initiator_id UUID NOT NULL REFERENCES auth.users(id),
    participant_id UUID REFERENCES auth.users(id),
    arbiter_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'arbiter_review', 'active', 'completed', 'disputed', 'cancelled')),
    arbiter_requested BOOLEAN DEFAULT FALSE,
    arbiter_required BOOLEAN DEFAULT FALSE,
    expected_completion_date TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_analysis_data JSONB
);

-- Create deliverables table
CREATE TABLE IF NOT EXISTS deliverables (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('product', 'service', 'payment', 'document')),
    party_responsible TEXT NOT NULL CHECK (party_responsible IN ('initiator', 'participant', 'both')),
    amount DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified', 'failed', 'submitted')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create escrow_proofs table
CREATE TABLE IF NOT EXISTS escrow_proofs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    proof_type TEXT NOT NULL CHECK (proof_type IN ('image', 'document', 'video', 'text', 'link')),
    proof_data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'))
);

-- Create oracle_verifications table
CREATE TABLE IF NOT EXISTS oracle_verifications (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
    deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
    oracle_type TEXT NOT NULL CHECK (oracle_type IN ('ai', 'ipfs', 'manual')),
    verification_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'manual_review')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for escrows table
CREATE INDEX IF NOT EXISTS idx_escrows_transaction_id ON escrows(transaction_id);
CREATE INDEX IF NOT EXISTS idx_escrows_initiator_id ON escrows(initiator_id);
CREATE INDEX IF NOT EXISTS idx_escrows_participant_id ON escrows(participant_id);
CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(status);

-- Indexes for deliverables table
CREATE INDEX IF NOT EXISTS idx_deliverables_escrow_id ON deliverables(escrow_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);

-- Indexes for escrow_proofs table
CREATE INDEX IF NOT EXISTS idx_escrow_proofs_deliverable_id ON escrow_proofs(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_escrow_proofs_user_id ON escrow_proofs(user_id);

-- Indexes for oracle_verifications table
CREATE INDEX IF NOT EXISTS idx_oracle_verifications_escrow_id ON oracle_verifications(escrow_id);
CREATE INDEX IF NOT EXISTS idx_oracle_verifications_deliverable_id ON oracle_verifications(deliverable_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for escrows
CREATE POLICY "Users can view escrows they are involved in" ON escrows
    FOR SELECT USING (
        initiator_id = auth.uid() OR 
        participant_id = auth.uid() OR 
        arbiter_id = auth.uid()
    );

CREATE POLICY "Users can create escrows" ON escrows
    FOR INSERT WITH CHECK (initiator_id = auth.uid());

CREATE POLICY "Users can update escrows they initiated" ON escrows
    FOR UPDATE USING (initiator_id = auth.uid());

-- Create RLS policies for deliverables
CREATE POLICY "Users can view deliverables for their escrows" ON deliverables
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM escrows 
            WHERE escrows.id = deliverables.escrow_id 
            AND (escrows.initiator_id = auth.uid() OR escrows.participant_id = auth.uid() OR escrows.arbiter_id = auth.uid())
        )
    );

CREATE POLICY "Users can create deliverables for their escrows" ON deliverables
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM escrows 
            WHERE escrows.id = deliverables.escrow_id 
            AND escrows.initiator_id = auth.uid()
        )
    );

-- Create RLS policies for escrow_proofs
CREATE POLICY "Users can view proofs for their deliverables" ON escrow_proofs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM deliverables d
            JOIN escrows e ON d.escrow_id = e.id
            WHERE d.id = escrow_proofs.deliverable_id
            AND (e.initiator_id = auth.uid() OR e.participant_id = auth.uid() OR e.arbiter_id = auth.uid())
        )
    );

CREATE POLICY "Users can create proofs for their deliverables" ON escrow_proofs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for oracle_verifications
CREATE POLICY "Users can view oracle verifications for their escrows" ON oracle_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM escrows 
            WHERE escrows.id = oracle_verifications.escrow_id 
            AND (escrows.initiator_id = auth.uid() OR escrows.participant_id = auth.uid() OR escrows.arbiter_id = auth.uid())
        )
    );

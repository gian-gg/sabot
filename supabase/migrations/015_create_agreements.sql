-- Create agreements table
CREATE TABLE IF NOT EXISTS agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting_for_participant' CHECK (status IN ('waiting_for_participant', 'both_joined', 'questionnaire_completed', 'active', 'finalized', 'cancelled')),
  title TEXT,
  agreement_type TEXT CHECK (agreement_type IN ('Partnership', 'Service', 'NDA', 'Sales', 'Custom')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create agreement_participants table
CREATE TABLE IF NOT EXISTS agreement_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'invitee')),
  has_confirmed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agreement_id, user_id)
);

-- Create agreement_content table to store document content and idea blocks
CREATE TABLE IF NOT EXISTS agreement_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  content TEXT,
  idea_blocks JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agreements_creator ON agreements(creator_id);
CREATE INDEX IF NOT EXISTS idx_agreements_status ON agreements(status);
CREATE INDEX IF NOT EXISTS idx_participants_agreement ON agreement_participants(agreement_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON agreement_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_agreement_content_agreement ON agreement_content(agreement_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to agreements table
CREATE TRIGGER update_agreements_updated_at
  BEFORE UPDATE ON agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to agreement_content table
CREATE TRIGGER update_agreement_content_updated_at
  BEFORE UPDATE ON agreement_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_content ENABLE ROW LEVEL SECURITY;

-- Agreements policies
CREATE POLICY "Users can view agreements they're part of"
  ON agreements FOR SELECT
  USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM agreement_participants
      WHERE agreement_participants.agreement_id = agreements.id
      AND agreement_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own agreements"
  ON agreements FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update agreements they're part of"
  ON agreements FOR UPDATE
  USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM agreement_participants
      WHERE agreement_participants.agreement_id = agreements.id
      AND agreement_participants.user_id = auth.uid()
    )
  );

-- Agreement participants policies
CREATE POLICY "Users can view participants of their agreements"
  ON agreement_participants FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = agreement_participants.agreement_id
      AND (agreements.creator_id = auth.uid() OR
           EXISTS (SELECT 1 FROM agreement_participants ap2
                   WHERE ap2.agreement_id = agreements.id
                   AND ap2.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can join agreements"
  ON agreement_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participant record"
  ON agreement_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Agreement content policies
CREATE POLICY "Users can view content of their agreements"
  ON agreement_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agreement_participants
      WHERE agreement_participants.agreement_id = agreement_content.agreement_id
      AND agreement_participants.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = agreement_content.agreement_id
      AND agreements.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert content for their agreements"
  ON agreement_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = agreement_content.agreement_id
      AND (agreements.creator_id = auth.uid() OR
           EXISTS (SELECT 1 FROM agreement_participants
                   WHERE agreement_participants.agreement_id = agreements.id
                   AND agreement_participants.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can update content of their agreements"
  ON agreement_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = agreement_content.agreement_id
      AND (agreements.creator_id = auth.uid() OR
           EXISTS (SELECT 1 FROM agreement_participants
                   WHERE agreement_participants.agreement_id = agreements.id
                   AND agreement_participants.user_id = auth.uid()))
    )
  );

-- Create a function to check if both participants have joined
CREATE OR REPLACE FUNCTION check_both_joined(agreement_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  participant_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO participant_count
  FROM agreement_participants
  WHERE agreement_id = agreement_uuid;

  RETURN participant_count = 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

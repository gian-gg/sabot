-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'waiting_for_participant', 'both_joined', 'screenshots_uploaded', 'active', 'completed', 'cancelled')),
  item_name TEXT,
  item_description TEXT,
  price DECIMAL(10, 2),
  meeting_location TEXT,
  meeting_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create transaction_participants table
CREATE TABLE IF NOT EXISTS transaction_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'invitee')),
  screenshot_uploaded BOOLEAN DEFAULT FALSE,
  screenshot_url TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(transaction_id, user_id)
);

-- Create transaction_screenshots table
CREATE TABLE IF NOT EXISTS transaction_screenshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_creator ON transactions(creator_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_participants_transaction ON transaction_participants(transaction_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON transaction_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_transaction ON transaction_screenshots(transaction_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to transactions table
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_screenshots ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view transactions they're part of"
  ON transactions FOR SELECT
  USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM transaction_participants
      WHERE transaction_participants.transaction_id = transactions.id
      AND transaction_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update transactions they're part of"
  ON transactions FOR UPDATE
  USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM transaction_participants
      WHERE transaction_participants.transaction_id = transactions.id
      AND transaction_participants.user_id = auth.uid()
    )
  );

-- Transaction participants policies
CREATE POLICY "Users can view participants of their transactions"
  ON transaction_participants FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_participants.transaction_id
      AND (transactions.creator_id = auth.uid() OR
           EXISTS (SELECT 1 FROM transaction_participants tp2
                   WHERE tp2.transaction_id = transactions.id
                   AND tp2.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can join transactions"
  ON transaction_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participant record"
  ON transaction_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Transaction screenshots policies
CREATE POLICY "Users can view screenshots from their transactions"
  ON transaction_screenshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transaction_participants
      WHERE transaction_participants.transaction_id = transaction_screenshots.transaction_id
      AND transaction_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload their own screenshots"
  ON transaction_screenshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a function to check if both participants have uploaded screenshots
CREATE OR REPLACE FUNCTION check_both_uploaded(transaction_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  upload_count INTEGER;
  participant_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO participant_count
  FROM transaction_participants
  WHERE transaction_id = transaction_uuid;

  SELECT COUNT(*) INTO upload_count
  FROM transaction_participants
  WHERE transaction_id = transaction_uuid
  AND screenshot_uploaded = TRUE;

  RETURN participant_count = 2 AND upload_count = 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

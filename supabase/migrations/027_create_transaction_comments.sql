-- Create transaction_comments table for comment threads on transactions
CREATE TABLE IF NOT EXISTS transaction_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 2000),
  parent_comment_id UUID REFERENCES transaction_comments(id) ON DELETE CASCADE,
  -- Store user info at time of comment for consistency
  user_name TEXT,
  user_email TEXT,
  user_avatar_url TEXT,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_transaction_comments_transaction_id ON transaction_comments(transaction_id);
CREATE INDEX idx_transaction_comments_user_id ON transaction_comments(user_id);
CREATE INDEX idx_transaction_comments_parent ON transaction_comments(parent_comment_id);
CREATE INDEX idx_transaction_comments_created_at ON transaction_comments(created_at);

-- Add updated_at trigger to transaction_comments
CREATE TRIGGER update_transaction_comments_updated_at
  BEFORE UPDATE ON transaction_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on transaction_comments
ALTER TABLE transaction_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transaction_comments
-- Users can view comments on transactions they participate in
CREATE POLICY "Users can view comments on their transactions"
  ON transaction_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_comments.transaction_id
      AND (transactions.creator_id = auth.uid() OR
           EXISTS (SELECT 1 FROM transaction_participants
                   WHERE transaction_participants.transaction_id = transactions.id
                   AND transaction_participants.user_id = auth.uid()))
    )
  );

-- Users can create comments on transactions they participate in
CREATE POLICY "Users can create comments on their transactions"
  ON transaction_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_comments.transaction_id
      AND (transactions.creator_id = auth.uid() OR
           EXISTS (SELECT 1 FROM transaction_participants
                   WHERE transaction_participants.transaction_id = transactions.id
                   AND transaction_participants.user_id = auth.uid()))
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON transaction_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON transaction_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment count function for transactions
CREATE OR REPLACE FUNCTION get_transaction_comment_count(transaction_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  comment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO comment_count
  FROM transaction_comments
  WHERE transaction_id = transaction_uuid;
  
  RETURN COALESCE(comment_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
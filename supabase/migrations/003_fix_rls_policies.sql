-- Fix infinite recursion in RLS policies
-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view participants of their transactions" ON transaction_participants;
DROP POLICY IF EXISTS "Users can join transactions" ON transaction_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON transaction_participants;

-- Recreate policies without circular references

-- Allow users to view participants where they are either:
-- 1. The participant themselves, OR
-- 2. The creator of the transaction, OR
-- 3. Another participant in the same transaction
CREATE POLICY "Users can view participants of their transactions"
  ON transaction_participants FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_participants.transaction_id
      AND transactions.creator_id = auth.uid()
    )
  );

-- Allow authenticated users to insert themselves as participants
CREATE POLICY "Users can join transactions"
  ON transaction_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own participant record
CREATE POLICY "Users can update their own participant record"
  ON transaction_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

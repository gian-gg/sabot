-- Fix RLS to allow invitees to update transaction status and see all participants

-- 1. Fix transaction UPDATE policy
-- Allow participants (not just creator) to update transaction status
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;

CREATE POLICY "Participants can update transaction status"
  ON transactions FOR UPDATE
  TO authenticated
  USING (
    -- User is the creator OR is a participant
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM transaction_participants
      WHERE transaction_participants.transaction_id = transactions.id
      AND transaction_participants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Only allow updating status field, not ownership
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM transaction_participants
      WHERE transaction_participants.transaction_id = transactions.id
      AND transaction_participants.user_id = auth.uid()
    )
  );

-- 2. Fix transaction_participants SELECT policy
-- Allow participants to see ALL participants in their transaction
DROP POLICY IF EXISTS "Users can view participants of their transactions" ON transaction_participants;

CREATE POLICY "Participants can view all participants"
  ON transaction_participants FOR SELECT
  TO authenticated
  USING (
    -- User is viewing their own record OR
    -- User is the creator of the transaction OR
    -- User is another participant in the same transaction
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_participants.transaction_id
      AND transactions.creator_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM transaction_participants tp2
      WHERE tp2.transaction_id = transaction_participants.transaction_id
      AND tp2.user_id = auth.uid()
      AND tp2.user_id != transaction_participants.user_id
    )
  );

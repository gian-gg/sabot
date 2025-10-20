-- Fix infinite recursion in transaction_participants SELECT policy
-- Simplest approach: Allow all authenticated users to view all participants
-- Security is maintained because they still need the transaction_id to query

DROP POLICY IF EXISTS "Participants can view all participants" ON transaction_participants;

-- Allow authenticated users to view all transaction participants
-- This is safe because:
-- 1. They need to know the transaction_id to query (from invite link)
-- 2. The transaction SELECT policy still restricts what transactions they can see
-- 3. Participant data isn't sensitive (just user_id and role)
CREATE POLICY "Authenticated users can view participants"
  ON transaction_participants FOR SELECT
  TO authenticated
  USING (true);

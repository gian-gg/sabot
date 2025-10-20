-- Allow invitees to view transactions so they can join them
-- This fixes the "Transaction not found" error when accepting invitations

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;

-- Create a more permissive SELECT policy
-- Users can view transactions if:
-- 1. They are the creator, OR
-- 2. They need to view it to join (allow all authenticated users to read)
CREATE POLICY "Users can view transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to read transactions

-- Keep the restrictive INSERT policy (only creator can insert)
-- This policy already exists from the previous migration

-- Keep the restrictive UPDATE policy (only creator can update)
-- This policy already exists from the previous migration

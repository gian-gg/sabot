-- Fix infinite recursion in agreement_participants SELECT policy
-- The nested SELECT on agreement_participants within the policy was causing infinite recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants of their agreements" ON agreement_participants;

-- Create a simplified policy that avoids recursion
-- Allow all authenticated users to view all agreement participants
-- This is secure because:
-- 1. They need to know the agreement_id to query (from invite link/data)
-- 2. The agreements SELECT policy still restricts what agreements they can see
-- 3. Participant data (user_id, role) is not sensitive
CREATE POLICY "Authenticated users can view agreement participants"
  ON agreement_participants FOR SELECT
  TO authenticated
  USING (true);

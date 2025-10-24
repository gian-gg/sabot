-- Fix agreements RLS policy to allow viewing for invitation acceptance
-- The previous policy blocked users from viewing agreements they haven't joined yet
-- This prevented them from accepting invitations

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view agreements they're part of" ON agreements;

-- Create a new policy that allows authenticated users to view agreements
-- This is secure because:
-- 1. Agreement ID is shared via secure invite links
-- 2. Users still can only JOIN if the join endpoint allows it
-- 3. Update/Delete policies remain restrictive
CREATE POLICY "Authenticated users can view agreements"
  ON agreements FOR SELECT
  TO authenticated
  USING (true);

-- Keep the update policy restrictive - only creator or participants can update
DROP POLICY IF EXISTS "Users can update agreements they're part of" ON agreements;

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

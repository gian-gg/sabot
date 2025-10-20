-- Fix infinite recursion in transactions table RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view transactions they're part of" ON transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update transactions they're part of" ON transactions;

-- Recreate policies without circular references

-- Users can view transactions where they are the creator
-- (Don't check participants table during SELECT to avoid recursion)
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = creator_id);

-- Users can create transactions where they are the creator
CREATE POLICY "Users can create their own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Users can update transactions where they are the creator
CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

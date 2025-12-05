-- Add DELETE policy to transactions table to allow users to delete their own transactions
-- This is required for the bulk delete feature to work

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

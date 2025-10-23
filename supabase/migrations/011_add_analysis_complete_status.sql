-- Add 'analysis_complete' to transaction status check constraint
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_status_check
CHECK (status IN (
  'pending',
  'waiting_for_participant',
  'both_joined',
  'screenshots_uploaded',
  'analysis_complete',
  'active',
  'completed',
  'cancelled'
));

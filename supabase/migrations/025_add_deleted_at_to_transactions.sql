-- Add soft delete support to transactions table
-- Allows soft-deleting screenshots_uploaded transactions while preserving statistics
-- Hard-delete other transaction statuses completely

-- Add deleted_at column for soft delete tracking
ALTER TABLE transactions
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for efficient filtering of deleted records
CREATE INDEX idx_transactions_deleted_at
ON transactions(deleted_at)
WHERE deleted_at IS NOT NULL;

-- Add composite index for active transactions queries (most common query pattern)
CREATE INDEX idx_transactions_active
ON transactions(creator_id, created_at)
WHERE deleted_at IS NULL;

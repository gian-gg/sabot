-- Add check constraint to ensure price is positive
ALTER TABLE transactions
ADD CONSTRAINT check_price_positive CHECK (price > 0);

-- Add comment explaining constraint
COMMENT ON CONSTRAINT check_price_positive ON transactions IS 'Ensures transaction price is always positive';

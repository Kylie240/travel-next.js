-- Buyer (Journli user) for each seller transaction; null for guest checkout.
ALTER TABLE seller_transactions
  ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES users (id) ON DELETE SET NULL;

COMMENT ON COLUMN seller_transactions.buyer_id IS
  'Authenticated buyer user id; null when purchase was made as a guest.';

CREATE INDEX IF NOT EXISTS seller_transactions_buyer_id_idx
  ON seller_transactions (buyer_id)
  WHERE buyer_id IS NOT NULL;

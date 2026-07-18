-- Guest purchase email: prefer buyer_email (auth callback historically used this).
ALTER TABLE itinerary_purchases
  ADD COLUMN IF NOT EXISTS buyer_email TEXT;

COMMENT ON COLUMN itinerary_purchases.buyer_email IS
  'Email for guest checkouts; null when user_id is set.';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'itinerary_purchases'
      AND column_name = 'customer_email'
  ) THEN
    EXECUTE $sql$
      UPDATE itinerary_purchases
      SET buyer_email = customer_email
      WHERE buyer_email IS NULL
        AND customer_email IS NOT NULL
    $sql$;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS itinerary_purchases_buyer_email_idx
  ON itinerary_purchases (buyer_email)
  WHERE buyer_email IS NOT NULL;

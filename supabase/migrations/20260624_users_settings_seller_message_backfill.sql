-- Backfill seller_message from legacy seller_message column (if present).
ALTER TABLE users_settings
  ADD COLUMN IF NOT EXISTS seller_message TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users_settings'
      AND column_name = 'seller_message'
  ) THEN
    UPDATE users_settings
    SET seller_message = NULLIF(TRIM(seller_message), '')
    WHERE seller_message IS NULL
      AND seller_message IS NOT NULL
      AND TRIM(seller_message) <> '';
  END IF;
END $$;

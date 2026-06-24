-- Optional message from the itinerary seller, included in the buyer's purchase confirmation email.
ALTER TABLE users_settings
  ADD COLUMN IF NOT EXISTS seller_message TEXT;

COMMENT ON COLUMN users_settings.seller_message IS
  'Plain text shown to buyers in the post-purchase email; set from Seller Dashboard.';

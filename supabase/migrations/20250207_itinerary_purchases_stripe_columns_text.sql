-- Stripe IDs (e.g. cs_test_..., pi_...) are not UUIDs. Use TEXT for these columns.
-- Run this in Supabase SQL Editor if itinerary_purchases was created with UUID for Stripe fields.

ALTER TABLE itinerary_purchases
  ALTER COLUMN stripe_checkout_session_id TYPE TEXT USING stripe_checkout_session_id::TEXT;

ALTER TABLE itinerary_purchases
  ALTER COLUMN stripe_payment_intent_id TYPE TEXT USING stripe_payment_intent_id::TEXT;

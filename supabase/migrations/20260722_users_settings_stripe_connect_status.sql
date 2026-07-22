-- Cached Stripe Connect seller status for marketplace UI (checkout still live-checks).
-- Prefer users_settings over users: stripe_account_id already lives here.

ALTER TABLE users_settings
  ADD COLUMN IF NOT EXISTS stripe_connect_sales_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_connect_payouts_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_connect_details_submitted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_connect_disabled_reason text,
  ADD COLUMN IF NOT EXISTS stripe_connect_requirements_currently_due text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS stripe_connect_status text,
  ADD COLUMN IF NOT EXISTS stripe_connect_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_connect_last_payout_failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_connect_last_payout_failure_code text,
  ADD COLUMN IF NOT EXISTS stripe_connect_last_payout_failure_message text;

COMMENT ON COLUMN users_settings.stripe_connect_sales_enabled IS
  'Cached: seller can accept destination charges. UI uses this; checkout still live-checks Stripe.';
COMMENT ON COLUMN users_settings.stripe_connect_payouts_enabled IS
  'Cached charges/payouts capability from Stripe Account.payouts_enabled (or v2 equivalent).';
COMMENT ON COLUMN users_settings.stripe_connect_details_submitted IS
  'Cached Account.details_submitted.';
COMMENT ON COLUMN users_settings.stripe_connect_disabled_reason IS
  'Cached Account.requirements.disabled_reason when restricted.';
COMMENT ON COLUMN users_settings.stripe_connect_requirements_currently_due IS
  'Cached Account.requirements.currently_due codes.';
COMMENT ON COLUMN users_settings.stripe_connect_status IS
  'Derived: ready | pending | restricted | incomplete | not_connected.';
COMMENT ON COLUMN users_settings.stripe_connect_synced_at IS
  'Last time Connect status was synced from Stripe webhooks or status poll.';
COMMENT ON COLUMN users_settings.stripe_connect_last_payout_failed_at IS
  'Last payout.failed webhook timestamp for this seller.';
COMMENT ON COLUMN users_settings.stripe_connect_last_payout_failure_code IS
  'Last payout.failed failure_code from Stripe.';
COMMENT ON COLUMN users_settings.stripe_connect_last_payout_failure_message IS
  'Last payout.failed failure_message from Stripe.';

CREATE INDEX IF NOT EXISTS users_settings_stripe_account_id_idx
  ON users_settings (stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;

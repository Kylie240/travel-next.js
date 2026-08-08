-- Founding creator program: claim → admin approve → Pro for 1 year (max 100 active)

ALTER TABLE public.users_settings
  ADD COLUMN IF NOT EXISTS founding_creator_status text,
  ADD COLUMN IF NOT EXISTS founding_creator_applied_at timestamptz,
  ADD COLUMN IF NOT EXISTS founding_creator_granted_at timestamptz,
  ADD COLUMN IF NOT EXISTS founding_creator_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS founding_creator_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS founding_creator_reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS founding_creator_reject_reason text;

COMMENT ON COLUMN public.users_settings.founding_creator_status IS
  'null | pending | active | rejected | expired';
COMMENT ON COLUMN public.users_settings.founding_creator_expires_at IS
  'When founding Pro grant ends (typically granted_at + 1 year)';

ALTER TABLE public.users_settings
  DROP CONSTRAINT IF EXISTS users_settings_founding_creator_status_check;

ALTER TABLE public.users_settings
  ADD CONSTRAINT users_settings_founding_creator_status_check
  CHECK (
    founding_creator_status IS NULL
    OR founding_creator_status IN ('pending', 'active', 'rejected', 'expired')
  );

CREATE INDEX IF NOT EXISTS users_settings_founding_status_idx
  ON public.users_settings (founding_creator_status);

CREATE INDEX IF NOT EXISTS users_settings_founding_active_expires_idx
  ON public.users_settings (founding_creator_expires_at)
  WHERE founding_creator_status = 'active';

-- Protect founding columns from client tampering (service_role may write)
CREATE OR REPLACE FUNCTION public.protect_users_settings_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.plan := 'free';
    NEW.stripe_customer_id := NULL;
    NEW.stripe_subscription_id := NULL;
    NEW.stripe_subscription_status := NULL;
    NEW.stripe_subscription_created_date := NULL;
    NEW.stripe_subscription_ends_at := NULL;
    NEW.stripe_account_id := NULL;
    NEW.stripe_connect_sales_enabled := coalesce(NEW.stripe_connect_sales_enabled, false);
    NEW.stripe_connect_payouts_enabled := coalesce(NEW.stripe_connect_payouts_enabled, false);
    NEW.stripe_connect_details_submitted := coalesce(NEW.stripe_connect_details_submitted, false);
    NEW.stripe_connect_disabled_reason := NULL;
    NEW.stripe_connect_requirements_currently_due := coalesce(
      NEW.stripe_connect_requirements_currently_due,
      '{}'::text[]
    );
    NEW.stripe_connect_status := NULL;
    NEW.stripe_connect_synced_at := NULL;
    NEW.stripe_connect_last_payout_failed_at := NULL;
    NEW.stripe_connect_last_payout_failure_code := NULL;
    NEW.stripe_connect_last_payout_failure_message := NULL;
    NEW.founding_creator_status := NULL;
    NEW.founding_creator_applied_at := NULL;
    NEW.founding_creator_granted_at := NULL;
    NEW.founding_creator_expires_at := NULL;
    NEW.founding_creator_reviewed_at := NULL;
    NEW.founding_creator_reviewed_by := NULL;
    NEW.founding_creator_reject_reason := NULL;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.user_id := OLD.user_id;
    NEW.plan := OLD.plan;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.stripe_subscription_id := OLD.stripe_subscription_id;
    NEW.stripe_subscription_status := OLD.stripe_subscription_status;
    NEW.stripe_subscription_created_date := OLD.stripe_subscription_created_date;
    NEW.stripe_subscription_ends_at := OLD.stripe_subscription_ends_at;
    NEW.stripe_account_id := OLD.stripe_account_id;
    NEW.stripe_connect_sales_enabled := OLD.stripe_connect_sales_enabled;
    NEW.stripe_connect_payouts_enabled := OLD.stripe_connect_payouts_enabled;
    NEW.stripe_connect_details_submitted := OLD.stripe_connect_details_submitted;
    NEW.stripe_connect_disabled_reason := OLD.stripe_connect_disabled_reason;
    NEW.stripe_connect_requirements_currently_due := OLD.stripe_connect_requirements_currently_due;
    NEW.stripe_connect_status := OLD.stripe_connect_status;
    NEW.stripe_connect_synced_at := OLD.stripe_connect_synced_at;
    NEW.stripe_connect_last_payout_failed_at := OLD.stripe_connect_last_payout_failed_at;
    NEW.stripe_connect_last_payout_failure_code := OLD.stripe_connect_last_payout_failure_code;
    NEW.stripe_connect_last_payout_failure_message := OLD.stripe_connect_last_payout_failure_message;
    NEW.founding_creator_status := OLD.founding_creator_status;
    NEW.founding_creator_applied_at := OLD.founding_creator_applied_at;
    NEW.founding_creator_granted_at := OLD.founding_creator_granted_at;
    NEW.founding_creator_expires_at := OLD.founding_creator_expires_at;
    NEW.founding_creator_reviewed_at := OLD.founding_creator_reviewed_at;
    NEW.founding_creator_reviewed_by := OLD.founding_creator_reviewed_by;
    NEW.founding_creator_reject_reason := OLD.founding_creator_reject_reason;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

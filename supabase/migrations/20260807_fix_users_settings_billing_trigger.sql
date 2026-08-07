-- Fix: protect_users_settings_billing_columns was forcing
-- stripe_connect_requirements_currently_due := NULL on INSERT, which violates
-- NOT NULL DEFAULT '{}'. That broke handle_new_user_settings() and all new signups.

CREATE OR REPLACE FUNCTION public.protect_users_settings_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role / admin API may update billing fields
  IF coalesce(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Force safe defaults on client inserts (no self-upgrade / fake Stripe IDs)
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
    -- Must be empty array, not NULL (column is NOT NULL)
    NEW.stripe_connect_requirements_currently_due := coalesce(
      NEW.stripe_connect_requirements_currently_due,
      '{}'::text[]
    );
    NEW.stripe_connect_status := NULL;
    NEW.stripe_connect_synced_at := NULL;
    NEW.stripe_connect_last_payout_failed_at := NULL;
    NEW.stripe_connect_last_payout_failure_code := NULL;
    NEW.stripe_connect_last_payout_failure_message := NULL;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Preserve billing / plan / Stripe columns from client tampering
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
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure column default is present even if someone dropped it
ALTER TABLE public.users_settings
  ALTER COLUMN stripe_connect_requirements_currently_due SET DEFAULT '{}'::text[];

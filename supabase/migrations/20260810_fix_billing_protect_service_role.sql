-- Fix: service_role updates were still hitting the protect trigger when
-- auth.jwt() was null in the request context, which reverted founding_*
-- columns on claim/approve and made "Claim for review" appear to do nothing.

CREATE OR REPLACE FUNCTION public.protect_users_settings_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text;
BEGIN
  jwt_role := coalesce(
    auth.jwt() ->> 'role',
    nullif(current_setting('request.jwt.claim.role', true), ''),
    ''
  );

  -- Service role / admin API may write billing + founding fields
  IF jwt_role = 'service_role'
     OR current_user IN ('service_role', 'supabase_admin', 'postgres') THEN
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

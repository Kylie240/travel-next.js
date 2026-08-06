-- Security hardening: RLS + billing column protection + private itinerary RPC filters
-- Run in Supabase SQL Editor (production) after review.

-- =============================================================================
-- 1) users_settings: prevent clients from changing plan / Stripe fields
-- =============================================================================

ALTER TABLE public.users_settings ENABLE ROW LEVEL SECURITY;

-- Drop overly-permissive policies if they exist (safe no-ops when missing)
DROP POLICY IF EXISTS "users_settings_select_own" ON public.users_settings;
DROP POLICY IF EXISTS "users_settings_insert_own" ON public.users_settings;
DROP POLICY IF EXISTS "users_settings_update_own" ON public.users_settings;
DROP POLICY IF EXISTS "Users can view own settings" ON public.users_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.users_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.users_settings;

CREATE POLICY "users_settings_select_own"
  ON public.users_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_settings_insert_own"
  ON public.users_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_settings_update_own"
  ON public.users_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- No DELETE for authenticated clients
DROP POLICY IF EXISTS "users_settings_delete_own" ON public.users_settings;

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
    NEW.stripe_connect_requirements_currently_due := NULL;
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

DROP TRIGGER IF EXISTS trg_protect_users_settings_billing ON public.users_settings;
CREATE TRIGGER trg_protect_users_settings_billing
  BEFORE INSERT OR UPDATE ON public.users_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_users_settings_billing_columns();

-- =============================================================================
-- 2) users: own-row updates only (profiles remain readable as your app requires)
-- =============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

-- Public/authenticated can read profiles (needed for explore / creator pages).
-- Tighten later with is_private if you want.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_all'
  ) THEN
    CREATE POLICY "users_select_all"
      ON public.users
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- =============================================================================
-- 3) itinerary_purchases: buyers can read own rows; no client writes
-- =============================================================================

ALTER TABLE public.itinerary_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "purchases_select_own" ON public.itinerary_purchases;
DROP POLICY IF EXISTS "purchases_no_client_insert" ON public.itinerary_purchases;
DROP POLICY IF EXISTS "purchases_no_client_update" ON public.itinerary_purchases;
DROP POLICY IF EXISTS "purchases_no_client_delete" ON public.itinerary_purchases;

CREATE POLICY "purchases_select_own"
  ON public.itinerary_purchases
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(coalesce(buyer_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR lower(coalesce(customer_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Explicitly no INSERT/UPDATE/DELETE policies for authenticated/anon
-- (service_role bypasses RLS for webhooks / checkout fulfillment)

-- =============================================================================
-- 4) Itinerary route RPCs: do not leak private / draft itineraries to anon
-- =============================================================================

-- Required helper (may be missing if 20260627 migration was never applied)
CREATE OR REPLACE FUNCTION public.slugify_itinerary_title(p_title text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    NULLIF(
      regexp_replace(
        regexp_replace(
          left(
            regexp_replace(
              regexp_replace(
                regexp_replace(lower(btrim(p_title)), '[^a-z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
              ),
              '-+', '-', 'g'
            ),
            80
          ),
          '^-+|-+$', '', 'g'
        ),
        '-+$', '', 'g'
      ),
      ''
    ),
    'itinerary'
  );
$$;

CREATE OR REPLACE FUNCTION public.itinerary_route_meta_is_visible(i public.itineraries)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Creator always sees own
    i.creator_id = auth.uid()
    OR (
      -- Published + public
      i.status = 2
      AND i.view_permission = 1
      AND i.status IS DISTINCT FROM 5
    )
    OR (
      -- Published + restricted list
      i.status = 2
      AND i.view_permission = 3
      AND auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.permission_view pv
        WHERE pv.itinerary_id = i.id
          AND pv.user_id = auth.uid()
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.get_itinerary_route_meta_by_prefix_slug(
  p_id_prefix text,
  p_slug text
)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT to_jsonb(row)::json
  FROM (
    SELECT
      i.id,
      i.slug,
      i.title,
      i.short_description,
      i.main_image,
      i.status,
      i.is_paid,
      i.price_cents,
      i.creator_id,
      i.view_permission,
      i.edit_permission,
      i.template
    FROM itineraries i
    WHERE lower(split_part(i.id::text, '-', 1)) = lower(p_id_prefix)
      AND (
        (i.slug IS NOT NULL AND lower(i.slug) = lower(p_slug))
        OR public.slugify_itinerary_title(i.title) = lower(p_slug)
      )
      AND public.itinerary_route_meta_is_visible(i)
      AND i.status IS DISTINCT FROM 5
    LIMIT 1
  ) row;
$$;

CREATE OR REPLACE FUNCTION public.get_itinerary_route_meta_by_id(p_itinerary_id uuid)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT to_jsonb(row)::json
  FROM (
    SELECT
      i.id,
      i.slug,
      i.title,
      i.short_description,
      i.main_image,
      i.status,
      i.is_paid,
      i.price_cents,
      i.creator_id,
      i.view_permission,
      i.edit_permission,
      i.template
    FROM itineraries i
    WHERE i.id = p_itinerary_id
      AND public.itinerary_route_meta_is_visible(i)
      AND i.status IS DISTINCT FROM 5
    LIMIT 1
  ) row;
$$;

CREATE OR REPLACE FUNCTION public.get_itinerary_route_meta_by_prefix_only(p_id_prefix text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH matches AS (
    SELECT
      i.id,
      i.slug,
      i.title,
      i.short_description,
      i.main_image,
      i.status,
      i.is_paid,
      i.price_cents,
      i.creator_id,
      i.view_permission,
      i.edit_permission,
      i.template
    FROM itineraries i
    WHERE lower(split_part(i.id::text, '-', 1)) = lower(p_id_prefix)
      AND public.itinerary_route_meta_is_visible(i)
      AND i.status IS DISTINCT FROM 5
  )
  SELECT to_jsonb(m)::json
  FROM matches m
  WHERE (SELECT count(*) FROM matches) = 1
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.slugify_itinerary_title(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.itinerary_route_meta_is_visible(public.itineraries) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_itinerary_route_meta_by_prefix_slug(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_itinerary_route_meta_by_id(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_itinerary_route_meta_by_prefix_only(text) TO anon, authenticated;

-- =============================================================================
-- 5) Sanity checks (run manually; expect plan/stripe update to be no-ops as user)
-- =============================================================================
-- select policyname, cmd, roles from pg_policies where tablename = 'users_settings';
-- As a normal user JWT: update users_settings set plan = 'pro' where user_id = auth.uid();
--   → plan should remain unchanged due to trigger.

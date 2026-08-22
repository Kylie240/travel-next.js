-- Remaining Supabase security lints (WARN), excluding the 9 RLS-disabled tables
-- already handled in 20260818_enable_rls_public_tables.sql.
--
-- Dashboard-only (not SQL):
--   auth_otp_long_expiry — Auth → Email → OTP expiry under 1 hour
--   auth_leaked_password_protection — Auth → Attack protection → HaveIBeenPwned
--   vulnerable_postgres_version — Project Settings → Infrastructure → Upgrade

-- =============================================================================
-- 1) function_search_path_mutable
-- Pin search_path on every public function that is missing it.
-- =============================================================================

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND p.proname NOT LIKE 'pg_%'
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(coalesce(p.proconfig, ARRAY[]::text[])) AS cfg(val)
        WHERE cfg.val LIKE 'search_path=%'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', r.sig);
  END LOOP;
END $$;

-- =============================================================================
-- 2) Helper to revoke PUBLIC / grant only the roles that should call a function
-- =============================================================================

CREATE OR REPLACE FUNCTION public._set_fn_execute_roles(
  p_name text,
  p_anon boolean,
  p_authenticated boolean,
  p_service_role boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = p_name
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon, authenticated', r.sig);
    IF p_anon THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon', r.sig);
    END IF;
    IF p_authenticated THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', r.sig);
    END IF;
    IF p_service_role THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
    END IF;
  END LOOP;
END;
$$;

-- Trigger / internal only — not callable via PostgREST.
-- Auth signup triggers run as supabase_auth_admin / postgres, so keep EXECUTE
-- for those roles or new signups fail after REVOKE FROM PUBLIC.
SELECT public._set_fn_execute_roles('handle_new_user', false, false, true);
SELECT public._set_fn_execute_roles('handle_new_user_settings', false, false, true);
SELECT public._set_fn_execute_roles('protect_users_settings_billing_columns', false, false, true);
SELECT public._set_fn_execute_roles('itinerary_route_meta_is_visible', false, false, true);

DO $$
DECLARE
  r record;
  fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'handle_new_user',
    'handle_new_user_settings',
    'protect_users_settings_billing_columns',
    'hook_before_user_created'
  ]
  LOOP
    FOR r IN
      SELECT p.oid::regprocedure AS sig
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = fn
    LOOP
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO postgres', r.sig);
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO supabase_auth_admin', r.sig);
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Admin RPC — service_role only (function already rejects non-service JWTs)
SELECT public._set_fn_execute_roles('approve_founding_creator', false, false, true);

-- Writes: signed-in users only
SELECT public._set_fn_execute_roles('create_itinerary', false, true, true);
SELECT public._set_fn_execute_roles('update_itinerary', false, true, true);
SELECT public._set_fn_execute_roles('update_itinerary_status', false, true, true);
SELECT public._set_fn_execute_roles('update_itinerary_permissions', false, true, true);
SELECT public._set_fn_execute_roles('get_itinerary_permissions', false, true, true);
SELECT public._set_fn_execute_roles('can_edit_itinerary', false, true, true);
SELECT public._set_fn_execute_roles('is_itinerary_creator', false, true, true);

-- Public itinerary pages + RLS helpers
SELECT public._set_fn_execute_roles('can_view_itinerary', true, true, true);
SELECT public._set_fn_execute_roles('get_itinerary_route_meta_by_id', true, true, true);
SELECT public._set_fn_execute_roles('get_itinerary_route_meta_by_prefix_only', true, true, true);
SELECT public._set_fn_execute_roles('get_itinerary_route_meta_by_prefix_slug', true, true, true);
SELECT public._set_fn_execute_roles('list_itinerary_route_meta_by_id_prefix', true, true, true);

DROP FUNCTION public._set_fn_execute_roles(text, boolean, boolean, boolean);

-- =============================================================================
-- 3) rls_policy_always_true
-- =============================================================================

-- gallery_removal: only the itinerary creator may enqueue cleanup
DO $$
BEGIN
  IF to_regclass('public.gallery_removal') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.gallery_removal ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.gallery_removal;
  DROP POLICY IF EXISTS "gallery_removal_insert_auth" ON public.gallery_removal;
  DROP POLICY IF EXISTS "gallery_removal_insert_creator" ON public.gallery_removal;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'gallery_removal'
      AND column_name = 'itinerary_id'
  ) THEN
    CREATE POLICY "gallery_removal_insert_creator"
      ON public.gallery_removal
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_itinerary_creator(itinerary_id));
  END IF;
END $$;

-- users_settings: auth trigger is SECURITY DEFINER and bypasses RLS;
-- WITH CHECK (true) is unnecessary and lets any signed-in user insert any row.
DROP POLICY IF EXISTS "Allow inserts from auth trigger" ON public.users_settings;

-- =============================================================================
-- 4) public_bucket_allows_listing (avatars)
-- Public object URLs still work without a SELECT policy. Listing the bucket
-- from the API is what this lint flags.
-- =============================================================================

DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;

-- =============================================================================
-- Notes on remaining WARN after this migration
-- -----------------------------------------------------------------------------
-- can_view_itinerary / get_itinerary_route_meta_* stay executable by anon
-- because public itinerary pages and RLS need them. That is intentional.
-- create_itinerary / update_itinerary stay executable by authenticated.
-- The linter still lists those as "SECURITY DEFINER executable"; they must
-- remain callable by the app.
-- =============================================================================

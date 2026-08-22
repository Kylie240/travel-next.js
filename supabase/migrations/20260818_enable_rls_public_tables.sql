-- Enable RLS + policies for public tables flagged by the Supabase linter.
-- Child itinerary tables: SELECT if parent is viewable; writes stay on SECURITY DEFINER RPCs.
-- Do not FORCE RLS — create_itinerary / update_itinerary must keep bypassing as table owner.

DROP FUNCTION IF EXISTS public._apply_itinerary_child_select_rls(text);

-- =============================================================================
-- Helper: SELECT policy on itinerary child tables (itinerary_id or day_id)
-- =============================================================================

CREATE OR REPLACE FUNCTION public._apply_itinerary_child_select_rls(p_table text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  has_itinerary_id boolean;
  has_day_id boolean;
  using_expr text;
  policy_name text := p_table || '_select_viewable';
BEGIN
  IF to_regclass('public.' || p_table) IS NULL THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table
      AND column_name = 'itinerary_id'
  ) INTO has_itinerary_id;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table
      AND column_name = 'day_id'
  ) INTO has_day_id;

  IF has_itinerary_id THEN
    using_expr := 'public.can_view_itinerary(itinerary_id)';
  ELSIF has_day_id THEN
    using_expr := $u$
      EXISTS (
        SELECT 1
        FROM public.itinerary_days d
        WHERE d.id = day_id
          AND public.can_view_itinerary(d.itinerary_id)
      )
    $u$;
  ELSE
    -- Fail closed: no client reads if we cannot tie the row to an itinerary.
    using_expr := 'false';
  END IF;

  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table);
  EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, p_table);
  EXECUTE format(
    'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (%s)',
    policy_name,
    p_table,
    using_expr
  );
END;
$$;

SELECT public._apply_itinerary_child_select_rls('itinerary_activities');
SELECT public._apply_itinerary_child_select_rls('itinerary_accommodations');
SELECT public._apply_itinerary_child_select_rls('itinerary_notes');

DROP FUNCTION IF EXISTS public._apply_itinerary_child_select_rls(text);

-- =============================================================================
-- itinerary_interactions
-- Existing "Enable update access for all users" is unsafe once RLS is on — drop it.
-- =============================================================================

DO $$
DECLARE
  has_itinerary_id boolean;
  has_user_id boolean;
BEGIN
  IF to_regclass('public.itinerary_interactions') IS NULL THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'itinerary_interactions'
      AND column_name = 'itinerary_id'
  ) INTO has_itinerary_id;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'itinerary_interactions'
      AND column_name = 'user_id'
  ) INTO has_user_id;

  ALTER TABLE public.itinerary_interactions ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Enable update access for all users" ON public.itinerary_interactions;
  DROP POLICY IF EXISTS "itinerary_interactions_select" ON public.itinerary_interactions;
  DROP POLICY IF EXISTS "itinerary_interactions_insert_own" ON public.itinerary_interactions;
  DROP POLICY IF EXISTS "itinerary_interactions_update_own" ON public.itinerary_interactions;
  DROP POLICY IF EXISTS "itinerary_interactions_delete_own" ON public.itinerary_interactions;

  IF has_itinerary_id THEN
    EXECUTE $p$
      CREATE POLICY "itinerary_interactions_select"
        ON public.itinerary_interactions
        FOR SELECT
        TO anon, authenticated
        USING (public.can_view_itinerary(itinerary_id))
    $p$;
  ELSIF has_user_id THEN
    EXECUTE $p$
      CREATE POLICY "itinerary_interactions_select"
        ON public.itinerary_interactions
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid())
    $p$;
  END IF;

  IF has_user_id THEN
    EXECUTE $p$
      CREATE POLICY "itinerary_interactions_insert_own"
        ON public.itinerary_interactions
        FOR INSERT
        TO authenticated
        WITH CHECK (user_id = auth.uid())
    $p$;
    EXECUTE $p$
      CREATE POLICY "itinerary_interactions_update_own"
        ON public.itinerary_interactions
        FOR UPDATE
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid())
    $p$;
    EXECUTE $p$
      CREATE POLICY "itinerary_interactions_delete_own"
        ON public.itinerary_interactions
        FOR DELETE
        TO authenticated
        USING (user_id = auth.uid())
    $p$;
  END IF;
END $$;

-- =============================================================================
-- users_blocked
-- Tighten "read access for all users" so block lists are not public.
-- =============================================================================

DO $$
BEGIN
  IF to_regclass('public.users_blocked') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.users_blocked ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Enable read access for all users" ON public.users_blocked;
  DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.users_blocked;
  DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.users_blocked;
  DROP POLICY IF EXISTS "users_blocked_select_own" ON public.users_blocked;
  DROP POLICY IF EXISTS "users_blocked_insert_own" ON public.users_blocked;
  DROP POLICY IF EXISTS "users_blocked_delete_own" ON public.users_blocked;

  CREATE POLICY "users_blocked_select_own"
    ON public.users_blocked
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR blocked_id = auth.uid());

  CREATE POLICY "users_blocked_insert_own"
    ON public.users_blocked
    FOR INSERT
    TO authenticated
    WITH CHECK (
      user_id = auth.uid()
      AND blocked_id IS DISTINCT FROM auth.uid()
    );

  CREATE POLICY "users_blocked_delete_own"
    ON public.users_blocked
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
END $$;

-- =============================================================================
-- blocked_signup_domains
-- Auth hook is SECURITY DEFINER; clients must not read or write the denylist.
-- =============================================================================

DO $$
BEGIN
  IF to_regclass('public.blocked_signup_domains') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.blocked_signup_domains ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "blocked_signup_domains_no_client_access" ON public.blocked_signup_domains;
  REVOKE ALL ON TABLE public.blocked_signup_domains FROM anon, authenticated;
END $$;

-- =============================================================================
-- newsletter
-- Anyone may subscribe; nobody may read the list via the API.
-- =============================================================================

DO $$
BEGIN
  IF to_regclass('public.newsletter') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "newsletter_insert" ON public.newsletter;
  DROP POLICY IF EXISTS "Enable insert for all users" ON public.newsletter;
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.newsletter;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'newsletter' AND column_name = 'email'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "newsletter_insert"
        ON public.newsletter
        FOR INSERT
        TO anon, authenticated
        WITH CHECK (
          email IS NOT NULL
          AND char_length(email) BETWEEN 3 AND 320
          AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
        )
    $p$;
  ELSE
    EXECUTE $p$
      CREATE POLICY "newsletter_insert"
        ON public.newsletter
        FOR INSERT
        TO anon, authenticated
        WITH CHECK (true)
    $p$;
  END IF;

  REVOKE SELECT, UPDATE, DELETE ON TABLE public.newsletter FROM anon, authenticated;
  GRANT INSERT ON TABLE public.newsletter TO anon, authenticated;
END $$;

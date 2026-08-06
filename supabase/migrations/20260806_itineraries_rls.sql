-- Itineraries + related tables RLS
-- Run after 20260806_rls_and_itinerary_rpc_hardening.sql
--
-- Content create/update still go through SECURITY DEFINER RPCs (bypass RLS).
-- Direct client access is limited to safe SELECT + creator UPDATE/DELETE.

-- =============================================================================
-- Helpers
-- =============================================================================

CREATE OR REPLACE FUNCTION public.can_view_itinerary(p_itinerary_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.itineraries i
    WHERE i.id = p_itinerary_id
      AND i.status IS DISTINCT FROM 5
      AND (
        i.creator_id = auth.uid()
        OR (
          i.status = 2
          AND i.view_permission = 1
        )
        OR (
          i.status = 2
          AND i.view_permission = 3
          AND auth.uid() IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.permission_view pv
            WHERE pv.itinerary_id = i.id
              AND pv.user_id = auth.uid()
          )
        )
        OR (
          i.status = 2
          AND auth.uid() IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.itinerary_purchases ip
            WHERE ip.itinerary_id = i.id
              AND ip.user_id = auth.uid()
          )
        )
        OR (
          auth.uid() IS NOT NULL
          AND i.edit_permission = 2
          AND EXISTS (
            SELECT 1
            FROM public.permission_edit pe
            WHERE pe.itinerary_id = i.id
              AND pe.user_id = auth.uid()
          )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_edit_itinerary(p_itinerary_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.itineraries i
    WHERE i.id = p_itinerary_id
      AND i.status IS DISTINCT FROM 5
      AND (
        i.creator_id = auth.uid()
        OR (
          i.edit_permission = 2
          AND EXISTS (
            SELECT 1
            FROM public.permission_edit pe
            WHERE pe.itinerary_id = i.id
              AND pe.user_id = auth.uid()
          )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_itinerary_creator(p_itinerary_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.itineraries i
    WHERE i.id = p_itinerary_id
      AND i.creator_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.can_view_itinerary(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_itinerary(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_itinerary_creator(uuid) TO anon, authenticated;

-- Keep route-meta visibility aligned with can_view (minus purchase/editor shortcuts already covered)
CREATE OR REPLACE FUNCTION public.itinerary_route_meta_is_visible(i public.itineraries)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.can_view_itinerary(i.id);
$$;

-- =============================================================================
-- itineraries
-- =============================================================================

ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "itineraries_select_viewable" ON public.itineraries;
DROP POLICY IF EXISTS "itineraries_update_creator" ON public.itineraries;
DROP POLICY IF EXISTS "itineraries_delete_creator" ON public.itineraries;
DROP POLICY IF EXISTS "itineraries_insert_none" ON public.itineraries;

CREATE POLICY "itineraries_select_viewable"
  ON public.itineraries
  FOR SELECT
  TO anon, authenticated
  USING (public.can_view_itinerary(id));

-- Direct column updates (pricing / template / slug) — creator only
CREATE POLICY "itineraries_update_creator"
  ON public.itineraries
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "itineraries_delete_creator"
  ON public.itineraries
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- No direct INSERT for clients (create_itinerary RPC is SECURITY DEFINER)

-- =============================================================================
-- itinerary_days / itinerary_tags (read if parent viewable; writes via RPC)
-- =============================================================================

DO $$
BEGIN
  IF to_regclass('public.itinerary_days') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "itinerary_days_select_viewable" ON public.itinerary_days';
    EXECUTE $p$
      CREATE POLICY "itinerary_days_select_viewable"
        ON public.itinerary_days
        FOR SELECT
        TO anon, authenticated
        USING (public.can_view_itinerary(itinerary_id))
    $p$;
  END IF;

  IF to_regclass('public.itinerary_tags') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.itinerary_tags ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "itinerary_tags_select_viewable" ON public.itinerary_tags';
    EXECUTE $p$
      CREATE POLICY "itinerary_tags_select_viewable"
        ON public.itinerary_tags
        FOR SELECT
        TO anon, authenticated
        USING (public.can_view_itinerary(itinerary_id))
    $p$;
  END IF;

  IF to_regclass('public.itinerary_gallery') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.itinerary_gallery ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "itinerary_gallery_select_viewable" ON public.itinerary_gallery';
    EXECUTE $p$
      CREATE POLICY "itinerary_gallery_select_viewable"
        ON public.itinerary_gallery
        FOR SELECT
        TO anon, authenticated
        USING (public.can_view_itinerary(itinerary_id))
    $p$;
  END IF;
END $$;

-- =============================================================================
-- permission_view / permission_edit
-- =============================================================================

DO $$
BEGIN
  IF to_regclass('public.permission_view') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.permission_view ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "permission_view_select" ON public.permission_view';
    EXECUTE $p$
      CREATE POLICY "permission_view_select"
        ON public.permission_view
        FOR SELECT
        TO authenticated
        USING (
          user_id = auth.uid()
          OR public.is_itinerary_creator(itinerary_id)
        )
    $p$;
  END IF;

  IF to_regclass('public.permission_edit') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.permission_edit ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "permission_edit_select" ON public.permission_edit';
    EXECUTE $p$
      CREATE POLICY "permission_edit_select"
        ON public.permission_edit
        FOR SELECT
        TO authenticated
        USING (
          user_id = auth.uid()
          OR public.is_itinerary_creator(itinerary_id)
        )
    $p$;
  END IF;
END $$;

-- =============================================================================
-- likes / saves
-- =============================================================================

DO $$
BEGIN
  IF to_regclass('public.interactions_likes') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.interactions_likes ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "likes_select" ON public.interactions_likes';
    EXECUTE 'DROP POLICY IF EXISTS "likes_insert_own" ON public.interactions_likes';
    EXECUTE 'DROP POLICY IF EXISTS "likes_delete_own" ON public.interactions_likes';
    EXECUTE $p$
      CREATE POLICY "likes_select"
        ON public.interactions_likes
        FOR SELECT
        TO anon, authenticated
        USING (
          user_id = auth.uid()
          OR public.can_view_itinerary(itinerary_id)
        )
    $p$;
    EXECUTE $p$
      CREATE POLICY "likes_insert_own"
        ON public.interactions_likes
        FOR INSERT
        TO authenticated
        WITH CHECK (
          user_id = auth.uid()
          AND public.can_view_itinerary(itinerary_id)
        )
    $p$;
    EXECUTE $p$
      CREATE POLICY "likes_delete_own"
        ON public.interactions_likes
        FOR DELETE
        TO authenticated
        USING (user_id = auth.uid())
    $p$;
  END IF;

  IF to_regclass('public.interactions_saves') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.interactions_saves ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "saves_select" ON public.interactions_saves';
    EXECUTE 'DROP POLICY IF EXISTS "saves_insert_own" ON public.interactions_saves';
    EXECUTE 'DROP POLICY IF EXISTS "saves_delete_own" ON public.interactions_saves';
    EXECUTE $p$
      CREATE POLICY "saves_select"
        ON public.interactions_saves
        FOR SELECT
        TO authenticated
        USING (
          user_id = auth.uid()
          OR public.can_view_itinerary(itinerary_id)
        )
    $p$;
    EXECUTE $p$
      CREATE POLICY "saves_insert_own"
        ON public.interactions_saves
        FOR INSERT
        TO authenticated
        WITH CHECK (
          user_id = auth.uid()
          AND public.can_view_itinerary(itinerary_id)
        )
    $p$;
    EXECUTE $p$
      CREATE POLICY "saves_delete_own"
        ON public.interactions_saves
        FOR DELETE
        TO authenticated
        USING (user_id = auth.uid())
    $p$;
  END IF;
END $$;

-- =============================================================================
-- gallery_removal (cleanup queue after delete)
-- =============================================================================

DO $$
BEGIN
  IF to_regclass('public.gallery_removal') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.gallery_removal ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "gallery_removal_insert_auth" ON public.gallery_removal';
    EXECUTE $p$
      CREATE POLICY "gallery_removal_insert_auth"
        ON public.gallery_removal
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() IS NOT NULL)
    $p$;
  END IF;
END $$;

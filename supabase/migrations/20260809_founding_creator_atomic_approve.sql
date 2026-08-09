-- Atomic founding-creator approve with hard 100-cap (transaction advisory lock)

CREATE OR REPLACE FUNCTION public.approve_founding_creator(
  p_user_id uuid,
  p_admin_id uuid,
  p_expires_at timestamptz,
  p_cap integer DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_active integer;
  v_now timestamptz := now();
BEGIN
  IF coalesce(auth.jwt() ->> 'role', '') <> 'service_role' THEN
    RAISE EXCEPTION 'approve_founding_creator requires service_role';
  END IF;

  -- Serialize approvals so concurrent admins cannot exceed the cap
  PERFORM pg_advisory_xact_lock(hashtext('journli_founding_creator_cap'));

  SELECT founding_creator_status
  INTO v_status
  FROM public.users_settings
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'User settings not found.');
  END IF;

  IF v_status = 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'User is already an active founding creator.');
  END IF;

  IF v_status IS DISTINCT FROM 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'User has no pending application.');
  END IF;

  SELECT count(*)::integer
  INTO v_active
  FROM public.users_settings
  WHERE founding_creator_status = 'active'
    AND founding_creator_expires_at > v_now;

  IF v_active >= p_cap THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', format('Cohort is full (%s active founding creators).', p_cap)
    );
  END IF;

  UPDATE public.users_settings
  SET
    founding_creator_status = 'active',
    founding_creator_granted_at = v_now,
    founding_creator_expires_at = p_expires_at,
    founding_creator_reviewed_at = v_now,
    founding_creator_reviewed_by = p_admin_id,
    founding_creator_reject_reason = NULL,
    plan = 'pro'
  WHERE user_id = p_user_id
    AND founding_creator_status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'Application was not pending (or already reviewed).'
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'expires_at', p_expires_at,
    'active_count', v_active + 1
  );
END;
$$;

REVOKE ALL ON FUNCTION public.approve_founding_creator(uuid, uuid, timestamptz, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_founding_creator(uuid, uuid, timestamptz, integer) TO service_role;

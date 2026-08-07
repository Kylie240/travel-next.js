-- Safety net: itinerary write RPCs must bypass RLS.
-- Tables like itineraries / permission_edit / permission_view have no client INSERT policies;
-- SECURITY INVOKER would block create, collaborator edits, and restricted viewers.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'create_itinerary',
        'update_itinerary',
        'update_itinerary_status',
        'update_itinerary_permissions',
        'get_itinerary_permissions'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SECURITY DEFINER', r.oid::regprocedure);
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', r.oid::regprocedure);
  END LOOP;
END $$;

-- Route resolution for /itinerary/{id-prefix}/{slug} (bypasses RLS for public metadata only)

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
  )
  SELECT to_jsonb(m)::json
  FROM matches m
  WHERE (SELECT count(*) FROM matches) = 1
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.slugify_itinerary_title(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_itinerary_route_meta_by_prefix_slug(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_itinerary_route_meta_by_id(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_itinerary_route_meta_by_prefix_only(text) TO anon, authenticated;

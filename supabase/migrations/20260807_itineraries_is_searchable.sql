-- Allow creators to hide published itineraries from Explore while keeping direct links.

ALTER TABLE public.itineraries
  ADD COLUMN IF NOT EXISTS is_searchable boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.itineraries.is_searchable IS
  'When true, published public itineraries appear on Explore / destination filters. Direct links still work when false.';

CREATE INDEX IF NOT EXISTS itineraries_explore_searchable_idx
  ON public.itineraries (status, view_permission, is_searchable)
  WHERE status = 2 AND view_permission = 1 AND is_searchable = true;

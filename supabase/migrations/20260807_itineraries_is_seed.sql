-- Mark editorial/demo itineraries so they can be cleaned up later.

ALTER TABLE public.itineraries
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.itineraries.is_seed IS
  'True for editorial seed content used to populate Explore. Safe to delete later.';

CREATE INDEX IF NOT EXISTS itineraries_is_seed_idx
  ON public.itineraries (is_seed)
  WHERE is_seed = true;

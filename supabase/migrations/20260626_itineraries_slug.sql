-- SEO-friendly URL slugs: /itinerary/{id-prefix}/{slug}
ALTER TABLE itineraries
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS itineraries_slug_unique
  ON itineraries (slug)
  WHERE slug IS NOT NULL;

COMMENT ON COLUMN itineraries.slug IS 'URL slug segment, e.g. 7-day-italy-itinerary';

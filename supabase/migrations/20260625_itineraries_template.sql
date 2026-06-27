ALTER TABLE itineraries
  ADD COLUMN IF NOT EXISTS template TEXT NOT NULL DEFAULT 'basic';

COMMENT ON COLUMN itineraries.template IS
  'Display template for the public itinerary page: basic, discover, explore, or journey.';

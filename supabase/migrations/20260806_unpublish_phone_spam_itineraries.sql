-- Take down existing phone/SEO spam itineraries (airline "ticket change" scam pages).
-- Safe to re-run. Sets status = 5 (deleted) so they leave explore/sitemap/public routes.

-- Preview matches first:
-- SELECT id, title, slug, creator_id, status
-- FROM public.itineraries
-- WHERE status = 2
--   AND (
--     title ~* '(ticket.?change|travel.?policy.?guide|name.?correction|NoWait)'
--     OR coalesce(detailed_overview, '') ~* '(833|866|855|844|877|888)[\s\-.]*[0-9]{3}'
--     OR coalesce(short_description, '') ~* '(833|866|855|844|877|888)[\s\-.]*[0-9]{3}'
--     OR title ~ '[★✈『⟶☄🔥🎀]'
--   );

UPDATE public.itineraries
SET status = 5
WHERE status = 2
  AND (
    title ~* '(ticket.?change|travel.?policy.?guide|name.?correction|NoWait)'
    OR coalesce(detailed_overview, '') ~* '(833|866|855|844|877|888)[\s\-.]*[0-9]{3}'
    OR coalesce(short_description, '') ~* '(833|866|855|844|877|888)[\s\-.]*[0-9]{3}'
    OR (
      title ~ '[★✈『⟶☄🔥🎀]'
      AND (
        coalesce(detailed_overview, '') ~ '[0-9]{3}[\s\-.]*[0-9]{3}[\s\-.]*[0-9]{4}'
        OR coalesce(short_description, '') ~ '[0-9]{3}[\s\-.]*[0-9]{3}[\s\-.]*[0-9]{4}'
      )
    )
  );

-- Optional: ban the specific spam account behind the Frontier ticket-change page
-- UPDATE auth.users SET banned_until = '2099-01-01' WHERE id = (
--   SELECT creator_id FROM public.itineraries WHERE id::text LIKE '4bd55e34%' LIMIT 1
-- );

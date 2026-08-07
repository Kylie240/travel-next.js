# Explore seed content

Populates Explore with **editorial guide accounts** and published itineraries so the marketplace doesn’t look empty before real users publish.

## Before you run

1. Apply these SQL migrations in Supabase:
   - `supabase/migrations/20260807_itineraries_is_searchable.sql`
   - `supabase/migrations/20260807_itineraries_is_seed.sql`
2. Ensure `.env.local` has:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Commands

```bash
npm run seed:explore
```

Idempotent: re-running skips itineraries that already exist for the same seed creator + title.

```bash
npm run seed:explore -- --clean
```

Deletes seed itineraries (`is_seed = true`).

```bash
npm run seed:explore -- --clean-users
```

Deletes seed itineraries **and** the seed auth/profile users.

## What gets created

- 5 guide accounts (`@tokyo.walks`, `@italian.trails`, `@nordic.escape`, `@coastal.trips`, `@journli.guides`)
- 11 published, public, searchable itineraries marked `is_seed = true`

Bios state these are editorial Journli accounts. Replace or remove them as real creators publish.

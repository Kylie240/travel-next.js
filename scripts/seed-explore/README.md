# Explore seed content

Populates Explore with **editorial guide accounts** and published itineraries.

## Why Auth createUser may fail

If `admin.createUser` returns `Database error creating new user`, your Supabase
**Before User Created** hook is likely returning HTTP 500 (for example a missing
`SUPABASE_AUTH_HOOK_SECRET` on Vercel). That blocks **all** new signups, including
the seed script.

Workaround: create seed users with SQL (bypasses Auth Hooks), then run the script
for itineraries only.

## Steps

1. Run these in the Supabase SQL Editor (if not already):
   - `supabase/migrations/20260807_itineraries_is_searchable.sql`
   - `supabase/migrations/20260807_itineraries_is_seed.sql`
   - `supabase/migrations/20260807_seed_explore_users.sql`  ← creates the 5 guide accounts
2. Locally:

```bash
npm run seed:explore
```

3. Open `/explore`

## Cleanup

```bash
npm run seed:explore -- --clean
```

## Also fix the Auth hook

In Supabase → Authentication → Hooks → Before User Created, confirm the HTTPS
endpoint returns 200. Check Vercel logs for `SUPABASE_AUTH_HOOK_SECRET is not configured`
or signature failures — until that's fixed, normal email signup will keep failing too.

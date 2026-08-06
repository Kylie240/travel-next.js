-- Immediate Auth-layer protection (run in Supabase SQL Editor).
-- Blocks known spam domains before auth.users rows are created,
-- even when bots call the Auth API directly with the anon key.
--
-- After running this SQL:
-- 1. Dashboard → Authentication → Hooks → Before User Created
-- 2. Hook type: Postgres Function
-- 3. Function: public.hook_before_user_created
--
-- Prefer the HTTPS hook (app/api/auth/hooks/before-user-created) in production
-- for the full disposable-domain list; keep this as a fast deny-list fallback.

create table if not exists public.blocked_signup_domains (
  domain text primary key,
  reason text,
  created_at timestamptz not null default now()
);

insert into public.blocked_signup_domains (domain, reason) values
  ('kavio.org', 'spam campaign'),
  ('glaud.biz', 'spam campaign'),
  ('rudox.biz', 'spam campaign'),
  ('mailinator.com', 'disposable'),
  ('guerrillamail.com', 'disposable'),
  ('tempmail.com', 'disposable'),
  ('yopmail.com', 'disposable'),
  ('throwaway.email', 'disposable'),
  ('sharklasers.com', 'disposable'),
  ('trashmail.com', 'disposable'),
  ('fakeinbox.com', 'disposable'),
  ('maildrop.cc', 'disposable'),
  ('10minutemail.com', 'disposable')
on conflict (domain) do nothing;

create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  email text := lower(coalesce(event->'user'->>'email', ''));
  domain text;
begin
  if email = '' or position('@' in email) = 0 then
    return '{}'::jsonb;
  end if;

  domain := split_part(email, '@', 2);

  if exists (
    select 1 from public.blocked_signup_domains b where b.domain = domain
  ) then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code', 400,
        'message', 'Disposable or temporary email addresses are not allowed. Please use a permanent email.'
      )
    );
  end if;

  -- Block short single-label domains on common abuse TLDs (e.g. something.biz)
  if domain ~ '^[a-z0-9]{3,12}\.(biz|top|xyz|click|icu|rest|sbs)$' then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code', 400,
        'message', 'Disposable or temporary email addresses are not allowed. Please use a permanent email.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_before_user_created(jsonb) from authenticated, anon, public;

-- Optional: purge unconfirmed spam accounts that never signed in (review first!)
-- select id, email, created_at from auth.users
-- where email_confirmed_at is null
--   and last_sign_in_at is null
--   and created_at > now() - interval '14 days'
-- order by created_at desc;

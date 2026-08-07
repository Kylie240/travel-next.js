-- Allow editorial seed account emails through the Postgres before-user-created hook.
-- Seed script uses *@seed.journli.com

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

  -- Editorial Explore seed accounts
  if domain = 'seed.journli.com' then
    return '{}'::jsonb;
  end if;

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

-- Create editorial seed auth users + profiles.
-- PREREQUISITE: run 20260807_fix_users_settings_billing_trigger.sql first
-- (otherwise handle_new_user_settings fails on NOT NULL stripe array).
--
-- Auth insert triggers handle_new_user → public.users + users_settings.
-- This script then corrects username/bio/avatar and sets plan=pro.
-- Idempotent: safe to re-run.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  u_tokyo uuid := 'a1000000-0000-4000-8000-000000000001';
  u_italy uuid := 'a1000000-0000-4000-8000-000000000002';
  u_nordic uuid := 'a1000000-0000-4000-8000-000000000003';
  u_coastal uuid := 'a1000000-0000-4000-8000-000000000004';
  u_guides uuid := 'a1000000-0000-4000-8000-000000000005';
  inst uuid;
  pwd text := crypt('JournliSeed2026!', gen_salt('bf'));
BEGIN
  SELECT id INTO inst FROM auth.instances LIMIT 1;
  IF inst IS NULL THEN
    inst := '00000000-0000-0000-0000-000000000000';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = u_tokyo OR lower(email) = 'tokyo.walks@seed.journli.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      inst, u_tokyo, 'authenticated', 'authenticated',
      'tokyo.walks@seed.journli.com', pwd, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Tokyo Walks","username":"tokyo.walks","is_seed":true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      u_tokyo, u_tokyo,
      jsonb_build_object('sub', u_tokyo::text, 'email', 'tokyo.walks@seed.journli.com'),
      'email', u_tokyo::text, now(), now(), now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = u_italy OR lower(email) = 'italian.trails@seed.journli.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      inst, u_italy, 'authenticated', 'authenticated',
      'italian.trails@seed.journli.com', pwd, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Italian Trails","username":"italian.trails","is_seed":true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      u_italy, u_italy,
      jsonb_build_object('sub', u_italy::text, 'email', 'italian.trails@seed.journli.com'),
      'email', u_italy::text, now(), now(), now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = u_nordic OR lower(email) = 'nordic.escape@seed.journli.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      inst, u_nordic, 'authenticated', 'authenticated',
      'nordic.escape@seed.journli.com', pwd, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Nordic Escape","username":"nordic.escape","is_seed":true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      u_nordic, u_nordic,
      jsonb_build_object('sub', u_nordic::text, 'email', 'nordic.escape@seed.journli.com'),
      'email', u_nordic::text, now(), now(), now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = u_coastal OR lower(email) = 'coastal.trips@seed.journli.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      inst, u_coastal, 'authenticated', 'authenticated',
      'coastal.trips@seed.journli.com', pwd, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Coastal Trips","username":"coastal.trips","is_seed":true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      u_coastal, u_coastal,
      jsonb_build_object('sub', u_coastal::text, 'email', 'coastal.trips@seed.journli.com'),
      'email', u_coastal::text, now(), now(), now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = u_guides OR lower(email) = 'guides@seed.journli.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      inst, u_guides, 'authenticated', 'authenticated',
      'guides@seed.journli.com', pwd, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Journli Guides","username":"journli.guides","is_seed":true}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      u_guides, u_guides,
      jsonb_build_object('sub', u_guides::text, 'email', 'guides@seed.journli.com'),
      'email', u_guides::text, now(), now(), now()
    );
  END IF;
END $$;

-- Correct profile fields (trigger may have set username from name without dots)
UPDATE public.users SET
  name = v.name,
  username = v.username,
  email = v.email,
  avatar = v.avatar,
  location = v.location,
  bio = v.bio,
  updated_at = now()
FROM (VALUES
  (
    'a1000000-0000-4000-8000-000000000001'::uuid,
    'Tokyo Walks', 'tokyo.walks', 'tokyo.walks@seed.journli.com',
    'https://api.dicebear.com/7.x/shapes/png?seed=tokyo.walks&size=256&backgroundColor=b6e3f4',
    'Tokyo, Japan',
    'Editorial guide account for Journli. Neighborhood walks, food alleys, and quiet temples.'
  ),
  (
    'a1000000-0000-4000-8000-000000000002'::uuid,
    'Italian Trails', 'italian.trails', 'italian.trails@seed.journli.com',
    'https://api.dicebear.com/7.x/shapes/png?seed=italian.trails&size=256&backgroundColor=c0aede',
    'Rome, Italy',
    'Editorial guide account for Journli. Classic Italy itineraries with room to wander.'
  ),
  (
    'a1000000-0000-4000-8000-000000000003'::uuid,
    'Nordic Escape', 'nordic.escape', 'nordic.escape@seed.journli.com',
    'https://api.dicebear.com/7.x/shapes/png?seed=nordic.escape&size=256&backgroundColor=d1d4f9',
    'Reykjavík, Iceland',
    'Editorial guide account for Journli. Nordic cities, coasts, and slow travel days.'
  ),
  (
    'a1000000-0000-4000-8000-000000000004'::uuid,
    'Coastal Trips', 'coastal.trips', 'coastal.trips@seed.journli.com',
    'https://api.dicebear.com/7.x/shapes/png?seed=coastal.trips&size=256&backgroundColor=ffd5dc',
    'Lisbon, Portugal',
    'Editorial guide account for Journli. Seaside cities, cafés, and sunset viewpoints.'
  ),
  (
    'a1000000-0000-4000-8000-000000000005'::uuid,
    'Journli Guides', 'journli.guides', 'guides@seed.journli.com',
    'https://api.dicebear.com/7.x/shapes/png?seed=journli.guides&size=256&backgroundColor=ffdfbf',
    'Worldwide',
    'Official editorial guides from Journli. Sample trips to help travelers get started.'
  )
) AS v(id, name, username, email, avatar, location, bio)
WHERE public.users.id = v.id;

-- Raise itinerary limits for seed creators.
-- Billing protect trigger blocks plan changes unless JWT role is service_role,
-- so briefly disable it in the SQL editor session.
ALTER TABLE public.users_settings DISABLE TRIGGER trg_protect_users_settings_billing;

UPDATE public.users_settings
SET plan = 'pro', is_private = false, email_notifications = false
WHERE user_id IN (
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000003',
  'a1000000-0000-4000-8000-000000000004',
  'a1000000-0000-4000-8000-000000000005'
);

ALTER TABLE public.users_settings ENABLE TRIGGER trg_protect_users_settings_billing;

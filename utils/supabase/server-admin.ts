// utils/supabase/admin.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is not configured"
    );
  }

  return createSupabaseClient(url, key);
}

/** Returns null instead of throwing when admin env vars are missing. */
export function createClientIfConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    return null;
  }

  return createSupabaseClient(url, key);
}

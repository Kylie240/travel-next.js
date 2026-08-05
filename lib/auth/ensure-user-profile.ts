import type { SupabaseClient, User } from "@supabase/supabase-js"

type ProfileMeta = {
  name?: string
  username?: string
}

/**
 * Creates users + users_settings rows if missing (idempotent).
 * Call after email confirmation or OAuth callback — not at raw signup time.
 */
export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User
): Promise<{ created: boolean; error?: string }> {
  if (!user?.id) {
    return { created: false, error: "Missing user" }
  }

  const { data: existing, error: existingError } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (existingError) {
    return { created: false, error: existingError.message }
  }

  if (existing) {
    return { created: false }
  }

  const meta = (user.user_metadata || {}) as ProfileMeta
  const email = user.email?.trim() || ""
  const name =
    meta.name?.trim() ||
    email.split("@")[0] ||
    "Traveler"

  let username =
    meta.username?.trim().toLowerCase().replace(/\s+/g, "") ||
    email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") ||
    `user${user.id.replace(/-/g, "").slice(0, 8)}`

  if (username.length < 3) {
    username = `user${user.id.replace(/-/g, "").slice(0, 8)}`
  }

  // Avoid username collisions by appending a short id suffix if needed
  const { data: usernameTaken } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle()

  if (usernameTaken) {
    username = `${username.slice(0, 12)}${user.id.replace(/-/g, "").slice(0, 6)}`
  }

  const now = new Date().toISOString()

  const { error: userInsertError } = await supabase.from("users").insert({
    id: user.id,
    name,
    username,
    email,
    avatar: "",
    location: "",
    bio: "",
    created_at: now,
    updated_at: now,
  })

  if (userInsertError) {
    // Race: another request may have created the row
    if (userInsertError.code === "23505") {
      return { created: false }
    }
    return { created: false, error: userInsertError.message }
  }

  const { error: settingsError } = await supabase.from("users_settings").insert({
    user_id: user.id,
    is_private: false,
    email_notifications: true,
  })

  if (settingsError && settingsError.code !== "23505") {
    return { created: false, error: settingsError.message }
  }

  return { created: true }
}

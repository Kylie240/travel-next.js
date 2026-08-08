/**
 * Seed Explore with editorial guide accounts + published itineraries.
 *
 * Prerequisites:
 *   1. Run supabase/migrations/20260807_itineraries_is_seed.sql
 *   2. Run supabase/migrations/20260807_itineraries_is_searchable.sql (if not already)
 *   3. .env.local has NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run seed:explore
 *   npm run seed:explore -- --clean          # delete seed itineraries only
 *   npm run seed:explore -- --clean-users    # delete seed itineraries + seed auth users
 */

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js"
import { randomUUID } from "crypto"
import { readFileSync, existsSync } from "fs"
import { resolve } from "path"
import { SEED_ACCOUNTS, SEED_ITINERARIES, type SeedAccount, type SeedItinerary } from "./data"

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local")
  if (!existsSync(envPath)) return
  const text = readFileSync(envPath, "utf8")
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvLocal()

const PUBLISHED = 2
const VIEW_PUBLIC = 1
const EDIT_CREATOR = 1

function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (check .env.local)"
    )
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "itinerary"
  )
}

async function findAuthUserByEmail(
  admin: SupabaseClient,
  email: string
): Promise<User | undefined> {
  const target = email.toLowerCase()

  // Prefer public.users (works even when Auth Hooks break admin.createUser)
  const { data: profile } = await admin
    .from("users")
    .select("id, email")
    .eq("email", target)
    .maybeSingle()
  if (profile?.id) {
    return { id: profile.id, email: profile.email } as User
  }

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw new Error(`listUsers failed: ${error.message}`)
  const users = (data?.users ?? []) as User[]
  return users.find((u) => (u.email || "").toLowerCase() === target)
}

async function ensureSeedAccount(
  admin: SupabaseClient,
  account: SeedAccount
): Promise<string> {
  const existing = await findAuthUserByEmail(admin, account.email)

  let userId = existing?.id

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        name: account.name,
        username: account.username,
        is_seed: true,
      },
    })
    if (error) {
      throw new Error(
        `Seed account @${account.username} is missing and Auth createUser failed (${error.message}).\n` +
          `Your Supabase "Before User Created" hook is likely returning 500 (this also blocks normal signups).\n` +
          `Fix: run supabase/migrations/20260807_seed_explore_users.sql in the SQL Editor, then re-run npm run seed:explore.`
      )
    }
    if (!data.user?.id) {
      throw new Error(`Create auth user ${account.username}: missing user id`)
    }
    userId = data.user.id
    console.log(`  + auth user @${account.username}`)
  } else {
    console.log(`  = account @${account.username} (exists)`)
  }

  const now = new Date().toISOString()
  const { error: upsertUserError } = await admin.from("users").upsert(
    {
      id: userId,
      name: account.name,
      username: account.username,
      email: account.email,
      avatar: account.avatar,
      location: account.location,
      bio: account.bio,
      updated_at: now,
      created_at: now,
    },
    { onConflict: "id" }
  )
  if (upsertUserError) {
    throw new Error(`Upsert users @${account.username}: ${upsertUserError.message}`)
  }

  const { error: settingsError } = await admin.from("users_settings").upsert(
    {
      user_id: userId,
      is_private: false,
      email_notifications: false,
      plan: "pro",
    },
    { onConflict: "user_id" }
  )
  if (settingsError) {
    // Some schemas may not allow upsert on user_id — try update then insert
    const { error: updateErr } = await admin
      .from("users_settings")
      .update({ plan: "pro", is_private: false })
      .eq("user_id", userId)
    if (updateErr) {
      const { error: insertErr } = await admin.from("users_settings").insert({
        user_id: userId,
        is_private: false,
        email_notifications: false,
        plan: "pro",
      })
      if (insertErr && insertErr.code !== "23505") {
        throw new Error(`users_settings @${account.username}: ${insertErr.message}`)
      }
    }
  }

  return userId
}

function buildItineraryPayload(seed: SeedItinerary, id: string) {
  return {
    id,
    status: PUBLISHED,
    title: seed.title,
    shortDescription: seed.shortDescription,
    mainImage: seed.mainImage,
    detailedOverview: seed.detailedOverview,
    duration: seed.duration,
    budget: seed.budget,
    template: seed.template,
    itineraryTags: seed.itineraryTags,
    cities: seed.days.map((d) => ({ city: d.cityName, country: d.countryName })),
    notes: [],
    days: seed.days.map((day, dayIndex) => ({
      id: dayIndex + 1,
      title: day.title,
      cityName: day.cityName,
      countryName: day.countryName,
      description: day.description,
      showAccommodation: false,
      activities: day.activities.map((activity, activityIndex) => ({
        id: activityIndex + 1,
        activityNumber: activityIndex + 1,
        activity_number: activityIndex + 1,
        title: activity.title,
        description: activity.description,
        time: activity.time || null,
        type: activity.type ?? null,
        location: activity.location || null,
        image: "",
        link: "",
        photos: [],
        price: 0,
        duration: null,
      })),
    })),
  }
}

async function seedItinerary(
  admin: SupabaseClient,
  seed: SeedItinerary,
  creatorId: string
): Promise<"created" | "skipped" | "updated"> {
  const { data: existing } = await admin
    .from("itineraries")
    .select("id")
    .eq("is_seed", true)
    .eq("title", seed.title)
    .eq("creator_id", creatorId)
    .maybeSingle()

  if (existing?.id) {
    console.log(`  ~ itinerary "${seed.title}" (refreshing media/flags)`)
    await admin
      .from("itineraries")
      .update({
        is_searchable: true,
        is_seed: true,
        status: PUBLISHED,
        view_permission: VIEW_PUBLIC,
        edit_permission: EDIT_CREATOR,
        slug: slugify(seed.title),
        template: seed.template,
        main_image: seed.mainImage,
        short_description: seed.shortDescription,
        budget: seed.budget,
      })
      .eq("id", existing.id)
    return "updated"
  }

  const id = randomUUID()
  const payload = buildItineraryPayload(seed, id)

  const { data, error } = await admin.rpc("create_itinerary", {
    p_itinerary: payload,
    p_creator_id: creatorId,
  })

  if (error) {
    throw new Error(`create_itinerary "${seed.title}": ${error.message}`)
  }

  const createdId =
    typeof data === "string"
      ? data
      : data && typeof data === "object" && "id" in data
        ? String((data as { id: string }).id)
        : id

  const { error: markError } = await admin
    .from("itineraries")
    .update({
      is_seed: true,
      is_searchable: true,
      status: PUBLISHED,
      view_permission: VIEW_PUBLIC,
      edit_permission: EDIT_CREATOR,
      slug: slugify(seed.title),
      template: seed.template,
      main_image: seed.mainImage,
      short_description: seed.shortDescription,
      budget: seed.budget,
    })
    .eq("id", createdId)

  if (markError) {
    console.warn(`  ! marked seed flags failed for "${seed.title}": ${markError.message}`)
    console.warn("    (Did you run 20260807_itineraries_is_seed.sql?)")
  } else {
    console.log(`  + itinerary "${seed.title}"`)
  }

  return "created"
}

async function cleanSeed(admin: SupabaseClient, removeUsers: boolean) {
  console.log("Cleaning seed itineraries…")
  const { data: rows, error } = await admin
    .from("itineraries")
    .select("id, creator_id, title")
    .eq("is_seed", true)

  if (error) {
    throw new Error(
      `Failed to list seed itineraries: ${error.message}. Run 20260807_itineraries_is_seed.sql first.`
    )
  }

  const creatorIds = new Set<string>()
  for (const row of rows || []) {
    creatorIds.add(String(row.creator_id))
    const { error: delError } = await admin.from("itineraries").delete().eq("id", row.id)
    if (delError) {
      // Soft-delete fallback
      await admin.from("itineraries").update({ status: 5, is_searchable: false }).eq("id", row.id)
      console.log(`  ~ soft-deleted ${row.title}`)
    } else {
      console.log(`  - deleted ${row.title}`)
    }
  }

  if (!removeUsers) {
    console.log(`Done. Removed ${(rows || []).length} seed itineraries.`)
    return
  }

  console.log("Cleaning seed auth users…")
  for (const account of SEED_ACCOUNTS) {
    const user = await findAuthUserByEmail(admin, account.email)
    if (!user) continue
    await admin.from("users_settings").delete().eq("user_id", user.id)
    await admin.from("users").delete().eq("id", user.id)
    const { error: authDel } = await admin.auth.admin.deleteUser(user.id)
    if (authDel) console.warn(`  ! auth delete @${account.username}: ${authDel.message}`)
    else console.log(`  - auth user @${account.username}`)
  }

  console.log("Seed cleanup complete.")
}

async function main() {
  const args = process.argv.slice(2)
  const clean = args.includes("--clean") || args.includes("--clean-users")
  const cleanUsers = args.includes("--clean-users")

  const admin = adminClient()

  if (clean) {
    await cleanSeed(admin, cleanUsers)
    return
  }

  console.log("Seeding editorial accounts…")
  const accountIds = new Map<string, string>()
  for (const account of SEED_ACCOUNTS) {
    const id = await ensureSeedAccount(admin, account)
    accountIds.set(account.key, id)
  }

  console.log("\nSeeding itineraries…")
  let created = 0
  let updated = 0
  for (const itinerary of SEED_ITINERARIES) {
    const creatorId = accountIds.get(itinerary.accountKey)
    if (!creatorId) {
      throw new Error(`Missing account for ${itinerary.accountKey}`)
    }
    const result = await seedItinerary(admin, itinerary, creatorId)
    if (result === "created") created++
    else if (result === "updated") updated++
  }

  console.log(`\nDone. created=${created} updated=${updated} total=${SEED_ITINERARIES.length}`)
  console.log("Open /explore to verify. Re-run refreshes cover images on existing seed trips.")
}

main().catch((err) => {
  console.error("\nSeed failed:", err instanceof Error ? err.message : err)
  process.exit(1)
})

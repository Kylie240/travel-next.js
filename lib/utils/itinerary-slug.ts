import type { SupabaseClient } from "@supabase/supabase-js"

export function slugifyItineraryTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "")

  return slug || "itinerary"
}

/** First 8 characters of the UUID (before the first hyphen). */
export function getItineraryIdPrefix(id: string): string {
  return id.split("-")[0]?.toLowerCase() ?? id.slice(0, 8).toLowerCase()
}

export function isFullItineraryUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
}

export async function ensureUniqueItinerarySlug(
  supabase: SupabaseClient,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug || "itinerary"
  let suffix = 1

  while (true) {
    let query = supabase.from("itineraries").select("id").eq("slug", slug)
    if (excludeId) {
      query = query.neq("id", excludeId)
    }
    const { data } = await query.maybeSingle()
    if (!data) return slug
    slug = `${baseSlug}-${suffix++}`
  }
}

export async function syncItinerarySlug(
  supabase: SupabaseClient,
  itineraryId: string,
  title: string
): Promise<string> {
  const baseSlug = slugifyItineraryTitle(title)
  const slug = await ensureUniqueItinerarySlug(supabase, baseSlug, itineraryId)

  const { error } = await supabase
    .from("itineraries")
    .update({ slug })
    .eq("id", itineraryId)

  if (error) {
    throw new Error(error.message)
  }

  return slug
}

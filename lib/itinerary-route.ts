import type { SupabaseClient } from "@supabase/supabase-js"
import createClient from "@/utils/supabase/server"
import { createClientIfConfigured } from "@/utils/supabase/server-admin"
import {
  getItineraryIdPrefix,
  isFullItineraryUuid,
  slugifyItineraryTitle,
  syncItinerarySlug,
} from "@/lib/utils/itinerary-slug"
import { getItineraryPath } from "@/lib/utils/itinerary-url"

export type ItineraryRouteMeta = {
  id: string
  slug: string | null
  title: string | null
  short_description: string | null
  main_image: string | null
  status: number | null
  is_paid: boolean | null
  price_cents: number | null
  creator_id: string | null
  view_permission: number | string | null
  edit_permission: number | string | null
  template: string | null
}

const ROUTE_META_SELECT =
  "id, slug, title, short_description, main_image, status, is_paid, price_cents, creator_id, view_permission, edit_permission, template"

function parseRouteMeta(data: unknown): ItineraryRouteMeta | null {
  if (!data || typeof data !== "object") return null
  const row = data as Record<string, unknown>
  if (typeof row.id !== "string") return null
  return row as ItineraryRouteMeta
}

function getEffectiveSlug(meta: Pick<ItineraryRouteMeta, "slug" | "title">): string {
  if (meta.slug?.trim()) return meta.slug.trim().toLowerCase()
  if (meta.title?.trim()) return slugifyItineraryTitle(meta.title).toLowerCase()
  return "itinerary"
}

function matchesPrefixAndSlug(
  meta: ItineraryRouteMeta,
  idPrefix: string,
  slug: string
): boolean {
  return (
    getItineraryIdPrefix(meta.id) === idPrefix.toLowerCase() &&
    getEffectiveSlug(meta) === slug.toLowerCase()
  )
}

/** UUID range for the first hyphen-separated segment (LIKE does not work on uuid columns). */
function uuidPrefixBounds(prefix: string): { min: string; max: string } | null {
  const normalized = prefix.toLowerCase()
  if (!/^[0-9a-f]{1,8}$/.test(normalized)) return null
  const low = normalized.padEnd(8, "0").slice(0, 8)
  const high = normalized.padEnd(8, "f").slice(0, 8)
  return {
    min: `${low}-0000-0000-0000-000000000000`,
    max: `${high}-ffff-ffff-ffff-ffffffffffff`,
  }
}

async function fetchMetaByPrefixSlugRpc(
  supabase: SupabaseClient,
  idPrefix: string,
  slug: string
): Promise<ItineraryRouteMeta | null> {
  const { data, error } = await supabase.rpc(
    "get_itinerary_route_meta_by_prefix_slug",
    { p_id_prefix: idPrefix, p_slug: slug }
  )
  if (error) return null
  return parseRouteMeta(data)
}

async function fetchMetaByIdRpc(
  supabase: SupabaseClient,
  itineraryId: string
): Promise<ItineraryRouteMeta | null> {
  const { data, error } = await supabase.rpc("get_itinerary_route_meta_by_id", {
    p_itinerary_id: itineraryId,
  })
  if (error) return null
  return parseRouteMeta(data)
}

async function fetchMetaByPrefixOnlyRpc(
  supabase: SupabaseClient,
  idPrefix: string
): Promise<ItineraryRouteMeta | null> {
  const { data, error } = await supabase.rpc(
    "get_itinerary_route_meta_by_prefix_only",
    { p_id_prefix: idPrefix }
  )
  if (error) return null
  return parseRouteMeta(data)
}

async function fetchMetaByPrefixSlugDirect(
  supabase: SupabaseClient,
  idPrefix: string,
  slug: string
): Promise<ItineraryRouteMeta | null> {
  const normalizedPrefix = idPrefix.toLowerCase()
  const normalizedSlug = slug.toLowerCase()
  const bounds = uuidPrefixBounds(normalizedPrefix)
  if (!bounds) return null

  const { data: bySlug } = await supabase
    .from("itineraries")
    .select(ROUTE_META_SELECT)
    .eq("slug", normalizedSlug)
    .gte("id", bounds.min)
    .lte("id", bounds.max)
    .maybeSingle()

  if (bySlug) return bySlug as ItineraryRouteMeta

  const { data: byPrefix, error } = await supabase
    .from("itineraries")
    .select(ROUTE_META_SELECT)
    .gte("id", bounds.min)
    .lte("id", bounds.max)

  if (error || !byPrefix?.length) return null

  const matches = (byPrefix as ItineraryRouteMeta[]).filter((row) =>
    matchesPrefixAndSlug(row, normalizedPrefix, normalizedSlug)
  )

  if (matches.length !== 1) return null
  return matches[0]
}

async function fetchMetaByIdDirect(
  supabase: SupabaseClient,
  itineraryId: string
): Promise<ItineraryRouteMeta | null> {
  const { data, error } = await supabase
    .from("itineraries")
    .select(ROUTE_META_SELECT)
    .eq("id", itineraryId)
    .maybeSingle()

  if (error || !data) return null
  return data as ItineraryRouteMeta
}

async function fetchMetaByPrefixOnlyDirect(
  supabase: SupabaseClient,
  idPrefix: string
): Promise<ItineraryRouteMeta | null> {
  const bounds = uuidPrefixBounds(idPrefix.toLowerCase())
  if (!bounds) return null

  const { data, error } = await supabase
    .from("itineraries")
    .select(ROUTE_META_SELECT)
    .gte("id", bounds.min)
    .lte("id", bounds.max)
    .limit(2)

  if (error || !data?.length) return null
  if (data.length > 1) return null
  return data[0] as ItineraryRouteMeta
}

async function resolveMeta(
  fetchers: Array<() => Promise<ItineraryRouteMeta | null>>
): Promise<ItineraryRouteMeta | null> {
  for (const fetch of fetchers) {
    const meta = await fetch()
    if (meta) return await ensureSlugOnMeta(meta)
  }
  return null
}

export async function resolveItineraryByFullId(
  itineraryId: string
): Promise<ItineraryRouteMeta | null> {
  const sessionClient = await createClient()
  const adminClient = createClientIfConfigured()

  return resolveMeta([
    () => fetchMetaByIdRpc(sessionClient, itineraryId),
    () =>
      adminClient
        ? fetchMetaByIdDirect(adminClient, itineraryId)
        : Promise.resolve(null),
    () => fetchMetaByIdDirect(sessionClient, itineraryId),
  ])
}

export async function resolveItineraryByPrefixAndSlug(
  idPrefix: string,
  slug: string
): Promise<ItineraryRouteMeta | null> {
  const sessionClient = await createClient()
  const adminClient = createClientIfConfigured()

  return resolveMeta([
    () => fetchMetaByPrefixSlugRpc(sessionClient, idPrefix, slug),
    () =>
      adminClient
        ? fetchMetaByPrefixSlugDirect(adminClient, idPrefix, slug)
        : Promise.resolve(null),
    () => fetchMetaByPrefixSlugDirect(sessionClient, idPrefix, slug),
  ])
}

export async function resolveItineraryByPrefixOnly(
  idPrefix: string
): Promise<ItineraryRouteMeta | null> {
  const sessionClient = await createClient()
  const adminClient = createClientIfConfigured()

  return resolveMeta([
    () => fetchMetaByPrefixOnlyRpc(sessionClient, idPrefix),
    () =>
      adminClient
        ? fetchMetaByPrefixOnlyDirect(adminClient, idPrefix)
        : Promise.resolve(null),
    () => fetchMetaByPrefixOnlyDirect(sessionClient, idPrefix),
  ])
}

async function ensureSlugOnMeta(
  meta: ItineraryRouteMeta
): Promise<ItineraryRouteMeta> {
  if (meta.slug?.trim()) return meta
  if (!meta.title?.trim()) return meta

  const syncClient = createClientIfConfigured() ?? (await createClient())

  try {
    const slug = await syncItinerarySlug(syncClient, meta.id, meta.title)
    return { ...meta, slug }
  } catch {
    return { ...meta, slug: slugifyItineraryTitle(meta.title) }
  }
}

export function getCanonicalItineraryPath(meta: ItineraryRouteMeta): string {
  return getItineraryPath({
    id: meta.id,
    slug: meta.slug,
    title: meta.title,
  })
}

export function isCanonicalItineraryPath(
  meta: ItineraryRouteMeta,
  idPrefix: string,
  slug: string
): boolean {
  return matchesPrefixAndSlug(meta, idPrefix, slug)
}

export function isLegacyItineraryParam(value: string): boolean {
  return isFullItineraryUuid(value)
}

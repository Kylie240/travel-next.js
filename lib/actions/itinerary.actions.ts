"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { CreateItinerary, type ItineraryTemplate } from "@/types/createItinerary";
import { ItineraryStatusEnum, viewPermissionEnum } from "@/enums/itineraryStatusEnum";
import { ItinerarySummary } from "@/types/ItinerarySummary";
import { SavedItinerary } from "@/types/savedItinerary";
import createClient from "@/utils/supabase/server";
import { syncItinerarySlug } from "@/lib/utils/itinerary-slug";
import type { GetItineraryOptions } from "@/types/GetItineraryOptions";
import type { ExplorePageDto } from "@/dtos/ExplorePageDto";
import type { ExploreItinerariesResult } from "@/types/explore";
import { itineraryTagsMap, activityTagsMap } from "@/lib/constants/tags";
import { getCountryNamesForContinents } from "@/lib/constants/country-continents";
import { assertItineraryNotSpam } from "@/lib/moderation/itinerary-spam";

export type { ItineraryTemplate };

function parseDurationRange(duration?: string): {
  min?: number
  max?: number
} {
  if (!duration) return {}
  if (duration.endsWith("+")) {
    const min = parseInt(duration.replace("+", ""), 10)
    return Number.isFinite(min) ? { min } : {}
  }
  const [a, b] = duration.split("-").map((n) => parseInt(n, 10))
  if (Number.isFinite(a) && Number.isFinite(b)) return { min: a, max: b }
  if (Number.isFinite(a)) return { min: a, max: a }
  return {}
}

function tagNamesToIds(
  tags: Array<string | number> | undefined,
  map: Array<{ id: number; name: string }>
): number[] {
  if (!tags?.length) return []
  return tags
    .map((t) => {
      if (typeof t === "number") return t
      const asNum = parseInt(t, 10)
      if (Number.isFinite(asNum) && String(asNum) === t) return asNum
      return map.find((m) => m.name.toLowerCase() === t.toLowerCase())?.id
    })
    .filter((id): id is number => typeof id === "number")
}

function tagIdsToNames(
  ids: unknown,
  map: Array<{ id: number; name: string }>
): string[] {
  if (!Array.isArray(ids)) return []
  return ids
    .map((id) => {
      const num = typeof id === "number" ? id : parseInt(String(id), 10)
      return map.find((m) => m.id === num)?.name
    })
    .filter((n): n is string => Boolean(n))
}

function parseBudgetLabel(budget?: string): { min?: number; max?: number } {
  if (!budget?.trim()) return {}
  switch (budget.trim().toLowerCase()) {
    case "budget friendly":
      return { max: 1000 }
    case "standard":
      return { min: 1000, max: 2500 }
    case "mid-range":
      return { min: 2500, max: 5000 }
    case "upscale":
      return { min: 5000, max: 10000 }
    case "luxury":
      return { min: 10000 }
    default:
      return parseDurationRange(budget) // numeric ranges if ever passed as "1000-2500"
  }
}

function resolveSort(sort?: string, quickFilter?: string): string {
  if (sort && sort !== "most-recent") return sort
  switch (quickFilter) {
    case "Most Viewed":
    case "Popular":
    case "Trending":
      return "most-viewed"
    case "Best Rated":
      return "best-rated"
    case "Budget Friendly":
      return "price-low"
    case "Luxury":
      return "price-high"
    case "New":
    default:
      return sort || "most-recent"
  }
}

/** Maps the UI sort key to an actual DB column on `itineraries`. */
function dbSort(sort: string): { column: string; ascending: boolean } {
  switch (sort) {
    case "duration-short":
      return { column: "duration", ascending: true }
    case "duration-long":
      return { column: "duration", ascending: false }
    case "price-low":
      return { column: "budget", ascending: true }
    case "price-high":
      return { column: "budget", ascending: false }
    // `views` isn't stored and best-rated needs an aggregate; fall back to recency.
    case "most-viewed":
    case "best-rated":
    case "most-recent":
    default:
      return { column: "updated_at", ascending: false }
  }
}

function intersectSets(
  current: Set<string> | null,
  next: Set<string>
): Set<string> {
  if (current === null) return next
  const out = new Set<string>()
  for (const id of next) if (current.has(id)) out.add(id)
  return out
}

/**
 * Resolve itinerary ids that include at least one activity of the given types.
 * Tries common table shapes; returns null if activity storage can't be queried
 * (caller should skip the filter rather than return zero results).
 */
async function getItineraryIdsByActivityTypes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  typeIds: number[]
): Promise<Set<string> | null> {
  if (!typeIds.length) return null

  const typeSet = new Set(typeIds)

  // Most likely shape for create_itinerary JSON: activities embedded on days.
  {
    const { data: days, error } = await supabase
      .from("itinerary_days")
      .select("itinerary_id, activities")

    if (!error) {
      const ids = new Set<string>()
      for (const day of days || []) {
        const activities = (day as { activities?: unknown }).activities
        if (!Array.isArray(activities)) continue
        const match = activities.some((activity) => {
          if (!activity || typeof activity !== "object") return false
          const type = Number((activity as { type?: unknown }).type)
          return Number.isFinite(type) && typeSet.has(type)
        })
        if (match) {
          const id = String(
            (day as { itinerary_id?: unknown }).itinerary_id || ""
          )
          if (id) ids.add(id)
        }
      }
      return ids
    }
  }

  // Normalized activity tables (if the RPC writes them separately).
  for (const table of [
    "itinerary_activities",
    "day_activities",
    "itinerary_day_activities",
  ]) {
    const { data, error } = await supabase
      .from(table)
      .select("itinerary_id, type")
      .in("type", typeIds)

    if (!error) {
      return new Set(
        (data || [])
          .map((row) =>
            String((row as { itinerary_id?: unknown }).itinerary_id || "")
          )
          .filter(Boolean)
      )
    }
  }

  console.warn(
    "Activity tag filter skipped; no readable activity storage found."
  )
  return null
}

/**
 * Unique country names from days on published, public itineraries —
 * used for the Explore destinations dropdown.
 */
export const getPublicDestinationCountries = async (): Promise<string[]> => {
  const supabase = await createClient()

  const { data: itineraries, error: itinerariesError } = await supabase
    .from("itineraries")
    .select("id")
    .eq("status", ItineraryStatusEnum.published)
    .eq("view_permission", viewPermissionEnum.public)
    .eq("is_searchable", true)
    .limit(5000)

  if (itinerariesError) {
    console.error(
      "Failed to load public itineraries for destinations:",
      itinerariesError.message
    )
    return []
  }

  const ids = (itineraries || []).map((row) => String(row.id)).filter(Boolean)
  if (ids.length === 0) return []

  const countries = new Set<string>()
  const chunkSize = 200

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize)
    const { data: dayRows, error: daysError } = await supabase
      .from("itinerary_days")
      .select("country")
      .in("itinerary_id", chunk)
      .not("country", "is", null)

    if (daysError) {
      console.error(
        "Failed to load countries for destinations:",
        daysError.message
      )
      continue
    }

    for (const row of dayRows || []) {
      const name = String(row.country || "").trim()
      if (name) countries.add(name)
    }
  }

  return [...countries].sort((a, b) => a.localeCompare(b))
}

/**
 * Public explore feed: published itineraries with public view permission.
 *
 * Schema notes: `countries`/`cities` are NOT columns on `itineraries`; they are
 * derived from `itinerary_days`. Tags live in `itinerary_tags`, and likes in
 * `interactions_likes`. We therefore pre-filter ids from those tables, then
 * batch-hydrate the current page.
 */
export const getItineraries = async (
  options?: GetItineraryOptions
): Promise<ExploreItinerariesResult> => {
  const supabase = await createClient()
  const page = Math.max(1, options?.pagination?.page || 1)
  const pageSize = Math.min(48, Math.max(1, options?.pagination?.pageSize || 12))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const emptyResult: ExploreItinerariesResult = {
    data: [],
    total: 0,
    totalPages: 1,
    currentPage: page,
  }

  const filters = options?.filters ?? {}
  const {
    destination,
    duration,
    durationMin,
    durationMax,
    budgetMin,
    budgetMax,
    itineraryTags,
    activityTags,
    continents,
    countries,
    sort,
    quickFilter,
    q,
  } = filters

  const durationRange = parseDurationRange(duration)
  const budgetRange = parseBudgetLabel(filters.budget)
  const minDuration = durationMin ?? durationRange.min
  const maxDuration = durationMax ?? durationRange.max
  const maxBudget =
    budgetMax ??
    budgetRange.max ??
    (quickFilter === "Budget Friendly" ? 1000 : undefined)
  const minBudget =
    budgetMin ??
    budgetRange.min ??
    (quickFilter === "Luxury" ? 10000 : undefined)
  const itineraryTagIds = tagNamesToIds(
    itineraryTags as Array<string | number> | undefined,
    itineraryTagsMap
  )
  const activityTagIds = tagNamesToIds(
    activityTags as Array<string | number> | undefined,
    activityTagsMap
  )
  const resolvedSort = resolveSort(sort, quickFilter)

  // Pre-filter ids from related tables when a derived filter is requested.
  const explicitCountries = [
    ...(destination?.trim() ? [destination.trim()] : []),
    ...(countries ?? []),
  ].filter(Boolean)
  const continentCountries = getCountryNamesForContinents(continents ?? [])
  let restrictIds: Set<string> | null = null

  if (explicitCountries.length) {
    const { data: dayRows } = await supabase
      .from("itinerary_days")
      .select("itinerary_id, country")
      .in("country", [...new Set(explicitCountries)])
    restrictIds = intersectSets(
      restrictIds,
      new Set((dayRows || []).map((r) => String(r.itinerary_id)))
    )
    if (restrictIds.size === 0) return emptyResult
  }

  if (continentCountries.length) {
    // Chunk large IN lists (e.g. selecting multiple continents).
    const continentIds = new Set<string>()
    const chunkSize = 100
    for (let i = 0; i < continentCountries.length; i += chunkSize) {
      const chunk = continentCountries.slice(i, i + chunkSize)
      const { data: dayRows } = await supabase
        .from("itinerary_days")
        .select("itinerary_id, country")
        .in("country", chunk)
      for (const row of dayRows || []) {
        continentIds.add(String(row.itinerary_id))
      }
    }
    restrictIds = intersectSets(restrictIds, continentIds)
    if (restrictIds.size === 0) return emptyResult
  }

  if (itineraryTagIds.length) {
    const { data: tagRows } = await supabase
      .from("itinerary_tags")
      .select("itinerary_id, tag_id")
      .in("tag_id", itineraryTagIds)
    restrictIds = intersectSets(
      restrictIds,
      new Set((tagRows || []).map((r) => String(r.itinerary_id)))
    )
    if (restrictIds.size === 0) return emptyResult
  }

  if (activityTagIds.length) {
    const activityIds = await getItineraryIdsByActivityTypes(
      supabase,
      activityTagIds
    )
    if (activityIds) {
      restrictIds = intersectSets(restrictIds, activityIds)
      if (restrictIds.size === 0) return emptyResult
    }
  }

  let query = supabase
    .from("itineraries")
    .select(
      "id, title, slug, short_description, main_image, duration, budget, creator_id, updated_at",
      { count: "exact" }
    )
    .eq("status", ItineraryStatusEnum.published)
    .eq("view_permission", viewPermissionEnum.public)
    .eq("is_searchable", true)

  if (minDuration != null) query = query.gte("duration", minDuration)
  if (maxDuration != null) query = query.lte("duration", maxDuration)
  if (minBudget != null) query = query.gte("budget", minBudget)
  if (maxBudget != null) query = query.lte("budget", maxBudget)
  if (q?.trim()) {
    const term = q.trim().replace(/[%,]/g, "")
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,short_description.ilike.%${term}%`
      )
    }
  }
  if (restrictIds) {
    query = query.in("id", [...restrictIds])
  }

  const sortSpec = dbSort(resolvedSort)
  query = query.order(sortSpec.column, {
    ascending: sortSpec.ascending,
    nullsFirst: false,
  })

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw new Error(`Failed to get itineraries: ${error.message}`)
  }

  const rows = data || []
  if (rows.length === 0) {
    const total = count ?? 0
    return {
      data: [],
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      currentPage: page,
    }
  }

  const ids = rows.map((r) => String(r.id))
  const creatorIds = [
    ...new Set(
      rows
        .map((r) => r.creator_id as string | null)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  const [daysRes, tagsRes, likesRes, creatorsRes] = await Promise.all([
    supabase
      .from("itinerary_days")
      .select("itinerary_id, country, city, day_number")
      .in("itinerary_id", ids),
    supabase
      .from("itinerary_tags")
      .select("itinerary_id, tag_id")
      .in("itinerary_id", ids),
    supabase
      .from("interactions_likes")
      .select("itinerary_id")
      .in("itinerary_id", ids),
    creatorIds.length
      ? supabase
          .from("users")
          .select("id, name, username, avatar")
          .in("id", creatorIds)
      : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
  ])

  const countriesById = new Map<string, string[]>()
  const citiesById = new Map<string, string[]>()
  for (const row of daysRes.data || []) {
    const key = String(row.itinerary_id)
    if (row.country) {
      const arr = countriesById.get(key) || []
      if (!arr.includes(String(row.country))) arr.push(String(row.country))
      countriesById.set(key, arr)
    }
    if (row.city) {
      const arr = citiesById.get(key) || []
      if (!arr.includes(String(row.city))) arr.push(String(row.city))
      citiesById.set(key, arr)
    }
  }

  const tagIdsById = new Map<string, number[]>()
  for (const row of tagsRes.data || []) {
    const key = String(row.itinerary_id)
    const arr = tagIdsById.get(key) || []
    const tagId = Number(row.tag_id)
    if (Number.isFinite(tagId) && !arr.includes(tagId)) arr.push(tagId)
    tagIdsById.set(key, arr)
  }

  const likesById = new Map<string, number>()
  for (const row of likesRes.data || []) {
    const key = String(row.itinerary_id)
    likesById.set(key, (likesById.get(key) || 0) + 1)
  }

  const creatorById = new Map<
    string,
    { name?: string | null; username?: string | null; avatar?: string | null }
  >()
  for (const c of (creatorsRes.data as Array<Record<string, unknown>>) || []) {
    creatorById.set(String(c.id), {
      name: c.name as string | null,
      username: c.username as string | null,
      avatar: c.avatar as string | null,
    })
  }

  const mapped: ExplorePageDto[] = rows.map((row) => {
    const id = String(row.id)
    const itineraryTagNames = tagIdsToNames(
      tagIdsById.get(id) || [],
      itineraryTagsMap
    )
    const creator = creatorById.get(String(row.creator_id))
    return {
      id,
      title: String(row.title || "Untitled"),
      slug: (row.slug as string | null) ?? null,
      duration: Number(row.duration) || 1,
      shortDescription: String(row.short_description || ""),
      mainImage: String(row.main_image || ""),
      countries: countriesById.get(id) || [],
      cities: citiesById.get(id) || [],
      itineraryTags: itineraryTagNames,
      activityTags: [],
      featuredCategories: itineraryTagNames.slice(0, 1),
      views: 0,
      rating: null,
      price:
        row.budget != null && String(row.budget) !== ""
          ? Number(row.budget)
          : null,
      likes: likesById.get(id) || 0,
      creatorId: String(row.creator_id || ""),
      creatorName:
        creator?.username?.trim() ||
        creator?.name?.trim() ||
        "Traveler",
      creatorImage: creator?.avatar || "",
    }
  })

  const total = count ?? mapped.length
  return {
    data: mapped,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    currentPage: page,
  }
}


export const getItineraryDataByUserId = async (userId: string, currentUserId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
    .rpc("get_profile_itineraries", { p_creator_id: userId, p_current_user_id: currentUserId }) as { 
        data: ItinerarySummary[] | null, 
        error: Error | null };

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const createItinerary = async (itinerary: CreateItinerary) => {
    const days = Array.isArray(itinerary.days) ? itinerary.days : []
    days.forEach((x, i) => {
      if (x && typeof x === "object") x.id = i + 1
    })
    itinerary.days = days

    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

      // Only block spam on publish — drafts must always be saveable
      if (itinerary.status === ItineraryStatusEnum.published) {
        assertItineraryNotSpam(itinerary)
      }

        const { data, error } = await supabase.rpc("create_itinerary", {
            p_itinerary: itinerary,
            p_creator_id: user.id,
        });

        if (error && error.message == "Maximum number of itineraries reached.") {
            throw new Error("Maximum number of itineraries reached.");
        } else if (error) throw new Error(error.message);

        const itineraryId =
          typeof data === "string"
            ? data
            : data && typeof data === "object" && "id" in data
              ? String((data as { id: string }).id)
              : itinerary.id || null

        if (itineraryId && itinerary.title?.trim()) {
          try {
            await syncItinerarySlug(supabase, itineraryId, itinerary.title)
          } catch (slugError) {
            console.error("Slug sync failed after create:", slugError)
          }
        }

        // Return a plain object — raw RPC payloads can fail Server Action serialization
        return { success: true, id: itineraryId };
}

export const updateItinerary = async (id: string, itinerary: CreateItinerary) => {
     const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

      if (itinerary.status === ItineraryStatusEnum.published) {
        assertItineraryNotSpam(itinerary)
      }

      const { error } = await supabase.rpc("update_itinerary", {
          p_itinerary: itinerary,
          p_user_id: user.id,
          p_itinerary_id: id,
      });

      if (error) throw new Error(error.message);

      if (itinerary.title?.trim()) {
        try {
          await syncItinerarySlug(supabase, id, itinerary.title)
        } catch (slugError) {
          console.error("Slug sync failed after update:", slugError)
        }
      }

      revalidatePath(`/itinerary/[id]/[slug]`, "page")

      return { success: true };
}

export const getItinerarySummaries = async (userId?: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
    
    // Try RPC first (get_my_itineraries may not exist or may return null in some setups)
    const { data: rpcData, error: rpcError } = await supabase
        .rpc("get_my_itineraries", { p_user_id: user.id }) as {
        data: ItinerarySummary[] | null;
        error: { message: string } | null;
    };

    if (!rpcError && Array.isArray(rpcData)) {
        return rpcData;
    }

    // Fallback: query itineraries directly by creator_id (when RPC is missing or returns null)
    const { data: rows, error: queryError } = await supabase
        .from("itineraries")
        .select("id, title, status, main_image, short_description, countries, view_permission, edit_permission, slug")
        .eq("creator_id", user.id)
        .order("id", { ascending: false });

    if (queryError) {
        if (rpcError) throw new Error(rpcError.message);
        throw new Error(queryError.message);
    }

    const summaries: ItinerarySummary[] = (rows || []).map((row: any) => ({
        id: row.id,
        title: row.title ?? "",
        status: row.status,
        mainImage: row.main_image ?? null,
        views: row.views ?? 0,
        likes: row.likes ?? 0,
        saves: row.saves ?? 0,
        shortDescription: row.short_description,
        countries: row.countries ?? [],
        viewPermission: row.view_permission ?? 0,
        editPermission: row.edit_permission ?? 0,
        slug: row.slug ?? null,
    }));
    return summaries;
}

export const getItineraryPermissions = async (userId?: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
    .rpc("get_itineraries_permissions", { p_user_id: userId }) as { 
        data: ItineraryPermissions[] | null, 
        error: Error | null };

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const updateItineraryStatus = async (itineraryId: string, status: number, creatorId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

    if (status === ItineraryStatusEnum.published) {
      const { data: existing, error: loadError } = await supabase.rpc("get_itinerary", {
        p_itinerary_id: itineraryId,
      })
      if (loadError) throw new Error(loadError.message)
      if (existing) {
        assertItineraryNotSpam({
          title: existing.title,
          shortDescription: existing.shortDescription ?? existing.short_description,
          detailedOverview: existing.detailedOverview ?? existing.detailed_overview,
          days: existing.days,
          notes: existing.notes,
        })
      }
    }

    const { data, error } = await supabase.rpc("update_itinerary_status", {
        p_creator_id: creatorId,
        p_itinerary_id: itineraryId,
        p_status: status,
    });

    if (error && error.message == "Maximum number of itineraries reached.") {
        throw new Error("Maximum number of itineraries reached.");
    } else if (error) throw new Error(error.message);
    
    return { success: true };
}

export const getItineraryById = async (itineraryId: string) => {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc("get_itinerary", {
        p_itinerary_id: itineraryId,
    });

    if (error) throw new Error(error.message);
    
    return data;
}

export const getItineraryForPdfExport = async (itineraryId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data: itineraryMeta, error: itineraryMetaError } = await supabase
    .from('itineraries')
    .select('is_paid, creator_id')
    .eq('id', itineraryId)
    .single()

    if (itineraryMetaError || !itineraryMeta) {
        throw new Error("Itinerary not found")
    }

    const isCreator = itineraryMeta.creator_id === user.id

    if (itineraryMeta.is_paid && !isCreator) {
        const { data: purchaseData, error: purchaseError } = await supabase
        .from('itinerary_purchases')
        .select('id')
        .eq('itinerary_id', itineraryId)
        .eq('user_id', user.id)
        .maybeSingle()

        if (purchaseError) {
            throw new Error(purchaseError.message)
        }

        if (!purchaseData) {
            throw new Error("Purchase required to export PDF")
        }
    }

    const { data, error } = await supabase.rpc("get_itinerary", {
        p_itinerary_id: itineraryId,
    });

    if (error) throw new Error(error.message);

    return data;
}

// Returns a restricted version of the itinerary without notes and day schedule details
// Used when itinerary is paid and user hasn't purchased access
export const getRestrictedItineraryById = async (itineraryId: string) => {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc("get_restricted_itinerary", {
        p_itinerary_id: itineraryId,
    });

    if (error) throw new Error(error.message);
    if (!data) return null;

    return data;
}

export const deleteItinerary = async (itineraryId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

        const { data: existing, error: fetchError } = await supabase
        .from('itineraries')
        .select('id, creator_id')
        .eq('id', itineraryId)
        .maybeSingle()

        if (fetchError) throw fetchError
        if (!existing) throw new Error("Itinerary not found")
        if (existing.creator_id !== user.id) {
            throw new Error("You are not authorized to delete this itinerary")
        }

        const { error: itineraryError } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', itineraryId)
        .eq('creator_id', user.id);

        if (itineraryError) {
            throw itineraryError;
        }

        // await deleteFolderRecursively(user.id, itineraryId);
        const { error: galleryError } = await supabase
        .from('gallery_removal')
        .insert({
            itinerary_id: itineraryId,
        });

        if (galleryError) {
            throw galleryError;
        }

        return { success: true };
}

export const incrementItineraryViewCount = async (itineraryId: string) => {
    const supabase = await createClient()
    
    const { data, error } = await supabase
    .rpc("increment_itinerary_view", { p_itinerary_id: itineraryId });

    if (error) {
        console.log("Error incrementing view count:", error)
    } 
}

export const getPurchasedByUserId = async (userId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
      const { data, error } = await supabase
      .rpc("get_purchased_itineraries", { p_user_id: userId }) as { 
          data: SavedItinerary[] | null, 
          error: Error | null 
      };

      if (error) {
          throw new Error(error.message);
      } 

      return data;
}

export const getSavesByUserId = async (userId: string, creatorId: string = null) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
      const { data, error } = await supabase
      .rpc("get_saved_itineraries", { p_user_id: userId, p_creator_id: creatorId }) as { 
          data: SavedItinerary[] | null, 
          error: Error | null 
      };

      if (error) {
          throw new Error(error.message);
      } 

      return data;
}

export const getSavesByCreatorId = async (userId: string, creatorId: string = null) => {
    const supabase = await createClient()   
        
    const { data, error } = await supabase
    .rpc("get_saved_itinerary_ids", { p_current_user_id: userId, p_creator_id: creatorId }) as { 
        data: string[] | null, 
        error: Error | null 
    };

    if (error) {
        throw new Error(error.message);
    } 

    return data;
}

//Interactions
export const LikeItinerary = async (itineraryId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { error: itineraryError } = await supabase
        .from('interactions_likes')
        .insert({
            itinerary_id: itineraryId,
            user_id: user.id,
        });

        if (itineraryError) {
            throw itineraryError;
        }

        return { success: true };
}

export const UnlikeItinerary = async (itineraryId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { error: itineraryError } = await supabase
        .from('interactions_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('itinerary_id', itineraryId);

        if (itineraryError) {
            throw itineraryError;
        }

        return { success: true };
}

export const SaveItinerary = async (itineraryId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { error: itineraryError } = await supabase
        .from('interactions_saves')
        .insert({
            itinerary_id: itineraryId,
            user_id: user.id,
        });

        if (itineraryError) {
            if (itineraryError.code === "23505") {
                revalidatePath("/saves");
                revalidatePath("/profile/[username]", "page");
                return { success: true, message: "Already saved" };
            }
            throw itineraryError;
        }

        revalidatePath("/saves");
        revalidatePath("/profile/[username]", "page");
        return { success: true };
}

export const UnsaveItinerary = async (itineraryId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { error: itineraryError } = await supabase
        .from('interactions_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('itinerary_id', itineraryId);

        if (itineraryError) {
            throw itineraryError;
        }

        revalidatePath("/saves");
        revalidatePath("/profile/[username]", "page");
        return { success: true };
}

async function deleteFolderRecursively(userId: string, itineraryId: string) {
    const supabase = await createClient()
    const bucket = "itinerary-images";
  const galleryPath = `${userId}/${itineraryId}/`;

  // Helper to delete all files in a folder
  async function deleteAllInFolder(path) {
    const { data: files, error } = await supabase.storage.from(bucket).list(path, { limit: 100 });
    if (error) throw error;

    if (!files || files.length === 0) return;

    const filePaths = files.map((f) => `${path}${f.name}`);
    await supabase.storage.from(bucket).remove(filePaths);
  }

  try {
    // 1️⃣ Delete files directly inside gallery folder (just in case)
    await deleteAllInFolder(galleryPath);

    // 2️⃣ Delete all files inside main/
    await deleteAllInFolder(`${galleryPath}main/`);

    // 3️⃣ Delete all files inside each days/day# folder
    const { data: daysFolders } = await supabase.storage.from(bucket).list(`${galleryPath}days/`, { limit: 100 });

    if (daysFolders && daysFolders.length > 0) {
      for (const dayFolder of daysFolders) {
        await deleteAllInFolder(`${galleryPath}days/${dayFolder.name}/`);
      }
    }

    console.log(`✅ Deleted gallery ${galleryPath} successfully.`);
  } catch (err) {
    console.error("Error deleting gallery:", err.message);
  }
  }

export interface ItineraryPermissions {
  viewPermission: 'public' | 'private' | 'restricted';
  editPermission: 'creator' | 'collaborators';
  allowedViewers?: string[];
  allowedEditors?: string[];
}

export const getItineraryPermissionsById = async (
  itineraryId: string,
  permissions: ItineraryPermissions
) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // First verify the user is the creator
  const { data: itinerary, error: fetchError } = await supabase
    .from('itineraries')
    .select('creator_id')
    .eq('id', itineraryId)
    .single()

  if (fetchError) throw new Error("Itinerary not found")
  if (itinerary.creator_id !== user.id) throw new Error("You are not authorized to update this itinerary")

  const { data, error } = await supabase.rpc(
    "get_itinerary_permissions",
    { p_itinerary_id: itineraryId }
  );

  if (error) {
    console.error("Failed to fetch permissions:", error);
    return null;
  }

  console.log("data", data)
  return data as ItineraryPermissions;
}

export const updateItineraryPermissions = async (
  itineraryId: string,
  permissions: ItineraryPermissions
) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // First verify the user is the creator
  const { data: itinerary, error: fetchError } = await supabase
    .from('itineraries')
    .select('creator_id')
    .eq('id', itineraryId)
    .single()

  if (fetchError) throw new Error("Itinerary not found")
  if (itinerary.creator_id !== user.id) throw new Error("You are not authorized to update this itinerary")

    console.log("permissions", permissions)
  const { error } = await supabase.rpc(
    "update_itinerary_permissions",
    {
      p_user_id: user.id,
      p_itinerary_id: itineraryId,
      p_permissions: permissions,
    }
  );

  if (error) {
    console.error("RPC Error:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

export const updateItineraryPricing = async (
  itineraryId: string,
  pricing: {
    is_paid: boolean;
    price_cents: number;
  }
) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Paid pricing requires Stripe Connect; unpaid/free listings do not.
  if (pricing.is_paid) {
    const { data: userSettings, error: settingsError } = await supabase
      .from('users_settings')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (settingsError) throw new Error("Could not verify seller account")
    if (!userSettings?.stripe_account_id) {
      throw new Error("Connect a Stripe seller account before setting pricing")
    }
  }

  // Verify the user is the creator
  const { data: itinerary, error: fetchError } = await supabase
    .from('itineraries')
    .select('creator_id')
    .eq('id', itineraryId)
    .single()

  if (fetchError) throw new Error("Itinerary not found")
  if (itinerary.creator_id !== user.id) throw new Error("You are not authorized to update this itinerary")

  if (pricing.is_paid && (!Number.isFinite(pricing.price_cents) || pricing.price_cents < 50)) {
    throw new Error("Paid itineraries need a price of at least $0.50")
  }

  // Update the pricing
  const { error } = await supabase
    .from('itineraries')
    .update({
      is_paid: pricing.is_paid,
      price_cents: pricing.is_paid ? pricing.price_cents : 0,
    })
    .eq('id', itineraryId)

  if (error) {
    console.error("Update Error:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

export const updateItineraryTemplate = async (
  itineraryId: string,
  template: ItineraryTemplate
) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: itinerary, error: fetchError } = await supabase
    .from("itineraries")
    .select("creator_id")
    .eq("id", itineraryId)
    .single();

  if (fetchError) throw new Error("Itinerary not found");
  if (itinerary.creator_id !== user.id) {
    throw new Error("You are not authorized to update this itinerary");
  }

  const { error } = await supabase
    .from("itineraries")
    .update({ template })
    .eq("id", itineraryId);

  if (error) {
    console.error("Update template error:", error);
    throw new Error(error.message);
  }

  return { success: true };
};

export const updateItinerarySearchable = async (
  itineraryId: string,
  isSearchable: boolean
) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { data: itinerary, error: fetchError } = await supabase
    .from("itineraries")
    .select("creator_id")
    .eq("id", itineraryId)
    .single()

  if (fetchError) throw new Error("Itinerary not found")
  if (itinerary.creator_id !== user.id) {
    throw new Error("You are not authorized to update this itinerary")
  }

  const { error } = await supabase
    .from("itineraries")
    .update({ is_searchable: isSearchable })
    .eq("id", itineraryId)

  if (error) {
    console.error("Update searchable error:", error)
    throw new Error(error.message)
  }

  return { success: true }
}
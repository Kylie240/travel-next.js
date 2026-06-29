import { getItineraryIdPrefix, slugifyItineraryTitle } from "@/lib/utils/itinerary-slug"

export type ItineraryLinkFields = {
  id: string
  slug?: string | null
  title?: string | null
}

export function getItinerarySlug(itinerary: ItineraryLinkFields): string {
  if (itinerary.slug?.trim()) return itinerary.slug.trim()
  if (itinerary.title?.trim()) return slugifyItineraryTitle(itinerary.title)
  return "itinerary"
}

/** Canonical path: /itinerary/{id-prefix}/{slug} */
export function getItineraryPath(itinerary: ItineraryLinkFields): string {
  const prefix = getItineraryIdPrefix(itinerary.id)
  const slug = getItinerarySlug(itinerary)
  return `/itinerary/${prefix}/${slug}`
}

export function getItineraryPublicUrl(
  itinerary: ItineraryLinkFields,
  baseUrl = "https://www.journli.com"
): string {
  const normalizedBase = baseUrl.replace(/\/$/, "")
  return `${normalizedBase}${getItineraryPath(itinerary)}`
}

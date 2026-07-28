import type { Metadata } from "next"
import { getDefaultOgImages } from "@/lib/seo/og"

const INDEXABLE_PARAM_ALLOWLIST = new Set([
  // page=1 is equivalent to no page; handled separately
])

function firstString(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0]
  return typeof value === "string" ? value : undefined
}

function hasMeaningfulFilters(
  params: Record<string, string | string[] | undefined>
): boolean {
  const keys = Object.keys(params).filter((key) => {
    const value = params[key]
    if (value == null || value === "") return false
    if (key === "page") {
      const page = parseInt(String(Array.isArray(value) ? value[0] : value), 10)
      return Number.isFinite(page) && page > 1
    }
    if (key === "sort") {
      const sort = String(Array.isArray(value) ? value[0] : value)
      return sort !== "most-recent" && sort !== ""
    }
    if (key === "quickFilter") {
      const qf = String(Array.isArray(value) ? value[0] : value)
      return qf !== "All" && qf !== ""
    }
    return !INDEXABLE_PARAM_ALLOWLIST.has(key)
  })
  return keys.length > 0
}

function buildExploreDescription(
  params: Record<string, string | string[] | undefined>
): string {
  const destination = firstString(params.destination)?.trim()
  const duration = firstString(params.duration)?.trim()
  const budget = firstString(params.budget)?.trim()

  const bits: string[] = []
  if (destination) bits.push(destination)
  if (duration) bits.push(`${duration} day trips`)
  if (budget) bits.push(budget.toLowerCase())

  if (bits.length) {
    return `Browse ${bits.join(" · ")} travel itineraries from real travelers on Journli.`
  }

  return "Browse public travel itineraries from travelers around the world. Filter by destination, duration, and budget on Journli."
}

function buildExploreTitle(
  params: Record<string, string | string[] | undefined>
): string {
  const destination = firstString(params.destination)?.trim()
  if (destination) return `Explore ${destination} itineraries`
  return "Explore itineraries"
}

/**
 * Explore SEO:
 * - Clean `/explore` is indexable.
 * - Filtered / paginated URLs stay usable but canonicalize to `/explore`
 *   and are noindex to avoid thin duplicate index entries.
 */
export function buildExploreMetadata(
  params: Record<string, string | string[] | undefined>
): Metadata {
  const filtered = hasMeaningfulFilters(params)
  const title = buildExploreTitle(params)
  const description = buildExploreDescription(params)
  const ogImages = getDefaultOgImages()

  return {
    title,
    description,
    alternates: {
      canonical: "/explore",
    },
    robots: filtered
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/explore",
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  }
}

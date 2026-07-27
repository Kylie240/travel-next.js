import { getSiteUrl } from "@/lib/site-url"
import { getItineraryPublicUrl } from "@/lib/utils/itinerary-url"

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function buildOrganizationJsonLd() {
  const site = getSiteUrl()
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Journli",
    url: site,
    logo: `${site}/favicon.ico`,
    description:
      "Discover, create, and share travel itineraries with fellow travelers around the world.",
  }
}

export function buildWebsiteJsonLd() {
  const site = getSiteUrl()
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Journli",
    url: site,
    description:
      "Create and share travel itineraries with fellow travelers around the world.",
    publisher: {
      "@type": "Organization",
      name: "Journli",
      url: site,
    },
  }
}

type ItineraryJsonLdInput = {
  id: string
  title: string
  slug?: string | null
  shortDescription?: string | null
  mainImage?: string | null
  countries?: string[]
  duration?: number | null
  isPaid?: boolean | null
  priceCents?: number | null
  creatorName?: string | null
  creatorUsername?: string | null
  updatedAt?: string | null
}

export function buildItineraryJsonLd(input: ItineraryJsonLdInput) {
  const site = getSiteUrl()
  const url = getItineraryPublicUrl(
    { id: input.id, slug: input.slug, title: input.title },
    site
  )

  const destinations =
    input.countries?.filter(Boolean).map((name) => ({
      "@type": "Place",
      name,
    })) ?? []

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: input.title,
    description:
      input.shortDescription?.trim() ||
      `Travel itinerary: ${input.title} on Journli.`,
    url,
    mainEntityOfPage: url,
    image: input.mainImage || undefined,
    touristType: "Travelers",
    itinerary: destinations.length
      ? {
          "@type": "ItemList",
          itemListElement: destinations.map((place, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: place,
          })),
        }
      : undefined,
    provider: {
      "@type": "Organization",
      name: "Journli",
      url: site,
    },
    author: input.creatorName
      ? {
          "@type": "Person",
          name: input.creatorName,
          url: input.creatorUsername
            ? `${site}/profile/${input.creatorUsername}`
            : undefined,
        }
      : undefined,
    dateModified: input.updatedAt || undefined,
  }

  if (input.duration && input.duration > 0) {
    base.duration = `P${Math.round(input.duration)}D`
  }

  if (input.isPaid && input.priceCents != null && input.priceCents > 0) {
    base.offers = {
      "@type": "Offer",
      price: (input.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      url,
      availability: "https://schema.org/InStock",
    }
  }

  return base
}

type PersonJsonLdInput = {
  name: string
  username: string
  bio?: string | null
  avatar?: string | null
  sameAs?: (string | null | undefined)[]
}

export function buildPersonJsonLd(input: PersonJsonLdInput) {
  const site = getSiteUrl()
  const profilePath = `/profile/${encodeURIComponent(input.username)}`
  const url = `${site}${profilePath}`

  const sameAs = (input.sameAs || []).filter(
    (link): link is string => typeof link === "string" && link.trim().length > 0
  )

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    alternateName: input.username,
    description:
      input.bio?.trim() ||
      `${input.name} (@${input.username}) on Journli — travel itineraries.`,
    url,
    mainEntityOfPage: url,
    image: input.avatar || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  }
}

import { getSiteUrl } from "@/lib/site-url"
import { getItineraryPath } from "@/lib/utils/itinerary-url"

export type BreadcrumbItem = {
  name: string
  href?: string
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const site = getSiteUrl()
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href
        ? {
            item: item.href.startsWith("http")
              ? item.href
              : `${site}${item.href}`,
          }
        : {}),
    })),
  }
}

export function buildExploreBreadcrumbs(
  destination?: string | null
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Destinations", href: "/explore" },
  ]

  if (destination?.trim()) {
    items.push({
      name: destination.trim(),
      href: `/explore?destination=${encodeURIComponent(destination.trim())}`,
    })
  }

  return items
}

/** Home > Destinations > [Country] > Itinerary title */
export function buildItineraryBreadcrumbs(input: {
  title: string
  id: string
  slug?: string | null
  countries?: string[]
}): BreadcrumbItem[] {
  const primaryCountry = input.countries?.find((c) => c?.trim())?.trim()
  const items: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Destinations", href: "/explore" },
  ]

  if (primaryCountry) {
    items.push({
      name: primaryCountry,
      href: `/explore?destination=${encodeURIComponent(primaryCountry)}`,
    })
  }

  items.push({
    name: input.title.trim() || "Itinerary",
    href: getItineraryPath({
      id: input.id,
      slug: input.slug,
      title: input.title,
    }),
  })

  return items
}

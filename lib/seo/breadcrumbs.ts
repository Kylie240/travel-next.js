import { getContinentForCountry } from "@/lib/constants/country-continents"
import { getSiteUrl } from "@/lib/site-url"

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

/** Destinations > [Continent] > [Country] */
export function buildItineraryBreadcrumbs(input: {
  countries?: string[]
}): BreadcrumbItem[] {
  const primaryCountry = input.countries?.find((c) => c?.trim())?.trim()
  const items: BreadcrumbItem[] = [
    { name: "Destinations", href: "/explore" },
  ]

  if (!primaryCountry) return items

  const continent = getContinentForCountry(primaryCountry)
  if (continent) {
    items.push({
      name: continent,
      href: `/explore?continents=${encodeURIComponent(continent)}`,
    })
  }

  items.push({
    name: primaryCountry,
    href: `/explore?destination=${encodeURIComponent(primaryCountry)}`,
  })

  return items
}

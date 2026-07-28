import { getSiteUrl } from "@/lib/site-url"

/** Default branded Open Graph / Twitter share image. */
export const DEFAULT_OG_IMAGE_PATH = "/og-default.png"

export function getDefaultOgImageUrl(): string {
  return `${getSiteUrl()}${DEFAULT_OG_IMAGE_PATH}`
}

export function getDefaultOgImages() {
  return [
    {
      url: DEFAULT_OG_IMAGE_PATH,
      width: 1200,
      height: 630,
      alt: "Journli — create and share travel itineraries",
    },
  ]
}

/** Prefer a content image when present; otherwise the branded default. */
export function resolveOgImages(imageUrl?: string | null) {
  const trimmed = imageUrl?.trim()
  if (trimmed) {
    return [{ url: trimmed }]
  }
  return getDefaultOgImages()
}

export function resolveOgImageUrls(imageUrl?: string | null): string[] {
  const trimmed = imageUrl?.trim()
  if (trimmed) return [trimmed]
  return [DEFAULT_OG_IMAGE_PATH]
}

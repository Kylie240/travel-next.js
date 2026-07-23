/** Canonical production site origin for SEO (metadata, sitemap, JSON-LD). */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) {
    return configured
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`
  }
  return "https://www.journli.com"
}

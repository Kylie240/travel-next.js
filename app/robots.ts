import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl()
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/create",
          "/account-settings",
          "/seller-dashboard",
          "/my-itineraries",
          "/saves",
          "/purchased",
          "/cart",
          "/purchase",
          "/success",
          "/canceled",
          "/auth/",
          "/login",
          "/itinerary-settings/",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  }
}

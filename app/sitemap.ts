import type { MetadataRoute } from "next"
import { createClient as createAdminClient } from "@/utils/supabase/server-admin"
import { ItineraryStatusEnum, viewPermissionEnum } from "@/enums/itineraryStatusEnum"
import { getItineraryPath } from "@/lib/utils/itinerary-url"
import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"
export const revalidate = 3600

const STATIC_PATHS: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority: number
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/plans", changeFrequency: "monthly", priority: 0.8 },
  { path: "/become-a-seller", changeFrequency: "monthly", priority: 0.7 },
  { path: "/landing", changeFrequency: "monthly", priority: 0.6 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/seller-agreement", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/cookies", changeFrequency: "yearly", priority: 0.2 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl()
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((entry) => ({
    url: `${site}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }))

  let itineraryEntries: MetadataRoute.Sitemap = []
  let profileEntries: MetadataRoute.Sitemap = []

  try {
    const supabase = createAdminClient()

    const { data: itineraries } = await supabase
      .from("itineraries")
      .select("id, title, slug, updated_at")
      .eq("status", ItineraryStatusEnum.published)
      .eq("view_permission", viewPermissionEnum.public)
      .order("updated_at", { ascending: false })
      .limit(5000)

    itineraryEntries = (itineraries || []).map((row) => {
      const path = getItineraryPath({
        id: String(row.id),
        slug: row.slug,
        title: row.title,
      })
      const safePath = path
        .split("/")
        .map((segment) => (segment ? encodeURIComponent(segment) : ""))
        .join("/")

      return {
        url: `${site}${safePath}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }
    })

    const { data: publicSettings } = await supabase
      .from("users_settings")
      .select("user_id")
      .eq("is_private", false)
      .limit(5000)

    const publicUserIds = (publicSettings || [])
      .map((row) => row.user_id as string)
      .filter(Boolean)

    if (publicUserIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("username, updated_at")
        .in("id", publicUserIds)
        .not("username", "is", null)
        .limit(5000)

      profileEntries = (users || [])
        .filter((u) => typeof u.username === "string" && u.username.trim())
        .map((u) => {
          const username = String(u.username).trim().toLowerCase()
          return {
            url: `${site}/profile/${encodeURIComponent(username)}`,
            lastModified: u.updated_at ? new Date(u.updated_at) : now,
            changeFrequency: "weekly" as const,
            priority: 0.5,
          }
        })
    }
  } catch (error) {
    console.error("sitemap generation failed to load dynamic URLs:", error)
  }

  return [...staticEntries, ...itineraryEntries, ...profileEntries]
}

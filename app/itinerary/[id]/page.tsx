import { redirect } from "next/navigation"
import {
  getCanonicalItineraryPath,
  isLegacyItineraryParam,
  resolveItineraryByFullId,
  resolveItineraryByPrefixOnly,
} from "@/lib/itinerary-route"

/** Redirects legacy /itinerary/{uuid} and /itinerary/{prefix} URLs to canonical paths. */
export default async function LegacyItineraryRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (isLegacyItineraryParam(id)) {
    const meta = await resolveItineraryByFullId(id)
    if (!meta) {
      redirect("/not-found")
    }
    redirect(getCanonicalItineraryPath(meta))
  }

  const meta = await resolveItineraryByPrefixOnly(id)
  if (!meta) {
    redirect("/not-found")
  }

  redirect(getCanonicalItineraryPath(meta))
}

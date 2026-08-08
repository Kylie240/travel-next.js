import { Suspense } from "react"
import { getPopularItineraries } from "@/lib/actions/itinerary.actions"
import type { ExplorePageDto } from "@/dtos/ExplorePageDto"
import { PopularItinerariesSection } from "./popular-itineraries-section"
import LandingClient from "./landing-client"

async function PopularItineraries() {
  let popular: ExplorePageDto[] = []
  try {
    popular = await getPopularItineraries(4)
  } catch (err) {
    console.error("Failed to load popular itineraries for landing:", err)
  }
  return <PopularItinerariesSection itineraries={popular} />
}

function PopularItinerariesFallback() {
  return (
    <section className="py-14 px-4 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 w-56 bg-gray-100 rounded mb-8 animate-pulse" />
        <div className="-mx-4 sm:-mx-8 lg:mx-0">
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 sm:px-8 pb-2 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] w-[72vw] max-w-[280px] shrink-0 rounded-2xl bg-gray-100 animate-pulse lg:w-auto lg:max-w-none lg:shrink"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <LandingClient>
      <Suspense fallback={<PopularItinerariesFallback />}>
        <PopularItineraries />
      </Suspense>
    </LandingClient>
  )
}

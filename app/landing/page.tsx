import { Suspense } from "react"
import { getPopularItineraries, getDestinationTripCounts } from "@/lib/actions/itinerary.actions"
import type { ExplorePageDto } from "@/dtos/ExplorePageDto"
import { PopularItinerariesSection } from "./popular-itineraries-section"
import {
  WhereToGoSection,
  type DestinationSpot,
} from "./where-to-go-section"
import LandingClient from "./landing-client"

/** Curated showcase destinations (Exoticca-style “Where to next”). */
const SHOWCASE_DESTINATIONS: Array<{ name: string; imageUrl: string }> = [
  {
    name: "Japan",
    imageUrl:
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Italy",
    imageUrl:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Portugal",
    imageUrl:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Iceland",
    imageUrl:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Indonesia",
    imageUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Morocco",
    imageUrl:
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "France",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Spain",
    imageUrl:
      "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Greece",
    imageUrl:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Thailand",
    imageUrl:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop",
  },
]

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop",
]

async function PopularItineraries() {
  let popular: ExplorePageDto[] = []
  try {
    popular = await getPopularItineraries(4)
  } catch (err) {
    console.error("Failed to load popular itineraries for landing:", err)
  }
  return <PopularItinerariesSection itineraries={popular} />
}

async function WhereToGo() {
  let counts: Array<{ country: string; count: number }> = []
  try {
    counts = await getDestinationTripCounts()
  } catch (err) {
    console.error("Failed to load destination counts for landing:", err)
  }

  const countByName = new Map(
    counts.map((row) => [row.country.toLowerCase(), row.count])
  )
  const showcaseNames = new Set(
    SHOWCASE_DESTINATIONS.map((d) => d.name.toLowerCase())
  )

  const destinations: DestinationSpot[] = SHOWCASE_DESTINATIONS.map((spot) => ({
    name: spot.name,
    imageUrl: spot.imageUrl,
    tripCount: countByName.get(spot.name.toLowerCase()) || 0,
    href: `/explore?destination=${encodeURIComponent(spot.name)}`,
  }))

  // Prefer destinations that already have trips; fill remaining slots from live data.
  const withTrips = destinations
    .filter((d) => d.tripCount > 0)
    .sort((a, b) => b.tripCount - a.tripCount)
  const withoutTrips = destinations.filter((d) => d.tripCount === 0)

  const extras: DestinationSpot[] = counts
    .filter((row) => !showcaseNames.has(row.country.toLowerCase()))
    .slice(0, 10)
    .map((row, index) => ({
      name: row.country,
      imageUrl: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
      tripCount: row.count,
      href: `/explore?destination=${encodeURIComponent(row.country)}`,
    }))

  const merged = [...withTrips, ...extras, ...withoutTrips].slice(0, 10)

  return <WhereToGoSection destinations={merged} />
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

function WhereToGoFallback() {
  return (
    <section className="py-14 px-4 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 w-64 bg-gray-100 rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gray-100 animate-pulse" />
              <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
              <div className="h-3 w-12 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <LandingClient
      destinations={
        <Suspense fallback={<WhereToGoFallback />}>
          <WhereToGo />
        </Suspense>
      }
    >
      <Suspense fallback={<PopularItinerariesFallback />}>
        <PopularItineraries />
      </Suspense>
    </LandingClient>
  )
}

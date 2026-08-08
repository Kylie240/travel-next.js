import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Globe2 } from "lucide-react"
import type { ExplorePageDto } from "@/dtos/ExplorePageDto"
import { getItineraryPath } from "@/lib/utils/itinerary-url"

export function PopularItinerariesSection({
  itineraries,
}: {
  itineraries: ExplorePageDto[]
}) {
  if (!itineraries.length) return null

  return (
    <section className="max-w-6xl px-4 sm:px-8 bg-white">
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Popular itineraries
            </h2>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              Trips travelers are loving right now
            </p>
          </div>
        </div>

        <div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-8 pb-2 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0 lg:snap-none">
            {itineraries.map((itinerary) => (
              <Link
                key={itinerary.id}
                href={getItineraryPath(itinerary)}
                className="block group w-[72vw] max-w-[280px] shrink-0 snap-start lg:w-auto lg:max-w-none lg:shrink"
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-200">
                  {itinerary.mainImage ? (
                    <Image
                      src={itinerary.mainImage}
                      alt={itinerary.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 72vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <Globe2 className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-xs text-white/60 mb-0.5">
                      @{itinerary.creatorName}
                    </p>
                    <h3 className="font-bold text-lg leading-snug line-clamp-2">
                      {itinerary.title}
                    </h3>
                    {itinerary.countries.length > 0 && (
                      <p className="text-sm text-white/80 mt-1 truncate">
                        {itinerary.countries.join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center gap-2 mt-6 text-gray-900 font-medium hover:underline"
        >
          View all on Explore
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}

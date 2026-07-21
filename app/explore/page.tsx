import { Suspense } from "react"
import FiltersForm from "./filters-form"
import Link from "next/link"
import Image from "next/image"
import { getItineraries } from "@/lib/actions/itinerary.actions"
import type { ExplorePageDto } from "@/dtos/ExplorePageDto"
import type { GetItineraryOptions } from "@/types/GetItineraryOptions"
import { Button } from "@/components/ui/button"
import { Globe2 } from "lucide-react"
import { getItineraryPath } from "@/lib/utils/itinerary-url"

function parseListParam(value: unknown): string[] | undefined {
  if (!value) return undefined
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean)
  }
  const str = String(value)
  if (!str.trim()) return undefined
  return str.split(",").map((s) => s.trim()).filter(Boolean)
}

function parseOptionalInt(value: unknown): number | undefined {
  if (value == null || value === "") return undefined
  const n = parseInt(String(value), 10)
  return Number.isFinite(n) ? n : undefined
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const page = parseOptionalInt(params.page) || 1
  const sort = typeof params.sort === "string" ? params.sort : undefined
  const quickFilter =
    typeof params.quickFilter === "string" ? params.quickFilter : undefined
  const destination =
    typeof params.destination === "string" ? params.destination : undefined
  const duration =
    typeof params.duration === "string" ? params.duration : undefined
  const q =
    typeof params.q === "string"
      ? params.q
      : typeof params.query === "string"
        ? params.query
        : undefined

  const budget =
    typeof params.budget === "string" ? params.budget : undefined

  const searchFilters: GetItineraryOptions = {
    pagination: {
      page,
      pageSize: 12,
    },
    filters: {
      sort,
      quickFilter,
      destination,
      duration,
      durationMin: parseOptionalInt(params.durationMin),
      durationMax: parseOptionalInt(params.durationMax),
      budget,
      budgetMin: parseOptionalInt(params.budgetMin),
      budgetMax: parseOptionalInt(params.budgetMax),
      itineraryTags: parseListParam(params.itineraryTags),
      activityTags: parseListParam(params.activityTags),
      continents: parseListParam(params.continents),
      q,
    },
  }

  let itineraryData: Awaited<ReturnType<typeof getItineraries>>
  try {
    itineraryData = await getItineraries(searchFilters)
  } catch (e) {
    console.error("Explore page failed to load itineraries:", e)
    itineraryData = {
      data: [],
      total: 0,
      totalPages: 1,
      currentPage: page,
    }
  }

  const hasResults = itineraryData.data.length > 0

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4">Explore itineraries</h2>
        <div className="flex flex-col mb-8">
          <Suspense fallback={<div>Loading filters…</div>}>
            <FiltersForm resultsCount={itineraryData.total} />
          </Suspense>
        </div>

        {!hasResults ? (
          <div className="mx-auto max-w-[800px] text-center py-16 px-4 rounded-xl border-2 border-dashed">
            <Globe2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No public itineraries found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters, or check back soon as travelers publish
              new trips.
            </p>
            <Link href="/explore">
              <Button variant="outline">Clear search</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
              {itineraryData.data.map((itinerary: ExplorePageDto) => (
                <Link
                  href={getItineraryPath(itinerary)}
                  className="block relative"
                  key={itinerary.id}
                >
                  <div>
                    <div className="relative aspect-[3/2] md:aspect-[4/5] rounded-2xl overflow-hidden bg-gray-200">
                      {itinerary.mainImage ? (
                        <Image
                          src={itinerary.mainImage}
                          alt={itinerary.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <Globe2 className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      {itinerary.featuredCategories?.length > 0 && (
                        <div className="absolute top-4 left-4 z-20">
                          <span className="px-4 py-1.5 bg-black/80 text-white text-sm rounded-xl capitalize">
                            {itinerary.featuredCategories[0]}
                          </span>
                        </div>
                      )}
                      <div className="p-3 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                        <h4 className="font-bold text-2xl mb-1 line-clamp-2">
                          {itinerary.title}
                        </h4>
                        <span className="text-sm text-white/80 truncate block">
                          {itinerary.countries.length > 0
                            ? itinerary.countries.join(" · ")
                            : itinerary.creatorName}
                        </span>
                      </div>
                    </div>

                    <div className="py-2 px-4">
                      <div className="flex text-[20px] font-medium my-1">
                        <div className="mx-1 flex gap-2 flex-wrap">
                          <span>
                            {itinerary.duration}
                            {itinerary.countries.length <= 2
                              ? itinerary.duration > 1
                                ? " Days In "
                                : " Day In "
                              : " Day "}
                          </span>
                          <span>
                            {itinerary.countries.length > 2
                              ? "Multi-Country Trip"
                              : itinerary.countries.length > 0
                                ? itinerary.countries.join(" & ")
                                : "Somewhere amazing"}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 line-clamp-4 leading-5 text-md mb-2">
                        {itinerary.shortDescription}
                      </p>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-start gap-2 flex-wrap">
                          {itinerary.itineraryTags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex mt-1 justify-between items-center">
                          <span className="text-xs text-gray-500 truncate">
                            by {itinerary.creatorName}
                          </span>
                          {itinerary.price != null && itinerary.price > 0 && (
                            <span className="px-2 py-1 max-h-[32px] gap-2 bg-black text-white text-md rounded-xl">
                              Est. ${itinerary.price}/pp
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {itineraryData.totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-10">
                {page > 1 && (
                  <Link
                    href={`/explore?${new URLSearchParams({
                      ...Object.fromEntries(
                        Object.entries(params).map(([k, v]) => [
                          k,
                          Array.isArray(v) ? v.join(",") : String(v ?? ""),
                        ])
                      ),
                      page: String(page - 1),
                    }).toString()}`}
                  >
                    <Button variant="outline">Previous</Button>
                  </Link>
                )}
                <span className="flex items-center text-sm text-gray-600">
                  Page {itineraryData.currentPage} of {itineraryData.totalPages}
                </span>
                {page < itineraryData.totalPages && (
                  <Link
                    href={`/explore?${new URLSearchParams({
                      ...Object.fromEntries(
                        Object.entries(params).map(([k, v]) => [
                          k,
                          Array.isArray(v) ? v.join(",") : String(v ?? ""),
                        ])
                      ),
                      page: String(page + 1),
                    }).toString()}`}
                  >
                    <Button variant="outline">Next</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

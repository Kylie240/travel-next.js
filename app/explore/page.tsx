import { Suspense } from "react";
import FiltersForm from "./filters-form";
import { getItineraries } from "@/data/itineraries";
import Link from "next/link";
import Image from "next/image";
import { Bookmark } from "lucide-react";

export default async function ExplorePage({
searchParams
} : {
    searchParams: Promise<any>
}
) {
    const searchParamsValues = await searchParams;
    const page = searchParamsValues.page;
    const sort = searchParamsValues.sort;
    const quickFilter = searchParamsValues.quickFilter;
    const destination = searchParamsValues.destination;
    const duration = searchParamsValues?.duration;
    const durationMin = searchParamsValues?.durationMin;
    const durationMax = searchParamsValues?.durationMax;
    const budgetMin = searchParamsValues?.budgetMin;
    const budgetMax = searchParamsValues?.budgetMax;
    const itineraryTags = searchParamsValues.itineraryTags;
    const activityTags = searchParamsValues.activityTags;
    const continents = searchParamsValues.continents;

    const itineraries = await getItineraries({
        pagination: {
            page: parseInt(searchParamsValues.page || "1"),
            pageSize: 10
        },
        filters: {
            sort,
            quickFilter,
            destination,
            duration,
            durationMin,
            durationMax,
            budgetMin,
            budgetMax,
            itineraryTags,
            activityTags,
            continents,
            status: ['published'],
        },
    })
    
    return (
        <div className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
                {/* Filters Bar */}
                <div className="flex flex-col mb-8">
                    <Suspense fallback={<div>Loading...</div>}>
                        <FiltersForm />
                    </Suspense>
                </div>
                {/* Itineraries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
          {itineraries.data.map((itinerary) => (
            <Link href={`/itinerary/${itinerary.id}`} className="block relative" key={itinerary.id}>
              
              <div>
                
                {/* Image Container */}
                <div className="relative aspect-[3/2] md:aspect-[4/5] rounded-2xl overflow-hidden">
                    <Image
                      src={itinerary.mainImage}
                      alt={itinerary.name}
                      fill
                      className="object-cover"
                    />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  {/* Badges */}
                  {/* {itinerary.status && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-4 py-1.5 bg-black/80 text-white text-sm rounded-xl capitalize">
                        {itinerary.rating === "highly rated" ? "Top Rated" :
                         itinerary.status === "most viewed" ? "Trending" :
                         "Popular"}
                      </span>
                    </div>
                  )} */}
                  <div className="absolute top-4 right-4">
                    <button className="bg-white/40 text-black hover:bg-white/80 px-2 py-2 rounded-full">
                      <Bookmark className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-3 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                    <h4 className="font-bold text-2xl mb-1">{itinerary.name}</h4>
                    <span className="text-sm text-white/80 truncate">
                      {itinerary.countries.map(country => country.).join(' · ')}
                      {/* change to citiies */}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="py-2 px-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center flex-1">
                    </div>
                  </div>
                  
                  <div className="flex text-[20px] font-medium my-1">
                    {/* change field to duration */}
                  {itinerary.length} 
                  {itinerary.countries.length <= 2  ? 
                    <span className="mx-1">
                      {itinerary.length > 1 ? " days in " : " day in "}
                    </span>
                  :
                  <span className="mx-1">
                    day 
                  </span>
                  }
                    <span className=" mr-1">
                      {itinerary.countries.length > 2 
                        ? "multi-country trip"
                        : itinerary.countries.map(country => country.value).join(' & ')}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-4 leading-5 text-md mb-2">{itinerary.shortDescription}</p>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-start gap-2">
                      {itinerary.itineraryTags.slice(0, 2).map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      {/* are we adding a cost or nah */}
                      {/* {itinerary.price && (
                        <span className="px-2 py-1 max-h-[32px] gap-2 bg-black text-white text-md rounded-xl capitalize">
                          Est. {itinerary.price}
                        </span>
                      )} */}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
            </div>
        </div>
    )
}
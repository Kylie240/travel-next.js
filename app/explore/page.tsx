import { Suspense } from "react";
import FiltersForm from "./filters-form";
import Link from "next/link";
import Image from "next/image";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { getItineraries } from "@/lib/actions/itinerary.actions";
import { Itinerary } from "@/types/itinerary";
import { ExplorePageDto } from "@/dtos/ExplorePageDto";

export default async function ExplorePage({
searchParams
} : {
    searchParams: Promise<any>
}) {
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

    const searchFilters: GetItineraryOptions = {
        pagination: {
            page: parseInt(page || "1"),
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
        },
    }

    const itineraryData : {
      data: ExplorePageDto[],
      total: number,
      totalPages: number,
      currentPage: number
    } = {
            data: [
              {
                id: '1',
                title: 'East Asian Island Hopping Journey',
                duration: 12,
                shortDescription: 'A trip across east asian countries. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
                mainImage: '',
                countries: ['Singapore', 'Thailand', 'Vietnam'],
                cities: ['Phuket', 'Phi Phi Islands', 'Ho Chi Min'],
                itineraryTags: ['Adventure', 'Roadtrip', 'History'],
                activityTags: ['Boating', 'Hiking'],
                featuredCategories: [],
                views: 289,
                rating: 4.2,
                price: 1400,
                likes: 29,
                creatorId: '328',
                creatorName: 'Kylie',
                creatorImage: '',
              },
              {
                id: '2',
                title: 'North American Roadtrip',
                duration: 4,
                shortDescription: 'A trip across North America',
                mainImage: '',
                countries: ['Canada', 'United States'],
                cities: ['Montreal', 'New York', 'Miami'],
                itineraryTags: ['Adventure', 'Roadtrip', 'History'],
                activityTags: ['Boating', 'Hiking'],
                featuredCategories: [],
                views: 289,
                rating: 3.0,
                price: null,
                likes: 29,
                creatorId: '328',
                creatorName: 'Kylie',
                creatorImage: '',
              },
              {
                id: '3',
                title: 'Day Trip To Chicago',
                duration: 1,
                shortDescription: 'A trip across North America',
                mainImage: '',
                countries: ['United States'],
                cities: ['Chicago'],
                itineraryTags: ['Day Trip', 'Solo'],
                activityTags: ['Boating', 'Foodie'],
                featuredCategories: ['Popular'],
                views: 2,
                rating: null,
                price: 200,
                likes: 0,
                creatorId: '328',
                creatorName: 'Kylie',
                creatorImage: '',
              },
              {
                id: '1',
                title: 'East Asian Island Hopping Journey',
                duration: 12,
                shortDescription: 'A trip across east asian countries. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
                mainImage: '',
                countries: ['Singapore', 'Thailand', 'Vietnam'],
                cities: ['Phuket', 'Phi Phi Islands', 'Ho Chi Min'],
                itineraryTags: ['Adventure', 'Roadtrip', 'History'],
                activityTags: ['Boating', 'Hiking'],
                featuredCategories: [],
                views: 289,
                rating: 4.2,
                price: 1400,
                likes: 29,
                creatorId: '328',
                creatorName: 'Kylie',
                creatorImage: '',
              },
              {
                id: '2',
                title: 'North American Roadtrip',
                duration: 4,
                shortDescription: 'A trip across North America',
                mainImage: '',
                countries: ['Canada', 'United States'],
                cities: ['Montreal', 'New York', 'Miami'],
                itineraryTags: ['Adventure', 'Roadtrip', 'History'],
                activityTags: ['Boating', 'Hiking'],
                featuredCategories: [],
                views: 289,
                rating: 3.0,
                price: null,
                likes: 29,
                creatorId: '328',
                creatorName: 'Kylie',
                creatorImage: '',
              },
              {
                id: '3',
                title: 'Day Trip To Chicago',
                duration: 1,
                shortDescription: 'A trip across North America',
                mainImage: '',
                countries: ['United States'],
                cities: ['Chicago'],
                itineraryTags: ['Day Trip', 'Solo'],
                activityTags: ['Boating', 'Foodie'],
                featuredCategories: ['Popular'],
                views: 2,
                rating: null,
                price: 200,
                likes: 0,
                creatorId: '328',
                creatorName: 'Kylie',
                creatorImage: '',
              },
              {
                id: '1',
                title: 'East Asian Island Hopping Journey',
                duration: 12,
                shortDescription: 'A trip across east asian countries. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
                mainImage: '',
                countries: ['Singapore', 'Thailand', 'Vietnam'],
                cities: ['Phuket', 'Phi Phi Islands', 'Ho Chi Min'],
                itineraryTags: ['Adventure', 'Roadtrip', 'History'],
                activityTags: ['Boating', 'Hiking'],
                featuredCategories: [],
                views: 289,
                rating: 4.2,
                price: 1400,
                likes: 29,
                creatorId: '328',
                creatorName: 'Kylie',
                creatorImage: '',
              },
              {
                id: '2',
                title: 'North American Roadtrip',
                duration: 4,
                shortDescription: 'A trip across North America',
                mainImage: '',
                countries: ['Canada', 'United States'],
                cities: ['Montreal', 'New York', 'Miami'],
                itineraryTags: ['Adventure', 'Roadtrip', 'History'],
                activityTags: ['Boating', 'Hiking'],
                featuredCategories: [],
                views: 289,
                rating: 3.0,
                price: null,
                likes: 29,
                creatorId: '328',
                creatorName: 'Kylie',
                creatorImage: '',
              },
              {
                id: '3',
                title: 'Day Trip To Chicago',
                duration: 1,
                shortDescription: 'A trip across North America',
                mainImage: '',
                countries: ['United States'],
                cities: ['Chicago'],
                itineraryTags: ['Day Trip', 'Solo'],
                activityTags: ['Boating', 'Foodie'],
                featuredCategories: ['Popular'],
                views: 2,
                rating: null,
                price: 200,
                likes: 0,
                creatorId: '328',
                creatorName: 'Kylie',
                creatorImage: '',
              },
              ],
            total: 2,
            totalPages: 1,
            currentPage: 1
          }

    // const itineraryData: {
    //         data: ExplorePageDto[],
    //         total: number,
    //         totalPages: number,
    //         currentPage: number
    //     } = await getItineraries(searchFilters)
    
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
                {itineraryData.data.map((itinerary: ExplorePageDto) => (
                  <Link href={`/itinerary/${itinerary.id}`} className="block relative" key={itinerary.id}>
                    <div>
                      {/* Image Container */}
                      <div className="relative aspect-[3/2] md:aspect-[4/5] rounded-2xl overflow-hidden">
                          <Image
                            src={itinerary.mainImage}
                            alt={itinerary.title}
                            fill
                            className="object-cover"
                          />
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                        {/* Badges */}
                        {itinerary.featuredCategories.length && (
                          <div className="absolute top-4 left-4 z-20">
                            <span className="px-4 py-1.5 bg-black/80 text-white text-sm rounded-xl capitalize">
                              {/* {itinerary.rating === "highly rated" ? "Top Rated" :
                              itinerary.status === "most viewed" ? "Trending" :
                              "Popular"} */}
                              {itinerary.featuredCategories[0]}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          <BookmarkButton />
                        </div>
                        <div className="p-3 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                          <h4 className="font-bold text-2xl mb-1">{itinerary.title}</h4>
                          <span className="text-sm text-white/80 truncate">
                            {itinerary.countries.map(country => country).join(' · ')}
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
                          <div className="mx-1 flex gap-2">
                            {itinerary.duration}
                            {itinerary.countries.length <= 2 ? itinerary.duration > 1 ? ' Days In ' : ' Day In ' : ' Day '}
                            {itinerary.countries.length > 2 
                              ? "Multi-Country Trip"
                              : itinerary.countries.map(country => country).join(' & ')}
                          </div>
                        </div>
                        <p className="text-gray-600 line-clamp-4 leading-5 text-md mb-2">{itinerary.shortDescription}</p>

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-start gap-2">
                            {itinerary.itineraryTags && itinerary.itineraryTags.map((tag) => (
                              <span 
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex mt-1 justify-end">
                            {itinerary.price && (
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
            </div>
        </div>
    )
}
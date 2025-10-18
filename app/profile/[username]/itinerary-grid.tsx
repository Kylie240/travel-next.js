"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Star } from "lucide-react"
import BookmarkElement from "@/components/ui/bookmark-element"
import SearchItineraries from "./search-itineraries"

interface ItineraryGridProps {
  itineraryData: any[]
  isPrivate: boolean
  isCurrentUser: boolean
  currentUserId?: string
  savedList?: string[]
}

export default function ItineraryGrid({ 
  itineraryData, 
  isPrivate, 
  isCurrentUser, 
  currentUserId,
  savedList
}: ItineraryGridProps) {
  const [filteredItineraryData, setFilteredItineraryData] = useState(itineraryData)

  const handleSearch = (filteredData: any[]) => {
    setFilteredItineraryData(filteredData)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        {!isPrivate && itineraryData?.length > 6 && (
          <SearchItineraries 
            itineraryData={itineraryData} 
            onSearch={handleSearch}
          />
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {isPrivate ? (
          <div className="col-span-full relative">
            <div className="w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 blur-sm">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="w-full aspect-[2/3] block md:hidden xl:hidden bg-gray-100 rounded-2xl">
                </div>
              ))}
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="w-full aspect-[2/3] hidden md:block xl:hidden bg-gray-100 rounded-2xl">
                </div>
              ))}
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="w-full aspect-[2/3] hidden xl:block bg-gray-100 rounded-2xl">
                </div>
              ))}
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-20 w-20 text-gray-400">
              <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
              </svg>
            </div>
          </div>
        ) : (
          filteredItineraryData?.map((itinerary) => ( 
            <div 
              key={itinerary.id}
              className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
              onClick={() => window.location.href = `/itinerary/${itinerary.id}`}
            >
              <div className="relative aspect-[2/3]">
                <Image
                  src={itinerary.mainImage}
                  alt={itinerary.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              </div>
              <div className="p-4 sm:m-1 md:m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                <p className="text-sm flex flex-wrap items-center gap-1 mt-1 opacity-90">
                  <MapPin size={14} /> {itinerary.countries.map((country) => country).join(" · ")}
                </p>
                <p className="sm:font-medium leading-[18px] sm:leading-6 text-lg sm:text-2xl max-h-[180px] line-clamp-4 overflow-hidden">{itinerary.title}</p>
                <div className="flex mt-1 justify-between items-end">
                  <div>
                    <div className="flex relative items-center">
                      <Star className="h-5 w-5 pb-1 pr-1"/>
                      <p className="text-sm">{itinerary.likes}</p>
                    </div>
                  </div>
                  <div>
                  </div>
                </div>
              </div>
              {!isCurrentUser && currentUserId &&
                <div className="absolute top-2 right-2">
                  <BookmarkElement itineraryId={itinerary.id} currentUserId={currentUserId} color="white" savedList={savedList} />
                </div>
              }
            </div>
          ))
        )}
      </div>
    </div>
  )
}

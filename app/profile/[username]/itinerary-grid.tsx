"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, Ban } from "lucide-react"
import BookmarkElement from "@/components/ui/bookmark-element"
import SearchItineraries from "./search-itineraries"
import { FaRegHeart, FaLock, FaUnlock } from "react-icons/fa6"

interface ItineraryGridProps {
  itineraryData: any[]
  isPrivate: boolean
  isBlockedByViewer?: boolean
  isCurrentUser: boolean
  currentUserId?: string
  savedList?: string[]
}

export default function ItineraryGrid({ 
  itineraryData, 
  isPrivate,
  isBlockedByViewer = false,
  isCurrentUser, 
  currentUserId,
  savedList
}: ItineraryGridProps) {
  const router = useRouter()
  const [filteredItineraryData, setFilteredItineraryData] = useState(itineraryData)
  const isRestricted = isPrivate || isBlockedByViewer

  const handleSearch = (filteredData: any[]) => {
    setFilteredItineraryData(filteredData)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        {!isRestricted && itineraryData?.length > 6 && (
          <SearchItineraries 
            itineraryData={itineraryData} 
            onSearch={handleSearch}
          />
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {isRestricted ? (
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
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 text-gray-500 px-4 text-center">
              {isBlockedByViewer ? (
                <div className="flex flex-col items-center text-gray-400">
                  <Ban className="h-20 w-20" />
                  <h3 className="text-base font-medium text-gray-900 mt-2">
                    You have blocked this user
                  </h3>
                  <p className="text-base font-medium text-gray-700">
                    Unblock this user to view their itineraries and interact with their content.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <FaLock className="h-20 w-20" />
                  <h3 className="text-base font-medium text-gray-900 mt-2">
                    This account is private
                  </h3>
                </div>
              )}
            </div>
          </div>
        ) : (
          filteredItineraryData?.map((itinerary, index) => ( 
            <div 
              key={itinerary.id}
              className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
              onClick={() => router.push(`/itinerary/${itinerary.id}`)}
            >
              <div className="relative aspect-[2/3]">
                <Image
                  src={itinerary.mainImage}
                  alt={itinerary.title}
                  fill
                  className="object-cover"
                  priority={index < 4}
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              </div>
              <div className="p-4 sm:m-1 md:m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                <p className="text-sm flex items-center gap-1 mt-1 opacity-90 overflow-hidden">
                  <MapPin size={14} className="flex-shrink-0" />
                  <span className="truncate">{itinerary.countries.map((country) => country).join(" · ")}</span>
                </p>
                <p className="sm:font-medium leading-[18px] sm:leading-6 text-lg sm:text-2xl max-h-[180px] line-clamp-4 overflow-hidden">{itinerary.title}</p>
                <div className="flex mt-2 justify-between items-end">
                  <div>
                    <div className="flex relative items-center">
                      <FaRegHeart className="h-5 w-5 pr-1"/>
                      <p className="text-sm">{itinerary.likes}</p>
                    </div>
                  </div>
                  <div>
                  </div>
                </div>
              </div>
              {!isCurrentUser && currentUserId &&
                <div className="absolute top-4 left-4 right-4">
                  <div className="flex justify-between items-center">
                      {itinerary.isPaid && !itinerary.isPurchased && (
                        <span className={`px-3 py-2 gap-1.5 flex items-center rounded-full text-sm md:text-md font-semibold capitalize bg-lime-500/70 text-white`}>
                          <FaLock />
                          ${itinerary.priceCents / 100}
                        </span>
                      )}
                      {itinerary.isPaid && itinerary.isPurchased && (
                        <span className={`px-3 py-2 gap-1.5 flex items-center rounded-full text-sm md:text-md font-semibold capitalize bg-gray-700/80 text-white`}>
                          <FaUnlock />
                          Purchased
                        </span>
                      )}
                      {!itinerary.isPaid && (
                        <></>
                      )}
                    <BookmarkElement itineraryId={itinerary.id} currentUserId={currentUserId} color="white" savedList={savedList} />
                  </div>
                </div>
              }
            </div>
          ))
        )}
      </div>
    </div>
  )
}

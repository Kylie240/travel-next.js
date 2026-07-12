"use client";

import { InteractionButtons } from "@/app/itinerary/[id]/interaction-buttons"
import ItineraryGallery from "@/app/itinerary/[id]/itinerary-gallery"
import PdfExportElement from "@/app/itinerary/[id]/pdf-export-element"
import ShareElement from "@/app/itinerary/[id]/share-element"
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum"
import { itineraryTagsMap } from "@/lib/constants/tags"
import { UserData } from "@/lib/types"
import { PhotoItem } from "@/lib/utils/photos"
import { Itinerary } from "@/types/itinerary"
import {
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  DollarSign,
  Lock,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { FiEdit } from "react-icons/fi"
import { Button } from "../ui/button"
import FollowButton from "@/app/itinerary/[id]/follow-button"
import NoteSection from "@/app/itinerary/[id]/note-section"
import { FaUserLarge } from "react-icons/fa6"
import { PurchaseButton } from "../ui/purchase-button"
import ScheduleSection from "@/app/itinerary/[id]/schedule-section"
import { useState } from "react"
import { DaySection } from "@/components/ui/day-section";
import BioSection from "@/app/itinerary/[id]/bio-section";
import { Day } from "@/types/Day";

export type WonderTemplateProps = {
  itinerary: Itinerary
  countries: string[]
  photos: PhotoItem[]
  canEdit: boolean
  /** Reserved for parity with BasicTemplate (future gated features). */
  paidUser?: boolean
  initialIsLiked: boolean
  initialIsSaved: boolean
  initialIsFollowing: boolean
  creator: UserData
  currentUserId: string
  isRestrictedView?: boolean
  priceCents?: number
}

function LocationLine({ countries }: { countries: string[] }) {
  const line =
    countries.length > 0
      ? countries.map((c) => c).join(" · ")
      : "Itinerary"
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
      <MapPin className="h-4 w-4 shrink-0 text-[#0d6b64]" />
      <span className="line-clamp-1">{line}</span>
    </div>
  )
}

export default function WonderTemplate({
  itinerary,
  countries,
  photos,
  canEdit,
  initialIsLiked,
  initialIsSaved,
  initialIsFollowing,
  creator,
  currentUserId,
  isRestrictedView = false,
  priceCents = 0,
  paidUser: _paidUser = false,
}: WonderTemplateProps) {
  void _paidUser
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)

  const toggleDay = (dayNumber: number | null) => {
    if (dayNumber === null) {
      setSelectedDayIndex(null)
      return
    }
    if (selectedDayIndex === dayNumber) {
      setSelectedDayIndex(null)
    } else {
      setSelectedDayIndex(dayNumber)
    }
  }

  if (!itinerary || !creator) {
    return null
  }

  const firstTag = itinerary.itineraryTags?.[0]
  const firstTagName = firstTag
    ? itineraryTagsMap.find((t) => t.id === firstTag)?.name
    : null
  const locationLine =
    countries.length > 0
      ? countries.map((c) => c).join(" · ")
      : itinerary.title
  return (
    <div
      className={`min-h-screen bg-slate-50 flex flex-col pb-12`}
    >
      {/* Full-bleed hero + glass overlay (detail page style) */}
      <div className="w-full md:mt-2 md:px-6 md:max-w-6xl md:mx-auto">
        <div className="hidden md:block w-full my-4 text-center">
          <h1 className="mx-4 font-bold text-5xl">{itinerary.title}</h1>
          <p>by <span className="text-gray-700 mt-2 font-bold text-xl">@{creator.username}</span></p>
        </div>
        <div className="w-full md:rounded-3xl md:shadow-xl">
              <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden md:mt-0 md:h-[520px] md:rounded-3xl">
                {itinerary.mainImage && (
                  <Image
                    src={itinerary.mainImage}
                    alt={itinerary.title || "Itinerary"}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 flex items-end md:items-end">
                  <div className="container h-full px-0 mx-0 lg:mx-auto">
                    <div className="flex h-full flex-col justify-between align-center text-white mx-2 p-4 sm:p-6 md:p-6 md:mb-4 md:ml-4 relative">
                      <div className="w-full my-4 text-center">
                        <h1 className="block md:hidden mx-4 text-center text-5xl font-bold">{itinerary.title}</h1>
                        <p  className="block md:hidden">by <span className="font-bold text-xl">@{creator.username}</span></p>
                      </div>
                      <div className="w-full mt-1 p-4 flex flex-col gap-4">
                        <div className="flex gap-6">
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-white/80">Duration</p>
                            <div className="items-center font-bold text-3xl">
                              {itinerary.duration} {itinerary.duration > 1 ? 'DAYS' : 'DAY'}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-white/80">Destinations</p>
                            <div className="items-center font-bold text-3xl">
                              {countries.length} {countries.length > 1 ? 'STOPS' : 'STOP'}
                            </div>
                          </div>
                          {itinerary?.budget && 
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium text-white/80">Price per person</p>
                              <div className="items-center font-bold text-3xl">
                                ${itinerary?.budget}
                              </div>
                            </div>
                            }
                        </div>
                        <span className="max-w-[500px]">
                          {itinerary.shortDescription}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </div>

      {photos.length > 1 && (
        <div className="max-w-6xl mx-auto w-full px-8 mt-8 mb-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {photos.map((p) => (
              <div
                key={p.id}
                className="relative md:h-30 md:w-30 h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200/60"
              >
                <Image
                  src={p.url}
                  alt={p.title || "Photo"}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {itinerary.detailedOverview && (
        <div className="mt-8 px-8 max-w-6xl mx-auto mb-6">
          <p className="text-xl font-semibold mb-4 text-gray-700">
            Trip Overview
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-900 line-clamp-4">
            {itinerary.detailedOverview}
          </p>
        </div>
      )}

      <div className="w-full px-6 flex justify-center">
        {isRestrictedView ? (
          <div className="mt-8 w-full max-w-[1080px] px-4 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Content</h3>
            <p className="text-gray-600 mb-4">
              Purchase this itinerary to unlock the full day-by-day schedule, detailed notes, and all travel tips.
            </p>
            <div className="text-2xl font-bold text-gray-900 mb-4">
              ${(priceCents / 100).toFixed(2)}
            </div>
            <div className="flex flex-col gap-3 items-center">
              <PurchaseButton
                itinerary={{
                  id: itinerary.id,
                  title: itinerary.title,
                  priceCents: priceCents,
                  mainImage: itinerary.mainImage,
                  creatorName: creator.name || "",
                  creatorUsername: creator.username || "",
                  creatorId: creator.id || "",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="px-4 max-w-[1080px]">
            <div className="sticky w-full top-20 z-50 flex flex-col items-end gap-2">
            <button 
              onClick={() => selectedDayIndex !== null ? toggleDay(null) : toggleDay(0)} 
              className="flex cursor-pointer bg-gray-800 text-white px-3 py-1 rounded-lg items-center gap-2 hover:opacity-80"
            >
              {selectedDayIndex !== null ? (
                <div className='flex text-xs sm:text-sm items-center gap-1' onClick={() => toggleDay(null)}>
                  Close
                  <ChevronUp strokeWidth={3} size={18} />
                </div>
              ) : (
                <div className='flex text-xs sm:text-sm items-center gap-1' onClick={() => toggleDay(0)}>
                  Open
                  <ChevronDown strokeWidth={3} size={18} />
                </div>
              )}
            </button>
            
          </div>
            <div className="flex w-full flex-col">
              {itinerary.days.map((day: Day, index) => (
                <div key={day.id}>
                  <DaySection
                    key={day.id}
                    day={day}
                    isActive={selectedDayIndex === index}
                    onToggle={() => toggleDay(index)}
                    onClose={() => toggleDay(index)}
                    duration={itinerary.duration}
                    template="wonder"
                  />
                </div>
              ))}
            </div>

            {itinerary.notes && itinerary.notes.length > 0 && (
                <div className="max-w-6xl mx-auto w-full px-6 pb-10 mt-6">
                  <p className="text-xl text-center w-full font-medium mt-2 mb-3">
                    Creator Notes
                  </p>
                  <NoteSection notes={itinerary.notes} />
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  )
}

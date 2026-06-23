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
import { MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { FiEdit } from "react-icons/fi"
import { Button } from "../ui/button"
import FollowButton from "@/app/itinerary/[id]/follow-button"
import NoteSection from "@/app/itinerary/[id]/note-section"
import { FaUserLarge } from "react-icons/fa6"
import { PurchaseButton } from "../ui/purchase-button"
import { DaySection } from "../ui/day-section"
import { useState } from "react";

const BRAND = {
  surface: "bg-slate-50",
  card: "bg-white",
  primary: "bg-[#0d6b64]",
  primaryHover: "hover:bg-[#0a5751]",
  primaryText: "text-[#0d6b64]",
  glass: "bg-[#0d6b64]/88 backdrop-blur-xl",
  pill: "text-[#0d6b64] border-[#0d6b64]/20",
  pillActive: "bg-[#0d6b64] text-white border-[#0d6b64]",
}

export type ExploreTemplateProps = {
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
    <div className="flex items-center gap-1.5 text-sm font-medium text-white/80">
      <MapPin className="h-4 w-4 shrink-0 text-white/80" />
      <span className="line-clamp-1">{line}</span>
    </div>
  )
}

export default function DiscoverTemplate({
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
}: ExploreTemplateProps) {
  void _paidUser
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
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)
  const toggleDay = (dayNumber: number) => {
    if (selectedDayIndex === dayNumber) {
      setSelectedDayIndex(null)
    } else {
      setSelectedDayIndex(dayNumber)
    }
  }

  return (
    <div
      className={`min-h-screen ${BRAND.surface} flex flex-col pb-12`}
    >

      {/* Explore-style header */}
      <div className="flex mx-auto w-full pt-8 pb-[80px] bg-gray-900 rounded-bl-3xl">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-start justify-start">
            <div className="min-w-0 flex-1 gap-3 p-8 sm:p-12 md:px-24 md:py-12 flex flex-col">
              <LocationLine countries={countries} />
              <h1 className="mt-2 text-2xl md:q lg:text-4xl md:mb-2 font-bold tracking-tight text-white sm:text-3xl">
                {itinerary.title}
              </h1>
              <p className="text-white/80 text-md lg:text-lg max-w-xl font-light">
                {itinerary.shortDescription}
              </p>
              {/* Category tabs (tags) */}
              <div className="flex flex-wrap gap-2 my-2">
                {itinerary.itineraryTags && itinerary.itineraryTags.map((tag: number) => {
                    const tagData = itineraryTagsMap.find(t => t.id === tag);
                    if (!tagData) return null;
                    return (
                      <span
                        key={tag}
                        className="flex justify-center items-center flex-wrap px-3 py-1 bg-white/10 text-white rounded-full text-xs sm:text-sm font-medium"
                      >
                        {tagData.name}
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center flex-col">
        {photos.length > 1 && (
          <div className="max-w-6xl w-full pl-12 -mt-[80px] mb-4">
            <div className="flex gap-5 md:gap-6 lg:gap-8 overflow-x-auto no-scrollbar">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="relative md:h-[300px] h-[200px] md:w-[230px] sm:h-[250px] sm:w-[190px] w-[150px] lg:w-[300px] lg:h-[400px] shrink-0 overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200/60"
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
            <div className="flex justify-end rounded-2xl overflow-hidden mt-8 max-w-[150px]">
              <ItineraryGallery photos={photos} template="discover" />
            </div>
          </div>
        )}
      </div>

      <div className="w-full mx-auto max-w-6xl px-6 mt-4">
        <h3 className="text-lg mb-2 leading none" htmlFor="detailedOverview">Detailed Overview</h3>
        {itinerary?.detailedOverview && itinerary.detailedOverview}
      </div>

      {itinerary.days &&
        Array.isArray(itinerary.days) &&
        itinerary.days.length > 0 && (
          <>
            <div className="w-full mt-8">
              <div className="w-full overflow-x-auto no-scrollbar my-6 pl-0 pr-6 sm:pr-[10%]">
                <div className="flex flex-col gap-4 sm:gap-3.5">
                  {itinerary.days.map((day, index) => {
                    const isSelected = selectedDayIndex === index
                    const parsedDate = day.date ? new Date(day.date) : null
                    const hasValidDate =
                      parsedDate && !Number.isNaN(parsedDate.getTime())
                    const monthAndDay = hasValidDate
                      ? parsedDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : null
                    const locationLine = [day.cityName, day.countryName]
                      .filter(Boolean)
                      .join(", ")
                    const summaryLine =
                      day.description?.trim() ||
                      locationLine ||
                      `${itinerary.duration} day trip`
                    return (
                      <div
                        key={day.id || index}
                        className="flex flex-col w-full gap-0"
                      >
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleDay(index)}
                          className={`group flex w-full min-h-[96px] items-center gap-4 border border-l-0 py-4 pl-8 pr-4 text-left transition-colors sm:min-h-[104px] sm:gap-5 sm:pr-4 rounded-none rounded-r-2xl ${
                            isSelected
                              ? "border-gray-400/90"
                              : "border-gray-200/90 bg-gray-900 text-white"
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 flex-col gap-1 pr-1">
                            <p className={`text-base font-bold leading-snug ${isSelected ? 'text-gray-900' : 'text-white'} sm:text-[17px]`}>
                              {day.title}
                            </p>
                            <p className={`text-sm font-normal ${isSelected ? 'text-gray-600' : 'text-white/80'}`}>
                              {monthAndDay ?? `Day ${day.id}`}
                            </p>
                            <p className={`line-clamp-2 text-sm leading-snug ${isSelected ? 'text-gray-600' : 'text-white/80'} max-w-[70%]`}>
                              {summaryLine}
                            </p>
                          </div>
                          {/* <div
                            className={`relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl sm:h-[88px] sm:w-[88px] sm:rounded-[1.25rem]}`}
                          >
                            {day.image && (
                              <Image
                                src={day.image}
                                alt={day.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 76px, 88px"
                              />
                            )}
                          </div> */}
                        </button>
                        {isSelected && (
                          <div className="max-w-6xl mx-auto w-full px-6 pb-8 pt-4">
                            <DaySection
                              day={day}
                              isActive={true}
                              onToggle={() => {}}
                              duration={itinerary.duration}
                              template="explore"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            {itinerary.notes && itinerary.notes.length > 0 && (
              <div className="max-w-6xl mx-auto w-full px-6 pb-10 mt-6">
                <p className="text-xl text-center w-full font-medium mt-2 mb-3">
                  Creator Notes
                </p>
                <NoteSection notes={itinerary.notes} />
              </div>
            )}
          </>
        )}
    </div>
  )
}

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
  ChevronLeft,
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

export type JourneyTemplateProps = {
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

export default function JourneyTemplate({
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
}: JourneyTemplateProps) {
  void _paidUser
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0)

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

      {/* Discover-style header */}
      <div className="block max-w-6xl mx-auto w-full px-4 md:px-6 pt-2">
        <div className="flex items-start justify-start gap-4">
          <div className="min-w-0 flex-1 my-2">
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {itinerary.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Full-bleed hero + glass overlay (detail page style) */}
      <div className="mt-2 px-3 md:px-6 w-full md:max-w-6xl md:mx-auto pb-8 pb-[210px] md:pb-[160px]">
        <div className="relative h-[calc(100svh-600px)] min-h-[calc(100svh-600px)] md:min-h-[520px] md:h-auto rounded-3xl overflow-visible">
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-lg">
            {itinerary.mainImage && (
              <Image
                src={itinerary.mainImage}
                alt={itinerary.title}
                fill
                className="object-cover"
                priority
              />
            )}
            {/* <div className="absolute inset-0 bg-black/10 to-transparent" /> */}
          </div>

          <div className="absolute bottom-0 right-0 z-10 gap-2 flex flex-col max-h-[300px] ">
            {photos.length > 1 && (
              <div className="max-w-6xl mx-auto w-full px-8 mt-8 mb-4">
                <div className="flex flex-col gap-3 overflow-x-auto no-scrollbar">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-200 ring-1 ring-slate-200/60"
                    >
                      <Image
                        src={p.url}
                        alt={p.title || "Photo"}
                        fill
                        className="object-cover border border-2 border-white"
                        sizes="160px"
                      />
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl overflow-hidden mt-8 max-w-[150px]">
                  <ItineraryGallery photos={photos} template="discover" />
                </div>
              </div>
            )}
          </div>

          {/* <div className="absolute inset-x-0 bottom-0 -bottom-[220px] md:-bottom-[160px] p-4 md:p-6 lg:p-8 z-20">
            <div
              className={`mx-auto relative max-w-2xl rounded-3xl px-5 py-5 text-gray-900 shadow-2xl sm:px-6 sm:py-6 bg-white`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-900 px-2">
                About this itinerary
              </p>
              <div className="flex items-start gap-2">
                {itinerary.shortDescription && (
                  <div className="py-4">
                    <div className="flex flex-wrap gap-2 my-2">
                      {itinerary.itineraryTags && itinerary.itineraryTags.map((tag: number) => {
                          const tagData = itineraryTagsMap.find(t => t.id === tag);
                          if (!tagData) return null;
                          return (
                            <span
                              key={tag}
                              className="flex justify-center items-center flex-wrap px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium"
                            >
                              {tagData.name}
                            </span>
                          );
                        })}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-gray-900 line-clamp-4 px-2">
                      {itinerary.shortDescription}
                    </p>
                    {itinerary.detailedOverview &&
                      itinerary.detailedOverview.length > 50 && (
                        <p className="mt-2 text-xs text-gray-700 px-2">
                          Scroll for full details &amp; day-by-day schedule
                        </p>
                      )}
                  </div>
                )}
            </div>
              <div className="flex flex-wrap w-full justify-between border-t border-gray-200 pt-4">
                  <div>
                    <Link href={`/profile/${creator.username || ''}`} className="min-w-[100px] md:w-full cursor-pointer">
                      <div className="flex items-center gap-2 px-1">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                          {creator.avatar && creator.avatar.length > 0 ? (
                            <Image
                              src={creator.avatar}
                              alt={creator.name || "Creator"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="relative h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <FaUserLarge className="h-10 w-10 mt-2 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex flex-col">
                            <p className="text-xl font-medium">{creator.name}</p>
                            <p className="text-gray-500">@{creator.username}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="flex w-fit gap-4 justify-end items-end">
                    <div className="hidden md:block md:w-1/2">
                      <Link href={`/profile/${creator.username}`} className="hidden md:block">
                        <Button variant="outline" className="cursor-pointer border flex justify-center items-center w-full p-2 hover:bg-gray-100">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                    {currentUserId === itinerary.creatorId ? (
                      <Link className="min-w-[100px] md:w-1/2" href={`/account-settings?tab=${encodeURIComponent('Profile')}`}>
                        <Button className="cursor-pointer border flex justify-center items-center w-full p-2 hover:bg-gray-800 text-white">
                          Edit Profile
                        </Button>
                      </Link>
                      ) : (
                        <div className="min-w-[100px] md:w-1/2">
                          <FollowButton 
                            creatorId={itinerary.creatorId} 
                            userId={currentUserId || ""} 
                            initialIsFollowing={initialIsFollowing}
                          />
                        </div>
                      )}
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  <BioSection bio={creator.bio} />
                </div>
              </div>
          </div> */}
        </div>
      </div>

      {itinerary.detailedOverview && (
        <div className="mt-8 px-8 max-w-6xl mx-auto">
          <p className="text-xl font-semibold mb-4 text-gray-700">
            Trip Overview
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-900 line-clamp-4">
            {itinerary.detailedOverview}
          </p>
        </div>
      )}

      {photos.length > 1 && (
        <div className="max-w-6xl mx-auto w-full px-8 mt-8 mb-4">
          <div className="flex flex-col gap-3 overflow-x-auto no-scrollbar border border-1 border-white">
            {photos.map((p) => (
              <div
                key={p.id}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-200 ring-1 ring-slate-200/60"
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
          <div className="rounded-2xl overflow-hidden mt-8 max-w-[150px]">
            <ItineraryGallery photos={photos} template="discover" />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto w-full mt-8 px-6">
        {/* Day Images Gallery */}
        {itinerary.days && Array.isArray(itinerary.days) && itinerary.days.some(day => day.image) && (
          <>
            <div className="w-full px-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Select a day</h2>
              <div className="w-full overflow-x-auto no-scrollbar my-6">
                <div className="flex gap-4 sm:gap-4">
                  {itinerary.days.map((day, index) => {
                    const isSelected = selectedDayIndex === index;
                    const parsedDate = day.date ? new Date(day.date) : null
                    const hasValidDate =
                      parsedDate && !Number.isNaN(parsedDate.getTime())
                    const formattedDate = hasValidDate
                      ? parsedDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : null
                    return (
                      <div
                        key={day.id || index}
                        onClick={() => setSelectedDayIndex(index)}
                        className={`relative inline-flex min-w-[60px] min-h-[80px] rounded-xl overflow-hidden items-end justify-center transition-all cursor-pointer group ${
                          isSelected ? 'shadow-sm shadow-black/10 bg-gray-900 text-white ring-1' : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <div className="relative px-3 py-2 whitespace-nowrap text-center">
                          {formattedDate ? (
                            <>
                              <p className="text-[14px] leading-tight">
                                {formattedDate.split(" ")[0]}
                              </p>
                              <p className="text-[25px] font-bold leading-tight">
                                {formattedDate.split(" ")[1]}
                              </p>
                            </>
                          ) : (
                            <>
                            <p className="text-[14px] leading-tight">
                              Day
                            </p>
                            <p className="text-[25px] font-bold leading-tight">
                              {day.id}
                            </p>
                          </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="pr-4" />
                </div>
              </div>
            </div>
            
            {/* Selected Day Schedule */}
            {itinerary.days[selectedDayIndex] && (
              <div className="w-full pb-8">
                <DaySection
                  day={itinerary.days[selectedDayIndex]}
                  isActive={true}
                  onToggle={() => {}}
                  duration={itinerary.days.length}
                  template="discover"
                />
              </div>
            )}
            {itinerary.notes && itinerary.notes.length > 0 && (
              <div className="w-full pb-10 mt-6 px-4">
                <p className="text-xl text-center w-full font-medium mt-2 mb-3">
                  Creator Notes
                </p>
                <NoteSection notes={itinerary.notes} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

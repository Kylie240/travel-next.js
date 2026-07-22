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
import { Lock, MapPin } from "lucide-react"
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
import BioSection from "@/app/itinerary/[id]/bio-section";
import PhotoGallery from "@/components/ui/photo-gallery";

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
  sellerPurchasesEnabled?: boolean
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

export default function ExploreTemplate({
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
  sellerPurchasesEnabled = true,
}: ExploreTemplateProps) {
  void _paidUser
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const openGalleryAt = (index: number) => {
    setGalleryIndex(index)
    setIsGalleryOpen(true)
  }

  const toggleDay = (dayNumber: number) => {
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
      className={`min-h-screen ${BRAND.surface} flex flex-col pb-12`}
    >

      {/* Explore-style header */}
      <div className="flex mx-auto w-full pt-8 pb-[80px] bg-gray-900" style={{ borderRadius: '0 0 0 4rem' }}>
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-start justify-start">
            <div className="min-w-0 flex-1 gap-3 p-8 sm:p-12 md:px-24 md:py-12 flex flex-col">
              <LocationLine countries={countries} />
              <h1 className="mt-2 text-2xl md:text-3xl lg:text-4xl md:mb-2 font-bold tracking-tight text-white sm:text-3xl">
                {itinerary.title}
              </h1>
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
              <p className="text-white/80 text-md lg:text-lg max-w-xl font-light">
                {itinerary.shortDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center flex-col">
        {photos.length > 0 && (
          <div className="max-w-6xl w-full pl-12 -mt-[60px] mb-4">
            <div className="flex gap-5 md:gap-6 lg:gap-8 overflow-x-auto no-scrollbar">
              {photos.map((p, index) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openGalleryAt(index)}
                  className="relative md:h-[300px] h-[200px] md:w-[230px] sm:h-[250px] sm:w-[190px] w-[150px] lg:w-[300px] lg:h-[400px] shrink-0 overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200/60 cursor-pointer transition-shadow hover:ring-2 hover:ring-gray-400"
                  aria-label={`View ${p.title || "photo"}`}
                >
                  <Image
                    src={p.url}
                    alt={p.title || "Photo"}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </button>
              ))}
            </div>
            {photos.length > 3 && (
              <div className="flex justify-end rounded-2xl overflow-hidden mt-8 max-w-[150px]">
                <ItineraryGallery photos={photos} template="discover" />
              </div>
            )}
          </div>
        )}
      </div>

      {isGalleryOpen && (
        <PhotoGallery
          key={galleryIndex}
          photos={photos}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          initialIndex={galleryIndex}
        />
      )}

      <div className="flex flex-col gap-8 w-full mx-auto max-w-6xl px-8 mt-2">
        {itinerary?.detailedOverview && (
          <div>
            <span className="flex justify-between items-center w-full">
              <h3 className="text-lg leading-none font-semibold">Detailed Overview</h3>
              <div className="flex items-center">
                {currentUserId !== itinerary.creatorId && (
                  <InteractionButtons 
                    itineraryId={itinerary.id} 
                    initialIsLiked={initialIsLiked}
                    initialIsSaved={initialIsSaved}
                  />
                )}
                {canEdit &&
                  <Link href={`/create?itineraryId=${itinerary.id}`}>
                    <FiEdit size={35} className={`transition-colors cursor-pointer h-10 w-10 text-black hover:bg-gray-100 rounded-lg p-2`}/>
                  </Link>
                }
                {(!isRestrictedView || canEdit) && (
                  <PdfExportElement itineraryId={itinerary.id} itineraryStatus={itinerary.status} smallButton={false} />
                )}
                {itinerary.status === ItineraryStatusEnum.published && 
                  <ShareElement id={itinerary.id} slug={itinerary.slug} title={itinerary.title} shape="square" backgroundColor="gray-100" color="black" />
                }
              </div>
            </span>
            <p className="mt-1 text-sm leading-relaxed text-gray-900 line-clamp-4">
              {itinerary.detailedOverview}
            </p>
          </div>
        )}

        <div className="p-4 border rounded-2xl">
          {creator.bio && creator.bio.length > 0 && (
            <p className="text-md hidden md:block font-medium px-2 mb-2">About the Creator</p>
          )}
          <div className="flex flex-wrap w-full justify-between">
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
            <div className="flex w-fit gap-4 justify-end items-start">
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
        {!isRestrictedView && 
          <h3 className="text-lg mt-6 leading-none font-semibold">Itinerary</h3>
        }
      </div>


      {isRestrictedView ? (
          <div className="mt-8 w-full max-w-[1080px] mx-auto px-4 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 text-center">
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
                purchasesEnabled={sellerPurchasesEnabled}
              />
            </div>
          </div>
        ) : (
          <>
            {itinerary.days && 
              Array.isArray(itinerary.days) &&
              itinerary.days.length > 0 && (
                <>
                  <div className="w-full">
                    <div className="w-full overflow-x-auto no-scrollbar my-6 pl-0 pr-6">
                      <div className="flex flex-col gap-8">
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
                                style={{ borderRadius: '0 2.2rem 2.2rem 0' }}
                                onClick={() => toggleDay(index)}
                                className={`group relative flex w-full min-h-[120px] items-center gap-4 border border-l-0 py-4 pl-8 pr-4 text-left transition-colors sm:gap-5 sm:pr-4 rounded-none ${
                                  isSelected
                                    ? "bg-white border-1 border-gray-900"
                                    : "border-gray-200/90 bg-gray-900 text-white"
                                }
                                ${day.id === itinerary.days.length ? 'mb-6' : ''}`}
                              >
                                {(day.activities?.length > 0 || day.accommodation?.name || day.notes?.length > 0) && (
                                  <div className={`absolute flex gap-2 bottom-[-20px] right-[50px] text-sm font-normal ${!isSelected ? 'bg-white text-black' : 'bg-gray-900 text-white'} shadow-md p-3 rounded-md`}>
                                    {day.activities && day.activities.length > 0 && (
                                      <p className="">
                                        <strong> Activities: </strong> {day.activities.length}
                                      </p>
                                    )}
                                    {day.accommodation?.name && (
                                      <p className="">
                                        <strong> Accomodation: </strong> {day.accommodation?.name}
                                      </p>
                                    )}
                                    {day.notes && day.notes.length > 0 && (
                                      <p className="">
                                        <strong> Notes: </strong> {day.notes.length}
                                      </p>
                                    )}
                                  </div>
                                )}
                                <div className={`flex min-w-0 flex-1 flex-col gap-1 pr-1 ${day.activities?.length > 0 || day.accommodation?.name || day.notes?.length > 0 ? 'mb-6' : ''}`}>
                                  <p className={`text-sm font-normal ${isSelected ? 'text-gray-600' : 'text-white/80'}`}>
                                    {monthAndDay ?? `Day ${day.id}`}
                                  </p>
                                  <p className={`text-2xl font-bold leading-snug ${isSelected ? 'text-gray-900' : 'text-white'}`}>
                                    {day.title}
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
          </>
        )}
    </div>
  )
}

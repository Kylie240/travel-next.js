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
import PhotoGallery from "@/components/ui/photo-gallery";

export type DiscoverTemplateProps = {
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
    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
      <MapPin className="h-4 w-4 shrink-0 text-[#0d6b64]" />
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
  sellerPurchasesEnabled = true,
}: DiscoverTemplateProps) {
  void _paidUser
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const openGalleryAt = (index: number) => {
    setGalleryIndex(index)
    setIsGalleryOpen(true)
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
      <div className="mt-2 px-3 md:px-6 w-full md:max-w-6xl md:mx-auto pb-8 pb-[280px] md:pb-[160px]">
        <div className="relative h-[calc(100svh-600px)] min-h-[400px] md:min-h-[520px] md:h-auto rounded-3xl overflow-visible">
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            {itinerary.mainImage && (
              <Image
                src={itinerary.mainImage}
                alt={itinerary.title}
                fill
                className="object-cover"
                priority
              />
            )}
            {/* <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" /> */}
          </div>              
          <div className="absolute top-6 right-6 z-10 flex flex-col items-center gap-3">
            {currentUserId !== itinerary.creatorId && (
              <InteractionButtons 
                itineraryId={itinerary.id} 
                initialIsLiked={initialIsLiked}
                initialIsSaved={initialIsSaved}
                columnLayout={true}
                color="white"
                smallButton={true}
              />
            )}
            {canEdit &&
              <Link href={`/create?itineraryId=${itinerary.id}`}>
                <FiEdit size={24} className={`transition-colors cursor-pointer h-10 w-10 p-2 text-black bg-white/40 hover:bg-white/80 rounded-lg`}/>
              </Link>
            }
            {(!isRestrictedView || canEdit) && (
              <div className="inline-flex shrink-0 items-center bg-white/40 rounded-lg">
                <PdfExportElement itineraryId={itinerary.id} itineraryStatus={itinerary.status} smallButton={false} />
              </div>
            )}
            {itinerary.status === ItineraryStatusEnum.published && 
              <ShareElement id={itinerary.id} slug={itinerary.slug} title={itinerary.title} shape="square" backgroundColor="white" color="black" smallButton={false} />
            }
          </div>

          <div className="absolute inset-x-0 -bottom-[280px] md:-bottom-[160px] p-4 md:p-6 lg:p-8 z-20">
            <div
              className={`mx-auto relative max-w-2xl rounded-3xl px-5 py-5 text-gray-900 shadow-2xl sm:px-6 sm:py-6 bg-white`}
            >
              <h1 className="mt-2 ml-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {itinerary.title}
              </h1>
              <div className="w-full flex justify-start items-center mx-2">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-900">
                  {typeof itinerary.rating === "number" && !Number.isNaN(itinerary.rating) && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-300 text-amber-200" />
                      {itinerary.rating.toFixed(1)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 opacity-90" />
                    {itinerary.duration}{" "}
                    {itinerary.duration === 1 ? "day" : "days"}
                  </span>
                  {itinerary.budget != null && (
                    <span className="inline-flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 opacity-90" />
                      {itinerary.budget}
                      <span className="text-gray-900">/ person</span>
                    </span>
                  )}
                  {typeof itinerary.likes === "number" && (
                    <span className="inline-flex items-center gap-1.5 text-white/85">
                      {itinerary.likes} likes
                    </span>
                  )}
                  <LocationLine countries={countries} />
                </div>  
              </div>
              <p className="text-xs mt-1 py-2 font-semibold uppercase tracking-wide text-gray-900 px-2">
                About this itinerary
              </p>
              <div className="flex items-start gap-2">
                {itinerary.shortDescription && (
                  <div className="pb-4">
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
                  <div className="flex w-fit gap-4 justify-end items-center">
                    <div className="md:w-1/2">
                      <Link href={`/profile/${creator.username}`}>
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
                <div className="text-xs line-height-1 mt-2 space-y-2">
                  {/* {creator.bio} */}
                  {/* <BioSection bio={creator.bio} /> */}
                </div>
              </div>
          </div>
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
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Photos</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {photos.map((p, index) => (
              <button
                key={p.id}
                type="button"
                onClick={() => openGalleryAt(index)}
                className="relative md:h-60 md:w-60 h-40 w-40 sm:h-50 sm:w-50 shrink-0 overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200/60 cursor-pointer transition-shadow hover:ring-2 hover:ring-gray-400"
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
          <div className="rounded-2xl overflow-hidden mt-8 max-w-[150px]">
            <ItineraryGallery photos={photos} template="discover" />
          </div>
        </div>
      )}

      {isGalleryOpen && (
        <PhotoGallery
          key={galleryIndex}
          photos={photos}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          initialIndex={galleryIndex}
        />
      )}

      {isRestrictedView ? (
        <div className="px-8 max-w-6xl mx-auto">
          <div className="mt-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 text-center">
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
              {/* {process.env.NEXT_PUBLIC_ENABLE_CART === 'true' && (
                <AddToCartButton
                  itinerary={{
                    id: itinerary.id,
                    title: itinerary.title,
                    priceCents: priceCents,
                    mainImage: itinerary.mainImage,
                    creatorName: creator.name || "",
                    creatorUsername: creator.username || "",
                    creatorId: creator.id || "",
                  }}
                  className="px-8 py-2"
                />
              )} */}
            </div>
          </div>
        </div>
      ) : (
      <div className="max-w-6xl mx-auto w-full mt-8 px-6">
        {itinerary.days &&
          Array.isArray(itinerary.days) &&
          itinerary.days.length > 0 && (
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
                        className={`relative inline-flex min-w-[80px] min-h-[100px] rounded-xl overflow-hidden items-end justify-center transition-all cursor-pointer group ${
                          isSelected ? 'shadow-sm shadow-black/10 bg-gray-800 text-white ring-1' : 'bg-white border border-gray-200 text-gray-800'
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
      )}
    </div>
  )
}

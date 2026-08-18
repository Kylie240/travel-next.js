"use client"

import { InteractionButtons } from "@/app/itinerary/[id]/interaction-buttons"
import PdfExportElement from "@/app/itinerary/[id]/pdf-export-element"
import ShareElement from "@/app/itinerary/[id]/share-element"
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum"
import { itineraryTagsMap } from "@/lib/constants/tags"
import { UserData } from "@/lib/types"
import { PhotoItem } from "@/lib/utils/photos"
import { Day } from "@/types/Day"
import { Itinerary } from "@/types/itinerary"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Images,
  InfoIcon,
  Lock,
  LucideSquarePen,
  MapPin,
  Star,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { FiArrowUpRight, FiEdit } from "react-icons/fi"
import { Button } from "../ui/button"
import FollowButton from "@/app/itinerary/[id]/follow-button"
import NoteSection from "@/app/itinerary/[id]/note-section"
import { FaUserLarge } from "react-icons/fa6"
import { PurchaseButton } from "../ui/purchase-button"
import { useCallback, useEffect, useRef, useState } from "react"
import PhotoGallery from "@/components/ui/photo-gallery"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import type { BreadcrumbItem } from "@/lib/seo/breadcrumbs"

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
  sellerPurchasesEnabled?: boolean
  breadcrumbItems?: BreadcrumbItem[]
}

const formatTime = (time: string | null | undefined, duration: number | null | undefined) => {
  if (!time) return ""
  const [hours, minutes] = time.split(":").map(Number)
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  if (duration) {
    const [hours, minutes] = (time + duration).split(":").map(Number)
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    return `${formattedTime} - ${formattedTime}`
  }
  return formattedTime
}

type SelectedView = number | "all" | "info" | "notes"

function getDayPhotos(day: Day, dayIndex: number): PhotoItem[] {
  const photos: PhotoItem[] = []

  if (day.image?.trim()) {
    photos.push({
      id: `day-${dayIndex}`,
      url: day.image.trim(),
      title: day.title,
      type: "day",
      dayTitle: day.title,
    })
  }

  day.activities?.forEach((activity, activityIndex) => {
    if (activity.image) {
      photos.push({
        id: `activity-${dayIndex}-${activityIndex}`,
        url: activity.image,
        title: activity.title,
        type: "activity",
        dayTitle: day.title,
        activityTitle: activity.title,
      })
    }
    activity.photos?.forEach((photo, photoIndex) => {
      photos.push({
        id: `activity-photo-${dayIndex}-${activityIndex}-${photoIndex}`,
        url: photo,
        title: activity.title,
        type: "activity",
        dayTitle: day.title,
        activityTitle: activity.title,
      })
    })
  })

  day.accommodation?.photos?.forEach((photo, photoIndex) => {
    photos.push({
      id: `accommodation-${dayIndex}-${photoIndex}`,
      url: photo,
      title: day.accommodation?.name || day.title,
      type: "accommodation",
      dayTitle: day.title,
      accommodationName: day.accommodation?.name,
    })
  })

  return photos
}

function railButtonClass(isSelected: boolean) {
  return `flex w-12 h-12 bg-white shadow-lg rounded-md text-gray-900 font-semibold p-2 flex-col items-center justify-center text-center transition-all ${
    isSelected ? "shadow-lg" : "shadow-sm"
  }`
}

function JourneyDayContent({
  day,
  dayIndex,
  onOpenGallery,
}: {
  day: Day
  dayIndex: number
  onOpenGallery: (index: number, photos: PhotoItem[]) => void
}) {
  const dayPhotos = getDayPhotos(day, dayIndex)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">Day {day.id}</p>
      {dayPhotos.length > 0 && (
        <SwipeGallery
          photos={dayPhotos}
          title={day.title}
          onOpenAt={(index) => onOpenGallery(index, dayPhotos)}
          className="relative mb-4 h-[240px] w-full overflow-hidden group md:h-[320px]"
        />
      )}
      <h1 className="text-2xl md:text-3xl font-bold">{day.title}</h1>
      {day.description && <p className="text-sm md:text-md">{day.description}</p>}
      {day.activities && day.activities.length > 0 && (
        <>
          <p className="text-lg mt-4 font-semibold">Activities</p>
          <div className="flex flex-col gap-6 mt-2">
            {day.activities.map((activity) => (
              <div key={activity.id}>
                <div className="flex items-start gap-2">
                  <div className="w-[86px] md:w-[100px]">
                    {activity.time && !activity.duration && (
                      <p className="text-sm mt-1 text-gray-500">
                        {formatTime(activity.time, null) || ""}
                      </p>
                    )}
                    {activity.duration && activity.time && (
                      <p className="text-sm mt-1 text-gray-500">
                        {formatTime(activity.time, activity.duration) || ""}
                      </p>
                    )}
                    {!activity.time && !activity.duration && (
                      <div className="w-[86px] md:w-[100px] text-md mr-1 text-gray-500 flex items-center justify-end">
                        -
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-md font-medium">{activity.title}</p>
                    {activity.location && (
                      <p className="text-sm text-gray-500">{activity.location}</p>
                    )}
                    {activity.duration && (
                      <div className="flex items-center gap-1">
                        <Clock size={16} strokeWidth={2} className="text-gray-500" />
                        <p className="text-sm text-gray-500 mt-1">
                          Duration: {activity.duration} minutes
                        </p>
                      </div>
                    )}
                    {activity.description && (
                      <p className="text-sm md:text-md text-gray-500">{activity.description}</p>
                    )}
                    {activity.link && (
                      <div
                        className="flex my-2 w-full items-center text-sm cursor-pointer hover:bg-gray-100/50 text-gray-500 border p-2 rounded-xl shadow-md"
                        onClick={() => {
                          window.open(activity.link, "_blank")
                        }}
                      >
                        <div className="rounded-lg bg-gray-800 p-2">
                          <FiArrowUpRight
                            size={16}
                            strokeWidth={4}
                            className="text-white"
                          />
                        </div>
                        <span className="ml-2 text-sm">Activity Link</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function JourneyInfoPanel({
  itinerary,
  countries,
  creator,
  currentUserId,
  initialIsFollowing,
}: {
  itinerary: Itinerary
  countries: string[]
  creator: UserData
  currentUserId: string
  initialIsFollowing: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        About this itinerary
      </p>
      {itinerary.itineraryTags && itinerary.itineraryTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {itinerary.itineraryTags.map((tag: number) => {
            const tagData = itineraryTagsMap.find((t) => t.id === tag)
            if (!tagData) return null
            return (
              <span
                key={tag}
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium"
              >
                {tagData.name}
              </span>
            )
          })}
        </div>
      )}
      {itinerary.shortDescription && (
        <p className="text-sm leading-relaxed text-gray-900">
          {itinerary.shortDescription}
        </p>
      )}
      <div className="flex flex-col pt-4">
        <Link
          href={`/profile/${creator.username || ""}`}
          className="min-w-[100px] md:w-full cursor-pointer"
        >
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
        <p className="text-md mt-2">{creator.bio}</p>
      </div>
      <div className="flex w-fit gap-4 justify-end items-center">
      <div className="md:w-1/2">
        <Link href={`/profile/${creator.username}`}>
          <Button
            variant="outline"
            className="cursor-pointer border flex justify-center items-center w-full p-2 hover:bg-gray-100"
          >
            View Profile
          </Button>
        </Link>
      </div>
      {currentUserId === itinerary.creatorId ? (
        <Link
          className="min-w-[100px] md:w-1/2"
          href={`/account-settings?tab=${encodeURIComponent("Profile")}`}
        >
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
      
      {itinerary.detailedOverview && (
        <div className="mt-2">
          <p className="text-lg font-semibold mb-2 text-gray-800">Trip Overview</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-2 text-sm text-gray-700">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {itinerary.duration} {itinerary.duration === 1 ? "day" : "days"}
            </span>
            {itinerary.budget != null && (
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                {itinerary.budget} / person
              </span>
            )}
            <LocationLine countries={countries} />
          </div>
          <p className="text-sm leading-relaxed text-gray-900 whitespace-pre-line">
            {itinerary.detailedOverview}
          </p>
        </div>
      )}
    </div>
  )
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

function SwipeGallery({
  photos,
  title,
  onOpenAt,
  className = "absolute inset-0 overflow-hidden group",
}: {
  photos: PhotoItem[]
  title: string
  onOpenAt: (index: number) => void
  className?: string
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const skipClickRef = useRef(false)
  const pointerRef = useRef<{
    id: number
    startX: number
    startY: number
    startLeft: number
    axis: "undecided" | "x" | "y"
    moved: boolean
  } | null>(null)

  const syncIndex = useCallback(() => {
    const el = scrollerRef.current
    if (!el || el.clientWidth === 0) return
    const next = Math.round(el.scrollLeft / el.clientWidth)
    setIndex(Math.max(0, Math.min(photos.length - 1, next)))
  }, [photos.length])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => syncIndex()
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [syncIndex])

  const scrollTo = (next: number) => {
    const el = scrollerRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(photos.length - 1, next))
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" })
    setIndex(clamped)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (photos.length <= 1 || e.pointerType === "mouse") return
    const el = scrollerRef.current
    if (!el) return
    pointerRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: el.scrollLeft,
      axis: "undecided",
      moved: false,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current
    const el = scrollerRef.current
    if (!p || p.id !== e.pointerId || !el) return
    const dx = e.clientX - p.startX
    const dy = e.clientY - p.startY
    if (p.axis === "undecided") {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
      p.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y"
      if (p.axis === "x") {
        el.setPointerCapture(e.pointerId)
      }
    }
    if (p.axis !== "x") return
    p.moved = true
    skipClickRef.current = true
    el.scrollLeft = p.startLeft - dx
  }

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current
    const el = scrollerRef.current
    if (!p || p.id !== e.pointerId) {
      pointerRef.current = null
      return
    }
    if (p.axis === "x" && el) {
      const width = el.clientWidth || 1
      const predicted = p.startLeft - (e.clientX - p.startX)
      scrollTo(Math.round(predicted / width))
    }
    pointerRef.current = null
  }

  if (photos.length === 0) {
    return <div className={`${className} bg-slate-200`} />
  }

  return (
    <div className={className}>
      <div
        ref={scrollerRef}
        className={`flex h-full w-full no-scrollbar ${
          photos.length > 1
            ? "overflow-x-auto snap-x snap-mandatory touch-pan-y"
            : "overflow-hidden touch-pan-y"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            className="relative h-full w-full min-w-full shrink-0 snap-center touch-pan-y"
            onClick={() => {
              if (skipClickRef.current) {
                skipClickRef.current = false
                return
              }
              onOpenAt(i)
            }}
            aria-label={`View photo ${i + 1} of ${photos.length}`}
          >
            <Image
              src={photo.url}
              alt={photo.title || title}
              fill
              draggable={false}
              className="pointer-events-none object-cover"
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 1152px"
            />
          </button>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <Images className="h-3.5 w-3.5" />
              {index + 1} / {photos.length}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              scrollTo(index - 1)
            }}
            className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/55 group-hover:opacity-100 md:inline-flex"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              scrollTo(index + 1)
            }}
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/55 group-hover:opacity-100 md:inline-flex"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
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
  sellerPurchasesEnabled = true,
  breadcrumbItems,
}: JourneyTemplateProps) {
  void _paidUser
  const [selectedView, setSelectedView] = useState<SelectedView>("info")
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [galleryPhotos, setGalleryPhotos] = useState<PhotoItem[]>([])
  const dayContentRef = useRef<HTMLDivElement>(null)
  const skipContentScrollRef = useRef(true)

  const scrollToDayContent = useCallback(() => {
    dayContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  useEffect(() => {
    if (skipContentScrollRef.current) {
      skipContentScrollRef.current = false
      return
    }
    if (typeof selectedView !== "number") return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToDayContent()
      })
    })
  }, [selectedView, scrollToDayContent])

  if (!itinerary || !creator) {
    return null
  }

  const heroPhotos: PhotoItem[] =
    photos.length > 0
      ? photos
      : itinerary.mainImage
        ? [
            {
              id: "main",
              url: itinerary.mainImage,
              title: itinerary.title,
              type: "main",
            },
          ]
        : []

  const openGalleryAt = (index: number, photosToShow: PhotoItem[]) => {
    setGalleryPhotos(photosToShow)
    setGalleryIndex(index)
    setIsGalleryOpen(true)
  }

  const hasDays =
    !isRestrictedView &&
    Array.isArray(itinerary.days) &&
    itinerary.days.length > 0

  const visibleDays =
    selectedView === "all"
      ? itinerary.days!.map((day, index) => ({ day, index }))
      : typeof selectedView === "number" && itinerary.days?.[selectedView]
        ? [{ day: itinerary.days[selectedView], index: selectedView }]
        : null

  return (
    <div className="min-h-screen bg-white flex flex-col pb-12">
      {/* Full-bleed hero + glass overlay (detail page style) */}
      <div className="mt-2 w-full max-w-[1000px] mx-auto">
        {breadcrumbItems?.length ? (
            <Breadcrumbs items={breadcrumbItems} className="mb-3 ml-2" />
          ) : null}
          <h1 className="mt-2 ml-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {itinerary.title}
          </h1>
          <div className="w-full flex justify-start items-center mx-2 mt-1 mb-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-900">
              {typeof itinerary.rating === "number" &&
                !Number.isNaN(itinerary.rating) && (
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
        <div className="relative h-[calc(100svh-600px)] min-h-[400px] md:min-h-[520px] shadow-lg md:h-auto overflow-visible">
          <SwipeGallery
            photos={heroPhotos}
            title={itinerary.title}
            onOpenAt={(index) => openGalleryAt(index, heroPhotos)}
          />

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
            {canEdit && (
              <Link href={`/create?itineraryId=${itinerary.id}`}>
                <FiEdit
                  size={24}
                  className="transition-colors cursor-pointer h-10 w-10 p-2 text-black bg-white/40 hover:bg-white/80 rounded-lg"
                />
              </Link>
            )}
            {(!isRestrictedView || canEdit) && (
              <div className="inline-flex shrink-0 items-center bg-white/40 rounded-lg">
                <PdfExportElement
                  itineraryId={itinerary.id}
                  itineraryStatus={itinerary.status}
                  smallButton={false}
                />
              </div>
            )}
            {itinerary.status === ItineraryStatusEnum.published && (
              <ShareElement
                id={itinerary.id}
                slug={itinerary.slug}
                title={itinerary.title}
                shape="square"
                backgroundColor="white"
                color="black"
                smallButton={false}
              />
            )}
          </div>
        </div>
      </div>
      {isGalleryOpen && (
        <PhotoGallery
          key={galleryIndex}
          photos={galleryPhotos.length > 0 ? galleryPhotos : heroPhotos}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          initialIndex={galleryIndex}
        />
      )}

      {isRestrictedView ? (
        <div className="px-8 max-w-6xl mx-auto">

        <div className="w-full max-w-[1000px] mx-auto shadow-xl xl:shadow-none z-10">
              <div className="mx-auto relative max-w-2xl px-5 py-5 text-gray-900 sm:px-6 sm:py-6 pointer-events-auto">
                      <p className="text-xs mt-1 py-2 font-semibold uppercase tracking-wide text-gray-900 px-2">
                        About this itinerary
                      </p>
                      <div className="flex items-start gap-2">
                        {itinerary.shortDescription && (
                          <div className="pb-4">
                            <div className="flex flex-wrap gap-2 my-2">
                              {itinerary.itineraryTags &&
                                itinerary.itineraryTags.map((tag: number) => {
                                  const tagData = itineraryTagsMap.find(
                                    (t) => t.id === tag
                                  )
                                  if (!tagData) return null
                                  return (
                                    <span
                                      key={tag}
                                      className="flex justify-center items-center flex-wrap px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium"
                                    >
                                      {tagData.name}
                                    </span>
                                  )
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
                          <Link
                            href={`/profile/${creator.username || ""}`}
                            className="min-w-[100px] md:w-full cursor-pointer"
                          >
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
                              <Button
                                variant="outline"
                                className="cursor-pointer border flex justify-center items-center w-full p-2 hover:bg-gray-100"
                              >
                                View Profile
                              </Button>
                            </Link>
                          </div>
                          {currentUserId === itinerary.creatorId ? (
                            <Link
                              className="min-w-[100px] md:w-1/2"
                              href={`/account-settings?tab=${encodeURIComponent("Profile")}`}
                            >
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
                      <div className="text-xs line-height-1 mt-2 space-y-2" />
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
                    </div>
                    
          </div>
          
          <div className="mt-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Premium Content
            </h3>
            <p className="text-gray-600 mb-4">
              Purchase this itinerary to unlock the full day-by-day schedule,
              detailed notes, and all travel tips.
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
        </div>
      ) : (
        hasDays && (
          <div className="w-full max-w-[1000px] bg-white mx-auto">
            <div className="flex gap-6 mr-4">
              {/* Left day rail — scroll inside this column */}
              <div className="sticky top-[64px] z-10 self-start shrink-0 h-[calc(100vh-64px)] bg-slate-100 shadow-lg px-4 md:px-8 pb-8 pt-4">
                <div
                  className="h-full overflow-y-auto no-scrollbar"
                  aria-label="Day selector"
                >
                  <div className="flex flex-col gap-8 md:gap-12 items-center py-2">
                    <button
                      type="button"
                      onClick={() => setSelectedView("info")}
                      className={railButtonClass(selectedView === "info")}
                      aria-label="Itinerary information"
                    >
                      <InfoIcon className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedView("all")}
                      className={railButtonClass(selectedView === "all")}
                    >
                      All
                    </button>
                    {itinerary.days.map((day, index) => {
                      const isSelected = selectedView === index
                      return (
                        <button
                          key={day.id || index}
                          type="button"
                          onClick={() => setSelectedView(index)}
                          className={railButtonClass(isSelected)}
                        >
                          {day.id}
                        </button>
                      )
                    })}
                    {itinerary.notes && itinerary.notes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedView("notes")}
                        className={railButtonClass(selectedView === "notes")}
                        aria-label="Creator notes"
                      >
                        <LucideSquarePen className="w-6 h-6 text-gray-900" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div ref={dayContentRef} className="min-w-0 flex-1 scroll-mt-20 pt-8">
                {selectedView === "info" && (
                  <>
                    <JourneyInfoPanel itinerary={itinerary} countries={countries} creator={creator} currentUserId={currentUserId} initialIsFollowing={initialIsFollowing} />
                  </>
                )}
                {selectedView === "notes" && itinerary.notes && (
                  <>
                    {heroPhotos.length > 0 && (
                      <SwipeGallery
                        photos={heroPhotos}
                        title={itinerary.title}
                        onOpenAt={(index) => openGalleryAt(index, heroPhotos)}
                        className="relative mb-6 h-[240px] w-full overflow-hidden rounded-2xl group md:h-[320px]"
                      />
                    )}
                    <p className="text-xl font-medium mb-3">Creator Notes</p>
                    <NoteSection notes={itinerary.notes} />
                  </>
                )}
                {visibleDays && (
                  <div className="flex flex-col gap-12">
                    {visibleDays.map(({ day, index }) => (
                      <JourneyDayContent
                        key={day.id || index}
                        day={day}
                        dayIndex={index}
                        onOpenGallery={openGalleryAt}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
        </div>
        )
      )}
    </div>
  )
}

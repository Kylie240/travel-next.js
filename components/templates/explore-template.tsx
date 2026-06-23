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
import { useEffect, useRef, useState } from "react"
import { DaySection } from "@/components/ui/day-section";

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
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  const [activeDays, setActiveDays] = useState<number[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const headerRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerPosition = headerRef.current.getBoundingClientRect().top
        setShowScrollTop(headerPosition < 0 && activeDays.length > 0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeDays.length])
  
  const toggleDay = (dayNumber: number) => {
    setActiveDays(prev => 
      prev.includes(dayNumber) 
        ? prev.filter(d => d !== dayNumber)
        : [...prev, dayNumber]
    )
  }

  const closeAllDays = () => {
    setActiveDays([])
  }

  const openAllDays = () => {
    const allDayIds = itinerary.days.map(day => day.id)
    setActiveDays(allDayIds)
  }

  const scrollToTop = () => {
    if (headerRef.current) {
      const headerPosition = headerRef.current.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top: headerPosition, behavior: 'smooth' })
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

      <div className="max-w-6xl mx-auto w-full mt-8 px-6">
        {/* Day Images Gallery */}
        {itinerary.days && Array.isArray(itinerary.days) && itinerary.days.some(day => day.image) && (
          <>
            
            {/* Selected Day Schedule */}
            {itinerary.days[selectedDayIndex] && (
              <div className="w-full pb-8">
                <h2 className="text-xl md:text-2xl w-full text-center font-semibold">Itinerary</h2>
                <div className="sticky w-full top-20 z-50 flex flex-col items-end gap-2">
                <button 
                  onClick={activeDays.length > 0 ? closeAllDays : openAllDays} 
                  className="flex cursor-pointer bg-gray-800 text-white px-3 py-1 rounded-lg items-center gap-2 hover:opacity-80"
                >
                  {activeDays.length > 0 ? (
                    <div className='flex text-xs sm:text-sm items-center gap-1' onClick={closeAllDays}>
                      Close
                      <ChevronUp strokeWidth={3} size={18} />
                    </div>
                  ) : (
                    <div className='flex text-xs sm:text-sm items-center gap-1' onClick={openAllDays}>
                      Open
                      <ChevronDown strokeWidth={3} size={18} />
                    </div>
                  )}
                </button>
                {showScrollTop && (
                  <button
                    onClick={scrollToTop}
                    className="flex text-xs sm:text-sm cursor-pointer bg-gray-800 text-white px-3 py-1 rounded-lg items-center gap-2 hover:opacity-80"
                  >
                    To Top
                  </button>
                )}
              </div>
                <DaySection
                  day={itinerary.days[selectedDayIndex]}
                  isActive={true}
                  onToggle={() => {}}
                  duration={itinerary.days.length}
                  template="explore"
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

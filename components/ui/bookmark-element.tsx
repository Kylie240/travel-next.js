"use client"

import React, { useEffect, useState } from 'react'
import { Bookmark } from "lucide-react"
import { SaveItinerary, UnsaveItinerary } from '@/lib/actions/itinerary.actions'
import { supabase } from '@/utils/supabase/superbase-client'

const BookmarkElement = ({ itineraryId, currentUserId, color, initialIsSaved }: { itineraryId: string, currentUserId: string, color?: string, initialIsSaved?: boolean }) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved || false)

  useEffect(() => {
      const checkSaved = async () => {
        if (!currentUserId) return
        // If initialIsSaved is provided, skip the database check
        if (initialIsSaved !== undefined) {
          setIsSaved(initialIsSaved)
          return
        }
        const { data, error } = await supabase.from('interactions_saves').select('*').eq('user_id', currentUserId).eq('itinerary_id', itineraryId).maybeSingle()
        if (error) console.log('Error checking save status')
        setIsSaved(!!data)
      }
      checkSaved()
    }, [itineraryId, currentUserId, initialIsSaved])

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (!currentUserId) {
      window.location.href = '/login'
    }
    
    if (isSaved) {
      UnsaveItinerary(itineraryId)
      setIsSaved(false)
    } else {
      SaveItinerary(itineraryId);
      setIsSaved(true)
    }
  }

  return (
    <button
      onClick={handleBookmark}
      className={`${color == 'black' ? 'p-2 h-10 w-10 hover:bg-gray-100' : 'h-10 w-10 sm:h-12 sm:w-12 md:h-10 md:w-10'} transition-colors cursor-pointer rounded-lg flex items-center justify-center ${
        isSaved
            ? `${color == 'black' ? 'fill-black text-black hover:fill-black/70' : 'fill-white text-white hover:fill-white/80'}`
            : `${color == 'black' ? 'fill-black/60 text-black hover:fill-black/70' : 'fill-white/60 text-white/80 hover:fill-white/80'}`
        }`}
    >
      <Bookmark size={35} />
    </button>
  )
}

export default BookmarkElement
"use client"

import React, { useEffect, useState } from 'react'
import { Bookmark } from "lucide-react"
import { SaveItinerary, UnsaveItinerary } from '@/lib/actions/itinerary.actions'
import { supabase } from '@/utils/supabase/superbase-client'

const BookmarkElement = ({ itineraryId, currentUserId, color, initialIsSaved, onUnsave }: { itineraryId: string, currentUserId: string, color?: string, initialIsSaved?: boolean, onUnsave?: (itineraryId: string) => void }) => {
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
      // Call the onUnsave callback if provided
      if (onUnsave) {
        onUnsave(itineraryId)
      }
    } else {
      SaveItinerary(itineraryId);
      setIsSaved(true)
    }
  }

  return (
    <button
      onClick={handleBookmark}
      className={`${color == 'black' ? 'p-2 h-10 w-10 hover:bg-gray-100' : 'h-10 w-10 sm:h-12 sm:w-12 md:h-10 md:w-10'} transition-colors cursor-pointer rounded-lg flex items-center justify-center`}
    >
      <Bookmark className={`${
        isSaved
            ? `${color == 'black' ? 'fill-black text-black hover:text-black/60 hover:fill-black/70' : 'fill-white text-white hover:text-white/70 hover:fill-white/80'}`
            : `${color == 'black' ? 'fill-white text-black hover:text-black/60 hover:fill-black/60' : 'fill-white/60 text-white/70 hover:text-white/70 hover:fill-white/80'}`
        }`} size={35} />
    </button>
  )
}

export default BookmarkElement
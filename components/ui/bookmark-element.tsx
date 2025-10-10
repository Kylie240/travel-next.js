"use client"

import React, { useEffect, useState } from 'react'
import { Bookmark } from "lucide-react"
import { SaveItinerary, UnsaveItinerary } from '@/lib/actions/itinerary.actions'
import { supabase } from '@/utils/supabase/superbase-client'

const BookmarkElement = ({ itineraryId, currentUserId, color }: { itineraryId: string, currentUserId: string, color?: string }) => {
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
      const isSaved = async () => {
        if (!currentUserId) return
        const { data, error } = await supabase.from('interactions_saves').select('*').eq('user_id', currentUserId).eq('itinerary_id', itineraryId).maybeSingle()
        if (error) console.log('Error checking save status')
        setIsSaved(!!data)
      }
      isSaved()
    }, [itineraryId, currentUserId])

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (!currentUserId) {
      window.location.href = '/'
      return
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
    <Bookmark size={35}
        className={`${color == 'black' ? 'p-2' : ''} transition-colors cursor-pointer h-10 w-100 rounded-lg ${
        isSaved
            ? `${color == 'black' ? 'fill-black text-black hover:fill-black/70' : 'fill-white text-transparent'}`
            : `${color == 'black' ? 'fill-white text-black hover:fill-black/70 rounded-lg' : 'fill-white/40'}`
        }`}
        onClick={handleBookmark}
    />
  )
}

export default BookmarkElement
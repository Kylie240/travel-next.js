"use client"

import React, { useEffect, useState } from 'react'
import { Bookmark } from "lucide-react"
import { SaveItinerary, UnsaveItinerary } from '@/lib/actions/itinerary.actions'
import { supabase } from '@/utils/supabase/superbase-client'

const BookmarkElement = ({ itineraryId, currentUserId, color }: { itineraryId: string, currentUserId: string, color?: string }) => {
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
      const checkFollow = async () => {
        if (!currentUserId) return // Don't check if user is not logged in
        const { data, error } = await supabase.from('interactions_saves').select('*').eq('user_id', currentUserId).eq('itinerary_id', itineraryId).maybeSingle()
        if (error) console.log('Error checking save status')
        setIsSaved(!!data)
      }
      checkFollow()
    }, [itineraryId, currentUserId])

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (!currentUserId) {
      // Redirect to login if user is not authenticated
      window.location.href = '/login'
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
        className={`${color == 'black' ? 'p-2' : ''} transition-colors cursor-pointer h-6 w-6 md:h-10 md:w-10 ${
        isSaved
            ? `${color == 'black' ? 'fill-black text-black hover:fill-black/70' : 'fill-white text-transparent hover:fill-white/70'}`
            : `${color == 'black' ? 'fill-black text-transparent hover:fill-black/70 rounded-lg' : 'text-transparent fill-white/40 hover:fill-text/70 hover:fill-white/70 rounded-lg'}`
        }`}
        onClick={handleBookmark}
    />
  )
}

export default BookmarkElement
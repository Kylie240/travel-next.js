"use client"

import React, { useEffect, useState } from 'react'
import { Bookmark } from "lucide-react"
import { SaveItinerary, UnsaveItinerary } from '@/lib/actions/itinerary.actions'
import { supabase } from '@/utils/supabase/superbase-client'

const BookmarkElement = ({ itineraryId, currentUserId }: { itineraryId: string, currentUserId: string }) => {
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

  const handleBookmark = () => {
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
        className={`transition-colors cursor-pointer h-10 w-10 p-2 ${
        isSaved
            ? "fill-black text-black"
            : "text-black hover:bg-gray-100 rounded-lg"
        }`}
        onClick={handleBookmark}
    />
  )
}

export default BookmarkElement
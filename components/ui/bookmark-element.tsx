"use client"

import React, { useEffect, useState } from 'react'
import { Bookmark } from "lucide-react"
import { SaveItinerary, UnsaveItinerary } from '@/lib/actions/itinerary.actions'
import { supabase } from '@/utils/supabase/superbase-client'

const BookmarkElement = ({ itineraryId, currentUserId, color, initialIsSaved, savedList, onUnsave }: { itineraryId: string, currentUserId: string, color?: string, initialIsSaved?: boolean, savedList?: string[], onUnsave?: (itineraryId: string) => void }) => {
  const [isSaved, setIsSaved] = useState(false) // Default to false, will be updated by useEffect

  useEffect(() => {
      const checkSaved = async () => {
        console.log('BookmarkElement useEffect:', { currentUserId, itineraryId, initialIsSaved, savedList })
        if (!currentUserId) {
          console.log('No currentUserId, skipping bookmark check')
          return
        }
        
        // If initialIsSaved is provided, use it and skip database check
        if (initialIsSaved !== undefined) {
          console.log('Using initialIsSaved:', initialIsSaved)
          setIsSaved(initialIsSaved)
          return
        }
        
        // If savedList is provided, check if itineraryId is in the list
        if (savedList && Array.isArray(savedList)) {
          const isInSavedList = savedList.includes(itineraryId)
          console.log('Checking savedList:', { itineraryId, savedList, isInSavedList })
          setIsSaved(isInSavedList)
          return
        }
        
        // Otherwise, check the database
        console.log('Checking database for save status...')
        const { data, error } = await supabase.from('interactions_saves').select('*').eq('user_id', currentUserId).eq('itinerary_id', itineraryId).maybeSingle()
        if (error) {
          console.log('Error checking save status:', error)
          return
        }
        console.log('Save status data:', { currentUserId, itineraryId, data })
        setIsSaved(!!data)
      }
      checkSaved()
    }, [itineraryId, currentUserId, initialIsSaved, savedList])

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
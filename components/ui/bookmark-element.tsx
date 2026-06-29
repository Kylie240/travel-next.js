"use client"

import React, { useEffect, useState } from 'react'
import { Bookmark } from "lucide-react"
import { SaveItinerary, UnsaveItinerary } from '@/lib/actions/itinerary.actions'
import { supabase } from '@/utils/supabase/superbase-client'
import { FaRegHeart } from 'react-icons/fa'

const BookmarkElement = ({ itineraryId, currentUserId, color, initialIsSaved, savedList, onUnsave, backgroundColor, smallButton = false }: { itineraryId: string, currentUserId: string, color?: string, initialIsSaved?: boolean, savedList?: string[], onUnsave?: (itineraryId: string) => void, backgroundColor?: string, smallButton?: boolean }) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved || false) // Use initialIsSaved if provided

  useEffect(() => {
      const checkSaved = async () => {
        if (!currentUserId) {
          return
        }
        
        // If initialIsSaved is provided, use it and skip database check
        if (initialIsSaved !== undefined) {
          setIsSaved(initialIsSaved)
          return
        }
        
        // If savedList is provided, check if itineraryId is in the list
        if (savedList && Array.isArray(savedList)) {
          const isInSavedList = savedList.includes(itineraryId)
          setIsSaved(isInSavedList)
          return
        }
        
        // Otherwise, check the database
        const { data, error } = await supabase.from('interactions_saves').select('*').eq('user_id', currentUserId).eq('itinerary_id', itineraryId).maybeSingle()
        if (error) {
          return
        }
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
    <>
      {isSaved ? (
        <Bookmark size={smallButton ? 30 : 35}
            className={`transition-colors cursor-pointer h-10 w-10 p-2 ${color == 'black' ? 'fill-black text-black hover:bg-gray-100' : 'fill-white text-white hover:bg-gray-100/60'} rounded-lg`}
            onClick={handleBookmark}
        />
      ) : (
        <Bookmark size={smallButton ? 30 : 35}
            className={`transition-colors cursor-pointer h-10 w-10 p-2 ${color == 'black' ? 'text-black hover:bg-gray-100 hover:fill-black/60' : 'text-white hover:bg-gray-100/60 hover:fill-white/60'} rounded-lg`}
            onClick={handleBookmark}
        />
      )}
    </>
  )
}

export default BookmarkElement
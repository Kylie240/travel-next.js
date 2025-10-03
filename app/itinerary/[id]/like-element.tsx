"use client"

import { LikeItinerary, UnlikeItinerary } from '@/lib/actions/itinerary.actions'
import { supabase } from '@/utils/supabase/superbase-client'
import React, { useEffect, useState } from 'react'
import { FaRegStar } from "react-icons/fa6"

const LikeElement = ({ itineraryId, currentUserId }: { itineraryId: string, currentUserId: string }) => {
  const [isLiked, setIsLiked] = useState(false)
  
    useEffect(() => {
        const checkFollow = async () => {
          const { data, error } = await supabase.from('interactions_saves').select('*').eq('user_id', currentUserId).eq('itinerary_id', itineraryId).maybeSingle()
          if (error) console.log('Error checking save status')
          setIsLiked(!!data)
        }
        checkFollow()
      }, [itineraryId, currentUserId])

  return (
    <FaRegStar size={35}
        className={`transition-colors cursor-pointer h-10 w-10  p-2 ${
        isLiked
            ? "fill-black text-black"
            : "text-black hover:bg-gray-100 rounded-lg p-2"
        }`}
        onClick={() => {
          if(isLiked) {
            UnlikeItinerary(itineraryId)
            setIsLiked(false)
          }
          LikeItinerary(itineraryId);
          setIsLiked(true)
        }}
    />
  )
}

export default LikeElement
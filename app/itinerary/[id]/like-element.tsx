"use client"

import { LikeItinerary, UnlikeItinerary } from '@/lib/actions/itinerary.actions'
import { supabase } from '@/utils/supabase/superbase-client'
import React, { useEffect, useState } from 'react'
import { FaRegStar, FaStar } from "react-icons/fa6"

const LikeElement = ({ 
  itineraryId, 
  currentUserId, 
  initialIsLiked 
}: { 
  itineraryId: string
  currentUserId: string
  initialIsLiked?: boolean
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked || false)
  
    useEffect(() => {
        const checkLike = async () => {
          if (!currentUserId) return // Don't check if user is not logged in
          // If initialIsLiked was provided, use it and skip database check
          if (initialIsLiked !== undefined) {
            setIsLiked(initialIsLiked)
            return
          }
          const { data, error } = await supabase.from('interactions_likes').select('*').eq('user_id', currentUserId).eq('itinerary_id', itineraryId).maybeSingle()
          if (error) console.log('Error checking like status')
          setIsLiked(!!data)
        }
        checkLike()
      }, [itineraryId, currentUserId, initialIsLiked])

  const handleLike = (e) => {
    e.stopPropagation();
    if (!currentUserId) {
      window.location.href = '/login'
      return
    }
    
    if(isLiked) {
      UnlikeItinerary(itineraryId)
      setIsLiked(false)
    } else {
      LikeItinerary(itineraryId);
      setIsLiked(true)
    }
  }

  return (
    <>
      {isLiked ? (
        <FaStar size={35}
            className="transition-colors cursor-pointer h-10 w-10 p-2 fill-black text-black hover:bg-gray-100 rounded-lg"
            onClick={handleLike}
        />
      ) : (
        <FaRegStar size={35}
            className="transition-colors cursor-pointer h-10 w-10 p-2 text-black hover:bg-gray-100 rounded-lg"
            onClick={handleLike}
        />
      )}
    </>
  )
}

export default LikeElement
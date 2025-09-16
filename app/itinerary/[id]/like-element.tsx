"use client"

import { LikeItinerary } from '@/lib/actions/itinerary.actions'
import React from 'react'
import { FaRegStar } from "react-icons/fa6"

const LikeElement = ({ itineraryId }: { itineraryId: string }) => {
  return (
    <FaRegStar size={35}
        className={`transition-colors cursor-pointer h-10 w-10 ${
        itineraryId.includes('48')
            ? "fill-red-500 text-red-500"
            : "text-black hover:bg-gray-100 rounded-lg p-2"
        }`}
        onClick={() => {
            LikeItinerary(itineraryId);
        }}
    />
  )
}

export default LikeElement
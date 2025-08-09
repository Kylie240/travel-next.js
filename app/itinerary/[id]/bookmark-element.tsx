"use client"

import React from 'react'
import { Bookmark } from "lucide-react"

const BookmarkElement = ({ itineraryId }: { itineraryId: string }) => {
  return (
    <Bookmark size={35}
        className={`transition-colors cursor-pointer h-10 w-10 ${
        itinerary.title.includes('Paris')
            ? "fill-red-500 text-red-500"
            : "text-black hover:bg-gray-200 rounded-full p-2"
        }`}
    />
  )
}

export default BookmarkElement
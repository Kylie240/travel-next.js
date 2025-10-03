"use client"

import React, { useState } from 'react'
import { PhotoItem } from '@/lib/utils/photos'
import PhotoGallery from '@/components/ui/photo-gallery';

const ItineraryGallery = ({ photos }: { photos: PhotoItem[] }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  return (
    <>
    <div className="bg-gray-800 relative w-full h-[30%] overflow-hidden rounded-3xl text-white flex justify-center items-center curstor-pointer"
        style={{
            backgroundImage: `url(${photos[1]?.url ?? photos[0].url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }}>
        <div onClick={() => setIsGalleryOpen(true)} className="w-full h-full inset-0 bg-black/20 z-1 cursor-pointer hover:bg-black/10 font-medium text-lg flex justify-center items-center">
            View All {photos.length} Photos
        </div>
        {isGalleryOpen && (
            <PhotoGallery photos={photos} isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
        )}
    </div>
    </>
  )
}

export default ItineraryGallery
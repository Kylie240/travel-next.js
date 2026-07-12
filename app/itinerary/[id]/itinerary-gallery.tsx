"use client"

import React, { useState } from 'react'
import { PhotoItem } from '@/lib/utils/photos'
import PhotoGallery from '@/components/ui/photo-gallery';
import { Images } from 'lucide-react';

const ItineraryGallery = ({ photos, template }: { photos: PhotoItem[], template?: string }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const isDiscoverTemplate = template === "discover"
  const isWonderTemplate = template === "wonder"
  return (
    <>
    {isDiscoverTemplate || isWonderTemplate ? (
      <div onClick={() => setIsGalleryOpen(true)} className={`px-3 py-2 rounded-lg cursor-pointer relative w-full h-full flex justify-center items-center bg-gray-800 hover:bg-gray-700 text-white`}>
      <span className="gap-1 flex font-thin items-center">
        {isDiscoverTemplate ? "View All" : photos.length} <Images size={14} strokeWidth={2} />
      </span>
      {isGalleryOpen && (
          <PhotoGallery photos={photos} isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
      )}
    </div>
    ) : (
      <>
       <div className="hidden lg:flex bg-gray-800 relative w-full h-full lg:h-[30%] overflow-hidden rounded-md lg:rounded-3xl text-white justify-center items-center curstor-pointer"
        style={{
            backgroundImage: `url(${photos[1]?.url ?? photos[0].url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }}>
        <div onClick={() => setIsGalleryOpen(true)} className="w-full h-full inset-0 bg-black/40 lg:bg-black/20 z-1 cursor-pointer hover:bg-black/30 mlghover:bg-black/10 font-medium text-lg flex justify-center items-center">
            <div>
              <span className="hidden lg:block">
                {photos.length > 0 ? photos.length == 1 ? `View ${photos.length} Photo` : `View All ${photos.length} Photos` : 'No Photos'}
              </span>
              <span className="lg:hidden gap-1 flex font-thin items-center">
                {photos.length > 0 ? photos.length == 1 ? `View ${photos.length} Photo` : `View All ${photos.length} Photos` : 'No Photos'}
              </span>
            </div>
        </div>
          {isGalleryOpen && (
              <PhotoGallery photos={photos} isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
          )}
        </div>
        <div onClick={() => setIsGalleryOpen(true)} className={`lg:hidden px-3 py-2 rounded-lg cursor-pointer relative w-full h-full flex justify-center items-center ${
          isDiscoverTemplate
            ? "bg-gray-900 hover:bg-gray-800 text-white"
            : "bg-gray-800/60 hover:bg-gray-800/50 text-white/80 hover:text-white/90"
        }`}>
          <span className="lg:hidden gap-1 flex font-thin items-center">
            {isDiscoverTemplate ? "View All" : photos.length} <Images size={14} strokeWidth={2} />
          </span>
          {isGalleryOpen && (
              <PhotoGallery photos={photos} isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
          )}
        </div>
      </>
    )}
    </>
  )
}

export default ItineraryGallery
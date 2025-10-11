"use client"

import React, { useState } from 'react'
import { PhotoItem } from '@/lib/utils/photos'
import PhotoGallery from '@/components/ui/photo-gallery';
import { Images } from 'lucide-react';

const ItineraryGallery = ({ photos }: { photos: PhotoItem[] }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  return (
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
                View All {photos.length} Photos
              </span>
              <span className="lg:hidden gap-1 flex font-thin items-center">
                {photos.length} <Images size={14} strokeWidth={2} />
              </span>
            </div>
        </div>
        {isGalleryOpen && (
            <PhotoGallery photos={photos} isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
        )}
    </div>
    <div className="lg:hidden bg-gray-700/60 rounded-md cursor-pointer relative w-full h-full hover:bg-gray-700/70 text-white/80 hover:text-white/90 flex justify-center items-center curstor-pointer">
      <span className="lg:hidden gap-1 flex font-thin items-center">
        {photos.length} <Images size={14} strokeWidth={2} />
      </span>
      {isGalleryOpen && (
          <PhotoGallery photos={photos} isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
      )}
    </div>
    {/* <div className="bg-gray-800 relative w-full h-full lg:h-[30%] overflow-hidden rounded-md lg:rounded-3xl text-white flex justify-center items-center curstor-pointer"
        style={{
            backgroundImage: `url(${photos[1]?.url ?? photos[0].url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }}>
        <div onClick={() => setIsGalleryOpen(true)} className="w-full h-full inset-0 bg-black/40 lg:bg-black/20 z-1 cursor-pointer hover:bg-black/30 mlghover:bg-black/10 font-medium text-lg flex justify-center items-center">
            <div>
              <span className="hidden lg:block">
                View All {photos.length} Photos
              </span>
              <span className="lg:hidden gap-1 flex font-thin items-center">
                {photos.length} <Images size={14} strokeWidth={2} />
              </span>
            </div>
        </div>
        {isGalleryOpen && (
            <PhotoGallery photos={photos} isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
        )}
    </div> */}
    </>
  )
}

export default ItineraryGallery
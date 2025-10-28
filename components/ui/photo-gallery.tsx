"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { PhotoItem } from "@/lib/utils/photos";
import { Button } from "@/components/ui/button";

interface PhotoGalleryProps {
  photos: PhotoItem[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function PhotoGallery({ 
  photos, 
  isOpen, 
  onClose, 
  initialIndex = 0 
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Prevent body scrolling when gallery is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && photos.length > 1) {
      goToNext();
    }
    if (isRightSwipe && photos.length > 1) {
      goToPrevious();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-white flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-20 right-4 z-60 text-gray-700 hover:bg-gray-100 bg-white/80 border border-gray-200 shadow-sm"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Main image */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh] mx-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation buttons */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform hidden md:block -translate-y-1/2 z-60 text-gray-700 hover:bg-gray-100 bg-white/80 border border-gray-200 shadow-sm"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform hidden md:block -translate-y-1/2 z-60 text-gray-700 hover:bg-gray-100 bg-white/80 border border-gray-200 shadow-sm"
              onClick={goToNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}
        <div className="w-full h-full"> 
          <Image
            src={currentPhoto.url}
            alt={currentPhoto.title}
            width={screen.width}
            height={800}
            className="object-contain max-w-full max-h-full rounded-lg"
            priority
          />
         </div>
        
        {/* Photo info */}
        {/* <div className="absolute bottom-0 left-0 right-0 bg-white/90 text-gray-800 p-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold">{currentPhoto.title}</h3>
          <div className="text-sm text-gray-600">
            {currentPhoto.type === 'main' && 'Main Itinerary Photo'}
            {currentPhoto.type === 'day' && `Day: ${currentPhoto.dayTitle}`}
            {currentPhoto.type === 'activity' && `Activity: ${currentPhoto.activityTitle} (Day: ${currentPhoto.dayTitle})`}
            {currentPhoto.type === 'accommodation' && `Accommodation: ${currentPhoto.accommodationName} (Day: ${currentPhoto.dayTitle})`}
          </div>
          {photos.length > 1 && (
            <div className="text-sm text-gray-500 mt-1">
              {currentIndex + 1} of {photos.length}
            </div>
          )}
        </div> */}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                index === currentIndex ? 'ring-2 ring-gray-700' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

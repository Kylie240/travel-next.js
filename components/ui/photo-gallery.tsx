"use client";

import { useState } from "react";
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

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation buttons */}
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 z-10 text-white hover:bg-white/20"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 z-10 text-white hover:bg-white/20"
            onClick={goToNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Main image */}
      <div className="relative max-w-[90vw] max-h-[90vh] mx-4">
        <Image
          src={currentPhoto.url}
          alt={currentPhoto.title}
          width={1200}
          height={800}
          className="object-contain max-w-full max-h-full"
          priority
        />
        
        {/* Photo info */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
          <h3 className="text-lg font-semibold">{currentPhoto.title}</h3>
          <div className="text-sm text-gray-300">
            {currentPhoto.type === 'main' && 'Main Itinerary Photo'}
            {currentPhoto.type === 'day' && `Day: ${currentPhoto.dayTitle}`}
            {currentPhoto.type === 'activity' && `Activity: ${currentPhoto.activityTitle} (Day: ${currentPhoto.dayTitle})`}
            {currentPhoto.type === 'accommodation' && `Accommodation: ${currentPhoto.accommodationName} (Day: ${currentPhoto.dayTitle})`}
          </div>
          {photos.length > 1 && (
            <div className="text-sm text-gray-400 mt-1">
              {currentIndex + 1} of {photos.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                index === currentIndex ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'
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

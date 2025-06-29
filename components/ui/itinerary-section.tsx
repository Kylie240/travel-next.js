import { useRef } from "react";
import { ItineraryCard } from "./itinerary-card";

export interface ItinerarySectionProps {
  title: string;
  description: string;
  itineraries: Array<{
    id: string;
    title: string;
    destination?: string;
    countries?: string[];
    imageUrl: string;
    duration: number;
    price?: number;
    discountedPrice?: number;
  }>;
}

export const ItinerarySection = ({ title, description, itineraries }: ItinerarySectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sectionRef.current) {
      const scrollAmount = 316;
      const newScrollPosition = sectionRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      sectionRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-left mb-8">
        <h2 className="text-4xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mx-auto">
          {description}
        </p>
      </div>

      <div className="relative">
        <div 
          ref={sectionRef}
          className="flex overflow-x-auto gap-4 pb-4 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {itineraries.map((itinerary) => (
            <ItineraryCard
              key={itinerary.id}
              {...itinerary}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button className="hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition-colors bg-[#000000] text-[#ffffff]">
          See all trips
        </button>
        <div className="flex space-x-2">
          <button 
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <span className="text-gray-600">‹</span>
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <span>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 
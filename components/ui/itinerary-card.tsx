"use client";

import Link from "next/link";

interface ItineraryCardProps {
  id: string | number;
  title: string;
  destination?: string;
  imageUrl: string;
  duration: number | string;
  price?: number | string;
  discountedPrice?: number;
  countries?: string[];
  onClick?: (id: string | number) => void;
  className?: string;
}

export function ItineraryCard({
  id,
  title,
  destination,
  imageUrl,
  duration,
  price,
  discountedPrice,
  countries = [],
  onClick,
  className,
}: ItineraryCardProps) {
  const handleCardClick = () => onClick?.(id);
  const destinationText = countries && countries.length > 0 
    ? countries.join(", ")
    : destination || "";

  return (
    <Link 
      href={`/itinerary/${id}`}
      className="flex-none w-[300px] group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-2xl h-[400px]">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white z-10">
          <h3 className="font-bold text-2xl mb-1">
            {title}
          </h3>
          <p className="text-xs opacity-90">
            {destinationText} in {duration} Days
          </p>
          {price && (
            <div className="flex items-center mt-2">
              <span className="text-sm font-bold">
                Est. ${typeof price === 'string' ? price.replace(/[^0-9]/g, '') : price?.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 
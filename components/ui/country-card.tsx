"use client"

import { useRouter } from "next/navigation"

interface CountryCardProps {
  name: string
  imageUrl: string
  tripCount: number
  onClick?: () => void
}

export const CountryCard = ({ name, imageUrl, tripCount, onClick }: CountryCardProps) => {
  const router = useRouter();
  return (
    <button 
      onClick={() => {
        router.push(`/explore?destination=${name}`);
      }}
      className="relative rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 w-full group overflow-hidden"
      style={{ aspectRatio: '2/1' }}
    >
      {/* Background image that only shows on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col justify-between h-full">
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-white transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-600 group-hover:text-gray-200 transition-colors">
            {tripCount} trips
          </p>
        </div>
      </div>
    </button>
  )
}

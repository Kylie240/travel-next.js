"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

interface CategoryCardProps {
  name: string
  icon: React.ComponentType<any>
  imageUrl: string
  onClick?: () => void
}

export const CategoryCard = ({ name, icon: Icon, imageUrl, onClick }: CategoryCardProps) => {
  const router = useRouter();
  return (
    <button 
      onClick={() => router.push(`/explore?category=${name.toLowerCase()}`)}
      className="relative flex items-center gap-3 p-6 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 w-full group overflow-hidden"
      style={{ aspectRatio: '2/1' }}
    >
      {/* Background image that only shows on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="p-3 bg-gray-100 group-hover:bg-white/20 rounded-lg transition-colors">
          <Icon className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
        </div>
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-white transition-colors">
            {name}
          </h3>
        </div>
      </div>
    </button>
  )
}
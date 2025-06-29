"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Search, Mountain, Utensils, Building, Palmtree, Camera, Tent, Bike, Ship, Wine, Heart, Music, Sparkles, Waves, Snowflake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// This is a placeholder for actual auth check - replace with your auth system
const useAuth = () => {
  // Replace this with actual auth logic
  return {
    isAuthenticated: false,
    user: null
  }
}

// Dummy data for itineraries
const itineraries = [
  {
    id: 1,
    title: "Japanese Cultural Journey",
    description: "Experience the best of Japan's ancient traditions and modern wonders",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1470&auto=format&fit=crop",
    duration: "14 days",
    cities: ["Tokyo", "Kyoto", "Osaka"],
    countries: ["Japan"],
    price: "$3,499",
    tags: ["culture", "food", "history"],
    status: "popular"
  },
  {
    id: 2,
    title: "Italian Food & Wine Tour",
    description: "Savor the flavors of Italy's finest culinary regions",
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1400&auto=format&fit=crop",
    duration: "10 days",
    cities: ["Rome", "Florence", "Venice"],
    countries: ["Italy"],
    price: "$2,899",
    tags: ["food", "wine", "culture"],
    status: "highly rated"
  },
  {
    id: 3,
    title: "Costa Rica Adventure",
    description: "Explore rainforests, volcanoes, and pristine beaches",
    image: "https://images.unsplash.com/photo-1518181835702-6eef8b4b2113?q=80&w=1400&auto=format&fit=crop",
    duration: "7 days",
    cities: ["San José", "Arenal", "Manuel Antonio"],
    countries: ["Costa Rica"],
    price: "$1,999",
    tags: ["adventure", "nature", "beach"]
  },
  {
    id: 4,
    title: "Greek Islands Explorer",
    description: "Island hop through the stunning Cyclades archipelago",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1374&auto=format&fit=crop",
    duration: "12 days",
    cities: ["Athens", "Santorini", "Mykonos"],
    countries: ["Greece"],
    price: "$2,799",
    tags: ["beach", "culture", "history"],
    status: "most viewed"
  },
  {
    id: 5,
    title: "Thai Adventure",
    description: "From bustling cities to serene beaches",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1400&auto=format&fit=crop",
    duration: "10 days",
    cities: ["Bangkok", "Chiang Mai", "Phuket"],
    countries: ["Thailand"],
    price: "$1,899",
    tags: ["adventure", "culture", "food"],
    status: "popular"
  },
  {
    id: 6,
    title: "Swiss Alps Explorer",
    description: "Mountain adventures in the heart of Europe",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1400&auto=format&fit=crop",
    duration: "8 days",
    cities: ["Zurich", "Lucerne", "Interlaken"],
    countries: ["Switzerland"],
    price: "$3,299",
    tags: ["adventure", "nature", "history"],
    status: "highly rated"
  }
]

const filters = {
  destinations: ["Japan", "Italy", "Costa Rica", "Thailand", "Greece", "Switzerland"],
  duration: ["1-3 days", "4-7 days", "8-14 days", "15-21 days", "21+ days"],
  budget: ["Under $1000", "$1000-$2000", "$2000-$3000", "$3000-$5000", "$5000+"],
  tags: [
    { name: "adventure", icon: Mountain },
    { name: "food", icon: Utensils },
    { name: "culture", icon: Building },
    { name: "beach", icon: Palmtree },
    { name: "photography", icon: Camera },
    { name: "camping", icon: Tent },
    { name: "cycling", icon: Bike },
    { name: "cruise", icon: Ship },
    { name: "wine", icon: Wine },
    { name: "wellness", icon: Heart },
    { name: "festivals", icon: Music },
    { name: "luxury", icon: Sparkles },
    { name: "surfing", icon: Waves },
    { name: "winter", icon: Snowflake },
  ]
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState({
    destination: "",
    duration: "",
    budget: "",
    tags: [] as string[],
  })
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [likedItineraries, setLikedItineraries] = useState<number[]>([])

  const toggleTag = (tag: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const toggleLike = (id: number, e: React.MouseEvent) => {
    e.preventDefault() // Prevent the Link navigation
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save itineraries",
        duration: 3000,
      })
      return
    }
    
    setLikedItineraries(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
    
    toast({
      title: likedItineraries.includes(id) ? "Removed from favorites" : "Added to favorites",
      duration: 2000,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations, activities..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-travel-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-travel-600"
                value={selectedFilters.destination}
                onChange={(e) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    destination: e.target.value,
                  }))
                }
              >
                <option value="">All Destinations</option>
                {filters.destinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-travel-600"
                value={selectedFilters.duration}
                onChange={(e) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
              >
                <option value="">Duration</option>
                {filters.duration.map((dur) => (
                  <option key={dur} value={dur}>
                    {dur}
                  </option>
                ))}
              </select>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-travel-600"
                value={selectedFilters.budget}
                onChange={(e) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    budget: e.target.value,
                  }))
                }
              >
                <option value="">Budget</option>
                {filters.budget.map((budget) => (
                  <option key={budget} value={budget}>
                    {budget}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {filters.tags.map(({ name, icon: Icon }) => (
              <Button
                key={name}
                variant={selectedFilters.tags.includes(name) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTag(name)}
                className="capitalize"
              >
                <Icon className="w-4 h-4 mr-2" />
                {name}
              </Button>
            ))}
          </div>
        </div>

        {/* Itineraries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {itineraries.map((itinerary) => (
            <Link href={`/itinerary/${itinerary.id}`} className="block relative" key={itinerary.id}>
              {/* Background cutout shape */}
              <div className="absolute -top-3 -left-3 bg-gray-50">
                <div className="relative w-[140px] h-[64px]">
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute bottom-0 right-0 w-[30px] h-[30px] bg-white" />
                    <div className="absolute bottom-0 right-0 w-[32px] h-[32px] bg-gray-50 rounded-tl-xl" />
                  </div>
                </div>
              </div>
              
              <motion.div
                className="overflow-hidden relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {/* Like Button */}
                {isAuthenticated && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const newLiked = !likedItineraries.includes(itinerary.id);
                      setLikedItineraries(prev => 
                        newLiked ? [...prev, itinerary.id] : prev.filter(id => id !== itinerary.id)
                      );
                      toast({
                        title: newLiked ? "Added to favorites" : "Removed from favorites",
                        duration: 2000,
                      });
                    }}
                    className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors ${
                        likedItineraries.includes(itinerary.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                )}

                {/* Card cutout overlay */}
                <div className="absolute -top-3 -left-3 bg-white">
                  <div className="relative w-[140px] h-[64px]">
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute bottom-0 right-0 w-[30px] h-[30px]" />
                      <div className="absolute bottom-0 right-0 w-[32px] h-[32px] rounded-tl-xl" />
                    </div>
                  </div>
                </div>
                
                {/* Image Container */}
                  <div className="relative h-56 left-clip">
    {isAuthenticated && (
      <button
        onClick={(e) => {
          e.preventDefault();
          const newLiked = !likedItineraries.includes(itinerary.id);
          setLikedItineraries(prev => 
            newLiked ? [...prev, itinerary.id] : prev.filter(id => id !== itinerary.id)
          );
          toast({
            title: newLiked ? "Added to favorites" : "Removed from favorites",
            duration: 2000,
          });
        }}
        className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
      >
        <Heart 
          className={`w-5 h-5 transition-colors ${
            likedItineraries.includes(itinerary.id)
              ? "fill-red-500 text-red-500"
              : "text-gray-600"
          }`}
        />
      </button>
    )}
    <Image
      src={itinerary.image}
      alt={itinerary.title}
      fill
      className="object-cover rounded-lg"
    />
                  {/* Status Badge */}
                  {itinerary.status && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-4 py-1.5 bg-black/80 text-white text-sm rounded-full capitalize">
                        {itinerary.status === "highly rated" ? "Top Rated" :
                         itinerary.status === "most viewed" ? "Trending" :
                         "Popular"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div className="py-6 px-2 h-[230px]">
                  <h3 className="text-2xl font-semibold mb-1">{itinerary.title}</h3>
                  {/* <p className="text-gray-600 text-sm mb-4">{itinerary.description}</p> */}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center flex-1">
                      {/* <MapPin className="h-4 w-4 mr-1 flex-shrink-0" /> */}
                      <div className="flex text-lg font-medium text-gray-500 mb-1">
                        <span className=" mr-1">
                          {itinerary.countries.length > 2 
                            ? "Multi Country Trip"
                            : itinerary.countries.join(' & ')}
                        </span>
                        in {itinerary.duration}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      2-4
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500 truncate">
                      {itinerary.cities.join(' · ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {itinerary.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="px-2 py-1 bg-black text-white text-md rounded-full capitalize">
                        Est. {itinerary.price}
                      </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Mountain, Utensils, Building, Palmtree, Camera, Tent, Bike, Ship, Wine, Heart, Music, Sparkles, Waves, Snowflake, Star, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { AdvancedFilterDialog } from "@/components/ui/advanced-filter-dialog"
import { QuickFilterList } from "@/components/ui/quick-filter-list"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { auth } from "@/lib/firebase"
import { CategoryCard } from "@/components/ui/category-card"

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(auth.currentUser)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user)
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  return {
    isAuthenticated,
    user
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
    status: "popular",
    continent: "Asia",
    regions: ["East Asia"],
    accommodation: ["Hotel", "Ryokan"],
    transportation: ["Train", "Bus"],
    rating: 4.8
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
    status: "highly rated",
    continent: "Europe",
    regions: ["Southern Europe"],
    accommodation: ["Hotel", "Villa"],
    transportation: ["Train", "Private Car"],
    rating: 4.9
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
    tags: ["adventure", "nature", "beach"],
    continent: "North America",
    regions: ["Central America"],
    accommodation: ["Resort", "Eco Lodge"],
    transportation: ["Bus", "Private Car"],
    rating: 4.7
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
    status: "most viewed",
    continent: "Europe",
    regions: ["Southern Europe"],
    accommodation: ["Hotel", "Villa"],
    transportation: ["Ferry", "Private Car"],
    rating: 4.6
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
    status: "popular",
    continent: "Asia",
    regions: ["Southeast Asia"],
    accommodation: ["Hotel", "Resort"],
    transportation: ["Train", "Bus"],
    rating: 4.5
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
    status: "highly rated",
    continent: "Europe",
    regions: ["Central Europe"],
    accommodation: ["Hotel", "Chalet"],
    transportation: ["Train", "Cable Car"],
    rating: 4.8
  }
]

const filters = {
  destinations: ["Japan", "Italy", "Costa Rica", "Thailand", "Greece", "Switzerland"],
  duration: ["1-3 days", "4-7 days", "8-14 days", "15-21 days", "21+ days"],
  budget: ["Under $1000", "$1000-$2000", "$2000-$3000", "$3000-$5000", "$5000+"],
  quickFilters: ["All", "Popular", "Most Viewed", "Best Rated", "New", "Trending", "Budget Friendly", "Luxury"],
  sortOptions: [
    { value: "popular", label: "Most Popular" },
    { value: "recent", label: "Most Recent" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "duration-short", label: "Duration: Shortest" },
    { value: "duration-long", label: "Duration: Longest" },
  ],
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
  const searchParams = useSearchParams()
  const [selectedFilters, setSelectedFilters] = useState({
    destination: "",
    duration: "",
    budget: "",
    tags: [] as string[],
    sort: "popular",
    regions: [] as string[],
    continents: [] as string[],
    accommodation: [] as string[],
    transportation: [] as string[],
    rating: "",
    quickFilter: "All"
  })
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [likedItineraries, setLikedItineraries] = useState<number[]>([])

  // Initialize filters from URL params
  useEffect(() => {
    const destination = searchParams.get("destination")
    const duration = searchParams.get("duration")
    const budget = searchParams.get("budget")

    if (destination || duration || budget) {
      setSelectedFilters(prev => ({
        ...prev,
        destination: destination || "",
        duration: duration || "",
        budget: budget || "",
      }))
    }
  }, [searchParams])

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

  // Filter itineraries based on all selected filters
  const filteredItineraries = itineraries.filter(itinerary => {
    // Quick filter
    if (selectedFilters.quickFilter !== "All") {
      const quickFilterMap: { [key: string]: (i: typeof itinerary) => boolean } = {
        "Popular": i => i.status === "popular",
        "Most Viewed": i => i.status === "most viewed",
        "Best Rated": i => i.status === "highly rated",
        "New": i => i.id > itineraries.length - 2,
        "Trending": i => i.status === "popular" || i.status === "most viewed",
        "Budget Friendly": i => parseInt(i.price.replace(/\D/g, "")) < 2000,
        "Luxury": i => parseInt(i.price.replace(/\D/g, "")) > 3000
      }
      if (quickFilterMap[selectedFilters.quickFilter] && !quickFilterMap[selectedFilters.quickFilter](itinerary)) {
        return false
      }
    }

    // Basic filters
    if (selectedFilters.destination && !itinerary.countries.includes(selectedFilters.destination)) {
      return false
    }
    if (selectedFilters.tags.length > 0 && !selectedFilters.tags.some(tag => itinerary.tags.includes(tag))) {
      return false
    }

    // Continent filter
    if (selectedFilters.continents.length > 0 && !selectedFilters.continents.some(continent => itinerary.continent?.includes(continent))) {
      return false
    }

    // Region filter
    if (selectedFilters.regions.length > 0 && !selectedFilters.regions.some(region => itinerary.regions?.includes(region))) {
      return false
    }

    // Accommodation filter
    if (selectedFilters.accommodation.length > 0 && 
        !selectedFilters.accommodation.some(acc => itinerary.accommodation?.includes(acc))) {
      return false
    }

    // Transportation filter
    if (selectedFilters.transportation.length > 0 && 
        !selectedFilters.transportation.some(trans => itinerary.transportation?.includes(trans))) {
      return false
    }

    // Rating filter
    if (selectedFilters.rating && itinerary.rating < parseFloat(selectedFilters.rating)) {
      return false
    }

    return true
  }).sort((a, b) => {
    switch (selectedFilters.sort) {
      case "price-low":
        return parseInt(a.price.replace(/\D/g, "")) - parseInt(b.price.replace(/\D/g, ""))
      case "price-high":
        return parseInt(b.price.replace(/\D/g, "")) - parseInt(a.price.replace(/\D/g, ""))
      case "duration-short":
        return parseInt(a.duration) - parseInt(b.duration)
      case "duration-long":
        return parseInt(b.duration) - parseInt(a.duration)
      case "rating-high":
        return (b.rating || 0) - (a.rating || 0)
      case "recent":
        return b.id - a.id
      default: // popular
        return b.status === "popular" ? 1 : -1
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Popular Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <CategoryCard
              name="Adventure"
              icon={Mountain}
              imageUrl="https://images.unsplash.com/photo-1519681393784-d120267933ba"
              onClick={() => setSelectedFilters(prev => ({ ...prev, tags: ['adventure'] }))}
              className="aspect-[4/3]"
            />
            <CategoryCard
              name="Food & Dining"
              icon={Utensils}
              imageUrl="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
              onClick={() => setSelectedFilters(prev => ({ ...prev, tags: ['food'] }))}
              className="aspect-[4/3]"
            />
            <CategoryCard
              name="Beach"
              icon={Palmtree}
              imageUrl="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
              onClick={() => setSelectedFilters(prev => ({ ...prev, tags: ['beach'] }))}
              className="aspect-[4/3]"
            />
            <CategoryCard
              name="Cultural"
              icon={Building}
              imageUrl="https://images.unsplash.com/photo-1533050487297-09b450131914"
              onClick={() => setSelectedFilters(prev => ({ ...prev, tags: ['culture'] }))}
              className="aspect-[4/3]"
            />
          </div>
        </section>

        <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
        {/* Filters Bar */}
        <div className="flex flex-col mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <select
                className="px-4 cursor-pointer py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-travel-900 bg-white"
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
                className="px-4 py-2 cursor-pointer border rounded-lg focus:outline-none focus:ring-2 focus:ring-travel-900 bg-white"
                value={selectedFilters.duration}
                onChange={(e) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
              >
                <option value="">Any Duration</option>
                {filters.duration.map((dur) => (
                  <option key={dur} value={dur}>
                    {dur}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-2 cursor-pointer border rounded-lg focus:outline-none focus:ring-2 focus:ring-travel-900 bg-white"
                value={selectedFilters.budget}
                onChange={(e) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    budget: e.target.value,
                  }))
                }
              >
                <option value="">Any Budget</option>
                {filters.budget.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end">
              <AdvancedFilterDialog
                destinations={filters.destinations}
                duration={filters.duration}
                budget={filters.budget}
                tags={filters.tags}
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-2">
            <QuickFilterList
              filters={filters.quickFilters}
              selectedFilter={selectedFilters.quickFilter}
              onFilterChange={(filter) =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  quickFilter: filter,
                }))
              }
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedFilters.tags.length > 0 || 
          selectedFilters.accommodation.length > 0 || 
          selectedFilters.transportation.length > 0 || 
          selectedFilters.rating || 
          selectedFilters.regions.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedFilters.regions.map(region => (
              <div key={region} className="bg-travel-50 text-travel-900 px-3 py-1 rounded-full text-sm font-medium">
                {region}
              </div>
            ))}
            {selectedFilters.rating && (
              <div className="bg-travel-50 text-travel-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Star className="h-4 w-4" />
                {selectedFilters.rating}+
              </div>
            )}
            {selectedFilters.accommodation.map(acc => (
              <div key={acc} className="bg-travel-50 text-travel-900 px-3 py-1 rounded-full text-sm font-medium">
                {acc}
              </div>
            ))}
            {selectedFilters.transportation.map(trans => (
              <div key={trans} className="bg-travel-50 text-travel-900 px-3 py-1 rounded-full text-sm font-medium">
                {trans}
              </div>
            ))}
            {selectedFilters.tags.map(tag => (
              <div key={tag} className="bg-travel-50 text-travel-900 px-3 py-1 rounded-full text-sm font-medium">
                {tag}
              </div>
            ))}
          </div>
        )}

        
         <div className="flex justify-between items-center mb-8">
            <p>1000 Results</p>
            <div className="flex items-center gap-2">
              <p>Sort By:</p>
              <select
                className="px-4 py-2 cursor-pointer border rounded-lg focus:outline-none focus:ring-2 focus:ring-travel-900 bg-white"
                value={selectedFilters.sort}
                onChange={(e) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    sort: e.target.value,
                  }))
                }
              >
                {filters.sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

        {/* Itineraries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItineraries.map((itinerary) => (
            <Link href={`/itinerary/${itinerary.id}`} className="block relative" key={itinerary.id}>
              
              <motion.div
                className="overflow-hidden relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
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
        <Bookmark 
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
      className="object-cover rounded-xl"
    />
                  {/* Status Badge */}
                  {itinerary.status && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-4 py-1.5 bg-black/80 text-white text-sm rounded-lg capitalize">
                        {itinerary.status === "highly rated" ? "Top Rated" :
                         itinerary.status === "most viewed" ? "Trending" :
                         "Popular"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div className="py-4 px-2 h-[230px]">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center flex-1">
                    <h3 className="text-xl font-semibold mb-1">{itinerary.title}</h3>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      2-4
                    </div>
                  </div>
                  
                  <div className="flex text-lg font-medium text-gray-500 mb-1">
                    <span className=" mr-1">
                      {itinerary.countries.length > 2 
                        ? "Multi Country Trip"
                        : itinerary.countries.join(' & ')}
                    </span>
                    in {itinerary.duration}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{itinerary.description}</p>
                  
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
                    <span className="px-2 py-1 bg-black text-white text-md rounded-xl capitalize">
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
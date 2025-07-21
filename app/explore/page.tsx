"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { AdvancedFilterDialog } from "@/components/ui/advanced-filter-dialog"
import { QuickFilterList } from "@/components/ui/quick-filter-list"
import { useSearchParams } from "next/navigation"
import { auth } from "@/firebase/client"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { activityTags, itineraryTags, sortOptions, quickFilters } from "@/lib/constants/tags"
import { Bookmark, Star } from "lucide-react"

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
    duration: "14",
    cities: ["Tokyo", "Kyoto", "Osaka"],
    countries: ["Japan"],
    price: "$3,499",
    itineraryTags: ["cultural", "romantic"],
    activityTags: ["culture", "food", "history"],
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
    duration: "10",
    cities: ["Rome", "Florence", "Venice"],
    countries: ["Italy"],
    price: "",
    itineraryTags: ["culinary", "romantic"],
    activityTags: ["food", "wine", "culture"],
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
    duration: "7",
    cities: ["San José", "Arenal", "Manuel Antonio"],
    countries: ["Costa Rica", "Panama"],
    price: "$1,999",
    itineraryTags: ["tropical", "action packed"],
    activityTags: ["adventure", "nature", "beach"],
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
    duration: "12",
    cities: ["Athens", "Santorini", "Mykonos"],
    countries: ["Greece", "Turkey", "Bulgaria"],
    price: "$2,799",
    itineraryTags: ["road trip", "tropical"],
    activityTags: ["beach", "culture", "history"],
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
    duration: "10",
    cities: ["Bangkok", "Chiang Mai", "Phuket"],
    countries: ["Thailand"],
    price: "",
    itineraryTags: ["budget", "volunteering"],
    activityTags: ["adventure", "culture", "food"],
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
      duration: "8",
    cities: ["Zurich", "Lucerne", "Interlaken"],
    countries: ["Switzerland"],
    price: "$3,299",
    itineraryTags: ["romantic", "wellness", "luxury"],
    activityTags: ["adventure", "nature", "history"],
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
  quickFilters,
  sortOptions,
  itineraryTags,
  activityTags,
}

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const [selectedFilters, setSelectedFilters] = useState({
    destination: "",
    duration: "",
    budget: "",
    itineraryTags: [] as string[],
    activityTags: [] as string[],
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
    if (selectedFilters.itineraryTags.length > 0 && !selectedFilters.itineraryTags.some(tag => itinerary.itineraryTags.includes(tag))) {
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
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
        {/* Filters Bar */}
        <div className="flex flex-col mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                value={selectedFilters.destination}
                onValueChange={(value) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    destination: value === "all" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="w-full rounded-xl px-3 py-2.5">
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  {filters.destinations.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedFilters.duration === "" ? "all" : selectedFilters.duration}
                onValueChange={(value) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    duration: value === "all" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="w-full rounded-xl px-3 py-2.5">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Duration</SelectItem>
                  {filters.duration.map((dur) => (
                    <SelectItem key={dur} value={dur}>
                      {dur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedFilters.budget === "" ? "all" : selectedFilters.budget}
                onValueChange={(value) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    budget: value === "all" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="w-full rounded-xl px-3 py-2.5">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Budget</SelectItem>
                  {filters.budget.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end rounded-xl">
              <AdvancedFilterDialog
                destinations={filters.destinations}
                duration={filters.duration}
                budget={filters.budget}
                itineraryTags={filters.itineraryTags}
                activityTags={filters.activityTags}
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
              />
            </div>
          </div>

          <div className="flex hidden justify-between items-center max-w-screen-lg mx-auto gap-2">
            {/* Quick Filters */}
            <div className="mt-2 flex-1">
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
        </div>

        {/* Active Filters Display */}
        {(selectedFilters.itineraryTags.length > 0 || 
          selectedFilters.activityTags.length > 0 || 
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
            {selectedFilters.itineraryTags.map(tag => (
              <div key={tag} className="bg-travel-50 text-travel-900 px-3 py-1 rounded-full text-sm font-medium">
                {tag}
              </div>
            ))}
            {selectedFilters.activityTags.map(tag => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
          {filteredItineraries.map((itinerary) => (
            <Link href={`/itinerary/${itinerary.id}`} className="block relative" key={itinerary.id}>
              
              <motion.div
                className="group relative overflow-hidden cursor-pointer bg-white"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* Image Container */}
                <div className="relative aspect-[3/2] md:aspect-[4/5] relative rounded-2xl overflow-hidden">
                    <Image
                      src={itinerary.image}
                      alt={itinerary.title}
                      fill
                      className="object-cover"
                    />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  {/* Badges */}
                  {itinerary.status && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-4 py-1.5 bg-black/80 text-white text-sm rounded-xl capitalize">
                        {itinerary.status === "highly rated" ? "Top Rated" :
                         itinerary.status === "most viewed" ? "Trending" :
                         "Popular"}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <button className="bg-white/40 text-black hover:bg-white/80 px-2 py-2 rounded-full">
                      <Bookmark className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-3 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                    <h4 className="font-bold text-2xl mb-1">{itinerary.title}</h4>
                    <span className="text-sm text-white/80 truncate">
                      {itinerary.cities.join(' · ')}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="py-2 px-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center flex-1">
                    </div>
                  </div>
                  
                  <div className="flex text-[20px] font-medium my-1">
                  {itinerary.duration} 
                  {itinerary.countries.length <= 2  ? 
                    <span className="mx-1">
                      {parseInt(itinerary.duration) > 1 ? " days in " : " day in "}
                    </span>
                  :
                  <span className="mx-1">
                    day 
                  </span>
                  }
                    <span className=" mr-1">
                      {itinerary.countries.length > 2 
                        ? "multi-country trip"
                        : itinerary.countries.join(' & ')}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-4 leading-5 text-md mb-2">{itinerary.description}</p>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-start gap-2">
                      {itinerary.itineraryTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      {itinerary.price && (
                        <span className="px-2 py-1 max-h-[32px] gap-2 bg-black text-white text-md rounded-xl capitalize">
                          Est. {itinerary.price}
                        </span>
                      )}
                    </div>
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
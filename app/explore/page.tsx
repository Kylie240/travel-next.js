"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { AdvancedFilterDialog } from "@/components/ui/advanced-filter-dialog"
import { QuickFilterList } from "@/components/ui/quick-filter-list"
import { useSearchParams } from "next/navigation"
import { auth } from "@/firebase/client"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { activityTags, itineraryTags, sortOptions, quickFilters } from "@/lib/constants/tags"
import { Star } from "lucide-react"
import { Itinerary } from "@/types/itinerary"

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(auth.currentUser)
  const [itineraries, setItineraries] = useState<Itinerary[]>([])

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

const filters = {
  destinations: ["Japan", "Italy", "Costa Rica", "Thailand", "Greece", "Switzerland"],
  duration: ["1-3 days", "4-7 days", "8-14 days", "15-21 days", "21+ days"],
  budget: ["Under $1000", "$1000-$2000", "$2000-$3000", "$3000-$5000", "$5000+"],
  quickFilters,
  sortOptions,
  itineraryTags,
  activityTags,
}

export default async function ExplorePage() {
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

      </div>
    </div>
  )
} 
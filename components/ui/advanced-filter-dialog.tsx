"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X, SlidersHorizontal, Check } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface FilterOption {
  name: string
  icon?: any
}

interface AdvancedFilterDialogProps {
  destinations: string[]
  duration: string[]
  budget: string[]
  itineraryTags: FilterOption[]
  activityTags: FilterOption[]
  selectedFilters: {
    destination: string
    duration: string
    budget: string
    itineraryTags: string[]
    activityTags: string[]
    regions: string[]
    continents: string[]
    accommodation: string[]
    transportation: string[]
    rating: string
    sort: string
    quickFilter: string
  }
  onFilterChange: (filters: {
    destination: string
    duration: string
    budget: string
    itineraryTags: string[]
    activityTags: string[]
    regions: string[]
    continents: string[]
    accommodation: string[]
    transportation: string[]
    rating: string
    sort: string
    quickFilter: string
  }) => void
}

const itineraryItems = [
  "accomodations",
  "activities",
  "transportation"
]

const continents = [
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Africa",
  "Oceania",
  "Antarctica"
]

const regions = [
  "Western Europe",
  "Eastern Europe",
  "Mediterranean",
  "Nordic Countries",
  "North America",
  "Central America",
  "South America",
  "Caribbean",
  "East Asia",
  "Southeast Asia",
  "South Asia",
  "Middle East",
  "North Africa",
  "Sub-Saharan Africa",
  "Oceania",
  "Pacific Islands"
]

const accommodationTypes = [
  "Hotel",
  "Resort",
  "Boutique Hotel",
  "Hostel",
  "Airbnb",
  "Vacation Rental",
  "Camping",
  "Glamping",
  "Luxury Villa",
  "Eco Lodge",
  "Guesthouse",
]

const transportationTypes = [
  "Flight",
  "Train",
  "Bus",
  "Cruise",
  "Self-drive",
  "Private Driver",
  "Group Tour",
  "Walking Tour",
  "Bike Tour",
  "Public Transport"
]

const ratingOptions = [
  { value: "4.5", label: "4.5+ Stars" },
  { value: "4.0", label: "4.0+ Stars" },
  { value: "3.5", label: "3.5+ Stars" },
  { value: "3.0", label: "3.0+ Stars" }
]

export function AdvancedFilterDialog({
  destinations,
  duration,
  budget,
  itineraryTags,
  activityTags,
  selectedFilters,
  onFilterChange,
}: AdvancedFilterDialogProps) {
  const handleItineraryTagToggle = (tag: string) => {
    const newTags = selectedFilters.itineraryTags.includes(tag)
      ? selectedFilters.itineraryTags.filter((t) => t !== tag)
      : [...selectedFilters.itineraryTags, tag]
    onFilterChange({ ...selectedFilters, itineraryTags: newTags })
  }

  const handleActivityTagToggle = (tag: string) => {
    const newTags = selectedFilters.activityTags.includes(tag)
      ? selectedFilters.activityTags.filter((t) => t !== tag)
      : [...selectedFilters.activityTags, tag]
    onFilterChange({ ...selectedFilters, activityTags: newTags })
  }

  const handleRegionToggle = (region: string) => {
    const newRegions = selectedFilters.regions.includes(region)
      ? selectedFilters.regions.filter((r) => r !== region)
      : [...selectedFilters.regions, region]
    onFilterChange({ ...selectedFilters, regions: newRegions })
  }

  const handleAccommodationToggle = (type: string) => {
    const newAccommodation = selectedFilters.accommodation.includes(type)
      ? selectedFilters.accommodation.filter((t) => t !== type)
      : [...selectedFilters.accommodation, type]
    onFilterChange({ ...selectedFilters, accommodation: newAccommodation })
  }

  const handleTransportationToggle = (type: string) => {
    const newTransportation = selectedFilters.transportation.includes(type)
      ? selectedFilters.transportation.filter((t) => t !== type)
      : [...selectedFilters.transportation, type]
    onFilterChange({ ...selectedFilters, transportation: newTransportation })
  }

  const handleContinentToggle = (continent: string) => {
    const newContinents = selectedFilters.continents.includes(continent)
      ? selectedFilters.continents.filter((c) => c !== continent)
      : [...selectedFilters.continents, continent]
    onFilterChange({ ...selectedFilters, continents: newContinents })
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-white border border-1 border-gray-300 px-3 py-2.5">
          <span className="text-sm">Filters</span>
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white shadow-lg z-[10000] overflow-hidden flex flex-col">
          <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b shadow-sm">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-bold">
                Advanced Filters
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>
          

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Continent Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Continents
              </label>
              <div className="grid grid-cols-3 gap-2">
                {continents.map((continent) => {
                  const isSelected = selectedFilters.continents.includes(continent)
                  return (
                    <div key={continent} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-md font-regular cursor-pointer border border-1 border-gray-300 hover:bg-gray-200 ${isSelected ? "bg-gray-100 ring-2 ring-gray-700" : ""}`} onClick={() => handleContinentToggle(continent)}>
                      {isSelected ? <Check className="h-5 w-5 bg-black p-1 text-white rounded-full" /> : <div className="h-5 w-5 bg-gray-white rounded-full border border-1 border-gray-300" />}
                      {continent}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Region Filter */}
            {/* <div>
              <label className="block text-md font-semibold text-gray-700 mb-3">
                Region
              </label>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => {
                  const isSelected = selectedFilters.regions.includes(region)
                  return (
                    <div key={region} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full text-sm font-medium cursor-pointer border border-1 border-gray-300 hover:bg-gray-200 ${isSelected ? "bg-gray-100" : ""}`} onClick={() => handleRegionToggle(region)}>
                      {isSelected ? <Check className="h-5 w-5 bg-black p-1 text-white rounded-full" /> : <div className="h-5 w-5 bg-gray-white rounded-full border border-1 border-gray-300" />}
                      {region}
                    </div>
                  )
                })}
              </div>
            </div> */}

            {/* Rating Filter */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-travel-900"
                value={selectedFilters.rating}
                onChange={(e) =>
                  onFilterChange({
                    ...selectedFilters,
                    rating: e.target.value,
                  })
                }
              >
                <option value="">Any Rating</option>
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div> */}

            

          {/* Itinerary Tags Filter */}
          <div>
            <div>
              <label className="block text-md font-semibold text-gray-700 mb-3">
                Itinerary Tags
              </label>
              <div className="flex flex-wrap gap-2 space-y-1">
                {itineraryTags.map((tag) => {
                  const Icon = tag.icon
                  const isSelected = selectedFilters.itineraryTags.includes(tag.name)
                  return (
                    <div
                      key={tag.name}
                      onClick={() => handleItineraryTagToggle(tag.name)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-md font-regular cursor-pointer border border-1 border-gray-300 hover:bg-gray-200 ${isSelected ? "bg-gray-100 ring-2 ring-gray-700" : ""}`}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      {tag.name}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>


            {/* Accommodation Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accommodation Types
              </label>
              <div className="flex flex-wrap gap-2">
                {accommodationTypes.map((type) => {
                  const isSelected = selectedFilters.accommodation.includes(type)
                  return (
                    <button
                      key={type}
                      onClick={() => handleAccommodationToggle(type)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-travel-100 text-travel-900"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Transportation Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transportation Types
              </label>
              <div className="flex flex-wrap gap-2">
                {transportationTypes.map((type) => {
                  const isSelected = selectedFilters.transportation.includes(type)
                  return (
                    <button
                      key={type}
                      onClick={() => handleTransportationToggle(type)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-travel-100 text-travel-900"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Activity Tags Filter */}
            <div>
              <label className="block text-md font-semibold text-gray-700 mb-3">
                Activity Tags
              </label>
              <div className="flex flex-wrap gap-2 space-y-1">
                {activityTags.map((tag) => {
                  const Icon = tag.icon
                  const isSelected = selectedFilters.activityTags.includes(tag.name)
                  return (
                    <div
                      key={tag.name}
                      onClick={() => handleActivityTagToggle(tag.name)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-md font-regular cursor-pointer border border-1 border-gray-300 hover:bg-gray-200 ${isSelected ? "bg-gray-100 ring-2 ring-gray-700" : ""}`}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      {tag.name}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button
                variant="outline"
                onClick={() =>
                  onFilterChange({
                    ...selectedFilters,
                    regions: [],
                    accommodation: [],
                    transportation: [],
                    rating: "",
                    itineraryTags: [],
                    activityTags: [],
                  })
                }
              >
                Reset
              </Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button>Apply Filters</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
} 
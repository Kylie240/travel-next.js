"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

// Dummy data for itineraries
const itineraries = [
  {
    id: 1,
    title: "Japanese Cultural Journey",
    description: "Experience the best of Japan's ancient traditions and modern wonders",
    image: "/images/japan.jpg",
    duration: "14 days",
    destinations: ["Tokyo", "Kyoto", "Osaka"],
    price: "$3,499",
    tags: ["culture", "food", "history"],
  },
  {
    id: 2,
    title: "Italian Food & Wine Tour",
    description: "Savor the flavors of Italy's finest culinary regions",
    image: "/images/italy.jpg",
    duration: "10 days",
    destinations: ["Rome", "Florence", "Venice"],
    price: "$2,899",
    tags: ["food", "wine", "culture"],
  },
  {
    id: 3,
    title: "Costa Rica Adventure",
    description: "Explore rainforests, volcanoes, and pristine beaches",
    image: "/images/costa-rica.jpg",
    duration: "7 days",
    destinations: ["San José", "Arenal", "Manuel Antonio"],
    price: "$1,999",
    tags: ["adventure", "nature", "beach"],
  },
  // Add more itineraries...
]

const filters = {
  destinations: ["Japan", "Italy", "Costa Rica", "Thailand", "France"],
  duration: ["1-7 days", "8-14 days", "15+ days"],
  budget: ["$0-$1000", "$1000-$3000", "$3000+"],
  tags: ["adventure", "culture", "food", "nature", "beach", "history", "wine"],
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState({
    destination: "",
    duration: "",
    budget: "",
    tags: [] as string[],
  })

  const toggleTag = (tag: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
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
            {filters.tags.map((tag) => (
              <Button
                key={tag}
                variant={selectedFilters.tags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTag(tag)}
                className="capitalize"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Itineraries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {itineraries.map((itinerary) => (
            <motion.div
              key={itinerary.id}
              className="bg-white rounded-lg shadow-md overflow-hidden card-hover"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={`/itinerary/${itinerary.id}`}>
                <div className="relative h-48">
                  <Image
                    src={itinerary.image}
                    alt={itinerary.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{itinerary.title}</h3>
                  <p className="text-gray-600 mb-4">{itinerary.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {itinerary.duration}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {itinerary.destinations[0]}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      2-4
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-travel-600">
                      {itinerary.price}
                    </span>
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
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 
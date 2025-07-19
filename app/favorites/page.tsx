"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Bookmark, Heart, Search } from "lucide-react"
import { auth } from "@/lib/firebase"
import { Input } from "@/components/ui/input"

const dummyFavorites = [
  {
    id: 4,
    title: "Barcelona Food Tour",
    description: "Experience the best of Barcelona",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=2070&auto=format&fit=crop",
    author: "FoodieExplorer",
    countries: ["Spain"],
    likes: 45,
    days: 2
  },
  {
    id: 5,
    title: "Swiss Alps Hiking",
    description: "Experience the best of Switzerland",
    image: "https://images.unsplash.com/photo-1531210483974-4f8c1f33fd35?q=80&w=2070&auto=format&fit=crop",
    author: "AdventureSeeker",
    countries: ["Switzerland"],
    likes: 56,
    days: 5
  }
]

export default function FavoritesPage() {
  const router = useRouter()
  const [user, setUser] = useState(auth.currentUser)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/")
        return
      }
      setUser(user)
    })

    return () => unsubscribe()
  }, [router])

  const filteredFavorites = dummyFavorites.filter(itinerary => 
    itinerary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    itinerary.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    itinerary.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    itinerary.countries.some(country => 
      country.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-semibold">Favorite Itineraries</h1>
        </div>

        <div className="relative mb-8">
          <Input
            type="text"
            placeholder="Search favorites by title, description, author or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredFavorites.map((itinerary) => (
              <motion.div
                key={itinerary.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
                onClick={() => router.push(`/itinerary/${itinerary.id}`)}
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={itinerary.image}
                    alt={itinerary.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>
                <div className="p-4 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                  <h4 className="font-bold text-2xl mb-1">{itinerary.title}</h4>
                  <p className="text-sm text-gray-200">by @{itinerary.author}</p>
                  <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                    {itinerary.countries.map((country) => country).join(" · ")}
                  </p>
                  <p className="text-sm mt-2">{itinerary.likes} likes</p>
                  <div className="absolute bottom-0 right-0">
                    <button 
                      className="bg-white/40 text-black hover:bg-white/80 px-2 py-2 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle unfavorite logic here
                      }}
                    >
                      <Bookmark className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed">
            <div className="mb-4">
              <Heart className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Favorites Yet</h3>
            <p className="text-gray-600 mb-4">Start exploring and save itineraries you like</p>
            <button 
              onClick={() => router.push('/explore')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Explore Itineraries
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 
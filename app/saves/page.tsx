"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Bookmark, Heart, MapPin, Search, ThumbsUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Session, User } from "@supabase/supabase-js"
import { getSavesByUserId, UnsaveItinerary } from "@/lib/actions/itinerary.actions"
import { SavedItinerary } from "@/types/savedItinerary"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import BookmarkElement from "../../components/ui/bookmark-element"

export default function SavesPage() { 
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [saves, setSaves] = useState<SavedItinerary[] | null>(null)
  const [filteredSaves, setFilteredSaves] = useState<SavedItinerary[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        setUser(null)
        setLoading(false)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const userItineraries = await getSavesByUserId(currentUser.id)
        setSaves(userItineraries as SavedItinerary[])
        setFilteredSaves(userItineraries as SavedItinerary[])
        setLoading(false)
      } else {
        setSaves(null)
        setFilteredSaves(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const refreshItineraries = async () => {
    if (user) {
      const userItineraries = await getSavesByUserId(user.id)
      setSaves(userItineraries as SavedItinerary[])
      setFilteredSaves(userItineraries as SavedItinerary[])
    }
  }

  const handleSearch = (searchTerm: string) => {
    if (searchTerm === "") {
      setFilteredSaves(saves)
      return
    }

    setSearchTerm(searchTerm)
    setFilteredSaves(saves?.filter(itinerary => 
      itinerary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itinerary.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itinerary.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itinerary.countries.some(country => 
        country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ))
  }

  const handleUnsave = async (itineraryId: string) => {
    const result = await UnsaveItinerary(itineraryId)
    if (result.success) {
      toast.success('Itinerary unsaved successfully')
      setSaves(saves?.filter(itinerary => itinerary.id !== itineraryId))
      refreshItineraries()
    }
    else {
      toast.error('Failed to unsave itinerary')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-12 sm:pt-[6rem]">
      <div className="container mx-auto px-6 md:px-[3rem] lg:px-[6rem]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Saved Itineraries</h1>
        </div>

        {saves && saves.length > 6 && (
        <div className="relative mb-8">
          <Input
            type="text"
            placeholder="Search itineraries..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 rounded-xl lg:max-w-[550px]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        )}

        {filteredSaves && filteredSaves.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredSaves.map((itinerary) => (
              <div
                key={itinerary.id}
                className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
                onClick={() => router.push(`/itinerary/${itinerary.id}`)}
              >
                <div className="relative aspect-[2/3]">
                  <Image
                    src={itinerary.mainImage}
                    alt={itinerary.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>
                <div className="p-4 sm:m-1 md:m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                  <p className="text-sm flex flex-wrap items-center gap-1 mt-1 opacity-90">
                      <MapPin size={14} /> {itinerary.countries.map((country) => country).join(" · ")}
                  </p>
                  <p className="font-medium leading-6 text-lg sm:text-xl md:text-2xl max-h-[180px] line-clamp-4 overflow-hidden">{itinerary.title}</p>
                  <div className="flex justify-between items-end">
                    <p className="text-sm text-gray-200/50">@{itinerary.creatorUsername}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <BookmarkElement itineraryId={itinerary.id} currentUserId={user?.id || ''} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed">
            <div className="mb-4">
              <Heart className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Saves Yet</h3>
            <p className="text-gray-600 mb-4">Start exploring and saving itineraries you like (coming soon)</p>
            <button 
              disabled={true}
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
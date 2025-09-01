"use client"

import Image from "next/image"
import { MoreVertical, Edit, Trash2, PenSquare, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { getItineraryByUserId } from "@/lib/actions/itinerary.actions"
import Link from "next/link"
import DeleteButton from "./delete-button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Itinerary } from "@/types/itinerary"
import { useEffect, useState } from "react"
import { User, Session } from "@supabase/supabase-js"

export default function MyItinerariesPage() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          const userItineraries = await getItineraryByUserId(user.id)
          setItineraries(userItineraries)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const userItineraries = await getItineraryByUserId(currentUser.id)
        setItineraries(userItineraries)
      } else {
        setItineraries([])
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-semibold mb-6">My Itineraries</h1>
          <Button>
            <Link href="/create">
              Create New Itinerary
            </Link>
          </Button>
        </div>

        {itineraries && itineraries?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {itineraries.map((itinerary: Itinerary) => (
              <Link key={itinerary.id} href={itinerary.status === 'published' ? `/itinerary/${itinerary.id}` : `/create?itineraryId=${itinerary.id}`}>
                <div
                  className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={itinerary.mainImage || "/images/placeholder.jpg"}
                      alt={itinerary.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm capitalize ${
                        itinerary.status === 'published' 
                          ? 'bg-green-500/80 text-white' 
                          : 'bg-gray-500/80 text-white'
                      }`}>
                        {itinerary.status}
                      </span>
                    </div>

                    {/* Actions Menu */}
                    <div className="absolute top-4 right-4">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button 
                            className="p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors">
                            <MoreVertical className="h-5 w-5 text-white" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="w-48 rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5"
                            align="end"
                            sideOffset={5}
                          >
                            <DropdownMenu.Item
                              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                            >
                              <Link href={`/create?itineraryId=${itinerary.id}`} className="flex items-center gap-1">
                                <Edit className="mr-2 h-4 w-4" />
                                  Edit Itinerary
                              </Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                            >
                              <Link href={`/itinerary/${itinerary.id}`} className="flex items-center gap-1">
                                <Eye className="mr-2 h-4 w-4" />
                                  View Itinerary
                              </Link>
                            </DropdownMenu.Item>
                            <DeleteButton itineraryId={itinerary.id} />
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>
                  </div>
                  <div className="p-4 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                    <h4 className="font-bold text-2xl mb-1">{itinerary.title}</h4>
                    <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                      {itinerary?.cities?.length > 0 ? itinerary.cities.map((city) => city.city).join(" · ") : itinerary.countries.join(" · ")}
                    </p>
                    <div className="flex gap-2 items-end">
                      <p className="text-sm mt-2">Views: {itinerary.views || 0}</p>
                      <span> | </span>
                      <p className="text-sm mt-2">Likes: {itinerary.likes || 0}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed">
            <div className="mb-4">
              <PenSquare className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Itineraries Created</h3>
            <p className="text-gray-600 mb-4">Start creating your first itinerary</p>
            <Button>
              <Link href="/create">
                Create New Itinerary
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 
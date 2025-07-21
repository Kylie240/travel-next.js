"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { MoreVertical, Edit, Trash2, PenSquare } from "lucide-react"
import { auth } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

const dummyCreated = [
  {
    id: 1,
    title: "Weekend in Paris",
    description: "Experience the best of Paris and the French Riviera",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop",
    countries: ["France"],
    likes: 24,
    days: 3,
    status: "published"
  },
  {
    id: 2,
    title: "Tokyo Adventure",
    description: "Experience the best of Japan",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2067&auto=format&fit=crop",
    countries: ["Japan"],
    likes: 18,
    days: 7,
    status: "draft"
  }
]

export default function MyItinerariesPage() {
  const router = useRouter()
  const [user, setUser] = useState(auth.currentUser)

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
          <h1 className="text-2xl md:text-4xl font-semibold mb-6">My Itineraries</h1>
          <Button onClick={() => router.push('/create')}>
            Create New Itinerary
          </Button>
        </div>

        {dummyCreated.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {dummyCreated.map((itinerary) => (
              <motion.div
                key={itinerary.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
                onClick={() => {itinerary.status === 'published' ? router.push(`/itinerary/${itinerary.id}`) : router.push(`/create?itineraryId=${itinerary.id}`)}}
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={itinerary.image}
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
                        <button className="p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors">
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
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/itinerary/${itinerary.id}/edit`)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Itinerary
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle delete logic here
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Itinerary
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                </div>
                <div 
                  className="p-4 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white"
                  onClick={() => router.push(`/itinerary/${itinerary.id}`)}
                >
                  <h4 className="font-bold text-2xl mb-1">{itinerary.title}</h4>
                  <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                    {itinerary.countries.map((country) => country).join(" · ")}
                  </p>
                  <p className="text-sm mt-2">{itinerary.likes} likes</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed">
            <div className="mb-4">
              <PenSquare className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Itineraries Created</h3>
            <p className="text-gray-600 mb-4">Start creating your first itinerary</p>
            <Button onClick={() => router.push('/create')}>
              Create New Itinerary
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 
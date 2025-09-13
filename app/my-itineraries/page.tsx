"use client"

import Image from "next/image"
import { MoreVertical, Edit, Trash2, PenSquare, Eye, Archive, Loader2, ThumbsUp, Bookmark, Router } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { deleteItinerary, getItineraryByUserId, getItinerarySummaries, updateItineraryStatus } from "@/lib/actions/itinerary.actions"
import Link from "next/link"
import DeleteButton from "./delete-button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Itinerary } from "@/types/itinerary"
import { useEffect, useState } from "react"
import { User, Session } from "@supabase/supabase-js"
import { ItineraryStatusEnum, ItineraryStatusEnumString } from "@/enums/itineraryStatusEnum"
import { ItinerarySummary } from "@/types/ItinerarySummary"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function MyItinerariesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [itineraries, setItineraries] = useState<Itinerary[]>(null)
  const [itinerarySummaries, setItinerarySummaries] = useState<ItinerarySummary[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
        setLoading(false)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const userItineraries = await getItinerarySummaries(currentUser.id)
        setItinerarySummaries(userItineraries as ItinerarySummary[])
        setLoading(false)
      } else {
        setItinerarySummaries(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-4xl font-semibold">My Itineraries</h1>
            {itinerarySummaries && itinerarySummaries?.length > 0 && (
              <p className="text-xl text-gray-500 md:text-2xl">
                ({itinerarySummaries?.length})
              </p>
            )}
          </div>
          {itinerarySummaries && itinerarySummaries?.length > 0 && (
            <Button disabled={loading}>
              <Link href="/create">
                Create New Itinerary
              </Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          (itinerarySummaries && itinerarySummaries?.length > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {itinerarySummaries.map((itinerary: ItinerarySummary) => (
                <Link key={itinerary.id} href={itinerary.status !== ItineraryStatusEnum.draft ? `/itinerary/${itinerary.id}` : `/create?itineraryId=${itinerary.id}`}>
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
                      {itinerary.status !== ItineraryStatusEnum.published && (
                        <div className="absolute top-5 left-5">
                          <span className={`px-3 py-2 rounded-full text-md capitalize bg-gray-500/80 text-white`}>
                            {ItineraryStatusEnumString[itinerary.status]}
                          </span>
                        </div>
                      )}
  
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
                                onClick={(event) => {
                                      event.stopPropagation()
                                      router.push(`/create?itineraryId=${itinerary.id}`)
                                  }}
                              >
                                <Link href={`/create?itineraryId=${itinerary.id}`} className="flex items-center gap-1">
                                  <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                              </DropdownMenu.Item>
                              {itinerary.status == ItineraryStatusEnum.archived && (
                                <DropdownMenu.Item
                                className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                 onClick={async (event) => {
                                      event.stopPropagation()
                                      if (confirm('Are you sure you want to publish this itinerary?')) {
                                          try {
                                              await updateItineraryStatus(itinerary.id, ItineraryStatusEnum.published)
                                              toast.success('Itinerary published successfully')
                                              window.location.reload()
                                          } catch (error) {
                                              toast.error('Failed to publish itinerary')
                                          }
                                      }
                                  }}
                              >
                                <div className="flex">
                                  <Archive className="mr-2 h-4 w-4" />
                                    Publish
                                </div>
                              </DropdownMenu.Item>
                              )}
                              {itinerary.status == ItineraryStatusEnum.published && (
                                <DropdownMenu.Item
                                className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                                 onClick={async (event) => {
                                      event.stopPropagation()
                                      if (confirm('Are you sure you want to archiv this itinerary?')) {
                                          try {
                                              await updateItineraryStatus(itinerary.id, ItineraryStatusEnum.archived)
                                              toast.success('Itinerary archived successfully')
                                              window.location.reload()
                                          } catch (error) {
                                              toast.error('Failed to archive itinerary')
                                          }
                                      }
                                  }}
                              >
                                <div className="flex">
                                  <Archive className="mr-2 h-4 w-4" />
                                    Archive
                                </div>
                              </DropdownMenu.Item>
                              )}
                              <DropdownMenu.Item
                                  className="flex items-center px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                                  onClick={async (event) => {
                                      event.stopPropagation()
                                      if (confirm('Are you sure you want to delete this itinerary?')) {
                                          try {
                                              await deleteItinerary(itinerary.id)
                                              toast.success('Itinerary deleted successfully')
                                              window.location.reload()
                                          } catch (error) {
                                              toast.error('Failed to delete itinerary')
                                          }
                                      }
                                  }}
                              >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                    </div>
                      <div className="p-4 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                        <h4 className="font-bold text-2xl">{itinerary.title}</h4>
                        <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                          {/* {itinerary?.cities?.length > 0 ? itinerary?.cities.map((city) => city.city).join(" · ") : itinerary.countries.join(" · ")} */}
                        </p>
                        {itinerary.status == ItineraryStatusEnum.published && (
                          <div className="flex gap-3">
                            <div className="flex gap-1 items-center">
                              <Eye className="h-4 w-4"/>
                              <p className="text-sm">{itinerary.views}</p>
                            </div>
                            <div className="flex relative items-center">
                              <ThumbsUp className="h-5 w-5 pb-1 pr-1"/>
                              <p className="text-sm">{itinerary.likes}</p>
                            </div>
                            <div className="flex relative items-center">
                              <Bookmark className="h-5 w-5 pb-1"/>
                              <p className="text-sm">{itinerary.saves}</p>
                            </div>
                          </div>
                        )}
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
          )
        )}
      </div>
    </div>
  )
} 
"use client"

import Image from "next/image"
import { MoreVertical, Edit, Trash2, PenSquare, Eye, Archive, Loader2, ThumbsUp, Bookmark, Share, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { deleteItinerary, getItinerarySummaries, updateItineraryStatus } from "@/lib/actions/itinerary.actions"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { User, Session } from "@supabase/supabase-js"
import { ItineraryStatusEnum, ItineraryStatusEnumString } from "@/enums/itineraryStatusEnum"
import { ItinerarySummary } from "@/types/ItinerarySummary"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

export default function MyItinerariesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [itinerarySummaries, setItinerarySummaries] = useState<ItinerarySummary[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredItinerarySummaries, setFilteredItinerarySummaries] = useState<ItinerarySummary[] | null>(null)

  const refreshItineraries = async () => {
    if (user) {
      try {
        setLoading(true)
        const userItineraries = await getItinerarySummaries(user.id)
        setItinerarySummaries(userItineraries as ItinerarySummary[])
        setFilteredItinerarySummaries(userItineraries as ItinerarySummary[])
      } catch (error) {
        toast.error('Failed to refresh itineraries')
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
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
        setFilteredItinerarySummaries(userItineraries as ItinerarySummary[])
        setLoading(false)
      } else {
        setItinerarySummaries(null)
        setFilteredItinerarySummaries(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm)
    setFilteredItinerarySummaries(itinerarySummaries?.filter(itinerary => 
      itinerary.title.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  }

  const handleDeleteItinerary = async (itineraryId: string) => {
    try {
      await deleteItinerary(itineraryId)
      toast.success('Itinerary deleted successfully')
      const newItinerarySummaries = itinerarySummaries?.filter(itinerary => itinerary.id !== itineraryId)
      setItinerarySummaries(newItinerarySummaries as ItinerarySummary[])
      setFilteredItinerarySummaries(newItinerarySummaries as ItinerarySummary[])
      // refreshItineraries()
    } catch (error) {
      toast.error('Failed to delete itinerary')
    }
  }

  return (
    <div className="min-h-screen bg-white pt-12 sm:pt-[6rem]">
      <div className="container mx-auto px-6 md:px-[3rem] lg:px-[6rem]">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-row items-center gap-2">
              <h1 className="text-3xl font-semibold">My Itineraries</h1>
              {itinerarySummaries && itinerarySummaries?.length > 0 && (
                <p className="text-xl text-gray-500 md:text-2xl">
                  ({itinerarySummaries?.length})
                </p>
              )}
            </div>
            {itinerarySummaries && itinerarySummaries?.length > 0 && (
              <Button disabled={loading}>
                <Link href="/create">
                <span className="hidden sm:block">
                  Create New Itinerary
                </span>
                <span className="sm:hidden">
                  <Edit />
                </span>
                </Link>
              </Button>
            )}
          </div>
          {itinerarySummaries && itinerarySummaries?.length > 0 && (
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
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          (filteredItinerarySummaries && filteredItinerarySummaries?.length > 0) ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredItinerarySummaries.map((itinerary: ItinerarySummary) => (
                <Link key={itinerary.id} href={itinerary.status !== ItineraryStatusEnum.draft ? `/itinerary/${itinerary.id}` : `/create?itineraryId=${itinerary.id}`}>
                  <div
                    className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gray-300 shadow-md"
                  >
                    <div className="relative aspect-[3/4]">
                      <Image
                        src={itinerary.mainImage || "/images/placeholder.jpg"}
                        alt={itinerary.title}
                        fill
                        className={`object-cover ${itinerary.status !== ItineraryStatusEnum.published ? "opacity-50" : ""}`}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      
                      {/* Status Badge */}
                      {itinerary.status !== ItineraryStatusEnum.published && (
                        <div className="absolute top-5 left-5">
                          <span className={`px-3 py-2 rounded-full text-md font-semibold capitalize bg-gray-700/80 text-white`}>
                            {ItineraryStatusEnumString[itinerary.status]}
                          </span>
                        </div>
                      )}
  
                      {/* Actions Menu */}
                      <div className="absolute top-4 right-4">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button 
                              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors">
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
                                              refreshItineraries()
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
                                              refreshItineraries()
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
                                              handleDeleteItinerary(itinerary.id)
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
                      {itinerary.status == ItineraryStatusEnum.published && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${window.location.href}/itinerary/${itinerary.id}`);
                            toast.success('Copied to clipboard')
                            }}
                          className="p-1.5 absolute top-8 mt-6 right-4 rounded-full bg-black/20 hover:bg-black/40 transition-colors">
                          <Share className="h-5 w-5 text-white" />
                        </button>
                      )}
                    </div>
                      <div className="px-4 pb-3 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                        <p className="font-medium text-2xl max-h-[180px] line-clamp-4 overflow-hidden">{itinerary.title}</p>
                        <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                          {/* {itinerary?.cities?.length > 0 ? itinerary?.cities.map((city) => city.city).join(" · ") : itinerary.countries.join(" · ")} */}
                        </p>
                        {itinerary.status == ItineraryStatusEnum.published && (
                          <div className="flex gap-3 mt-2">
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
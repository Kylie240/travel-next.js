import Image from "next/image"
import { MoreVertical, Edit, Trash2, PenSquare, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { getItineraryByUserId } from "@/data/itineraries"
import { cookies } from "next/headers"
import { auth } from "@/firebase/server"
import { redirect } from "next/navigation"

async function getUser() {
  const token = cookies().get("token")
  if (!token) {
    redirect("/")
  }

  try {
    const decodedToken = await auth.verifyIdToken(token.value)
    return decodedToken.uid
  } catch (error) {
    console.error("Error verifying token:", error)
    redirect("/")
  }
}

export default async function MyItinerariesPage() {
  const userId = await getUser()
  const itineraries = await getItineraryByUserId(userId)

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
            {itineraries.map((itinerary) => (
              <Link key={itinerary.id} href={itinerary.status === 'published' ? `/itinerary/${itinerary.id}` : `/create?itineraryId=${itinerary.id}`}>
                <div
                  className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={itinerary.mainImage || "/images/placeholder.jpg"}
                      alt={itinerary.name}
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
                            className="p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
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
                                window.location.href = `/create?itineraryId=${itinerary.id}`
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Itinerary
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex items-center px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                // TODO: Add delete confirmation dialog
                                if (confirm('Are you sure you want to delete this itinerary?')) {
                                  // TODO: Implement delete functionality
                                }
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
                  <div className="p-4 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                    <h4 className="font-bold text-2xl mb-1">{itinerary.name}</h4>
                    <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                      {itinerary.countries.join(" · ")}
                    </p>
                    <p className="text-sm mt-2">Views: {itinerary.views || 0}</p>
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
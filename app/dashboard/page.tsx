"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { 
  MapPin, 
  Calendar, 
  Users, 
  Edit, 
  Trash2, 
  Heart, 
  Eye, 
  Star,
  Activity,
  Settings,
  User
} from "lucide-react"

interface Itinerary {
  id: string
  title: string
  destinations: string[]
  duration: string
  status: "draft" | "published"
  lastEdited: string
  views?: number
  likes?: number
  coverImage?: string
}

interface Stats {
  totalViews: number
  totalLikes: number
  publishedItineraries: number
  draftItineraries: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(auth.currentUser)
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    totalLikes: 0,
    publishedItineraries: 0,
    draftItineraries: 0
  })

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/")
        return
      }
      setUser(user)
      fetchItineraries(user.uid)
    })

    return () => unsubscribe()
  }, [router])

  const fetchItineraries = async (userId: string) => {
    try {
      setIsLoading(true)
      const itinerariesRef = collection(db, "itineraries")
      const q = query(
        itinerariesRef,
        where("userId", "==", userId),
        orderBy("lastEdited", "desc")
      )
      const querySnapshot = await getDocs(q)
      const itinerariesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Itinerary[]

      setItineraries(itinerariesData)

      // Calculate stats
      const stats = itinerariesData.reduce((acc, curr) => ({
        totalViews: acc.totalViews + (curr.views || 0),
        totalLikes: acc.totalLikes + (curr.likes || 0),
        publishedItineraries: acc.publishedItineraries + (curr.status === "published" ? 1 : 0),
        draftItineraries: acc.draftItineraries + (curr.status === "draft" ? 1 : 0)
      }), {
        totalViews: 0,
        totalLikes: 0,
        publishedItineraries: 0,
        draftItineraries: 0
      })

      setStats(stats)
    } catch (error) {
      console.error("Error fetching itineraries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Welcome back, {user.displayName || user.email}</h1>
          <p className="text-gray-600">Manage your itineraries and create new adventures</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-semibold">{stats.totalViews}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-full">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Likes</p>
                <p className="text-2xl font-semibold">{stats.totalLikes}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-semibold">{stats.publishedItineraries}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Edit className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-semibold">{stats.draftItineraries}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Button 
            onClick={() => router.push("/create")}
            className="flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Create New Itinerary
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="itineraries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="itineraries" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Itineraries
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="itineraries">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">My Itineraries</h2>
              <div className="space-y-4">
                {itineraries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>You haven't created any itineraries yet.</p>
                    <Button 
                      onClick={() => router.push("/create")}
                      variant="outline"
                      className="mt-4"
                    >
                      Create Your First Itinerary
                    </Button>
                  </div>
                ) : (
                  itineraries.map((itinerary) => (
                    <Card key={itinerary.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium mb-2">{itinerary.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {itinerary.destinations.join(", ")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {itinerary.duration}
                            </span>
                            {itinerary.status === "published" && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {itinerary.views || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  {itinerary.likes || 0}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/itinerary/${itinerary.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          itinerary.status === "published" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Last edited: {new Date(itinerary.lastEdited).toLocaleDateString()}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <p className="text-gray-500 text-center py-4">
                  Activity tracking coming soon!
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <p className="mt-1">{user.displayName || "Not set"}</p>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                      <span className="ml-2">Notify me when someone likes my itinerary</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                      <span className="ml-2">Notify me when someone comments on my itinerary</span>
                    </label>
                  </div>
                </div>
                <Button variant="outline">Save Settings</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
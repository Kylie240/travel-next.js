"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Calendar, Users, Edit, Trash2 } from "lucide-react"

// This is a placeholder for actual auth check - replace with your auth system
const useAuth = () => {
  // Replace this with actual auth logic
  return {
    isAuthenticated: true, // Temporarily true for development
    user: {
      name: "John Doe",
      email: "john@example.com"
    }
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Sample data - replace with actual data from your backend
  const myItineraries = [
    {
      id: "1",
      title: "Japan Adventure 2024",
      destinations: ["Tokyo", "Kyoto", "Osaka"],
      duration: "10 days",
      status: "draft",
      lastEdited: "2024-03-15"
    },
    {
      id: "2",
      title: "European Summer Tour",
      destinations: ["Paris", "Rome", "Barcelona"],
      duration: "14 days",
      status: "published",
      lastEdited: "2024-03-10"
    }
  ]

  if (!isAuthenticated) {
    return null // or a loading state
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Welcome back, {user.name}</h1>
          <p className="text-gray-600">Manage your itineraries and create new adventures</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={() => router.push("/create")}
            className="flex items-center justify-center gap-2 h-auto py-4"
          >
            <MapPin className="w-4 h-4" />
            Create New Itinerary
          </Button>
        </div>

        {/* Itineraries List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Itineraries</h2>
          <div className="space-y-4">
            {myItineraries.map((itinerary) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
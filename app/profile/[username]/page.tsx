"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProfileHeader } from "@/components/profile/profile-header"
import { auth } from "@/lib/firebase"
import { UserData } from "@/lib/types"
import Image from "next/image"
import { Heart, MapPin } from "lucide-react"

// This would come from your database in a real app
const dummyUserData: UserData = {
  name: "Sarah Thompson",
  username: "wanderlust_sarah",
  title: "Adventure Seeker",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop",
  location: "London, UK",
  joined: "January 2024",
  bio: "Passionate traveler exploring the world one city at a time. Love photography and local cuisine.",
  website: "https://sarahexplores.com",
  email: "sarah@example.com",
  social: {
    facebook: "",
    instagram: "",
    twitter: ""
  },
  achievements: [],
  stats: {
    trips: 15,
    followers: 1200,
    following: 450,
    likes: 3200
  },
  travelPreferences: {
    interests: [],
    travelStyle: [],
    languages: [],
    visitedCountries: []
  }
}

const dummyItineraries = [
  {
    id: 1,
    title: "Weekend in Paris",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop",
    likes: 24,
    days: 3
  },
  {
    id: 2,
    title: "Tokyo Adventure",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2067&auto=format&fit=crop",
    likes: 18,
    days: 7
  }
]

const dummyHotels = [
  {
    id: 1,
    name: "The Ritz Paris",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
    location: "Paris, France",
    rating: 5,
    review: "Absolutely stunning hotel with impeccable service"
  },
  {
    id: 2,
    name: "Mandarin Oriental Tokyo",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=2074&auto=format&fit=crop",
    location: "Tokyo, Japan",
    rating: 5,
    review: "Best views of Tokyo with amazing amenities"
  }
]

const dummyRestaurants = [
  {
    id: 1,
    name: "Le Cheval d'Or",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop",
    location: "Paris, France",
    cuisine: "French",
    review: "Incredible French cuisine in a cozy setting"
  },
  {
    id: 2,
    name: "Sushi Saito",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop",
    location: "Tokyo, Japan",
    cuisine: "Japanese",
    review: "Best sushi experience in Tokyo"
  }
]

const dummyActivities = [
  {
    id: 1,
    name: "Louvre Museum Tour",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop",
    location: "Paris, France",
    type: "Cultural",
    review: "Must-visit museum with expert guide"
  },
  {
    id: 2,
    name: "Mount Fuji Hike",
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?q=80&w=2070&auto=format&fit=crop",
    location: "Japan",
    type: "Adventure",
    review: "Breathtaking views and great hiking experience"
  }
]

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    // In a real app, fetch user data from your database
    // For now, we'll use dummy data
    setUserData(dummyUserData)
  }, [username])

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <ProfileHeader user={userData} onEditProfile={() => {}} disableEdit={true} />
        
        <Tabs defaultValue="itineraries" className="w-full">
          <TabsList className="w-full justify-start bg-white rounded-none p-0 h-12">
            <TabsTrigger 
              value="itineraries"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
            >
              Itineraries
            </TabsTrigger>
            <TabsTrigger 
              value="hotels"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
            >
              Hotels
            </TabsTrigger>
            <TabsTrigger 
              value="restaurants"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
            >
              Restaurants
            </TabsTrigger>
            <TabsTrigger 
              value="activities"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
            >
              Activities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="itineraries" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:gird-cols-4 gap-6">
              {dummyItineraries.map((itinerary) => (
                <div 
                  key={itinerary.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer"
                >
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={itinerary.image}
                      alt={itinerary.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 p-4 text-white">
                      <h4 className="font-semibold">{itinerary.title}</h4>
                      <div className="flex items-center gap-3 text-sm mt-1">
                        <span>{itinerary.days} days</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" /> {itinerary.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hotels" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {dummyHotels.map((hotel) => (
                <div 
                  key={hotel.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={hotel.image}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold">{hotel.name}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" /> {hotel.location}
                    </p>
                    <p className="text-sm mt-2">{hotel.review}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="restaurants" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {dummyRestaurants.map((restaurant) => (
                <div 
                  key={restaurant.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold">{restaurant.name}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" /> {restaurant.location}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{restaurant.cuisine}</p>
                    <p className="text-sm mt-2">{restaurant.review}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {dummyActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={activity.image}
                      alt={activity.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold">{activity.name}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" /> {activity.location}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{activity.type}</p>
                    <p className="text-sm mt-2">{activity.review}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
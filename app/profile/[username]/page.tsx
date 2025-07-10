"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProfileHeader } from "@/components/profile/profile-header"
import { auth } from "@/lib/firebase"
import { UserData } from "@/lib/types"
import Image from "next/image"
import { Bookmark, Heart, MapPin, Search, Share } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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
  },
  {
    id: 3,
    title: "Getaway to the carribean islands",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop",
    likes: 24,
    days: 3
  },
  {
    id: 4,
    title: "A week in the mountains",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2067&auto=format&fit=crop",
    likes: 18,
    days: 7
  },
  {
    id: 5,
    title: "Island hopping in the medditeranean and aegean seas",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop",
    likes: 24,
    days: 3
  },
  {
    id: 6,
    title: "Romantic baecation in rome",
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
    review: "Absolutely stunning hotel with impeccable service",
    link: 'https://www.marriott.com/search/findHotels.mi?searchType=InCity&destinationAddress.city=Orlando&destinationAddress.stateProvince=FL&destinationAddress.country=US&nst=paid&cid=PAI_GLB0004YXE_GLE000BIMO_GLF000OETS&ppc=ppc&pId=ustbppc&gclid=6f7b1df90ebf1c8edf1b7597e57d169a&gclsrc=3p.ds&msclkid=6f7b1df90ebf1c8edf1b7597e57d169a&deviceType=mobile-web&view=list'
  },
  {
    id: 2,
    name: "Mandarin Oriental Tokyo",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=2074&auto=format&fit=crop",
    location: "Tokyo, Japan",
    rating: 5,
    review: "Best views of Tokyo with amazing amenities",
    link: 'https://www.marriott.com/search/findHotels.mi?searchType=InCity&destinationAddress.city=Orlando&destinationAddress.stateProvince=FL&destinationAddress.country=US&nst=paid&cid=PAI_GLB0004YXE_GLE000BIMO_GLF000OETS&ppc=ppc&pId=ustbppc&gclid=6f7b1df90ebf1c8edf1b7597e57d169a&gclsrc=3p.ds&msclkid=6f7b1df90ebf1c8edf1b7597e57d169a&deviceType=mobile-web&view=list'
  }
]

const dummyRestaurants = [
  {
    id: 1,
    name: "Le Cheval d'Or",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop",
    location: "Paris, France",
    cuisine: "French",
    review: "Incredible French cuisine in a cozy setting",
    link: 'https://www.marriott.com/search/findHotels.mi?searchType=InCity&destinationAddress.city=Orlando&destinationAddress.stateProvince=FL&destinationAddress.country=US&nst=paid&cid=PAI_GLB0004YXE_GLE000BIMO_GLF000OETS&ppc=ppc&pId=ustbppc&gclid=6f7b1df90ebf1c8edf1b7597e57d169a&gclsrc=3p.ds&msclkid=6f7b1df90ebf1c8edf1b7597e57d169a&deviceType=mobile-web&view=list'
  },
  {
    id: 2,
    name: "Sushi Saito",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop",
    location: "Tokyo, Japan",
    cuisine: "Japanese",
    review: "Best sushi experience in Tokyo",
    link: 'https://www.marriott.com/search/findHotels.mi?searchType=InCity&destinationAddress.city=Orlando&destinationAddress.stateProvince=FL&destinationAddress.country=US&nst=paid&cid=PAI_GLB0004YXE_GLE000BIMO_GLF000OETS&ppc=ppc&pId=ustbppc&gclid=6f7b1df90ebf1c8edf1b7597e57d169a&gclsrc=3p.ds&msclkid=6f7b1df90ebf1c8edf1b7597e57d169a&deviceType=mobile-web&view=list'
  }
]

const dummyActivities = [
  {
    id: 1,
    name: "Louvre Museum Tour",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop",
    location: "Paris, France",
    type: "Cultural",
    review: "Must-visit museum with expert guide",
    link: 'https://www.viator.com/Phuket/d349-ttd'
  },
  {
    id: 2,
    name: "Mount Fuji Hike",
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?q=80&w=2070&auto=format&fit=crop",
    location: "Japan",
    type: "Adventure",
    review: "Breathtaking views and great hiking experience",
    link: 'https://www.viator.com/Phuket/d349-ttd'
  }
]

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [userData, setUserData] = useState<UserData | null>(null)
  const [itinerarySearch, setItinerarySearch] = useState("")
  const [hotelSearch, setHotelSearch] = useState("")
  const [restaurantSearch, setRestaurantSearch] = useState("")
  const [activitySearch, setActivitySearch] = useState("")

  useEffect(() => {
    // In a real app, fetch user data from your database
    // For now, we'll use dummy data
    setUserData(dummyUserData)
  }, [username])

  // Filter functions
  const filteredItineraries = dummyItineraries.filter(item =>
    item.title.toLowerCase().includes(itinerarySearch.toLowerCase())
  )

  const filteredHotels = dummyHotels.filter(item =>
    item.name.toLowerCase().includes(hotelSearch.toLowerCase()) ||
    item.location.toLowerCase().includes(hotelSearch.toLowerCase())
  )

  const filteredRestaurants = dummyRestaurants.filter(item =>
    item.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
    item.location.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
    item.cuisine.toLowerCase().includes(restaurantSearch.toLowerCase())
  )

  const filteredActivities = dummyActivities.filter(item =>
    item.name.toLowerCase().includes(activitySearch.toLowerCase()) ||
    item.location.toLowerCase().includes(activitySearch.toLowerCase()) ||
    item.type.toLowerCase().includes(activitySearch.toLowerCase())
  )

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white py-8 mb-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center px-2">
          <ProfileHeader user={userData} onEditProfile={() => {}} disableEdit={true} />
            <span className="flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded-full p-2"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success('Link copied to clipboard')
            }}>
              <Share className="h-6 w-6" />
            </span>
        </div>
        
        <Tabs defaultValue="itineraries" className="w-full">
          <TabsList className="w-full justify-start bg-white rounded-none p-0 h-12">
            <TabsTrigger 
              value="itineraries"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-black rounded-none"
            >
              Itineraries
            </TabsTrigger>
            <TabsTrigger 
              value="hotels"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-black rounded-none"
            >
              Hotels
            </TabsTrigger>
            <TabsTrigger 
              value="restaurants"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-black rounded-none"
            >
              Restaurants
            </TabsTrigger>
            <TabsTrigger 
              value="activities"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-black rounded-none"
            >
              Activities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="itineraries" className="mt-6">
            <div className="mb-6 relative">
              <Input
                type="text"
                placeholder={`Search all ${dummyItineraries.length} itineraries`}
                value={itinerarySearch}
                onChange={(e) => setItinerarySearch(e.target.value)}
                className="pl-10 rounded-xl bg-gray-100"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItineraries.map((itinerary) => (
                <div 
                  key={itinerary.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer bg-white shadow-sm"
                  onClick={() => {
                    router.push(`/itinerary/${itinerary.id}`)
                  }}
                >
                  <div className="aspect-[2/3] relative">
                    <Image
                      src={itinerary.image}
                      alt={itinerary.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold">{itinerary.title}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" /> {itinerary.days} days
                    </p>
                    <p className="text-sm mt-2">{itinerary.likes} likes</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hotels" className="mt-6">
            <div className="mb-6 relative">
              <Input
                type="text"
                placeholder={`Search all ${dummyHotels.length} hotels`}
                value={hotelSearch}
                onChange={(e) => setHotelSearch(e.target.value)}
                className="pl-10 rounded-xl bg-gray-100"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredHotels.map((hotel) => (
                <div 
                  key={hotel.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer bg-white shadow-sm"
                  onClick={() => {
                    window.open(hotel.link, '_blank')
                  }}
                >
                  <div className="aspect-[2/3] relative">
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
            <div className="mb-6 relative">
              <Input
                type="text"
                placeholder={`Search all ${dummyRestaurants.length} itineraries`}
                value={restaurantSearch}
                onChange={(e) => setRestaurantSearch(e.target.value)}
                className="pl-10 rounded-xl bg-gray-100"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <div 
                  key={restaurant.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer bg-white shadow-sm"
                  onClick={() => {
                    window.open(restaurant.link, '_blank')
                  }}
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
            <div className="mb-6 relative">
              <Input
                type="text"
                placeholder={`Search all ${dummyActivities.length} activities`}
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="pl-10 rounded-xl bg-gray-100"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer bg-white shadow-sm"
                  onClick={() => {
                    window.open(activity.link, '_blank')
                  }}
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
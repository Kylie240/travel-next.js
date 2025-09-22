"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProfileHeader } from "@/components/profile/profile-header"
import { UserData } from "@/lib/types"
import Image from "next/image"
import { Bookmark, MapPin, Search, Share, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

// This would come from your database in a real app
const dummyUserData: UserData = {
  id: "1",
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
    description: "Experience the best of Paris and the French Riviera",
    countries: ["Paris", "French Riviera"],
    image: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bHV4dXJ5JTIwdHJhdmVsfGVufDB8fDB8fHww",
    likes: 24,
    days: 3
  },
  {
    id: 2,
    title: "Tokyo Adventure",
    description: "Experience the best of Tokyo",
    countries: ["Tokyo"],
    image: "https://plus.unsplash.com/premium_photo-1699566448055-671c8dbcc7ee?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njd8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D",
    likes: 18,
    days: 7
  },
  {
    id: 3,
    title: "Getaway to the carribean islands",
    description: "Experience the best of the Caribbean islands",
    countries: ["Caribbean Islands"],
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D",
    likes: 24,
    days: 3
  },
  {
    id: 4,
    title: "Weekend in Paris",
    description: "Experience the best of Paris",
    countries: ["Paris"],
    image: "https://images.unsplash.com/photo-1590602391458-7aaa83454938?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzZ8fGx1eHVyeSUyMHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D",
    likes: 18,
    days: 7
  },
  {
    id: 5,
    title: "Island hopping in the medditeranean and aegean seas",
    description: "Experience the best of the Mediterranean and Aegean seas",
    countries: ["Mediterranean", "Aegean Seas"],
    image: "https://plus.unsplash.com/premium_photo-1668703335982-a2d335b5cf82?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTExfHx0cmF2ZWx8ZW58MHx8MHx8fDA%3D",
    likes: 24,
    days: 3
  },
  {
    id: 6,
    title: "Romantic baecation in rome",
    description: "Experience the best of Rome",
    countries: ["Rome", "Spain", "Portugal"],
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTIyfHx0cmF2ZWx8ZW58MHx8MHx8fDA%3D",
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
    rating: 5,
    review: "Incredible French cuisine in a cozy setting",
    link: 'https://www.marriott.com/search/findHotels.mi?searchType=InCity&destinationAddress.city=Orlando&destinationAddress.stateProvince=FL&destinationAddress.country=US&nst=paid&cid=PAI_GLB0004YXE_GLE000BIMO_GLF000OETS&ppc=ppc&pId=ustbppc&gclid=6f7b1df90ebf1c8edf1b7597e57d169a&gclsrc=3p.ds&msclkid=6f7b1df90ebf1c8edf1b7597e57d169a&deviceType=mobile-web&view=list'
  },
  {
    id: 2,
    name: "Sushi Saito",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop",
    location: "Tokyo, Japan",
    cuisine: "Japanese",
    rating: 5,
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
    rating: 5,
    review: "Must-visit museum with expert guide",
    link: 'https://www.viator.com/Phuket/d349-ttd'
  },
  {
    id: 2,
    name: "Mount Fuji Hike",
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?q=80&w=2070&auto=format&fit=crop",
    location: "Japan",
    type: "Adventure",
    rating: 5,
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
    <div className="min-h-screen max-w-[1340px] mx-auto bg-white py-8 mb-4">
      <div className="container mx-auto px-6">
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-center gap-6 mb-4">
            <div className="flex flex-col items-center justify-center w-24">
              <p className="text-gray-900 text-xl font-bold">{userData.stats.trips}</p>
              <p className="text-gray-600 text-sm">Trips</p>
            </div>
            <div className="w-[100px] h-[100px] relative rounded-full">
                <Image
                  src={"https://tse3.mm.bing.net/th/id/OIP.GbXrupVNmGPefq-s5IGitwHaKo?rs=1&pid=ImgDetMain&o=7&rm=3"}
                  alt={userData.name}
                  fill
                  className="object-cover rounded-full cursor-pointer"
                  style={{ width: '100%', height: '100%' }}
                />
                {/* <div className="absolute block md:hidden -top-1 -right-3">
                  {userData.isFollowing ? (
                    <div onClick={() => onFollowToggle?.(user.id)}><Minus className="h-[30px] w-[35px] px-[3px] py-[2px] cursor-pointer rounded-full border border-[3px] border-black bg-white hover:bg-gray-500 text-black" /></div>
                  ) : (
                    <div onClick={() => onFollowToggle?.(user.id)}><Plus className="h-[30px] w-[35px] px-[3px] py-[2px] cursor-pointer rounded-full border border-[3px] border-white bg-black hover:bg-gray-500 text-white" /></div>
                  )}
                </div> */}
              </div>
            <div className="flex flex-col items-center justify-center w-24">
              <p className="text-gray-900 text-xl font-bold">{userData.stats.trips}</p>
              <p className="text-gray-600 text-sm">Conects</p>
            </div>
          </div>
          <div className="w-full flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">{userData.name}</h1>
            <p className="text-gray-600 mb-2">@{userData.username}</p>
          </div>
          <div className="flex gap-4 mt-2 mb-6">
            <Button>Follow</Button>
            <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied to clipboard')
              }}>Share Profile</Button>
          </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItineraries.map((itinerary) => ( 
                <div 
                  key={itinerary.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
                  onClick={() => {
                    router.push(`/itinerary/${itinerary.id}`)
                  }}
                >
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={itinerary.image}
                      alt={itinerary.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  </div>
                  <div className="p-4 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                    <h4 className="font-bold text-2xl mb-1">{itinerary.title}</h4>
                    <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                      {itinerary.countries.map((country) => country).join(" · ")}
                    </p>
                    <p className="text-sm mt-2">{itinerary.likes} likes</p>
                    <div className="absolute bottom-0 right-0">
                      <button className="bg-white/40 text-black hover:bg-white/80 px-2 py-2 rounded-full">
                        <Bookmark className="h-5 w-5" />
                      </button>
                    </div>
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
                className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
                onClick={() => {
                  router.push(`/itinerary/${hotel.id}`)
                }}
              >
                <div className="relative aspect-[2/3]">
                  <Image
                    src={hotel.image}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>
                <div className="p-4 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                  <h4 className="font-bold text-2xl mb-1">{hotel.name}</h4>
                  <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                    <MapPin className="h-4 w-4" />
                    {hotel.location}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: hotel.rating }).map((_, index) => (
                      <Star className="h-4 w-4" fill="currentColor" key={index} />
                    ))}
                  </div>
                  <p className="text-sm mt-1.5">{hotel.review}</p>
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
                className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
                onClick={() => {
                  router.push(`/itinerary/${restaurant.id}`)
                }}
              >
                <div className="relative aspect-[2/3] relative">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>
                <div className="p-4 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                  <h4 className="font-bold text-2xl mb-1">{restaurant.name}</h4>
                  <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                    <MapPin className="h-4 w-4" />
                    {restaurant.location}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: restaurant.rating }).map((_, index) => (
                      <Star className="h-4 w-4" fill="currentColor" key={index} color="white" />
                    ))}
                  </div>
                  <p className="text-sm mt-1.5">{restaurant.review}</p>
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
                className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
                onClick={() => {
                  router.push(`/itinerary/${activity.id}`)
                }}
              >
                <div className="relative aspect-[2/3] relative">
                  <Image
                    src={activity.image}
                    alt={activity.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>
                <div className="p-4 m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                  <h4 className="font-bold text-2xl mb-1">{activity.name}</h4>
                  <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                    <MapPin className="h-4 w-4" />
                    {activity.location}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: activity.rating }).map((_, index) => (
                      <Star className="h-4 w-4" fill="currentColor" key={index} color="white" />
                    ))}
                  </div>
                  <p className="text-sm mt-1.5">{activity.review}</p>
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
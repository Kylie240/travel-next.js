"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Image from "next/image"
import { Bookmark, MapPin, Search, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Session, User } from "@supabase/supabase-js"
import { addFollow, getProfileDataByUsername, removeFollow } from "@/lib/actions/user.actions"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ProfileData } from "@/types/profileData"
import { getItineraryDataByUserId } from "@/lib/actions/itinerary.actions"
import { ItinerarySummary } from "@/types/ItinerarySummary"

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

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  const supabase = createClientComponentClient()
  const [userData, setUserData] = useState<ProfileData | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [itineraryData, setItineraryData] = useState<ItinerarySummary[] | null>(null)
  const [filteredItineraryData, setFilteredItineraryData] = useState<ItinerarySummary[] | null>(null)
  const [itinerarySearch, setItinerarySearch] = useState("")
  const [hotelSearch, setHotelSearch] = useState("")
  const [restaurantSearch, setRestaurantSearch] = useState("")
  const [activitySearch, setActivitySearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState<boolean>(null)
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false)

  // Handle auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      const newUser = session?.user ?? null
      setCurrentUser(newUser)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Fetch initial user data
  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    initUser()
  }, [supabase])

  // Fetch profile data
  useEffect(() => {
    const fetchData = async () => {
      if (!username) return

      setIsLoading(true)
      setUserData(null)
      setItineraryData(null)
      setFilteredItineraryData(null)
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const profileData = await getProfileDataByUsername(username, user?.id || '')
        
        if (profileData) {
          setUserData(profileData)
          const userId = profileData[0].userId
          if (userId) {
            console.log(userId, currentUser?.id)
            setIsCurrentUser(userId == currentUser?.id)
            setIsFollowing(profileData[0].isFollowing)
            const itineraryData = await getItineraryDataByUserId(userId)
            if (itineraryData) {
              setItineraryData(itineraryData)
              setFilteredItineraryData(itineraryData)
            }
          }
        } else {
          setNotFound(true)
          toast.error('User not found')
        }
      } catch (error) {
        toast.error('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [username, supabase])

  const toggleFollow = async (isFollow: boolean, followingId: string) => {
    if(!currentUser.id) { return }

    if (isFollow) {
      await addFollow(currentUser?.id, followingId)
      setIsFollowing(true)
    } else {
      await removeFollow(currentUser?.id, followingId)
      setIsFollowing(false)
    } 
    
    toast.success(`User succesfully ${isFollow ? '' : 'un'}followed`)
  }

  // Filter itineraries when search changes
  useEffect(() => {
    if (itineraryData) {
      const filtered = itineraryData.filter(item =>
        item.title.toLowerCase().includes(itinerarySearch.toLowerCase())
      )
      setFilteredItineraryData(filtered)
    }
  }, [itinerarySearch, itineraryData])

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

  const [notFound, setNotFound] = useState(false)

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
        <p className="text-gray-600">The user you're looking for doesn't exist</p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  if (isLoading || !userData || !userData[0]) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )
  }
  const router = useRouter()

  return (
    <div className="min-h-screen max-w-[1340px] mx-auto bg-white py-8 mb-4">
      <div className="container mx-auto px-6">
        <div className="w-full flex flex-col justify-center">
          <div className="w-full flex items-center justify-start gap-6 mb-4">
            <div className="flex gap-4">
              <div className="w-[100px] h-[100px] relative rounded-full">
                  <Image
                    src={userData[0].avatar}
                    alt={userData[0].name}
                    fill
                    className="object-cover rounded-full cursor-pointer"
                    style={{ width: '100%', height: '100%' }}
                  />
                  {/* <div className="absolute block md:hidden -top-1 -right-3">
                    {userData[0].isFollowing ? (
                      <div onClick={() => onFollowToggle?.(user.id)}><Minus className="h-[30px] w-[35px] px-[3px] py-[2px] cursor-pointer rounded-full border border-[3px] border-black bg-white hover:bg-gray-500 text-black" /></div>
                    ) : (
                      <div onClick={() => onFollowToggle?.(user.id)}><Plus className="h-[30px] w-[35px] px-[3px] py-[2px] cursor-pointer rounded-full border border-[3px] border-white bg-black hover:bg-gray-500 text-white" /></div>
                    )}
                  </div> */}
                </div>
                <div className="flex flex-col items-start justify-center">
                  <h1 className="text-2xl font-bold">{userData[0].name}</h1>
                  <p className="text-gray-600">@{userData[0].username}</p>
                  <div className="flex gap-4 mt-2 mb-6">
                    {isCurrentUser ? (
                      <Button onClick={() => toggleFollow(false, userData[0].userId)}>Unfollow</Button>
                    ) : (
                      isFollowing ? (
                        <Button onClick={() => toggleFollow(false, userData[0].userId)}>Unfollow</Button>
                      ) : (
                        <Button onClick={() => toggleFollow(true,userData[0].userId)}>Follow</Button>
                      )
                    )}
                    <Button variant="outline" onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        toast.success('Link copied to clipboard')
                      }}>Share Profile</Button>
                  </div>
                </div>
            </div>
            {userData[0]?.userId == currentUser?.id}
          </div>
          <p className="text-gray-700">{userData[0].bio}</p>
        </div>
        
        <Tabs defaultValue="itineraries" className="w-full">
          <TabsList className="w-full justify-start bg-white rounded-none p-0 h-12">
            <TabsTrigger 
              value="itineraries"
              className="flex-1 hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-black rounded-none"
            >
              Itineraries
            </TabsTrigger>
            {/* <TabsTrigger 
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
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="itineraries" className="mt-6">
            <h2></h2>
            {itineraryData?.length && (
              <div className="mb-8 relative max-w-[550px]">
                <Input
                  type="text"
                  placeholder={`Search all ${filteredItineraryData?.length} itineraries`}
                  value={itinerarySearch}
                  onChange={(e) => setItinerarySearch(e.target.value)}
                  className="pl-10 font-medium rounded-xl bg-gray-100 border-none"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItineraryData?.map((itinerary) => ( 
                <div 
                  key={itinerary.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
                  onClick={() => {
                    router.push(`/itinerary/${itinerary.id}`)
                  }}
                >
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={itinerary.mainImage}
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

          {/* <TabsContent value="hotels" className="mt-6">
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
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  )
} 
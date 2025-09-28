"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Image from "next/image"
import { Bookmark, Link, Lock, MapPin, PenSquare, Search, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Session, User } from "@supabase/supabase-js"
import { addFollow, getProfileDataByUsername, removeFollow } from "@/lib/actions/user.actions"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ProfileData } from "@/types/profileData"
import { getItineraryDataByUserId, getSavesByCreatorId, getSavesByUserId, SaveItinerary, UnsaveItinerary } from "@/lib/actions/itinerary.actions"
import { ItinerarySummary } from "@/types/ItinerarySummary"
import { AuthDialog } from "@/components/ui/auth-dialog"
import { FaUserLarge } from "react-icons/fa6"

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  const supabase = createClientComponentClient()
  const [userData, setUserData] = useState<ProfileData | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [itineraryData, setItineraryData] = useState<ItinerarySummary[] | null>(null)
  const [filteredItineraryData, setFilteredItineraryData] = useState<ItinerarySummary[] | null>(null)
  const [itinerarySearch, setItinerarySearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState<boolean>(null)
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false)
  const [currentUserSaves, setCurrentUserSaves] = useState<string[]>([])
  const [isPrivate, setIsPrivate] = useState<boolean>(false)

 useEffect(() => {
  const initUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setCurrentUser(session?.user ?? null)
  }

  initUser()

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setCurrentUser(session?.user ?? null)
  })

  return () => {
    subscription.unsubscribe()
  }
}, [supabase])


  useEffect(() => {
  const fetchData = async () => {
    if (!username) return

    setIsLoading(true)
    setUserData(null)
    setItineraryData(null)
    setFilteredItineraryData(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const profileData = await getProfileDataByUsername(username, user?.id || null)

      if (profileData) {
        setUserData(profileData)
        if (profileData[0].isPrivate && profileData[0].userId !== currentUser?.id) {
          setIsPrivate(true)
        }
        const userId = profileData[0].userId

        if (userId) {
          setIsCurrentUser(userId === currentUser?.id)
          setIsFollowing(profileData[0].isFollowing)

          const itineraryData = await getItineraryDataByUserId(userId)
          if (itineraryData) {
            setItineraryData(itineraryData)
            setFilteredItineraryData(itineraryData)
          }
          
          const userSaves = currentUser?.id ? await getSavesByCreatorId(currentUser.id, userId) : []
          setCurrentUserSaves(userSaves ?? [])
          console.log(userSaves)

          if (!currentUser?.id) {
            displaySignUpDialog(3000)
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
}, [username, supabase, currentUser])



  const toggleFollow = async (isFollow: boolean, followingId: string) => {
    if(!currentUser?.id) { 
      displaySignUpDialog()
      return;
    }

    if (isFollow) {
      await addFollow(currentUser.id, followingId)
      setIsFollowing(true)
    } else {
      await removeFollow(currentUser.id, followingId)
      setIsFollowing(false)
    } 
    
    toast.success(`User succesfully ${isFollow ? '' : 'un'}followed`)
  }

  const handleSaveItinerary = async (itineraryId: string) => {
    const result = await SaveItinerary(itineraryId)
    if (result.success) {
      toast.success('Itinerary saved successfully')
      setCurrentUserSaves([...currentUserSaves, itineraryId])
    } else {
      toast.error('Failed to save itinerary')
    }
  }

  const handleUnsaveItinerary = async (itineraryId: string) => {
    const result = await UnsaveItinerary(itineraryId)
    if (result.success) {
      toast.success('Itinerary unsaved successfully')
      setCurrentUserSaves(currentUserSaves.filter(save => save !== itineraryId))
    } else {
      toast.error('Failed to unsave itinerary')
    }
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

  const [notFound, setNotFound] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true)

  const displaySignUpDialog = (timeout: number = 0) => {
    setTimeout(() => {
      setIsOpen(true)
      setIsSignUp(false)
    }, timeout)
  }

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
            <div className="flex flex-col w-full items-center gap-4">
              {userData[0].avatar && userData[0].avatar !== "" ? (
              <div className="w-[100px] h-[100px] relative rounded-full">
                  <Image
                    src={userData[0].avatar}
                    alt={userData[0].name}
                    fill
                    className="object-cover rounded-full cursor-pointer"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              ) : (
                <div className="w-[100px] h-[100px] relative rounded-full bg-gray-100 flex items-center justify-center">
                  <FaUserLarge className="h-14 w-14 text-gray-300" />
                </div>
              )}
                { !isPrivate ? (
                <div className="flex flex-col gap-2 items-center justify-center">
                  <h1 className="text-4xl font-semibold">{userData[0].name}</h1>
                  <p className="text-gray-600">@ {userData[0].username}</p>
                  <p className="text-gray-700 text-center px-4 max-w-[550px]">{userData[0].bio}</p>
                  <div className="flex gap-2 mt-2">
                    {isCurrentUser ? (
                      <Button onClick={() => router.push(`/account-settings?tab=${encodeURIComponent('Edit Profile')}`)}>Edit Profile</Button>
                    ) : !currentUser ? (
                      <AuthDialog isOpen={isOpen} setIsOpen={setIsOpen} isSignUp={false} setIsSignUp={setIsSignUp}>
                        <Button onClick={() => displaySignUpDialog()}>Follow</Button>
                      </AuthDialog>
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
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <h1 className="text-4xl font-semibold">{userData[0].name}</h1>
                    <p className="text-gray-600">@ {userData[0].username}</p>
                    <p className="text-gray-700 flex mt-2 text-center gap-1">This user's profile is 
                      <strong className="flex items-center gap-1"> 
                        private
                      </strong>
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          {itineraryData?.length > 0 ? (
            <h2 className="mb-6 font-bold p-4 border-b-2 border-gray-200 mt-6 text-xl">Itineraries</h2>
          ) : (
            <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed">
              <div className="mb-4">
                <PenSquare className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Itineraries Found</h3>
              { isCurrentUser && (
                <> 
                <p className="text-gray-600 mb-4">Start creating your first itinerary</p>
                <Button variant="outline" onClick={() => router.push('/create')}>
                    Create New Itinerary
                </Button>
                </>
              )}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div>
                {!isPrivate && itineraryData?.length > 6 && (
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
            </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                { isPrivate ? (
                  <div className="col-span-full relative">
                    <div className="w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 blur-sm">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="w-full aspect-[2/3] block md:hidden xl:hidden bg-gray-100 rounded-2xl">
                        </div>
                      ))}
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="w-full aspect-[2/3] hidden md:block xl:hidden bg-gray-100 rounded-2xl">
                        </div>
                      ))}
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="w-full aspect-[2/3] hidden xl:block bg-gray-100 rounded-2xl">
                        </div>
                      ))}
                    </div>
                    <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-20 w-20 text-gray-400" />                </div>
                ) : (
                  filteredItineraryData?.map((itinerary) => ( 
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
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                            {itinerary.countries.map((country) => country).join(" · ")}
                          </p>
                          <p className="text-sm mt-2">{itinerary.likes} likes</p>
                        </div>
                        <div>
                          {(!isCurrentUser && currentUser?.id) && 
                            currentUserSaves.includes(itinerary.id) ? (
                              <button className="text-white" 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUnsaveItinerary(itinerary.id)
                                }}>
                                  <Bookmark className="h-6 w-6 hover:h-7 hover:w-7 fill-current" />
                                </button>
                            ) : (
                              <button className="bg-white/40 text-black hover:bg-white/80 px-2 py-2 rounded-full" 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSaveItinerary(itinerary.id)
                                }}>
                                  <Bookmark className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                  ))
                )}
                </div>
          </div>
        </div>
        
        {/* <Tabs defaultValue="itineraries" className="w-full">
          <TabsList className="w-full justify-start bg-white rounded-none p-0 h-12">
            <TabsTrigger 
              value="itineraries"
              className="flex-1 hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-black rounded-none"
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
            {itineraryData?.length > 6 && (
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
        </Tabs> */}
      </div>
    </div>
  )
} 
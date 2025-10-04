import BookmarkElement from "@/app/itinerary/[id]/bookmark-element";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getItineraryDataByUserId } from "@/lib/actions/itinerary.actions";
import { getProfileDataByUsername } from "@/lib/actions/user.actions";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Lock, PenSquare, Search, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cookies } from 'next/headers'
import { FaUserLarge } from "react-icons/fa6";
import FollowButton from "@/app/itinerary/[id]/follow-button";
import ShareProfileButton from "./share-profile";

export default async function UserProfilePage({ params }: { params: { username: string } }) {
const { username } = params;
const supabase = createServerComponentClient({ cookies })
const { data: { user: currentUser } } = await supabase.auth.getUser()
const userData = await getProfileDataByUsername(username, currentUser?.id || null)
const userId = userData[0].userId;
let isPrivate: boolean = false;
if (userData[0].isPrivate && userId !== currentUser?.id) {
isPrivate = true
}
const isCurrentUser = userId == currentUser?.id;
const isFollowing = userData[0].isFollowing;
const itineraryData = await getItineraryDataByUserId(userId)
let filteredItineraryData = itineraryData;
const searchValue: string = '';

const handleSearch = (text: string) => {
    if (searchValue == '') { return }
    const filtered = itineraryData.filter(item =>
        item.title.toLowerCase().includes(searchValue.toLowerCase())
      )
      filteredItineraryData = filtered;
}

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
                      <p className="text-gray-700 text-center px-0 sm:px-4 max-w-[550px]">{userData[0].bio}</p>
                      <div className="flex gap-2 mt-2">
                        {isCurrentUser ? (
                        <Link href={`/account-settings?tab=${encodeURIComponent('Edit Profile')}`}>
                            <Button>Edit Profile</Button>
                        </Link>
                        ) : (
                            <FollowButton creatorId={userId} userId={currentUser.id} />
                        )}
                        <ShareProfileButton />
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
            <div className="mt-4 mb-8">
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
                    <Link href={`/create`}>
                        <Button variant="outline">
                            Create New Itinerary
                        </Button>
                    </Link>
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
                          placeholder={`Search all ${itineraryData?.length} itineraries`}
                          value={searchValue}
                          onChange={(e) => handleSearch(e.target.value)}
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
                        <Link href={`/itinerary/${itinerary.id}`}>
                            <div 
                                key={itinerary.id}
                                className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
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
                                <div className="p-4 sm:m-1 md:m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                                <p className="font-medium leading-6 text-lg sm:text-xl sm:text-2xl max-h-[180px] line-clamp-4 overflow-hidden">{itinerary.title}</p>
                                <div className="flex justify-between items-end">
                                    <div>
                                      <p className="text-sm flex items-center gap-1 mt-1 opacity-90">
                                          {itinerary.countries.map((country) => country).join(" · ")}
                                      </p>
                                      <div className="flex relative items-center">
                                        <ThumbsUp className="h-5 w-5 pb-1 pr-1"/>
                                        <p className="text-sm">{itinerary.likes}</p>
                                      </div>
                                    </div>
                                    <div>
                                      {!isCurrentUser && currentUser?.id && 
                                          <BookmarkElement itineraryId={itinerary.id} currentUserId={currentUser.id} />
                                      }
                                    </div>
                                </div>
                                </div>
                            </div>
                        </Link>
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
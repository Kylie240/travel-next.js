import { Button } from "@/components/ui/button";
import { getItineraryDataByUserId } from "@/lib/actions/itinerary.actions";
import { getProfileDataByUsername } from "@/lib/actions/user.actions";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { PenSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cookies } from 'next/headers'
import { FaUserLarge } from "react-icons/fa6";
import FollowButton from "@/app/itinerary/[id]/follow-button";
import ShareProfileButton from "./share-profile";
import ProfileMenuButton from "./profile-menu-button";
import ItineraryGrid from "./itinerary-grid";
import createClient from "@/utils/supabase/server";

export default async function UserProfilePage({ params }: { params: { username: string } }) {
const { username } = params;
// const supabase = createServerComponentClient({ cookies })
const supabase = await createClient()
const { data: { user: currentUser } } = await supabase.auth.getUser()
const userData = await getProfileDataByUsername(username.toLowerCase())
const userId = userData[0]?.userId;
let isPrivate: boolean = false;
if (userData[0]?.isPrivate && userId !== currentUser?.id) {
isPrivate = true
}
const itineraryData = await getItineraryDataByUserId(userId)
const isCurrentUser = userId == currentUser?.id;
const { data: currentUserSaves } = await supabase.from('interactions_saves').select('itinerary_id').eq('user_id', currentUser?.id) || null
const savedList = currentUserSaves ? currentUserSaves.map((save) => save.itinerary_id) : null

  return (
    <div className="min-h-screen max-w-[1340px] mx-auto bg-white py-8 mb-4">
          <div className="container mx-auto px-6 sm:px-8 md:px-[3rem] lg:px-[6rem]">
            <div className="w-full flex flex-col justify-center">
              <div className="w-full flex items-center justify-start gap-6 mb-4">
                <div className="flex flex-col w-full items-center gap-2 md:gap-4">
                  {userData[0].avatar && userData[0].avatar !== "" ? (
                  <div className="w-[120px] h-[120px] relative rounded-full">
                      <Image
                        src={userData[0].avatar}
                        alt={userData[0].name}
                        fill
                        className="object-cover rounded-full cursor-pointer"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  ) : (
                    <div className="w-[120px] h-[120px] relative rounded-full bg-gray-100 flex items-center justify-center">
                      <FaUserLarge className="h-14 w-14 text-gray-300" />
                    </div>
                  )}
                    { !isPrivate ? (
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <h1 className="text-4xl font-semibold">{userData[0].name}</h1>
                        <p className="text-gray-600 text-center">@ {userData[0].username}</p>
                      </div>
                      <p className="text-gray-700 text-center px-0 sm:px-4 text-sm md:text-md max-w-[500px] mx-4">{userData[0].bio}</p>
                      <div className="flex gap-2 mt-2">
                        <div className="grid grid-cols-2 gap-2">
                          {isCurrentUser ? (
                          <Link href={`/account-settings?tab=${encodeURIComponent('Profile')}`}>
                              <Button className="w-full">Edit Profile</Button>
                          </Link>
                          ) : (
                            <div>
                              <FollowButton creatorId={userId} userId={currentUser?.id || null} />
                            </div>
                          )}
                          <ShareProfileButton />
                        </div>
                        {/* {!isCurrentUser && currentUser && (
                          <ProfileMenuButton creatorId={userId} userId={currentUser?.id || null} />
                        )} */}
                      </div>
                    </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <h1 className="text-4xl font-semibold">{userData[0].name}</h1>
                        <p className="text-gray-600 text-center">@{userData[0].username}</p>
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
            <div className="md:mt-4 mb-4 md:mb-8">
              {itineraryData?.length > 0 ? (
                <h2 className="my-3 md:my-6 font-bold py-4 border-b-2 border-gray-200 text-xl">Itineraries</h2>
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
              <ItineraryGrid 
                itineraryData={itineraryData}
                isPrivate={isPrivate}
                isCurrentUser={isCurrentUser}
                currentUserId={currentUser?.id}
                savedList={savedList}
              />
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
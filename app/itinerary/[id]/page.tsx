import { Suspense } from "react"
import Loading from "@/app/loading"
import { similarItineraries } from "./data"
import { Calendar, MapPin, Users, Utensils, Bike, BedDouble, Train, Bookmark, ChevronUp, ChevronDown, ChevronRight, Share, Edit } from "lucide-react"
import Image from "next/image"
import { Itinerary } from "@/types/itinerary"
import { DaySection } from "@/components/ui/day-section"
import Link from "next/link"
import { toast } from "sonner"
import BookmarkElement from "./bookmark-element"
import ScheduleSection from "./schedule-section"
import NoteSection from "./note-section"
import ShareElement from "./share-element"
import { getItineraryById } from "@/lib/actions/itinerary.actions"

export default async function ItineraryPage({ params }: { params: Promise<any> }) {
  const paramsValue = await params;
  const itinerary = await getItineraryById(paramsValue.id);
  // const currentUser = await getCurrentUser();
  const currentUser = {
    uid: "123",
    name: "John Doe",
    title: "Traveler",
    trips: 10,
    avatar: "https://via.placeholder.com/150",
    image: "https://via.placeholder.com/150",
  };
  // const creator = await getUserById(itinerary.creatorId) as User;
  const creator = {
    id: "123",
    name: "John Doe",
    title: "Traveler",
    trips: 10,
    avatar: "https://via.placeholder.com/150",
    image: "https://via.placeholder.com/150",
  };

  const getCountryValue = (country: string | { value: string }) => {
    return typeof country === 'string' ? country : country.value;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="flex flex-col sticky h-[calc(100vh-70px)] min-h-[800px] lg:min-h-fit md:minn-h-screen md:h-screen px-2 md:px-8 gap-6 lg:flex-row lg:h-[520px]">
        <div className="w-full lg:h-full rounded-3xl shadow-xl">
          <div className="flex-1 h-[450px] md:h-[520px] relative rounded-3xl overflow-hidden">
            <Image
              src={itinerary.}
              alt={itinerary.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-end md:items-center">
              <div className="container px-0 mx-0 lg:mx-auto">
                <div className="text-white lg:max-w-2xl m-0 p-6">
                  <h1 className="text-3xl max-w-[80%] md:max-w-none leading-[40px] md:leading-none md:text-3xl lg:text-5xl font-bold mb-4">{itinerary.name}</h1>
                  <p className="text-sm md:text-xl mb-6 hidden md:block">{itinerary.shortDescription}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {itinerary.shortDescription}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      {itinerary.countries.map((country: any) => country.value).join(' · ')}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      2-4 people
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Items List */}
        <div className="flex flex-col justify-between h-full lg:hidden">
          <div className="block px-4">
            <div className="flex justify-between">
              <div>
                <h2 className="font-semibold text-xl mb-2">Trip Overview</h2>
                <span className="text-sm text-black truncate">
                  {/* {itinerary.cities.map((city: any) => city.city).join(' · ')} */}
                  {itinerary.countries.map((country: any) => country.value).join(' · ')}
                </span>
                
                {/* Category Tags */}
                <div className="mb-4 mt-2">
                  <div className="flex flex-wrap gap-2">
                    {itinerary.itineraryTags.map((category: string) => (
                      <span
                        key={category}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 mt-2">{itinerary.shortDescription}</p>
                <div className="flex gap-4 hidden">
                  <div className="flex flex-col items-center my-4 relative w-[90px]">
                    <div className="flex items-center justify-center text-white/80 w-[60px] h-[60px] bg-gray-900/10 rounded-xl">
                      <Train />
                    </div>
                    <p className="text-xs mt-2">Transportation</p>
                    <div className="absolute rounded-full right-1 -top-1 flex items-center justify-center w-[20px] h-[20px] text-white bg-black">
                      <p className="text-xs">5</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center my-4 relative w-[90px]">
                    <div className="flex items-center justify-center text-white/80 w-[60px] h-[60px] bg-gray-900/10 rounded-xl">
                      <BedDouble />
                    </div>
                    <p className="text-xs mt-2">Accommodations</p>
                    <div className="absolute rounded-full right-1 -top-1 flex items-center justify-center w-[20px] h-[20px] text-white bg-black">
                      <p className="text-xs">5</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center my-4 relative w-[90px]">
                    <div className="flex items-center justify-center text-white/80 w-[60px] h-[60px] bg-gray-900/10 rounded-xl">
                      <Bike />
                    </div>
                    <p className="text-xs mt-2">Activities</p>
                    <div className="absolute rounded-full right-1 -top-1 flex items-center justify-center w-[20px] h-[20px] text-white bg-black">
                      <p className="text-xs">5</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center my-4 relative w-[90px]">
                    <div className="flex items-center justify-center text-white/80 w-[60px] h-[60px] bg-gray-900/10 rounded-xl">
                      <Utensils />
                    </div>
                    <p className="text-xs mt-2">Food</p>
                    <div className="absolute rounded-full right-1 -top-1 flex items-center justify-center w-[20px] h-[20px] text-white bg-black">
                      <p className="text-xs">2</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {currentUser?.uid !== itinerary.creatorId ? (
                  <Link href={`/itinerary/${itinerary.id}/edit`}>
                    <Edit size={30} className="cursor-pointer hover:bg-gray-200 h-10 w-10 rounded-full p-2"/>
                  </Link>
                ) : (
                  <BookmarkElement itineraryId={itinerary.id} />
                )}
                <ShareElement />
              </div>
            </div>
            
            <div className="w-full flex justify-around my-3 justify-between">
              <p>2 Transports</p>
              <span>|</span>
              <p>2 Restaurants</p>
              <span>|</span>
              <p>4 Accommodations</p>
            </div>
          </div>

          <div className="bg-gray-100 flex flex-col gap-2 w-full rounded-xl p-4">
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-4">
                <Image
                  src={creator.image}
                  alt={creator.name}
                  width={50}
                  height={56}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium">Created by {creator.name}</p>
                  <p className="text-sm text-gray-600">
                    {creator.title} · {creator.trips} trips created
                  </p>
                </div>
              </div>
              <button className="hover:bg-gray-200 rounded-lg px-8 text-sm transition-colors bg-[#000000] text-[#ffffff]">
                Follow
              </button>
            </div>
            <div>
              {/* <p className={cn(
                "text-md text-gray-700",
                !showFullDetails && "line-clamp-2"
              )}>
                {itinerary.details}
              </p>
              {itinerary.details && itinerary.details.length > 100 && (
                <button 
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="text-sm text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1"
                >
                  {showFullDetails ? 'Show less' : 'Read more'}
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    showFullDetails && "rotate-90"
                  )} />
                </button>
              )} */}
              <p>{itinerary.details}</p>
            </div>
          </div>
        </div>
        
        <div className="flex h-full w-full lg:w-[40%] hidden lg:block ">
          <div className="flex flex-col h-full gap-4">
            <div className="w-full relative rounded-3xl h-[40%] overflow-hidden">
              <Image
                src="https://uploads.exoticca.com/p/16561/50656/i/ism_horizontal_aspect_ratio_3_29.jpg"
                alt="Secondary view"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="lg:bg-gray-800 w-full lg:h-[40%] rounded-3xl p-4 text-black lg:text-white flex flex-col justify-end gap-2">
              {itinerary.shortDescription}
            </div>
            <div className="bg-gray-800 relative w-full h-[20%] rounded-3xl p-4 text-white flex flex-col justify-end"
            style={{
              backgroundImage: `url(${itinerary.mainImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}>
              <div className="absolute bottom-1 right-1">
                View all photos
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Schedule */}
          <ScheduleSection schedule={itinerary.days} notes={itinerary.notes} />

          {/* Right Column - Details & Notes */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <h2 className="text-2xl font-semibold mb-6">Trip Details</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={creator.image}
                    alt={creator.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{creator.name}</p>
                  <p className="text-sm text-gray-600">
                    {creator.trips} trips created
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">{itinerary.details}</p>
              <div className="space-y-4">
                {/* Category Tags */}
                <div className="mb-4 mt-2">
                  <div className="flex flex-wrap gap-2">
                    {itinerary.itineraryTags.map((category: string) => (
                      <span
                        key={category}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Creator Notes */}
              <div className="mt-8 hidden lg:block">
                <h3 className="text-lg font-semibold mb-4">Creator Notes</h3>
                <NoteSection notes={itinerary.notes} />
              </div>
            </div>
          </div>
        </div>

        {/* Similar Itineraries */}
        {/* <div className="mt-24">
          <h2 className="text-2xl font-semibold mb-6">Similar Itineraries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarItineraries.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  router.push(`/itinerary/${item.id}`)
                }}
              >
                <div className="relative h-48">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.countries}, {item.countries[0]}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{item.duration} days</span>
                    <span className="font-medium">${item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  )
} 
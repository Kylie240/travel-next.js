import { Suspense } from "react"
import Loading from "@/app/loading"
import { similarItineraries } from "./data"
import { Calendar, MapPin, Users, Utensils, Bike, BedDouble, Train, Bookmark, ChevronUp, ChevronDown, ChevronRight, Share, Edit, DollarSign } from "lucide-react"
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
import { activityTagsMap, itineraryTagsMap } from "@/lib/constants/tags"
import { BiMoney } from "react-icons/bi"

export default async function ItineraryPage({ params }: { params: Promise<any> }) {
  const paramsValue = await params;
  const itinerary = await getItineraryById(paramsValue.id) as Itinerary;
  const creator = itinerary.creator;
  // const currentUser = await getCurrentUser();
  const currentUser = {
    uid: "123",
    name: "John Doe",
    title: "Traveler",
    trips: 10,
    avatar: "https://via.placeholder.com/150",
    image: "https://via.placeholder.com/150",
  };
  const countries = itinerary.days.map(day => day.countryName).filter((value, index, self) => self.indexOf(value) === index);
  const cities = itinerary.days.map(day => day.cityName).filter((value, index, self) => self.indexOf(value) === index);
  const activityTags = itinerary.days.flatMap(day =>
    day.activities.map(activity => activity.type).filter(Boolean)
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center lg:gap-8">
      {/* Hero Section */}
      <div className="flex flex-col justify-between sticky h-[calc(100vh-70px)] min-h-[800px] lg:min-h-fit px-2 md:px-8 lg:px-[6rem] gap-6 lg:flex-row lg:h-[520px] w-full" style={{maxWidth: "1600px"}}>
        <div className="w-full lg:h-full rounded-3xl shadow-xl">
          <div className="flex-1 h-[450px] md:h-[520px] relative rounded-3xl overflow-hidden">
            <Image
              src={itinerary.mainImage}
              alt={itinerary.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-end md:items-end">
              <div className="container px-0 mx-0 lg:mx-auto">
                <div className="text-white m-0 p-6 md:p-8 md:mb-8 md:ml-4">
                  <h1 className="text-3xl max-w-[80%] leading-[40px] md:leading-[40px] md:text-4xl lg:text-5xl font-bold mb-4">{itinerary.title}</h1>
                  {/* <p className="text-sm md:text-xl mb-6 hidden md:block">{itinerary.shortDescription}</p> */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {itinerary.duration} days
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      {countries.length > 0 ? countries.map((country: any) => country).join(' · ') : ''}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      {itinerary?.budget}/person
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Items List */}
        <div className="flex flex-col h-full lg:hidden block justify-between p-4">
          <div className="">
              <h2 className="text-xl font-semibold mb-2">Trip Overview</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {itinerary.itineraryTags && itinerary.itineraryTags.map((tag: number) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {itineraryTagsMap[tag - 1].name}
                    </span>
                  ))}
              </div>
              {itinerary.shortDescription}
          </div>
          <div className=" px-4 pt-6 pb-4 border rounded-2xl">
            <div className="flex justify-between">
              <div className="flex items-center gap-4 px-1">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={creator.avatar}
                    alt={creator.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex gap-2">
                    <p className="font-medium">{creator.name}</p>
                    <p className="font-medium text-gray-600">@{creator.username}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {creator.title} {creator.trips && ` · ${creator.trips} trips created`}
                  </p>
                </div>
              </div>
              <div className="cursor-pointer border rounded-xl flex justify-center items-center w-[150px] h-[30px] bg-gray-900 hover:bg-gray-800 text-white p-2">
                Follow
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className=" px-2">{creator.bio}</p>
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

            <div className="lg:bg-gray-800 w-full lg:h-[40%] rounded-3xl p-6 text-black lg:text-white flex flex-col justify-end gap-2">
              {itinerary.shortDescription}
            </div>
            <div className="bg-gray-800 relative w-full h-[20%] overflow-hidden rounded-3xl text-white flex justify-center items-center curstor-pointer"
            style={{
              backgroundImage: `url(${itinerary.mainImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}>
              <div className="w-full h-full inset-0 bg-black/20 z-1 cursor-pointer hover:bg-black/10 font-medium text-lg flex justify-center items-center">
                View All 20 Photos
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-[4rem] py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 md:px-8">
          {/* Left Column - Schedule */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="flex flex-col mb-4 lg:mb-0">
              <h2 className="text-2xl md:text-2xl font-semibold mb-2 hidden lg:block">Trip Overview</h2>
              <div className="hidden flex-wrap gap-2 mb-2 lg:flex">
                {itinerary.itineraryTags && itinerary.itineraryTags.map((tag: number) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {itineraryTagsMap[tag - 1].name}
                    </span>
                  ))}
              </div>
              {itinerary.detailedOverview}
            </div>
            <ScheduleSection schedule={itinerary.days} notes={itinerary.notes} />
          </div>

          {/* Right Column - Details & Notes */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className=" px-4 pt-6 pb-4 border rounded-2xl">
                <div className="flex items-center gap-4 px-1">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src={creator.avatar}
                      alt={creator.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <p className="font-medium">{creator.name}</p>
                      <p className="font-medium text-gray-600">@{creator.username}</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {creator.title} {creator.trips && ` · ${creator.trips} trips created`}
                    </p>
                  </div>
                </div>
                <div className="mt-4 hidden lg:block space-y-2">
                  <p className="text-lg font-semibold px-2">About the Creator</p>
                  <p className=" px-2">{creator.bio}</p>
                  <div className="flex gap-2 w-full mt-2">
                    <div className="cursor-pointer border rounded-xl flex justify-center items-center w-full p-2 hover:bg-gray-100">
                      View Profile
                    </div>
                    <div className="cursor-pointer border rounded-xl flex justify-center items-center w-full bg-gray-900 hover:bg-gray-800 text-white p-2">
                      Follow
                    </div>
                  </div>
                </div>
              </div>
              {/* Creator Notes */}
              <p className="text-lg text-center font-medium mt-8">Useful Trip Notes</p>
              <div className="px-1">
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
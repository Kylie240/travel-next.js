import { Calendar, MapPin, DollarSign } from "lucide-react"
import Image from "next/image"
import { Itinerary } from "@/types/itinerary"
import BookmarkElement from "./bookmark-element"
import ScheduleSection from "./schedule-section"
import NoteSection from "./note-section"
import ShareElement from "./share-element"
import { getItineraryById } from "@/lib/actions/itinerary.actions"
import { itineraryTagsMap } from "@/lib/constants/tags"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import EditElement from "../edit-element"
import LikeElement from "./like-element"
import { Button } from "@/components/ui/button"
import FollowButton from "./follow-button"
import { collectAllPhotos } from "@/lib/utils/photos"
import ItineraryGallery from "./itinerary-gallery"
import Link from "next/link"
import { FiEdit } from "react-icons/fi"

export default async function ItineraryPage({ params }: { params: Promise<any> }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id

  const paramsValue = await params;
  const itinerary = await getItineraryById(paramsValue.id) as Itinerary;
  const creator = itinerary.creator;
  const countries = itinerary.days.map(day => day.countryName).filter((value, index, self) => self.indexOf(value) === index);
  const cities = itinerary.days.map(day => day.cityName).filter((value, index, self) => self.indexOf(value) === index);
  const activityTags = itinerary.days.flatMap(day =>
    day.activities.map(activity => activity.type).filter(Boolean)
  );
  const photos = collectAllPhotos(itinerary);
  const canEdit = currentUserId === itinerary.creatorId;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center lg:gap-8">
      {/* Hero Section */}
      <div className="flex flex-col justify-between sticky h-[calc(100vh-70px)] min-h-[800px] lg:min-h-fit px-2 md:px-8 lg:px-[4rem] xl:px-[6rem] gap-6 lg:flex-row lg:h-[520px] w-full" style={{maxWidth: "1600px"}}>
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
        <div className="flex flex-col h-full lg:hidden justify-between p-4">
          <div className="mb-2">
            <div className="flex w-full justify-between">
              <h2 className="text-xl font-semibold mb-2">Trip Overview</h2>
              <div className="flex gap-2">
                {canEdit ?
                (
                  <Link href={`/create?itineraryId=${itinerary.id}`}>
                    <FiEdit size={35} className={`transition-colors cursor-pointer h-10 w-10 text-black hover:bg-gray-100 rounded-lg p-2`}/>
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <LikeElement itineraryId={itinerary.id} />  
                    <BookmarkElement itineraryId={itinerary.id} />
                  </div>
                )}
                <ShareElement />
              </div>
            </div>
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
              <div className="cursor-pointer border rounded-xl flex justify-center items-center w-[130px] h-[30px] bg-gray-900 hover:bg-gray-800 text-white p-4">
                Follow
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className=" px-2">{creator.bio}</p>
            </div>
          </div>
        </div>
        
        <div className="h-full w-full lg:w-[40%] hidden lg:flex ">
          <div className="flex flex-col h-full gap-4">
            {/* <div className="w-full relative rounded-3xl h-[40%] overflow-hidden">
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
            </div> */}
            <div className="lg:bg-gray-800 w-full lg:h-[70%] rounded-3xl p-6 text-black lg:text-white flex flex-col justify-center gap-2">
              {itinerary.shortDescription}
            </div>
            <ItineraryGallery photos={photos} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-[3rem] xl:px-[6rem] py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 md:px-8">
          {/* Left Column - Schedule */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="flex flex-col mb-4 lg:mb-0">
              <div className="flex w-full justify-between">
                <h2 className="text-2xl md:text-2xl font-semibold mb-2 hidden lg:block">Trip Overview</h2>
                <div className="flex gap-2">
                  {canEdit ?
                  (
                    <Link href={`/create?itineraryId=${itinerary.id}`}>
                      <FiEdit size={35} className={`transition-colors cursor-pointer h-10 w-10 text-black hover:bg-gray-100 rounded-lg p-2`}/>
                    </Link>
                  ) : (
                    <div className="flex gap-2">
                    <LikeElement itineraryId={itinerary.id} />  
                    <BookmarkElement itineraryId={itinerary.id} />
                  </div>
                  )}
                  <ShareElement />
                </div>
              </div>
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
            <ScheduleSection 
              schedule={itinerary.days} 
              notes={itinerary.notes}
            />
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
                    <div className="flex flex-col">
                      <p className="font-medium text-lg">{creator.name}</p>
                      <p className="text-gray-500">@{creator.username}</p>
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
                    <Link href={`/profile/${creator.username}`} className="w-1/2">
                      <Button variant="outline" className="cursor-pointer border rounded-xl flex justify-center items-center w-full p-2 hover:bg-gray-100">
                        View Profile
                      </Button>
                    </Link>
                    {canEdit ?
                    (
                      <Link className="w-1/2" href={`/account-settings?tab=${encodeURIComponent('Edit Profile')}`}>
                        <Button className="cursor-pointer border rounded-xl flex justify-center items-center w-full p-2 hover:bg-gray-800 text-white">
                          Edit Profile
                        </Button>
                      </Link>
                    ) : (
                      <div className="w-1/2">
                        <FollowButton creatorId={creator.userId} userId={currentUserId} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Creator Notes */}
              <p className="text-lg text-center font-medium mt-8">Useful Trip Notes</p>
              <div className="px-1 w-full">
                <NoteSection notes={itinerary.notes} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
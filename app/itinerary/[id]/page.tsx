import { Calendar, MapPin, DollarSign } from "lucide-react"
import Image from "next/image"
import { Itinerary } from "@/types/itinerary"
import BookmarkElement from "../../../components/ui/bookmark-element"
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
import { redirect } from "next/navigation"
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum"
import BioSection from "./bio-section"

export default async function ItineraryPage({ params }: { params: Promise<any> }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id
  const paramsValue = await params;
  const itinerary = await getItineraryById(paramsValue.id) as Itinerary;
  const creator = itinerary.creator;
  const isPrivate = itinerary.creator?.isPrivate;
  const countries = itinerary.days.map(day => day.countryName).filter((value, index, self) => self.indexOf(value) === index);
  const cities = itinerary.days.map(day => day.cityName).filter((value, index, self) => self.indexOf(value) === index);
  const activityTags = itinerary.days.flatMap(day =>
    day.activities.map(activity => activity.type).filter(Boolean)
  );
  const photos = collectAllPhotos(itinerary);
  const { data: userPlan } = await supabase.from('users_settings').select('plan').eq('user_id', currentUserId).single()
  console.log("userPlan", userPlan)
  const paidUser = userPlan.plan != "free";
  const canEdit = currentUserId === itinerary.creatorId;

  if (isPrivate && currentUserId !== itinerary.creatorId) {
    redirect("/not-authorized");
  }
  

  return (
    <div className="min-h-screen bg-white flex flex-col items-center lg:gap-8">
      {/* Hero Section */}
      <div className="flex flex-col min-h-fit px-2 md:px-8 lg:px-[4rem] xl:px-[6rem] gap-4 md:gap-6 lg:flex-row lg:h-[520px] w-full" style={{maxWidth: "1600px"}}>
        <div className="w-full lg:h-full rounded-3xl shadow-xl">
          <div className="flex-1 h-[400px] sm:h-[450px] md:h-[520px] relative rounded-3xl overflow-hidden">
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
                <div className="flex flex-col text-white m-0 sm:m-2 p-6 md:p-8 md:mb-8 md:ml-4 relative">
                    <h1 className="max-w-[100%] lg:max-w-[80%] text-left leading-[30px] md:leading-[40px] text-3xl xl:text-4xl font-bold lg:mb-4 mr-0 md:mr-6 lg:mr-0">{itinerary.title}</h1>
                    <div className="w-full flex justify-between items-center">
                      <div className="flex items-center gap-1 flex-wrap sm:gap-4 md:gap-6 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-1 sm:mr-2" />
                          {itinerary.duration} {itinerary.duration > 1 ? 'days' : 'day'}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 mr-1 sm:mr-2" />
                          {countries.length > 0 ? countries.map((country: any) => country).join(' · ') : ''}
                        </div>
                        {itinerary?.budget && 
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 sm:mr-1" />
                            {itinerary?.budget}/person
                          </div>
                        }
                      </div>
                      <div>
                        {photos?.length > 2 && 
                          <div className="lg:hidden rounded-md h-[45px] w-[65px]">
                            <ItineraryGallery photos={photos} />
                          </div>
                        }
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Items List */}
        <div className="flex mt-4 flex-col h-full lg:hidden justify-between px-4 md:pt-4">
          <div className="mb-2">
            <div className="flex w-full justify-between items-center mb-2">
              <h2 className="text-xl flex items-center font-semibold">Trip Overview</h2>
              <div className="flex gap-2">
                {canEdit ? (
                  <Link href={`/create?itineraryId=${itinerary.id}`} className={paidUser ? "" : "hidden"}>
                    <FiEdit size={35} className={`transition-colors cursor-pointer h-10 w-10 text-black hover:bg-gray-100 rounded-lg p-2`}/>
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <LikeElement itineraryId={itinerary.id} currentUserId={currentUserId}/>  
                    <BookmarkElement color="black" itineraryId={itinerary.id} currentUserId={currentUserId} />
                  </div>
                )}
                {itinerary.status === ItineraryStatusEnum.published && 
                  <ShareElement />
                }
              </div>
            </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {itinerary.itineraryTags && itinerary.itineraryTags.map((tag: number) => (
                    <span
                      key={tag}
                      className="flex justify-center items-center flex-wrap px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium"
                    >
                      {itineraryTagsMap[tag - 1].name}
                    </span>
                  ))}
              </div>
              <p className="text-sm md:text-md">
                {itinerary.shortDescription}
              </p>
          </div>
          <div className="p-4 border mt-4 rounded-md">
            <p className="text-md hidden md:block font-medium px-2 mb-2">About the Creator</p>
            <div className="flex w-full justify-between">
              <div>
                <Link href={`/profile/${creator.username}`} className="min-w-[100px] md:w-full cursor-pointer">
                  <div className="flex items-center gap-2 px-1">
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
                        <p className="text-xl font-medium">{creator.name}</p>
                        <p className="text-gray-500">@{creator.username}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="flex w-full gap-4 justify-end items-start">
                <div className="hidden md:block md:w-1/2">
                  <Link href={`/profile/${creator.username}`} className="hidden lg:block">
                    <Button variant="outline" className="cursor-pointer border flex justify-center items-center w-full p-2 hover:bg-gray-100">
                      View Profile
                    </Button>
                  </Link>
                </div>
                {canEdit ? (
                  <Link className="min-w-[100px] md:w-1/2" href={`/account-settings?tab=${encodeURIComponent('Edit Profile')}`}>
                    <Button className="cursor-pointer border flex justify-center items-center w-full p-2 hover:bg-gray-800 text-white">
                      Edit Profile
                    </Button>
                  </Link>
                  ) : (
                    <div className="min-w-[100px] md:w-1/2">
                      <FollowButton creatorId={creator.userId} userId={currentUserId} />
                    </div>
                  )}
              </div>
            </div>
            <div className="mt-2 space-y-2">
              <BioSection bio={creator.bio} />
            </div>
          </div>
        </div>
        
        <div className="h-full w-full lg:w-[40%] hidden lg:flex ">
          <div className="flex flex-col w-full h-full gap-4">
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
          <div className="lg:col-span-2 flex flex-col gap-4 md:gap-8">
            <div className="flex flex-col lg:mb-0">
              <div className="w-full justify-between hidden lg:flex">
                <h2 className="text-2xl md:text-2xl font-semibold mb-2">Trip Overview</h2>
                <div className="flex gap-2">
                  {currentUserId && !canEdit &&
                    <div className="flex gap-2">
                      <LikeElement itineraryId={itinerary.id} currentUserId={currentUserId}/>  
                      <BookmarkElement color="black" itineraryId={itinerary.id} currentUserId={currentUserId} />
                    </div>
                  }
                  {canEdit &&
                    <Link href={`/create?itineraryId=${itinerary.id}`} className={paidUser ? "" : "hidden"}>
                      <FiEdit size={35} className={`transition-colors cursor-pointer h-10 w-10 text-black hover:bg-gray-100 rounded-lg p-2`}/>
                    </Link>
                  }
                  {itinerary.status === ItineraryStatusEnum.published && 
                    <ShareElement />
                  }
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
              {itinerary?.detailedOverview && 
              <>
                <h2 className="text-xl lg:hidden font-semibold">Details</h2>
                <p className="my-4 text-sm md:text-md">
                  {itinerary.detailedOverview}
                </p>
              </>
              }
            </div>
            <ScheduleSection 
              schedule={itinerary.days} 
              notes={itinerary.notes}
              itineraryId={itinerary.id}
              isCreator={canEdit}
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
              {itinerary?.notes.length > 0 &&
              <>
                <p className="text-lg text-center font-medium mt-8">Useful Trip Notes</p>
                <div className="px-1 w-full">
                  <NoteSection notes={itinerary.notes} />
                </div>
              </>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
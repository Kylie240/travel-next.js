import { InteractionButtons } from "@/app/itinerary/[id]/interaction-buttons";
import ItineraryGallery from "@/app/itinerary/[id]/itinerary-gallery";
import PdfExportElement from "@/app/itinerary/[id]/pdf-export-element";
import ShareElement from "@/app/itinerary/[id]/share-element";
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum";
import { itineraryTagsMap } from "@/lib/constants/tags";
import { UserData } from "@/lib/types";
import { PhotoItem } from "@/lib/utils/photos";
import { Itinerary } from "@/types/itinerary";
import { Calendar, DollarSign, Lock, MapPin, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FiEdit } from "react-icons/fi";
import { Button } from "../ui/button";
import FollowButton from "@/app/itinerary/[id]/follow-button";
import BioSection from "@/app/itinerary/[id]/bio-section";
import ScheduleSection from "@/app/itinerary/[id]/schedule-section";
import NoteSection from "@/app/itinerary/[id]/note-section";
import { FaUserLarge } from "react-icons/fa6"
import { AddToCartButton } from "../ui/add-to-cart-button";

export default function BasicTemplate({ itinerary, countries, photos, canEdit, paidUser, initialIsLiked, initialIsSaved, initialIsFollowing, creator, currentUserId, isRestrictedView = false, priceCents = 0 }: { 
    itinerary: Itinerary, 
    countries: string[], 
    photos: PhotoItem[], 
    canEdit: boolean, 
    paidUser: boolean, 
    initialIsLiked: boolean, 
    initialIsSaved: boolean, 
    initialIsFollowing: boolean,
    creator: UserData
    currentUserId: string
    isRestrictedView?: boolean
    priceCents?: number
 }) {
    // Early return if essential data is missing
    if (!itinerary || !creator) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center lg:gap-8">
          {/* Hero Section */}
          <div className="flex flex-col min-h-fit px-2 md:px-8 lg:px-[4rem] xl:px-[6rem] gap-4 md:gap-6 lg:flex-row lg:h-[520px] w-full" style={{maxWidth: "1600px"}}>
            <div className="w-full lg:h-full rounded-3xl shadow-xl">
              <div className="flex-1 h-[450px] sm:h-[500px] md:h-[520px] relative rounded-3xl overflow-hidden">
                {itinerary.mainImage && (
                  <Image
                    src={itinerary.mainImage}
                    alt={itinerary.title || "Itinerary"}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 flex items-end md:items-end">
                  <div className="container px-0 mx-0 lg:mx-auto">
                    <div className="flex flex-col text-white mx-2 p-4 sm:p-6 md:p-6 md:mb-4 md:ml-4 relative">
                        <h1 className="max-w-[100%] pr-12 lg:max-w-[80%] text-left leading-[30px] md:leading-[40px] mt-2 md:mt-0 text-3xl xl:text-4xl font-bold lg:mb-4 mr-0 md:mr-6 lg:mr-0">{itinerary.title}</h1>
                        <div className="w-full mt-1 flex justify-between items-center gap-2">
                          <div className="flex items-center flex-wrap gap-x-2 sm:gap-x-4 md:gap-x-6 text-sm">
                            <div className="items-center hidden sm:flex">
                              <Calendar className="h-[16px] w-[16px] mr-[2px]" />
                              {itinerary.duration} {itinerary.duration > 1 ? 'days' : 'day'}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-[16px] w-[16px] mr-[2px]" />
                              {countries.length > 0 ? countries.map((country: any) => country).join(' · ') : ''}
                            </div>
                            {itinerary?.budget && 
                              <div className="flex items-center">
                                <DollarSign className="h-[16px] w-[16px] mr-[2px]" />
                                {itinerary?.budget}/person
                              </div>
                            }
                          </div>
                          <div>
                            {photos?.length > 1 && 
                              <div className="lg:hidden rounded-md">
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
                <div className="flex w-full justify-between items-center mb-1">
                  <h2 className="text-xl flex items-center font-semibold">Overview</h2>
                  <div className="flex">
                    {canEdit}
                    {canEdit ? (
                      <div className="flex">
                      <Link href={`/create?itineraryId=${itinerary.id}`}>
                        <FiEdit size={35} className={`transition-colors cursor-pointer h-10 w-10 text-black hover:bg-gray-100 rounded-lg p-2`}/>
                      </Link>
                      <PdfExportElement itineraryId={itinerary.id} itineraryStatus={itinerary.status} smallButton={false} />
                      </div>
                    ) : ( 
                      <InteractionButtons
                        itineraryId={itinerary.id} 
                        initialIsLiked={initialIsLiked}
                        initialIsSaved={initialIsSaved}
                        itineraryStatus={itinerary.status}
                      />
                    )}
                    {itinerary.status === ItineraryStatusEnum.published && 
                      <ShareElement id={itinerary.id} smallButton={false} />
                    }
                  </div>
                </div>
                <div className="flex justify-center w-full text-sm sm:text-base px-2 sm:px-4">
                  {/* <div className="flex mb-2 px-1 justify-between sm:hidden w-full max-w-[500px]">
                    <div className="flex py-1 pr-3 gap-2 justify-center items-center">
                      {itinerary.duration}
                      <p>Day{itinerary.duration == 1 ? '' : 's'}</p>
                    </div>
                    <p className="mt-1">|</p>
                    <div className="flex py-1 px-3 gap-2 justify-center items-center">
                      {accommodationCount}
                      <p>Accommodation{accommodationCount == 1 ? '' : 's'}</p>
                    </div>
                    <p className="mt-1">|</p>
                    <div className="flex py-1 pl-3 gap-2 justify-center items-center">
                      {activityCount}
                      <p>Activit{activityCount == 1 ? 'y' : 'ies'}</p>
                    </div>
                  </div> */}
                </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {itinerary.itineraryTags && itinerary.itineraryTags.map((tag: number) => {
                        const tagData = itineraryTagsMap.find(t => t.id === tag);
                        if (!tagData) return null;
                        return (
                          <span
                            key={tag}
                            className="flex justify-center items-center flex-wrap px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium"
                          >
                            {tagData.name}
                          </span>
                        );
                      })}
                  </div>
                  <p className="text-sm md:text-md">
                    {itinerary.shortDescription}
                  </p>
              </div>
              <div className="p-4 border mt-4 rounded-md">
                {creator.bio && creator.bio.length > 0 && (
                  <p className="text-md hidden md:block font-medium px-2 mb-2">About the Creator</p>
                )}
                <div className="flex flex-wrap w-full justify-between">
                  <div>
                    <Link href={`/profile/${creator.username || ''}`} className="min-w-[100px] md:w-full cursor-pointer">
                      <div className="flex items-center gap-2 px-1">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                          {creator.avatar && creator.avatar.length > 0 ? (
                            <Image
                              src={creator.avatar}
                              alt={creator.name || "Creator"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="relative h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <FaUserLarge className="h-10 w-10 mt-2 text-gray-300" />
                            </div>
                          )}
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
                  <div className="flex w-fit gap-4 justify-end items-start">
                    <div className="hidden md:block md:w-1/2">
                      <Link href={`/profile/${creator.username}`} className="hidden md:block">
                        <Button variant="outline" className="cursor-pointer border flex justify-center items-center w-full p-2 hover:bg-gray-100">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                    {currentUserId === itinerary.creatorId ? (
                      <Link className="min-w-[100px] md:w-1/2" href={`/account-settings?tab=${encodeURIComponent('Profile')}`}>
                        <Button className="cursor-pointer border flex justify-center items-center w-full p-2 hover:bg-gray-800 text-white">
                          Edit Profile
                        </Button>
                      </Link>
                      ) : (
                        <div className="min-w-[100px] md:w-1/2">
                          <FollowButton 
                            creatorId={itinerary.creatorId} 
                            userId={currentUserId || ""} 
                            initialIsFollowing={initialIsFollowing}
                          />
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
                    {(itinerary.detailedOverview && itinerary.detailedOverview.length > 0 || itinerary.itineraryTags.length > 0) ? (
                      <h2 className="text-2xl md:text-2xl font-semibold mb-2">Overview</h2>
                    ) : (
                      <h2 className="text-2xl md:text-2xl font-semibold mb-2"> </h2>
                    )}
                    <div className="flex">
                      {currentUserId !== itinerary.creatorId && (
                        <InteractionButtons 
                          itineraryId={itinerary.id} 
                          initialIsLiked={initialIsLiked}
                          initialIsSaved={initialIsSaved}
                          itineraryStatus={itinerary.status}
                        />
                      )}
                      {canEdit &&
                        <Link href={`/create?itineraryId=${itinerary.id}`}>
                          <FiEdit size={35} className={`transition-colors cursor-pointer h-10 w-10 text-black hover:bg-gray-100 rounded-lg p-2`}/>
                        </Link>
                      }
                      {itinerary.status === ItineraryStatusEnum.published && 
                        <ShareElement id={itinerary.id} smallButton={false} />
                      }
                    </div>
                  </div>
                  <div className="hidden flex-wrap gap-2 mb-2 lg:flex">
                    {itinerary.itineraryTags && itinerary.itineraryTags.map((tag: number) => {
                        const tagData = itineraryTagsMap.find(t => t.id === tag);
                        if (!tagData) return null;
                        return (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                          >
                            {tagData.name}
                          </span>
                        );
                      })}
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
                {isRestrictedView ? (
                  <div className="mt-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <Lock className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Content</h3>
                    <p className="text-gray-600 mb-4">
                      Purchase this itinerary to unlock the full day-by-day schedule, detailed notes, and all travel tips.
                    </p>
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      ${(priceCents / 100).toFixed(2)}
                    </div>
                    <div className="flex flex-col gap-3 items-center">
                      <Button className="bg-black hover:bg-gray-800 text-white px-8 py-2">
                        Purchase Itinerary
                      </Button>
                      {process.env.NEXT_PUBLIC_ENABLE_CART === 'true' && (
                        <AddToCartButton
                          itinerary={{
                            id: itinerary.id,
                            title: itinerary.title,
                            priceCents: priceCents,
                            mainImage: itinerary.mainImage,
                            creatorName: creator.name || "",
                            creatorUsername: creator.username || "",
                          }}
                          className="px-8 py-2"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <ScheduleSection 
                    schedule={itinerary.days} 
                    notes={itinerary.notes}
                    itineraryId={itinerary.id}
                    isCreator={canEdit}
                    duration={itinerary.duration}
                  />
                )}
              </div>
    
              {/* Right Column - Details & Notes */}
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <div className=" px-4 pt-6 pb-4 border rounded-2xl">
                    <Link href={`/profile/${creator.username || ''}`} className="cursor-pointer">
                      <div className="flex items-center gap-4 px-1">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                          {creator.avatar && creator.avatar.length > 0 ? (
                            <Image
                              src={creator.avatar}
                              alt={creator.name || "Creator"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="relative h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <FaUserLarge className="h-10 w-10 mt-2 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex flex-col">
                            <p className="font-medium text-lg">{creator.name}</p>
                            <p className="text-gray-500">@{creator.username}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="mt-4 hidden lg:block space-y-2">
                      {creator.bio && creator.bio.length > 0 && 
                        <p className="text-lg font-semibold px-2">About the Creator</p>
                      }
                      <p className=" px-2">{creator.bio}</p>
                      <div className="flex gap-2 w-full mt-2">
                        <Link href={`/profile/${creator.username}`} className="w-1/2">
                          <Button variant="outline" className="cursor-pointer border flex justify-center items-center w-full p-2 hover:bg-gray-100">
                            View Profile
                          </Button>
                        </Link>
                        {currentUserId === itinerary.creatorId ?
                        (
                          <Link className="w-1/2" href={`/account-settings?tab=${encodeURIComponent('Profile')}`}>
                            <Button className="cursor-pointer border flex justify-center items-center w-full p-2 hover:bg-gray-800 text-white">
                              Edit Profile
                            </Button>
                          </Link>
                        ) : (
                          <div className="w-1/2">
                            <FollowButton 
                              creatorId={itinerary.creatorId} 
                              userId={currentUserId || ""} 
                              initialIsFollowing={initialIsFollowing}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Creator Notes - hidden for restricted view */}
                  {!isRestrictedView && itinerary?.notes && itinerary.notes.length > 0 &&
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
"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { Itinerary } from "@/types/itinerary";
import PhotoGallery from "@/components/ui/photo-gallery";
import { collectAllPhotos } from "@/lib/utils/photos";
import BookmarkElement from "./bookmark-element";
import LikeElement from "./like-element";
import ShareElement from "./share-element";
import EditElement from "../edit-element";
import { itineraryTagsMap } from "@/lib/constants/tags";

interface ItineraryHeaderProps {
  itinerary: Itinerary;
  countries: string[];
  canEdit: boolean;
}

export default function ItineraryHeader({ itinerary, countries, canEdit }: ItineraryHeaderProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const photos = collectAllPhotos(itinerary);

  return (
    <>
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
                {!canEdit ? (
                  <div className="flex gap-2">
                    <LikeElement itineraryId={itinerary.id} />  
                    <BookmarkElement itineraryId={itinerary.id} />
                  </div>
                ) : (
                  <EditElement itineraryId={itinerary.id} />
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
          <div className="px-4 pt-6 pb-4 border rounded-2xl">
            <div className="flex justify-between">
              <div className="flex items-center gap-4 px-1">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={itinerary.creator.avatar}
                    alt={itinerary.creator.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex gap-2">
                    <p className="font-medium">{itinerary.creator.name}</p>
                    <p className="font-medium text-gray-600">@{itinerary.creator.username}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {itinerary.creator.title} {itinerary.creator.trips && ` · ${itinerary.creator.trips} trips created`}
                  </p>
                </div>
              </div>
              <div className="cursor-pointer border rounded-xl flex justify-center items-center w-[130px] h-[30px] bg-gray-900 hover:bg-gray-800 text-white p-4">
                Follow
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="px-2">{itinerary.creator.bio}</p>
            </div>
          </div>
        </div>
        
        <div className="h-full w-full lg:w-[40%] hidden lg:flex">
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
            <div 
              className="bg-gray-800 relative w-full h-[20%] overflow-hidden rounded-3xl text-white flex justify-center items-center cursor-pointer"
              style={{
                backgroundImage: `url(${itinerary.mainImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onClick={() => setIsGalleryOpen(true)}
            >
              <div className="w-full h-full inset-0 bg-black/20 z-1 cursor-pointer hover:bg-black/10 font-medium text-lg flex justify-center items-center">
                View All {photos.length} Photos
              </div>
            </div>
          </div>
        </div>
      </div>

      <PhotoGallery
        photos={photos}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </>
  );
}

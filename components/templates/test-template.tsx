"use client";

import React, { useState, useEffect } from "react";
import { InteractionButtons } from "@/app/itinerary/[id]/interaction-buttons";
import ItineraryGallery from "@/app/itinerary/[id]/itinerary-gallery";
import PdfExportElement from "@/app/itinerary/[id]/pdf-export-element";
import ShareElement from "@/app/itinerary/[id]/share-element";
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum";
import { itineraryTagsMap } from "@/lib/constants/tags";
import { UserData } from "@/lib/types";
import { PhotoItem } from "@/lib/utils/photos";
import { Itinerary } from "@/types/itinerary";
import { Calendar, DollarSign, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FiEdit } from "react-icons/fi";
import { Button } from "../ui/button";
import FollowButton from "@/app/itinerary/[id]/follow-button";
import BioSection from "@/app/itinerary/[id]/bio-section";
import ScheduleSection from "@/app/itinerary/[id]/schedule-section";
import NoteSection from "@/app/itinerary/[id]/note-section";

export default function TestTemplate({ itinerary, countries, photos, canEdit, paidUser, initialIsLiked, initialIsSaved, initialIsFollowing, creator, currentUserId }: { 
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
 }) {
    const [dominantColor, setDominantColor] = useState<string>("rgba(0, 0, 0, 0.6)");

    // Extract dominant color from image
    useEffect(() => {
        const extractColor = async () => {
            try {
                const img = new window.Image();
                img.crossOrigin = "anonymous";
                
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;

                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Sample pixels from the bottom portion of the image (where the overlay will be)
                    const imageData = ctx.getImageData(0, Math.floor(img.height * 0.6), img.width, Math.floor(img.height * 0.4));
                    const pixels = imageData.data;

                    // Calculate average color
                    let r = 0, g = 0, b = 0, count = 0;
                    for (let i = 0; i < pixels.length; i += 16) { // Sample every 4th pixel
                        r += pixels[i];
                        g += pixels[i + 1];
                        b += pixels[i + 2];
                        count++;
                    }

                    if (count > 0) {
                        r = Math.floor(r / count);
                        g = Math.floor(g / count);
                        b = Math.floor(b / count);
                        
                        // Use the extracted color with 70% opacity
                        setDominantColor(`rgba(${r}, ${g}, ${b}, 0.7)`);
                    }
                };

                img.onerror = () => {
                    // Fallback to dark color if image fails to load
                    setDominantColor("rgba(0, 0, 0, 0.6)");
                };

                img.src = itinerary.mainImage;
            } catch (error) {
                console.error("Error extracting color:", error);
                setDominantColor("rgba(0, 0, 0, 0.6)");
            }
        };

        extractColor();
    }, [itinerary.mainImage]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center lg:gap-8">
          {/* Hero Section */}
          <div className="w-full h-[calc(100vh-62px)] relative">
            <Image
                src={itinerary.mainImage}
                alt={itinerary.title}
                fill
                className="object-cover"
                priority
                />
            <div className="absolute bottom-20 w-full h-[600px]">
                <div 
                    className="mx-20 text-white rounded-3xl p-6 backdrop-blur-sm border border-white/20"
                    style={{ backgroundColor: dominantColor }}
                >
                    <div className="flex border-b border-white/50 pb-4">
                        <MapPin size={40} />
                        <div className="flex flex-col">
                            <h1 className="text-white text-4xl font-bold">
                                {itinerary.title}
                            </h1>
                            {countries.length > 0 ? countries.map((country: any) => country).join(' · ') : ''}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex justify-between">
                            <div className="flex">
                                <Calendar size={20} />
                                <p className="text-sm">
                                    {itinerary.duration} {itinerary.duration > 1 ? 'days' : 'day'}
                                </p>
                            </div>
                            <div className="flex">
                                <MapPin size={20} />
                                <p className="text-sm">
                                    {countries.length > 0 ? countries.map((country: any) => country).join(' · ') : ''}
                                </p>
                            </div>
                            <div className="flex">
                                <DollarSign size={20} />
                                <p className="text-sm">
                                    {itinerary.budget} / person
                                </p>
                            </div>
                        </div>
                        <p>Description</p>
                        <p className="text-sm">
                            {itinerary.detailedOverview}
                        </p>
                    </div>
                    <Button className="bg-white text-black w-full rounded-full mt-4">
                        View Itinerary
                    </Button>
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
                      {currentUserId !== itinerary.creatorId && (
                        <InteractionButtons 
                          itineraryId={itinerary.id} 
                          initialIsLiked={initialIsLiked}
                          initialIsSaved={initialIsSaved}
                          itineraryStatus={itinerary.status}
                        />
                      )}
                      {canEdit &&
                        <Link href={`/create?itineraryId=${itinerary.id}`} className={paidUser ? "" : "hidden"}>
                          <FiEdit size={35} className={`transition-colors cursor-pointer h-10 w-10 text-black hover:bg-gray-100 rounded-lg p-2`}/>
                        </Link>
                      }
                      {itinerary.status === ItineraryStatusEnum.published && 
                        <ShareElement id={itinerary.id} smallButton={false} />
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
                    <Link href={`/profile/${creator.username}`} className="cursor-pointer">
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
                    </Link>
                    <div className="mt-4 hidden lg:block space-y-2">
                      <p className="text-lg font-semibold px-2">About the Creator</p>
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
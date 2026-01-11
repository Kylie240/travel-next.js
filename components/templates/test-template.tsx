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
import { Calendar, ChevronLeft, DollarSign, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FiEdit } from "react-icons/fi";
import { Button } from "../ui/button";
import FollowButton from "@/app/itinerary/[id]/follow-button";
import BioSection from "@/app/itinerary/[id]/bio-section";
import ScheduleSection from "@/app/itinerary/[id]/schedule-section";
import NoteSection from "@/app/itinerary/[id]/note-section";
import BookmarkElement from "../ui/bookmark-element";
import { useRouter } from "next/navigation";
import { DaySection } from "@/components/ui/day-section";

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
    const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
    const router = useRouter();
    
    // Initialize selected day to first day with image
    useEffect(() => {
        if (itinerary?.days && itinerary.days.length > 0) {
            const firstDayWithImage = itinerary.days.findIndex(day => day.image);
            if (firstDayWithImage !== -1) {
                setSelectedDayIndex(firstDayWithImage);
            }
        }
    }, [itinerary?.days]);
    
    // Extract dominant color from image
    useEffect(() => {
        if (!itinerary?.mainImage) return;
        
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
    }, [itinerary?.mainImage]);

    // Early return if essential data is missing
    if (!itinerary || !creator) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center lg:gap-8">
          {/* Hero Section */}
          <div className="w-full h-[calc(100vh-62px)] relative">
            {itinerary.mainImage && (
              <Image
                  src={itinerary.mainImage}
                  alt={itinerary.title || "Itinerary"}
                  fill
                  className="object-cover"
                  priority
                  />
            )}
            <div className="flex flex-col justify-end items-center w-full h-full relative z-10">
              <div className="flex flex-col justify-between h-full w-full p-12 md:p-16 lg:p-20">
                <div className="flex w-full justify-between">
                  <div className="w-10 h-10 cursor-pointer bg-white rounded-full flex items-center justify-center shadow-lg z-20 relative">
                    <ChevronLeft size={20} onClick={() => router.push(`/profile/${creator.username}`)} />
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-20 relative">
                    <BookmarkElement itineraryId={itinerary.id} currentUserId={currentUserId} color="black" backgroundColor="none" />
                  </div>
                </div>
                <div 
                    className="text-white rounded-3xl p-6 backdrop-blur-sm"
                    style={{ backgroundColor: dominantColor }}
                >
                    <div className="flex gap-3 border-b border-white/50 pb-4">
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
                        <p className="pt-1 font-semibold">Description</p>
                        <p className="text-sm py-1">
                            {itinerary.shortDescription}
                        </p>
                    </div>
                    <Button className="bg-white text-black w-full rounded-full mt-4">
                        View Itinerary
                    </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="px-4 py-6 mb-8 border rounded-2xl">
              <Link href={`/profile/${creator.username || ''}`} className="cursor-pointer">
                <div className="flex items-center gap-4 px-1">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                    {creator.avatar && (
                      <Image
                        src={creator.avatar}
                        alt={creator.name || "Creator"}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col">
                      <p className="font-medium text-lg">{creator.name}</p>
                      <p className="text-gray-500">@{creator.username}</p>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
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
              </Link>
              <div className="mt-4 space-y-2">
                <p className="text-lg font-semibold px-2">About the Creator</p>
                <p className="px-2">{creator.bio}</p>
              </div>
            </div>
            <h2 className="text-2xl font-semibold">Trip Overview</h2>
            <p className="my-4 text-sm md:text-md">
              {itinerary.detailedOverview}
            </p>
          </div>
          
          {/* Day Images Gallery */}
          {itinerary.days && Array.isArray(itinerary.days) && itinerary.days.some(day => day.image) && (
            <>
              <div className="w-full p-8">
                <h2 className="text-2xl font-semibold mb-4">Day Schedule</h2>
                <div className="w-full overflow-x-auto no-scrollbar">
                  <div className="flex gap-6 m-6 min-w-max">
                    {itinerary.days.map((day, index) => {
                      if (!day.image) return null;
                      const isSelected = selectedDayIndex === index;
                      return (
                        <div
                          key={day.id || index}
                          onClick={() => setSelectedDayIndex(index)}
                          className={`relative flex-shrink-0 md:w-[275px] md:h-[350px] w-[200px] h-[250px] rounded-2xl overflow-hidden transition-all cursor-pointer group ${
                            isSelected ? 'shadow-lg shadow-black/20' : ''
                          }`}
                        >
                          <Image
                            src={day.image}
                            alt={day.title || `Day ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <p className="text-2xl text-white/70">{String(index + 1).padStart(2, '0')}</p>
                            <p className="text-md ">{day.title}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pr-8"></div>
                  </div>
                </div>
              </div>
              
              {/* Selected Day Schedule */}
              {itinerary.days[selectedDayIndex] && (
                <div className="w-full px-8 pb-8">
                  <DaySection
                    day={itinerary.days[selectedDayIndex]}
                    isActive={true}
                    onToggle={() => {}}
                    duration={itinerary.days.length}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )
}
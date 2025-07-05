"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Clock, Hotel, Car, Share2, Heart, StickyNote, Utensils, Bike, BedDouble, Train } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DaySection } from "@/components/ui/day-section"

interface ItineraryViewProps {
  itinerary: any // TODO: Add proper type
  similarItineraries: any[] // TODO: Add proper type
}

export function ItineraryView({ itinerary, similarItineraries }: ItineraryViewProps) {
  const [currentDay, setCurrentDay] = useState(null)
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="flex flex-col w-full md:px-8 gap-6 lg:flex-row lg:h-[520px]">
        <div className="w-full h-full rounded-3xl">
          <div className="flex-1 h-screen max-h-[900px] md:h-[520px] relative md:rounded-3xl overflow-hidden">
            <Image
              src={itinerary.image}
              alt={itinerary.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-end md:items-center">
              <div className="container px-0 mx-0 lg:mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white lg:max-w-2xl m-8 md:m-0 p-6 rounded-2xl bg-white/10 backdrop-blur-md md:bg-transparent md:backdrop-blur-none"
                >
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">{itinerary.title}</h1>
                  <div>
                    <span className="text-sm text-white truncate">
                      {itinerary.cities.join(' · ')}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center my-4 relative w-[90px]">
                      <div className="flex items-center justify-center text-white/80 w-[60px] h-[60px] bg-gray-100/10 rounded-full">
                        <Train />
                      </div>
                      <p className="text-xs mt-2">Transportation</p>
                      <div className="absolute rounded-full -right-1 -top-1 flex items-center justify-center w-[20px] h-[20px] text-black bg-white/80">
                        <p className="text-xs">5</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center my-4 relative w-[90px]">
                      <div className="flex items-center justify-center text-white/80 w-[60px] h-[60px] bg-gray-100/10 rounded-full">
                        <BedDouble />
                      </div>
                      <p className="text-xs mt-2">Accomodations</p>
                      <div className="absolute rounded-full -right-1 -top-1 flex items-center justify-center w-[20px] h-[20px] text-black bg-white/80">
                        <p className="text-xs">5</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center my-4 relative w-[90px]">
                      <div className="flex items-center justify-center text-white/80 w-[60px] h-[60px] bg-gray-100/10 rounded-full">
                        <Bike />
                      </div>
                      <p className="text-xs mt-2">Activities</p>
                      <div className="absolute rounded-full -right-1 -top-1 flex items-center justify-center w-[20px] h-[20px] text-black bg-white/80">
                        <p className="text-xs">5</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center my-4 relative w-[90px]">
                      <div className="flex items-center justify-center text-white/80 w-[60px] h-[60px] bg-gray-100/10 rounded-full">
                        <Utensils />
                      </div>
                      <p className="text-xs mt-2">Food</p>
                      <div className="absolute rounded-full -right-1 -top-1 flex items-center justify-center w-[20px] h-[20px] text-black bg-white/80">
                        <p className="text-xs">2</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm md:text-xl mb-6">{itinerary.description}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {itinerary.duration}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      {itinerary.countries[0]}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      2-4 people
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-full w-full lg:w-[40%]">
          <div className="flex flex-col h-full gap-4">
            <div className="w-full relative rounded-3xl h-[40%] overflow-hidden hidden lg:block">
              <Image
                src="https://uploads.exoticca.com/p/16561/50656/i/ism_horizontal_aspect_ratio_3_29.jpg"
                alt="Secondary view"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            
            
              <div className="bg-gray-100 block lg:hidden rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={itinerary.creator.image}
                    alt={itinerary.creator.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium">{itinerary.creator.name}</p>
                    <p className="text-sm text-gray-600">
                      {itinerary.creator.trips} trips created
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>{itinerary.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-gray-500" />
                    <span>Hotels & Ryokans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-gray-500" />
                    <span>Private & Public Transport</span>
                  </div>
                </div>
              </div>

            <div className="lg:bg-gray-800 w-full lg:h-[40%] rounded-3xl p-4 text-black lg:text-white flex flex-col justify-end gap-2">
              <h3 className="font-bold text-lg block lg:hidden">Description</h3>
              <p className="text-gray-600 lg:text-white">
              {itinerary.details}
              </p>
            </div>
            <div className="bg-gray-800 hidden lg:block w-full h-[20%] rounded-3xl p-4 text-white flex flex-col justify-end">
              View all photos
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button size="lg" className="gap-2">
              Book Now - {itinerary.price}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{itinerary.rating}</span>
            <div className="text-sm text-gray-600">
              ({itinerary.reviews} reviews)
            </div>
          </div>
        </div>

        {/* Category Tags */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {itinerary.categories.map((category: string) => (
              <span
                key={category}
                className="px-3 py-1 bg-travel-50 text-travel-900 rounded-full text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Schedule */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Itinerary Schedule</h2>
            <div className="flex flex-col gap-6">
              {itinerary.schedule.map((day: any) => (
                <DaySection
                  key={day.day}
                  day={day}
                  isActive={currentDay === day.day}
                  onClick={() => setCurrentDay(currentDay === day.day ? null : day.day)}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Details & Notes */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <h2 className="text-2xl font-semibold mb-6">Trip Details</h2>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={itinerary.creator.image}
                    alt={itinerary.creator.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium">{itinerary.creator.name}</p>
                    <p className="text-sm text-gray-600">
                      {itinerary.creator.trips} trips created
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{itinerary.details}</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>{itinerary.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-gray-500" />
                    <span>Hotels & Ryokans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-gray-500" />
                    <span>Private & Public Transport</span>
                  </div>
                </div>
              </div>

              {/* Add Note */}
              {/* <div className="mt-6">
                <h4 className="font-medium mb-2">Add Personal Note</h4>
                <Textarea
                  placeholder="Write your travel notes here..."
                  className="min-h-[100px]"
                />
                <Button className="mt-2 w-full">Save Note</Button>
              </div> */}
            </div>
          </div>
        </div>

        {/* Similar Itineraries */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Similar Itineraries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarItineraries.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
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
        </div>
      </div>
    </div>
  )
} 
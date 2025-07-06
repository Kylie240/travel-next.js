"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Clock, Hotel, Car, Share2, Heart, StickyNote, Utensils, Bike, BedDouble, Train, Bookmark, Star, X, ChevronUp, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DaySection } from "@/components/ui/day-section"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface ItineraryViewProps {
  itinerary: any // TODO: Add proper type
  similarItineraries: any[] // TODO: Add proper type
}

export function ItineraryView({ itinerary, similarItineraries }: ItineraryViewProps) {
  const [activeDays, setActiveDays] = useState<number[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [showFullDetails, setShowFullDetails] = useState(false)

  const toggleDay = (dayNumber: number) => {
    setActiveDays(prev => 
      prev.includes(dayNumber) 
        ? prev.filter(d => 
          d !== dayNumber)
        : [...prev, dayNumber]
    )
  }

  const closeAllDays = () => {
    setActiveDays([])
  }

  const openAllDays = () => {
    const days = itinerary.schedule.map((day: any) => day.day)
    setActiveDays(days)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="flex flex-col sticky h-[calc(100vh-70px)] md:h-screen px-2 md:px-8 gap-6 lg:flex-row lg:h-[520px]">
        <div className="w-full lg:h-full rounded-3xl shadow-xl">
          <div className="flex-1 h-[450px] md:h-[520px] relative rounded-3xl overflow-hidden">
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
                  className="text-white lg:max-w-2xl m-0 p-6"
                >
                  <h1 className="text-3xl max-w-[80%] md:max-w-none leading-[40px] md:leading-none md:text-3xl md:text-5xl font-bold mb-4">{itinerary.title}</h1>
                  <p className="text-sm md:text-xl mb-6 hidden md:block">{itinerary.description}</p>
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

        {/* Mobile Items List */}
        <div className="flex flex-col justify-between h-full md:h-auto lg:hidden">
          <div className="block px-4">
            <div className="flex justify-between">
              <div>
                <h2 className="font-semibold text-xl mb-2">Trip Overview</h2>
                {/* <div className="flex md:hidden mb-2">
                  <Star fill />
                  <p>4.8 · (123 reviews)</p>
                </div> */}
                <span className="text-sm text-black truncate">
                  {itinerary.cities.join(' · ')}
                </span>
                <p className="text-gray-600 mt-2">{itinerary.description}</p>
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
                    <p className="text-xs mt-2">Accomodations</p>
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
              <div className="flex">
                <Bookmark size={35}
                className={`transition-colors cursor-pointer ${
                  itinerary.title.includes('Japan')
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600"
                }`}
                />
                <Share2 size={35} className="cursor-pointer" />
              </div>
            </div>
            
            <div className="w-full flex justify-around my-3 justify-between">
              <p>2 Transports</p>
              <span>|</span>
              <p>2 Restaurants</p>
              <span>|</span>
              <p>4 Accomodations</p>
              <span className="hidden md:block">|</span>
              <div className="hidden md:flex">
                <Star fill />
                <Star fill />
                <Star fill />
                <Star fill />
                <Star fill />
              </div>
            </div>
          </div>

          <div className="bg-gray-100 flex flex-col gap-2 w-full rounded-xl p-4">
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-4">
                <Image
                  src={itinerary.creator.image}
                  alt={itinerary.creator.name}
                  width={50}
                  height={56}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium">Created by {itinerary.creator.name}</p>
                  <p className="text-sm text-gray-600">
                    {itinerary.creator.title} · {itinerary.creator.trips} trips created
                  </p>
                </div>
              </div>
              <button className="hover:bg-gray-200 rounded-lg px-8 text-sm transition-colors bg-[#000000] text-[#ffffff]">
                Follow
              </button>
            </div>
            <div>
              <p className={cn(
                "text-md text-gray-700",
                !showFullDetails && "line-clamp-2"
              )}>
                {itinerary.details}
              </p>
              {itinerary.details.length > 100 && (
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
              )}
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
              {itinerary.description}
            </div>
            <div className="bg-gray-800 w-full h-[20%] rounded-3xl p-4 text-white flex flex-col justify-end">
              View all photos
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="hidden flex justify-between items-center mb-8">
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
        <div className="hidden mb-6">
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Itinerary Schedule</h2>
              {activeDays.length > 0 ? (
                <div onClick={closeAllDays} className="flex cursor-pointer items-center gap-2">
                Close All
                <ChevronUp size={16} />
              </div>
              ) : (
                <div onClick={openAllDays} className="flex cursor-pointer items-center gap-2">
                  Open All
                  <ChevronDown size={16} />
                </div>
              )
              }
            </div>
            <div className="flex flex-col">
              {itinerary.schedule.map((day: any) => (
                <DaySection
                  key={day.day}
                  day={day}
                  isActive={activeDays.includes(day.day)}
                  onToggle={() => toggleDay(day.day)}
                  onClose={() => toggleDay(day.day)}
                />
              ))}
            </div>

            {/* Creator Notes */}
            <div className="mt-12 px-4 block lg:hidden">
                <h3 className="text-lg font-semibold mb-4">Creator Notes</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="preparation">
                    <AccordionTrigger>Trip Preparation</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        <li>Best time to visit: {itinerary.bestTimeToVisit || 'Spring and Fall'}</li>
                        <li>Recommended duration: {itinerary.duration}</li>
                        <li>Budget estimate: {itinerary.budgetEstimate || 'Mid-range'}</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tips">
                    <AccordionTrigger>Travel Tips</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {itinerary.travelTips?.map((tip: string, index: number) => (
                          <li key={index}>{tip}</li>
                        )) || (
                          <>
                            <li>Book accommodations in advance</li>
                            <li>Check local weather conditions</li>
                            <li>Research local customs and etiquette</li>
                          </>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="transportation">
                    <AccordionTrigger>Transportation Guide</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {itinerary.transportationTips?.map((tip: string, index: number) => (
                          <li key={index}>{tip}</li>
                        )) || (
                          <>
                            <li>Consider getting a rail pass</li>
                            <li>Download local transport apps</li>
                            <li>Book airport transfers in advance</li>
                          </>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="cultural">
                    <AccordionTrigger>Cultural Insights</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {itinerary.culturalNotes?.map((note: string, index: number) => (
                          <li key={index}>{note}</li>
                        )) || (
                          <>
                            <li>Learn basic local phrases</li>
                            <li>Respect local customs</li>
                            <li>Try local specialties</li>
                          </>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
          </div>

          {/* Right Column - Details & Notes */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <h2 className="text-2xl font-semibold mb-6">Trip Details</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={itinerary.creator.avatar}
                    alt={itinerary.creator.name}
                    fill
                    className="object-cover"
                  />
                </div>
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

              {/* Creator Notes */}
              <div className="mt-8 hidden lg:block">
                <h3 className="text-lg font-semibold mb-4">Creator Notes</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="preparation">
                    <AccordionTrigger>Trip Preparation</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        <li>Best time to visit: {itinerary.bestTimeToVisit || 'Spring and Fall'}</li>
                        <li>Recommended duration: {itinerary.duration}</li>
                        <li>Budget estimate: {itinerary.budgetEstimate || 'Mid-range'}</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tips">
                    <AccordionTrigger>Travel Tips</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {itinerary.travelTips?.map((tip: string, index: number) => (
                          <li key={index}>{tip}</li>
                        )) || (
                          <>
                            <li>Book accommodations in advance</li>
                            <li>Check local weather conditions</li>
                            <li>Research local customs and etiquette</li>
                          </>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="transportation">
                    <AccordionTrigger>Transportation Guide</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {itinerary.transportationTips?.map((tip: string, index: number) => (
                          <li key={index}>{tip}</li>
                        )) || (
                          <>
                            <li>Consider getting a rail pass</li>
                            <li>Download local transport apps</li>
                            <li>Book airport transfers in advance</li>
                          </>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="cultural">
                    <AccordionTrigger>Cultural Insights</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {itinerary.culturalNotes?.map((note: string, index: number) => (
                          <li key={index}>{note}</li>
                        )) || (
                          <>
                            <li>Learn basic local phrases</li>
                            <li>Respect local customs</li>
                            <li>Try local specialties</li>
                          </>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Itineraries */}
        <div className="mt-24">
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
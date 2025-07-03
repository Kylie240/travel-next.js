"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Clock, Hotel, Car, Share2, Heart, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/input"
import { ItinerarySection } from "@/components/ui/itinerary-section"

// Dummy data for a single itinerary
const itinerary = {
  id: 1,
  title: "Japanese Cultural Journey",
  description:
    "Experience the best of Japan's ancient traditions and modern wonders on this comprehensive 14-day journey through the Land of the Rising Sun.",
  image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1470&auto=format&fit=crop",
  duration: "14 days",
  destinations: ["Tokyo", "Kyoto", "Osaka", "Hakone", "Nara"],
  price: "$3,499",
  rating: 4.8,
  reviews: 24,
  categories: ["Culture", "Food & Dining", "History", "Urban Exploration", "Nature", "Photography"],
  details: "This carefully curated journey takes you through the heart of Japan, blending ancient traditions with modern experiences. You'll explore historic temples, participate in traditional tea ceremonies, and discover the vibrant food scene. The itinerary includes stays in both luxury hotels and authentic ryokans, offering a perfect balance of comfort and cultural immersion. Suitable for first-time visitors to Japan who want to experience the country's highlights while enjoying premium accommodations and expert-guided tours.",
  creator: {
    name: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop",
    trips: 12,
    notes: [
      {
        title: "Best Time to Visit",
        content: "Spring (March to May) and Fall (September to November) are ideal for comfortable weather and beautiful scenery. Cherry blossoms bloom in late March to early April, while autumn colors peak in November."
      },
      {
        title: "Transportation Tips",
        content: "Get a JR Pass if you plan to use the bullet train between cities. For local transport, get a prepaid IC card (Pasmo/Suica) for convenient travel on metros and buses."
      },
      {
        title: "Cultural Etiquette",
        content: "Remove shoes before entering homes and some restaurants. Bow when greeting people. Avoid eating while walking or speaking loudly on public transport. Tipping is not customary in Japan."
      },
      {
        title: "Useful Apps",
        content: "Download Google Maps, Google Translate, and Japan Travel by NAVITIME for offline navigation. Many restaurants use mobile payment apps like PayPay."
      }
    ]
  },
  schedule: [
    {
      day: 1,
      title: "Arrival in Tokyo",
      description: "Land at Narita International Airport and transfer to your hotel in Tokyo",
      activities: [
        {
          time: "15:00",
          title: "Hotel Check-in",
          type: "accommodation",
          details: "Check in at the Tokyu Stay Hotel in Shinjuku",
          location: "Shinjuku, Tokyo",
          image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1374&auto=format&fit=crop"
        },
        {
          time: "18:00",
          title: "Welcome Dinner",
          type: "food",
          details: "Traditional Japanese dinner at a local izakaya",
          location: "Shinjuku, Tokyo",
          image: "https://images.unsplash.com/photo-1554502078-ef0fc409efce?q=80&w=1384&auto=format&fit=crop"
        },
      ],
      accommodation: {
        name: "Tokyu Stay Hotel",
        type: "Hotel",
        location: "Shinjuku, Tokyo",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1470&auto=format&fit=crop"
      },
      transport: {
        type: "Airport Transfer",
        details: "Private shuttle from Narita Airport to hotel",
      },
    },
    {
      day: 2,
      title: "Tokyo Exploration",
      description: "Discover the highlights of Tokyo's most famous districts",
      activities: [
        {
          time: "09:00",
          title: "Tsukiji Outer Market",
          type: "sightseeing",
          details: "Explore the famous fish market and try fresh sushi",
          location: "Tsukiji, Tokyo",
          image: "https://images.unsplash.com/photo-1595456982104-14cc660c4d22?q=80&w=1470&auto=format&fit=crop"
        },
        {
          time: "13:00",
          title: "Senso-ji Temple",
          type: "culture",
          details: "Visit Tokyo's oldest Buddhist temple",
          location: "Asakusa, Tokyo",
          image: "https://images.unsplash.com/photo-1583084647979-b53fbbc15e79?q=80&w=1374&auto=format&fit=crop"
        },
        {
          time: "16:00",
          title: "Harajuku & Meiji Shrine",
          type: "sightseeing",
          details: "Experience modern and traditional Japan side by side",
          location: "Harajuku, Tokyo",
          image: "https://images.unsplash.com/photo-1542931287-023b922fa89b?q=80&w=1374&auto=format&fit=crop"
        },
      ],
      accommodation: {
        name: "Tokyu Stay Hotel",
        type: "Hotel",
        location: "Shinjuku, Tokyo",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1470&auto=format&fit=crop"
      },
      transport: {
        type: "Public Transport",
        details: "Tokyo Metro (subway) day pass",
      },
    },
    // Add more days...
  ],
}

// Similar itineraries data
const similarItineraries = [
  {
    id: "2",
    title: "South Korean Adventure",
    destination: "Seoul",
    countries: ["South Korea"],
    imageUrl: "https://images.unsplash.com/photo-1538485399081-7c8272e0fe66?q=80&w=1374&auto=format&fit=crop",
    duration: 10,
    price: 2899,
  },
  {
    id: "3",
    title: "Taiwan Food & Culture",
    destination: "Taipei",
    countries: ["Taiwan"],
    imageUrl: "https://images.unsplash.com/photo-1470004914212-05527e49370b?q=80&w=1374&auto=format&fit=crop",
    duration: 7,
    price: 1999,
  },
  {
    id: "4",
    title: "Vietnam Heritage Tour",
    destination: "Hanoi",
    countries: ["Vietnam"],
    imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1470&auto=format&fit=crop",
    duration: 12,
    price: 2499,
  },
  {
    id: "5",
    title: "Thailand Island Hopping",
    destination: "Bangkok",
    countries: ["Thailand"],
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1439&auto=format&fit=crop",
    duration: 14,
    price: 2699,
  }
]

export default function ItineraryPage({ params }: { params: { id: string } }) {
  const [currentDay, setCurrentDay] = useState(1)
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <Image
          src={itinerary.image}
          alt={itinerary.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{itinerary.title}</h1>
              <p className="text-lg md:text-xl mb-6">{itinerary.description}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {itinerary.duration}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {itinerary.destinations[0]}
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
            {itinerary.categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1 bg-travel-50 text-travel-900 rounded-full text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Trip Details */}
        <div className="mb-8">
          <p className="text-gray-600 leading-relaxed">
            {itinerary.details}
          </p>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <Image
            src={itinerary.creator.image}
            alt={itinerary.creator.name}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold">{itinerary.creator.name}</h3>
            <p className="text-sm text-gray-600">
              {itinerary.creator.trips} trips created
            </p>
          </div>
        </div>

        {/* Itinerary Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Day Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Daily Schedule</h3>
              <div className="space-y-2">
                {itinerary.schedule.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setCurrentDay(day.day)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      currentDay === day.day
                        ? "bg-travel-900 text-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium">Day {day.day}</div>
                    <div className={`text-sm truncate ${
                      currentDay === day.day ? "text-white/90" : "text-gray-600"
                    }`}>
                      {day.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Day Details */}
          <div className="lg:col-span-2">
            {itinerary.schedule
              .filter((day) => day.day === currentDay)
              .map((day) => (
                <div key={day.day}>
                  <h2 className="text-2xl font-bold mb-4">
                    Day {day.day}: {day.title}
                  </h2>
                  <p className="text-gray-600 mb-6">{day.description}</p>

                  {/* Activities Timeline */}
                  <div className="space-y-6">
                    {day.activities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="w-20 text-gray-500">{activity.time}</div>
                        <div className="flex-1">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-gray-600">
                            {activity.details}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {activity.location}
                          </div>
                          {activity.image && (
                            <div className="mt-2 relative h-48 rounded-lg overflow-hidden">
                              <Image
                                src={activity.image}
                                alt={activity.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Accommodation */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Hotel className="h-5 w-5 mr-2" />
                      Accommodation
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex gap-4">
                        {day.accommodation.image && (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                            <Image
                              src={day.accommodation.image}
                              alt={day.accommodation.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{day.accommodation.name}</div>
                          <div className="text-sm text-gray-600">{day.accommodation.type}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {day.accommodation.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transportation */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Car className="h-5 w-5 mr-2" />
                      Transportation
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium">{day.transport.type}</div>
                      <div className="text-sm text-gray-600">{day.transport.details}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Trip Notes */}
        <div className="mb-8">
          {/* <div className="flex items-center gap-2 mb-4">
            <StickyNote className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Useful Notes from the Creator</h3>
          </div> */}
          <Accordion type="single" collapsible className="w-full">
            {itinerary.creator.notes.map((note, index) => (
              <AccordionItem key={index} value={`note-${index}`}>
                <AccordionTrigger className="text-left">
                  {note.title}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">{note.content}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Similar Itineraries */}
        <div className="mt-16 -mx-4 sm:-mx-6 lg:-mx-8">
          <ItinerarySection
            title="You May Also Like"
            description="Discover more amazing trips across Asia that match your interests"
            itineraries={similarItineraries}
          />
        </div>
      </div>
    </div>
  )
} 
"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Clock, Hotel, Car, Share2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

// Dummy data for a single itinerary
const itinerary = {
  id: 1,
  title: "Japanese Cultural Journey",
  description:
    "Experience the best of Japan's ancient traditions and modern wonders on this comprehensive 14-day journey through the Land of the Rising Sun.",
  image: "/images/japan.jpg",
  duration: "14 days",
  destinations: ["Tokyo", "Kyoto", "Osaka", "Hakone", "Nara"],
  price: "$3,499",
  rating: 4.8,
  reviews: 24,
  creator: {
    name: "Sarah Chen",
    image: "/images/avatar.jpg",
    trips: 12,
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
        },
        {
          time: "18:00",
          title: "Welcome Dinner",
          type: "food",
          details: "Traditional Japanese dinner at a local izakaya",
          location: "Shinjuku, Tokyo",
        },
      ],
      accommodation: {
        name: "Tokyu Stay Hotel",
        type: "Hotel",
        location: "Shinjuku, Tokyo",
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
        },
        {
          time: "13:00",
          title: "Senso-ji Temple",
          type: "culture",
          details: "Visit Tokyo's oldest Buddhist temple",
          location: "Asakusa, Tokyo",
        },
        {
          time: "16:00",
          title: "Harajuku & Meiji Shrine",
          type: "sightseeing",
          details: "Experience modern and traditional Japan side by side",
          location: "Harajuku, Tokyo",
        },
      ],
      accommodation: {
        name: "Tokyu Stay Hotel",
        type: "Hotel",
        location: "Shinjuku, Tokyo",
      },
      transport: {
        type: "Public Transport",
        details: "Tokyo Metro (subway) day pass",
      },
    },
    // Add more days...
  ],
}

export default function ItineraryPage({ params }: { params: { id: string } }) {
  const [currentDay, setCurrentDay] = useState(1)
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div className="min-h-screen bg-white pt-16">
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
                        ? "bg-travel-600 text-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium">Day {day.day}</div>
                    <div className="text-sm truncate">
                      {currentDay === day.day ? "text-white/90" : "text-gray-600"}
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
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Accommodation */}
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Hotel className="h-5 w-5 text-travel-600" />
                      <h3 className="font-semibold">Accommodation</h3>
                    </div>
                    <div className="text-gray-600">
                      <div>{day.accommodation.name}</div>
                      <div className="text-sm">{day.accommodation.location}</div>
                    </div>
                  </div>

                  {/* Transport */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Car className="h-5 w-5 text-travel-600" />
                      <h3 className="font-semibold">Transport</h3>
                    </div>
                    <div className="text-gray-600">
                      <div>{day.transport.type}</div>
                      <div className="text-sm">{day.transport.details}</div>
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
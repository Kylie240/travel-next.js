"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Clock, Hotel, Car, Share2, Heart, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/input"
import { DaySection } from "@/components/ui/day-section"

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

interface Props {
  params: {
    id: string;
  };
}

export default function ItineraryClient({ params }: Props) {
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Schedule */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Itinerary Schedule</h2>
            <div className="space-y-6">
              {itinerary.schedule.map((day) => (
                <DaySection
                  key={day.day}
                  day={day}
                  isActive={currentDay === day.day}
                  onClick={() => setCurrentDay(day.day)}
                />
              ))}
              

              {/* Creator Notes */}
              <h3 className="text-xl font-semibold mb-4">Creator Notes</h3>
              <Accordion type="single" collapsible className="w-full">
                {itinerary.creator.notes.map((note, index) => (
                  <AccordionItem key={index} value={`note-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <StickyNote className="h-4 w-4" />
                        {note.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600">{note.content}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Right Column - Details & Notes */}
          <div>
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
                    {item.destination}, {item.countries[0]}
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
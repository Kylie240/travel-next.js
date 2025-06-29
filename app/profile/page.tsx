"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Settings, Edit } from "lucide-react"

// Dummy data for user profile
const user = {
  name: "Sarah Chen",
  image: "/images/avatar.jpg",
  location: "San Francisco, CA",
  joined: "January 2024",
  stats: {
    trips: 12,
    followers: 245,
    following: 180,
  },
}

// Dummy data for itineraries
const myItineraries = [
  {
    id: 1,
    title: "Japanese Cultural Journey",
    description: "Experience the best of Japan's ancient traditions and modern wonders",
    image: "/images/japan.jpg",
    duration: "14 days",
    destinations: ["Tokyo", "Kyoto", "Osaka"],
    price: "$3,499",
    status: "published",
  },
  {
    id: 2,
    title: "Italian Food & Wine Tour",
    description: "Savor the flavors of Italy's finest culinary regions",
    image: "/images/italy.jpg",
    duration: "10 days",
    destinations: ["Rome", "Florence", "Venice"],
    price: "$2,899",
    status: "draft",
  },
]

const favoriteItineraries = [
  {
    id: 3,
    title: "Costa Rica Adventure",
    description: "Explore rainforests, volcanoes, and pristine beaches",
    image: "/images/costa-rica.jpg",
    duration: "7 days",
    destinations: ["San José", "Arenal", "Manuel Antonio"],
    price: "$1,999",
    creator: "Alex Thompson",
  },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative w-32 h-32">
              <Image
                src={user.image}
                alt={user.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
              <p className="text-gray-600 mb-4">
                {user.location} · Joined {user.joined}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-4">
                <div>
                  <div className="font-semibold">{user.stats.trips}</div>
                  <div className="text-sm text-gray-600">Trips</div>
                </div>
                <div>
                  <div className="font-semibold">{user.stats.followers}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div>
                  <div className="font-semibold">{user.stats.following}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Button>Edit Profile</Button>
                <Button variant="outline">Share Profile</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-itineraries" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="my-itineraries">My Itineraries</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="my-itineraries">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myItineraries.map((itinerary) => (
                <motion.div
                  key={itinerary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="relative h-48">
                    <Image
                      src={itinerary.image}
                      alt={itinerary.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          itinerary.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {itinerary.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{itinerary.title}</h3>
                    <p className="text-gray-600 mb-4">{itinerary.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {itinerary.duration}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {itinerary.destinations[0]}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-travel-600">
                        {itinerary.price}
                      </span>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteItineraries.map((itinerary) => (
                <motion.div
                  key={itinerary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="relative h-48">
                    <Image
                      src={itinerary.image}
                      alt={itinerary.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{itinerary.title}</h3>
                    <p className="text-gray-600 mb-4">{itinerary.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {itinerary.duration}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {itinerary.destinations[0]}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-travel-600">
                        {itinerary.price}
                      </span>
                      <div className="text-sm text-gray-600">
                        by {itinerary.creator}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-600"
                    defaultValue="sarah.chen@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <Button variant="outline">Change Password</Button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notification Preferences
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Email notifications for new followers
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Email notifications for comments
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Email notifications for likes
                    </label>
                  </div>
                </div>
                <div className="pt-4">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
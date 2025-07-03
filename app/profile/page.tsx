"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Globe, Camera, Users } from "lucide-react"
import { ProfileHeader } from "@/components/profile/profile-header"
import { SocialLinks } from "@/components/profile/social-links"
import { Achievements } from "@/components/profile/achievements"
import { TravelPreferences } from "@/components/profile/travel-preferences"
import { auth } from "@/lib/firebase"
import { UserData } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(auth.currentUser)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/")
        return
      }
      setUser(user)
    })

    return () => unsubscribe()
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const userData: UserData = {
    name: user.displayName || user.email?.split("@")[0] || "User",
    username: "testinUsers",
    title: "Budget Traveller",
    image: user.photoURL || "/images/avatar.jpg",
    location: "Location not set",
    joined: new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    bio: "My name is test and I want to be your virtual travel planner. I have over six years of experience travelling.",
    website: "",
    email: user.email,
    social: {
      facebook: "",
      instagram: "",
      twitter: ""
    },
    achievements: [
      {
        title: "Explorer",
        description: "Just getting started",
        icon: Globe
      },
      {
        title: "Photographer",
        description: "Share your first photo",
        icon: Camera
      },
      {
        title: "Influencer",
        description: "Get your first follower",
        icon: Users
      }
    ],
    stats: {
      trips: 0,
      followers: 0,
      following: 0,
      likes: 0
    },
    travelPreferences: {
      interests: [],
      travelStyle: [],
      languages: [],
      visitedCountries: []
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 px-6 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://th.bing.com/th/id/R.666511722b8a59564f5c16637d138956?rik=VQ39yQHssfwsNA&pid=ImgRaw&r=0https://th.bing.com/th/id/R.666511722b8a59564f5c16637d138956?rik=VQ39yQHssfwsNA&pid=ImgRaw&r=0')`,
          }}
        >
        </div>
      </section>

      <div className="container flex gap-8 mx-auto px-4 py-8">
        <ProfileHeader user={userData} />
        <div>
          <SocialLinks 
            website={userData.website}
            email={userData.email}
            social={userData.social}
          />
          <Achievements achievements={userData.achievements} />
          <TravelPreferences preferences={userData.travelPreferences} />

          <Tabs defaultValue="my-itineraries" className="space-y-6">
            <TabsList className="bg-white">
              <TabsTrigger value="my-itineraries">My Itineraries</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="my-itineraries">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-600">You have not created any itineraries yet.</p>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push("/create")}
                  >
                    Create Your First Itinerary
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-600">No favorite itineraries yet.</p>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push("/explore")}
                  >
                    Explore Itineraries
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-900"
                      defaultValue={userData.username}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-900"
                      defaultValue={userData.title}
                      placeholder="Enter your title (e.g. Travel Enthusiast)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="url"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-900"
                      defaultValue={userData.website}
                      placeholder="https://your-website.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-900"
                      defaultValue={userData.email}
                      disabled
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
    </div>
  )
}
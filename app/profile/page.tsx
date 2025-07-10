"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Globe, Camera, Users, ChevronRight, Heart, MapPin } from "lucide-react"
import { ProfileHeader } from "@/components/profile/profile-header"
import { auth } from "@/lib/firebase"
import { UserData } from "@/lib/types"
import { Input } from "@/components/ui/input"
import Image from "next/image"

const dummyItineraries = [
  {
    id: 1,
    title: "Weekend in Paris",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2070&auto=format&fit=crop",
    likes: 24,
    days: 3
  },
  {
    id: 2,
    title: "Tokyo Adventure",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2067&auto=format&fit=crop",
    likes: 18,
    days: 7
  },
  {
    id: 3,
    title: "New York City Guide",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop",
    likes: 32,
    days: 4
  }
]

const dummyFavorites = [
  {
    id: 4,
    title: "Barcelona Food Tour",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=2070&auto=format&fit=crop",
    author: "FoodieExplorer",
    likes: 45,
    days: 2
  },
  {
    id: 5,
    title: "Swiss Alps Hiking",
    image: "https://images.unsplash.com/photo-1531210483974-4f8c1f33fd35?q=80&w=2070&auto=format&fit=crop",
    author: "AdventureSeeker",
    likes: 56,
    days: 5
  }
]

const followingUsers = [
  {
    id: 1,
    name: "Sarah Thompson",
    username: "wanderlust_sarah",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop",
    location: "London, UK"
  },
  {
    id: 2,
    name: "Alex Rivera",
    username: "travel_alex",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop",
    location: "Barcelona, Spain"
  },
  {
    id: 3,
    name: "Emma Chen",
    username: "emma_explores",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2787&auto=format&fit=crop",
    location: "Singapore"
  }
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(auth.currentUser)
  const [activeSection, setActiveSection] = useState("Dashboard")

  const handleEditProfile = () => {
    setActiveSection("Edit Profile")
  }

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

  const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date()

  const userData: UserData = {
    name: user.displayName || user.email?.split("@")[0] || "User",
    username: "testinUsers",
    title: "Budget Traveller",
    image: "https://media.licdn.com/dms/image/D4E03AQH1o4Avl01RCA/profile-displayphoto-shrink_800_800/0/1698873322772?e=2147483647&v=beta&t=bU_iaAUxnhokAcSmCwTi-LFF1MTZ12S4OruFTeeneoQ",
    // image: user.photoURL || "/images/avatar.jpg",
    location: "Location not set",
    joined: creationTime.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    bio: "My name is test and I want to be your virtual travel planner. I have over six years of experience travelling.",
    website: "",
    email: user.email || "",
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

  const settingsSections = [
    {
      title: "Dashboard",
      description: "View your itineraries and connections",
      content: (
        <div className="space-y-8">
          {/* Your Itineraries Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Your Itineraries</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dummyItineraries.map((itinerary) => (
                <div 
                  key={itinerary.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/itinerary/${itinerary.id}`)}
                >
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={itinerary.image}
                      alt={itinerary.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 p-4 text-white">
                      <h4 className="font-semibold">{itinerary.title}</h4>
                      <div className="flex items-center gap-3 text-sm mt-1">
                        <span>{itinerary.days} days</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" /> {itinerary.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Favorited Itineraries Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Favorited Itineraries</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dummyFavorites.map((itinerary) => (
                <div 
                  key={itinerary.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer"
                >
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={itinerary.image}
                      alt={itinerary.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 p-4 text-white">
                      <h4 className="font-semibold">{itinerary.title}</h4>
                      <p className="text-sm text-gray-200">by @{itinerary.author}</p>
                      <div className="flex items-center gap-3 text-sm mt-1">
                        <span>{itinerary.days} days</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" /> {itinerary.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Following Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Following</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {followingUsers.map((user) => (
                <div 
                  key={user.id}
                  className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/profile/${user.username}`)}
                >
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={user.image}
                      alt={user.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {user.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Edit Profile",
      description: "Edit your public profile information",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input
              type="text"
              defaultValue={userData.username}
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              type="text"
              defaultValue={userData.title}
              placeholder="Enter your title (e.g. Travel Enthusiast)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-900 min-h-[100px]"
              defaultValue={userData.bio}
              placeholder="Tell us about yourself"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Input
              type="text"
              defaultValue={userData.location}
              placeholder="Where are you based?"
            />
          </div>
          <Button>Save Changes</Button>
        </div>
      )
    },
    {
      title: "Personal information",
      description: "Manage your personal details",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input
              type="text"
              defaultValue={userData.name}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              defaultValue={userData.email || ""}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <Input
              type="tel"
              placeholder="Enter your phone number"
            />
          </div>
          <Button>Save Changes</Button>
        </div>
      )
    },
    {
      title: "Login & Security",
      description: "Update your password and secure your account",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <Input
              type="password"
              placeholder="Enter your current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <Input
              type="password"
              placeholder="Enter your new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <Input
              type="password"
              placeholder="Confirm your new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Deactivate Account</label>
            <p className="text-sm text-gray-600">
            Deactivating your account means that your account will no longer be available. 
            You will not be able to sign in and your profile will not be accessible. 
            Any reviews, photos, and tips that you have contributed may continue to be displayed on the site.
            </p>
            <a href="">Deactivate</a>
          </div>
          <Button>Update Password</Button>
        </div>
      )
    },
    {
      title: "Communication preferences",
      description: "Choose how you want to be notified",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-4">Email Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                New followers
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Comments on your itineraries
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Likes on your itineraries
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Trip recommendations
              </label>
            </div>
          </div>
          <Button>Save Preferences</Button>
        </div>
      )
    },
    {
      title: "Travel preferences",
      description: "Set your travel style and interests",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Travel Style</label>
            <div className="space-y-2">
              {["Budget", "Mid-range", "Luxury", "Backpacker", "Digital Nomad"].map((style) => (
                <label key={style} className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  {style}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Interests</label>
            <div className="space-y-2">
              {["Culture", "Nature", "Adventure", "Food", "Photography", "History"].map((interest) => (
                <label key={interest} className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  {interest}
                </label>
              ))}
            </div>
          </div>
          <Button>Save Preferences</Button>
        </div>
      )
    },
    {
      title: "Site preferences",
      description: "Customize your experience",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-900">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-900">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-900">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <Button>Save Preferences</Button>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Background Image */}
      {/* <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 px-6 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://th.bing.com/th/id/R.666511722b8a59564f5c16637d138956?rik=VQ39yQHssfwsNA&pid=ImgRaw&r=0')`,
          }}
        >
        </div>
      </section> */}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Profile Header + Settings Navigation */}
          <div className="space-y-6">
            {/* Profile Header */}
            <ProfileHeader 
              user={userData} 
              onEditProfile={handleEditProfile}
            />
            
            {/* Settings Navigation */}
            <div className="">
              {settingsSections.map((section) => (
                <button
                  key={section.title}
                  onClick={() => setActiveSection(section.title)}
                  className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left ${
                    activeSection === section.title ? "bg-white" : ""
                  }`}
                >
                  <div>
                    <h3 className="font-medium">{section.title}</h3>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Settings Content */}
          <div className="md:col-span-2">
            {/* Background Image Section */}
            {/* <div className="relative h-64 mb-6 rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop')`,
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30" />
              <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back {userData.name}</h1>
                <p className="text-white text-opacity-90">{userData.title}</p>
              </div>
            </div> */}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6">{activeSection}</h3>
              {settingsSections.find(section => section.title === activeSection)?.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
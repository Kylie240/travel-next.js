import Image from "next/image"
import { Camera, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfileHeaderProps {
  user: {
    name: string
    username: string
    title: string
    website: string
    image: string
    location: string
    joined: string
    bio: string
    stats: {
      trips: number
      followers: number
      following: number
      likes: number
    }
  }
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col items-center md:items-start gap-6">
        <div className="relative w-32 h-32 group">
          <Image
            src={user.image}
            alt={user.name}
            fill
            className="rounded-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600 mb-4">@{user.username ?? "@no_username"}</p>
          {/* <p className="text-gray-600 mb-4">
            <MapPin className="inline-block h-4 w-4 mr-1" />
            {user.location} · Joined {user.joined}
          </p> */}
          <p className="font-semibold mb-4 max-w-2xl">{user.title ?? "Solo Travel Enthusiast"}</p>
          <a href="user.website">Site name</a>
          <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
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
            <div>
              <div className="font-semibold">{user.stats.likes}</div>
              <div className="text-sm text-gray-600">Likes</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <Button>Edit Profile</Button>
            <Button variant="outline">Share Profile</Button>
          </div>
        </div>
      </div>
    </div>
  )
} 
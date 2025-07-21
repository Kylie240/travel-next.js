"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Camera, MapPin, Minus, Plus, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FollowersDialog } from "@/components/ui/followers-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { UserData } from "@/lib/types"
import { auth, db } from "@/firebase/client"

interface ProfileHeaderProps {
  onEditProfile: () => void
  disableEdit?: boolean
  onFollowToggle?: (userId: string) => void
}

export function ProfileHeader({onEditProfile, disableEdit = false, onFollowToggle }: ProfileHeaderProps) {
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    if (auth.currentUser) {
      // db.collection("users").doc(auth.currentUser.uid).get().then((doc) => {
      //   setUser(doc.data() as UserData)
      // })
      setUser({
        ...auth.currentUser,
        bio: "Hello, I'm a traveler and I love to explore new places.",
        title: "Traveler",
        location: "New York, NY",
        travelPreferences: {
          interests: ["hiking", "photography", "food"],
          travelStyle: ["adventure", "relaxing", "luxury"],
          languages: ["English", "Spanish", "French"],
          visitedCountries: ["United States", "Mexico", "France"]
        },
        social: {
          twitter: "https://twitter.com/traveler",
          instagram: "https://instagram.com/traveler",
          facebook: "https://facebook.com/traveler"
        },
        stats: {
          trips: 10,
          followers: 100,
          following: 100,
          likes: 100
        }
      })
    }
    console.log(user?.displayName)
  }, [auth.currentUser])

  // Placeholder data - replace with actual data from your backend
  const mockUsers = [
    {
      id: "1",
      name: "John Doe",
      username: "johndoe",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      isFollowing: true,
    },
    {
      id: "2",
      name: "Jane Smith",
      username: "janesmith",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      isFollowing: false,
    },
  ]

  return (
    <div className={`bg-white ${ !disableEdit ? 'rounded-2xl md:shadow-sm mb-8' : ''} p-6`}>
      {!disableEdit && 
        <div className="flex flex-col items-center gap-6">
          <div className="absolute top-6 right-4 block md:hidden">
            <Button variant="outline" onClick={() => {navigator.clipboard.writeText(window.location.href); toast.success('Copied to clipboard')}}><Share /></Button>
          </div>
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-32 lg:h-32">
            <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-32 lg:h-32 relative rounded-full overflow-hidden">
              <Image
                src={user?.photoURL || ""}  
                alt={user?.displayName || ""}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 128px"
              />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="h-6 w-6 text-white" />
            </div>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left px-8">
            <div className="text-center flex flex-col items-center">
              <h1 className="text-2xl font-bold">{user?.displayName}</h1>
              <p className="text-gray-600 mb-2">@{user?.email}</p>
            </div>
            <p className="font-semibold mb-4 max-w-2xl">{user?.title}</p>
            <p className="text-gray-700 mb-4 max-w-2xl">{user?.bio}</p>
            <div className="grid grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-2 xl:gap-6 mb-4">
              <div className="cursor-pointer" onClick={() => router.push("/my-itineraries")}>
                <div className="font-semibold">{user?.stats.trips}</div>
                <div className="text-sm text-gray-600">Trips</div>
              </div>
              <div className="cursor-pointer" onClick={() => setShowFollowers(true)}>
                <div className="font-semibold">{user?.stats.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="cursor-pointer" onClick={() => setShowFollowing(true)}>
                <div className="font-semibold">{user?.stats.following}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
              <div className="cursor-pointer" onClick={() => router.push("/favorites")}>
                <div className="font-semibold">{user?.stats.likes}</div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
            </div>
            <div className="hidden sm:flex flex-wrap justify-center mt-8 md:justify-start gap-4">
              <Button onClick={onEditProfile}>Edit Profile</Button>
              <Button variant="outline" onClick={() => {navigator.clipboard.writeText(window.location.href); toast.success('Copied to clipboard')}}>Share Profile</Button>
            </div>
          </div>
        </div>
      } {disableEdit &&
        <div className="flex flex-col items-center gap-6">
          <div className="flex relative">
            <div className="relative w-32 h-32">
              <div className="w-24 h-24 relative rounded-full">
                <Image
                  src={user.image}
                  alt={user.name}
                  fill
                  className="object-cover rounded-full cursor-pointer"
                  sizes="(max-width: 128px) 100vw, 128px"
                />
                <div className="absolute block md:hidden -top-1 -right-3">
                  {user.isFollowing ? (
                    <div onClick={() => onFollowToggle?.(user.id)}><Minus className="h-[30px] w-[35px] px-[3px] py-[2px] cursor-pointer rounded-full border border-[3px] border-black bg-white hover:bg-gray-500 text-black" /></div>
                  ) : (
                    <div onClick={() => onFollowToggle?.(user.id)}><Plus className="h-[30px] w-[35px] px-[3px] py-[2px] cursor-pointer rounded-full border border-[3px] border-white bg-black hover:bg-gray-500 text-white" /></div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 text-left px-8">
              <div className="flex gap-4">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <div className="hidden md:block">
                  {user.isFollowing ? (
                    <Button variant="outline" style={{height: '30px', width : '90px'}} onClick={() => onFollowToggle?.(user.id)}>Following</Button>
                  ) : (
                    <Button style={{height: '30px', width : '90px', backgroundColor: 'black', color: 'white'}} onClick={() => onFollowToggle?.(user.id)}>Follow</Button>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-2">@{user.username}</p>
              <p className="text-gray-600 mb-4">
                <MapPin className="inline-block h-4 w-4 mr-1" />
                {user.location} · Joined {user.joined}
              </p>
            </div>
          </div>
        </div>
      }

      <FollowersDialog
        isOpen={showFollowers}
        onOpenChange={setShowFollowers}
        users={mockUsers}
        title="Followers"
        onFollowToggle={onFollowToggle}
      />

      <FollowersDialog
        isOpen={showFollowing}
        onOpenChange={setShowFollowing}
        users={mockUsers}
        title="Following"
        onFollowToggle={onFollowToggle}
      />
    </div>
  )
} 
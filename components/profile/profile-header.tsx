"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Camera, MapPin, Minus, Plus, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FollowersDialog } from "@/components/ui/followers-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { UserData } from "@/lib/types"
import { UserStats } from "@/types/userStats"
import { getFollowersById } from "@/lib/actions/user.actions"
import { getFollowingById } from "@/lib/actions/user.actions"
import { Followers } from "@/types/followers"

interface ProfileHeaderProps {
  onEditProfile: () => void
  disableEdit?: boolean
  onFollowToggle?: (userId: string) => void
  user: UserData | null
  userStats: UserStats
}

export function ProfileHeader({onEditProfile, disableEdit = false, onFollowToggle, user, userStats }: ProfileHeaderProps) {
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [followers, setFollowers] = useState<Followers[]>([])
  const [following, setFollowing] = useState<Followers[]>([])
  const router = useRouter()

  const handleFollowers = async ( open: boolean ) => {
    const followers = await getFollowersById(user?.id)
    setFollowers(followers)
    setShowFollowers(open)
  }

  const handleFollowing = async ( open: boolean ) => {
    const following = await getFollowingById(user?.id)
    setFollowing(following)
    setShowFollowing(open)
  }

  return (
    <div className={`bg-white ${ !disableEdit ? 'rounded-2xl md:shadow-sm mb-8' : ''} p-6`}>
      {!disableEdit && 
        <div className="flex flex-col items-center gap-6">
          <div className="absolute top-6 right-4 block md:hidden">
            <Button variant="outline" onClick={() => {navigator.clipboard.writeText(window.location.href); toast.success('Copied to clipboard')}}><Share /></Button>
          </div>
          <div className="relative w-32 h-32">
            <div className="w-32 h-32 relative rounded-full overflow-hidden">
              <Image
                src={user?.avatar || ""}  
                alt={user?.name || ""}
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
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-gray-600 mb-2">@{user?.username}</p>
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-2 xl:gap-6 mb-4">
              <div className="cursor-pointer flex flex-col items-center hover:text-gray-500" onClick={() => router.push("/my-itineraries")}>
                <div className="font-semibold">{userStats[0].totalitineraries}</div>
                <div className="text-sm">Trips</div>
              </div>
              <div className="cursor-pointer flex flex-col items-center hover:text-gray-500" onClick={() => handleFollowers(true)}>
                <div className="font-semibold">{userStats[0].followerscount}</div>
                <div className="text-sm">Followers</div>
              </div>
              <div className="cursor-pointer flex flex-col items-center hover:text-gray-500" onClick={() => handleFollowing(true)}>
                <div className="font-semibold">{userStats[0].followingcount}</div>
                <div className="text-sm">Following</div>
              </div>
              <div className="cursor-pointer flex flex-col items-center hover:text-gray-500" onClick={() => router.push("/favorites")}>
                <div className="font-semibold">{userStats[0].totallikes}</div>
                <div className="text-sm">Likes</div>
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
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover rounded-full cursor-pointer"
                  sizes="(max-width: 128px) 100vw, 128px"
                />
                {/* <div className="absolute block md:hidden -top-1 -right-3">
                  {user.isFollowing ? (
                    <div onClick={() => onFollowToggle?.(user.id)}><Minus className="h-[30px] w-[35px] px-[3px] py-[2px] cursor-pointer rounded-full border border-[3px] border-black bg-white hover:bg-gray-500 text-black" /></div>
                  ) : (
                    <div onClick={() => onFollowToggle?.(user.id)}><Plus className="h-[30px] w-[35px] px-[3px] py-[2px] cursor-pointer rounded-full border border-[3px] border-white bg-black hover:bg-gray-500 text-white" /></div>
                  )}
                </div> */}
              </div>
            </div>
            <div className="flex-1 text-left px-8">
              <div className="flex gap-4">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {/* <div className="hidden md:block">
                  {user.isFollowing ? (
                    <Button variant="outline" style={{height: '30px', width : '90px'}} onClick={() => onFollowToggle?.(user.id)}>Following</Button>
                  ) : (
                    <Button style={{height: '30px', width : '90px', backgroundColor: 'black', color: 'white'}} onClick={() => onFollowToggle?.(user.id)}>Follow</Button>
                  )}
                </div> */}
              </div>
              <p className="text-gray-600 mb-2">@{user.username}</p>
              <p className="text-gray-600 mb-4">
                <MapPin className="inline-block h-4 w-4 mr-1" />
                {user.location} · Joined {user.createdAt}
              </p>
            </div>
          </div>
        </div>
      }

      <FollowersDialog
        isOpen={showFollowers}
        onOpenChange={setShowFollowers}
        users={followers}
        title="Followers"
        onFollowToggle={onFollowToggle}
      />

      <FollowersDialog
        isOpen={showFollowing}
        onOpenChange={setShowFollowing}
        users={following}
        title="Following"
        onFollowToggle={onFollowToggle}
      />
    </div>
  )
} 
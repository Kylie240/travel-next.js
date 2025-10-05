"use client"

import Image from "next/image"
import { useState } from "react"
import { Camera, Share, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FollowersDialog } from "@/components/ui/followers-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { UserData } from "@/lib/types"
import { UserStats } from "@/types/userStats"
import { getFollowersById } from "@/lib/actions/user.actions"
import { getFollowingById } from "@/lib/actions/user.actions"
import { Followers } from "@/types/followers"
import { FaUserLarge } from "react-icons/fa6";
import ShareProfileButton from "@/app/profile/[username]/share-profile"

interface ProfileHeaderProps {
  disableEdit?: boolean
  onFollowToggle?: (userId: string) => void
  user?: UserData | null
  userStats: UserStats
}

export function ProfileHeader({onFollowToggle, user, userStats }: ProfileHeaderProps) {
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
    <div>
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          {user?.avatar && user?.avatar !== "" ? (
          <div className="w-32 h-32 relative rounded-full overflow-hidden">
            <Image
              src={user?.avatar || ""}  
              alt={user?.name || ""}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 128px"
            />
          </div>
          ) : (
            <div className="w-32 h-32 relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <FaUserLarge className="h-20 w-20 text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left px-2 sm:px-4 md:px-8">
          <div className="text-center flex flex-col items-center">
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-gray-600 mb-2">@{user?.username}</p>
          </div>
          <div className="grid py-2 grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-2 xl:gap-6 mb-4">
            <div className="cursor-pointer flex flex-col items-center hover:text-gray-500" onClick={() => router.push("/favorites")}>
              <div className="font-semibold">{userStats[0].totalSaves}</div>
              <div className="text-sm">Saves</div>
            </div>
            <div className="cursor-pointer flex flex-col items-center hover:text-gray-500" onClick={() => handleFollowers(true)}>
              <div className="font-semibold">{userStats[0].followersCount}</div>
              <div className="text-sm">Followers</div>
            </div>
            <div className="cursor-pointer flex flex-col items-center hover:text-gray-500" onClick={() => handleFollowing(true)}>
              <div className="font-semibold">{userStats[0].followingCount}</div>
              <div className="text-sm">Following</div>
            </div>
            <div className="cursor-pointer flex flex-col items-center hover:text-gray-500" onClick={() => router.push("/favorites")}>
              <div className="font-semibold">{userStats[0].totalLikes}</div>
              <div className="text-sm">Likes</div>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.push(`/profile/${user.username}`)}>View Profile</Button>
            <ShareProfileButton />
          </div>
        </div>
      </div>

      <FollowersDialog
        isOpen={showFollowers}
        onOpenChange={setShowFollowers}
        users={followers}
        title="Followers"
        currentUserId={user?.id}
      />

      <FollowersDialog
        isOpen={showFollowing}
        onOpenChange={setShowFollowing}
        users={following}
        title="Following"
        currentUserId={user?.id}
      />
    </div>
  )
} 
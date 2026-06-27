"use client"

import { useState } from "react"
import FollowButton from "@/app/itinerary/[id]/follow-button"
import ProfileMenuButton from "./profile-menu-button"
import ShareProfileButton from "./share-profile"

export default function ProfileActions({
  creatorId,
  userId,
  username,
}: {
  creatorId: string
  userId: string
  username: string
}) {
  const [followOverride, setFollowOverride] = useState<boolean | undefined>(
    undefined
  )

  return (
    <div className="flex gap-2 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <FollowButton
          creatorId={creatorId}
          userId={userId}
          externalFollowing={followOverride}
        />
        <ShareProfileButton username={username} />
      </div>
      {userId ? (
        <ProfileMenuButton
          creatorId={creatorId}
          userId={userId}
          onUserBlocked={() => setFollowOverride(false)}
        />
      ) : null}
    </div>
  )
}
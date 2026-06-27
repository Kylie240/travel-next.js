"use client"

import { useState } from "react"
import FollowButton from "@/app/itinerary/[id]/follow-button"
import ProfileMenuButton from "./profile-menu-button"
import ShareProfileButton from "./share-profile"
import UnblockUserButton from "./unblock-user-button"

export default function ProfileActions({
  creatorId,
  userId,
  username,
  isBlockedByViewer = false,
}: {
  creatorId: string
  userId: string
  username: string
  isBlockedByViewer?: boolean
}) {
  const [followOverride, setFollowOverride] = useState<boolean | undefined>(
    undefined
  )

  return (
    <div className="flex gap-2 mt-2">
      <div className="grid grid-cols-2 gap-2">
        {isBlockedByViewer && userId ? (
          <UnblockUserButton userId={userId} blockedUserId={creatorId} />
        ) : (
          <FollowButton
            creatorId={creatorId}
            userId={userId}
            externalFollowing={followOverride}
          />
        )}
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
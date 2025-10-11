"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import Image from "next/image"
import { Button } from "./button"
import { useRouter } from "next/navigation"
import { Followers } from "@/types/followers"
import { addFollow, removeFollow, blockUser, removeBlockedUser } from "@/lib/actions/user.actions"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { FaUserLarge } from "react-icons/fa6"

interface FollowersDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  users: Followers[]
  title: string
  currentUserId: string
  onFollowToggle?: (userId: string) => void
}

export function FollowersDialog({ isOpen, onOpenChange, users, title, currentUserId }: FollowersDialogProps) {
  const router = useRouter()
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({})
  const [blockStatus, setBlockStatus] = useState<Record<string, boolean>>({})

  // Initialize follow and block status from props
  useEffect(() => {
    const initialFollowStatus: Record<string, boolean> = {}
    const initialBlockStatus: Record<string, boolean> = {}
    users.forEach(user => {
      initialFollowStatus[user.userId] = user.isFollowing
      initialBlockStatus[user.userId] = user.isBlocked || false
    })
    setFollowStatus(initialFollowStatus)
    setBlockStatus(initialBlockStatus)
  }, [users])

  const handleFollowToggle = async (userId: string) => {
    const currentStatus = followStatus[userId]
    
    try {
      if (currentStatus) {
        await removeFollow(currentUserId, userId)
      } else {
        await addFollow(currentUserId, userId)
      }
      
      // Update local state optimistically
      setFollowStatus(prev => ({
        ...prev,
        [userId]: !currentStatus
      }))
      
      router.refresh()
    } catch (error) {
      toast.error('Failed to update follow status')
    }
  }

  const handleBlockToggle = async (userId: string) => {
    const currentStatus = blockStatus[userId]
    
    try {
      if (currentStatus) {
        await removeBlockedUser(currentUserId, userId)
      } else {
        await blockUser(currentUserId, userId)
      }
      
      // Update local state optimistically
      setBlockStatus(prev => ({
        ...prev,
        [userId]: !currentStatus
      }))
      
      toast.success(`Successfully ${currentStatus ? 'unblocked' : 'blocked'} user`)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update block status')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[10000] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-4">
            {title}
          </Dialog.Title>

          <div className="space-y-4">
            { users && users.map((user) => (
              <div key={user.userId} className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push(`/profile/${user.userUsername}`)}>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    {user.userAvatar && user.userAvatar !== "" ? (
                    <Image
                      src={user.userAvatar}
                      alt={user.userName}
                      fill
                      className="object-cover rounded-full"
                      sizes="40px"
                    />
                    ) : (
                      <div className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaUserLarge className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{user.userName}</p>
                    <p className="text-sm text-gray-600">{user.userUsername}</p>
                  </div>
                </div>
                
                {user.userId !== currentUserId && (
                  <>
                  {title !== "Blocked Users" && !user.isPrivate && (
                    <div className="flex gap-2">
                      <Button
                        variant={followStatus[user.userId] ? "outline" : "default"}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFollowToggle(user.userId)
                        }}
                        className={`h-9 rounded-xl ${followStatus[user.userId] ? "" : "bg-gray-700"}`}
                      >
                        {followStatus[user.userId] ? "Unfollow" : "Follow"}
                      </Button>
                    </div>
                  )}
                  {title === "Blocked Users" && (
                    <Button
                      variant={blockStatus[user.userId] ? "outline" : "default"}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBlockToggle(user.userId)
                      }}
                      className={`h-9 rounded-xl ${blockStatus[user.userId] ? "" : "bg-red-600 hover:bg-red-700"}`}
                    >
                      {blockStatus[user.userId] ? "Unblock" : "Block"}
                    </Button>
                  )}
                  </>
                )}
              </div>
            ))}
            { users && users.length === 0 && (
              <div className="flex items-center justify-center">
                <p className="text-gray-600 text-lg py-8">No users to display</p>
              </div>
            )}
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
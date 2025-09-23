"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import Image from "next/image"
import { Button } from "./button"
import { useRouter } from "next/navigation"
import { Followers } from "@/types/followers"

interface User {
  id: string
  name: string
  username: string
  image: string
  isFollowing?: boolean
}

interface FollowersDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  users: Followers[]
  title: string
  onFollowToggle?: (userId: string) => void
}

export function FollowersDialog({ isOpen, onOpenChange, users, title, onFollowToggle }: FollowersDialogProps) {
  const router = useRouter()
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[10000] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-4">
            {title}
          </Dialog.Title>

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.userId} className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push(`/profile/${user.userUsername}`)}>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src={user.userAvatar}
                      alt={user.userName}
                      fill
                      className="object-cover rounded-full"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{user.userName}</p>
                    <p className="text-sm text-gray-600">{user.userUsername}</p>
                  </div>
                </div>
                
                  <Button
                    variant={user.isFollowing ? "outline" : "default"}
                    onClick={(e) => {
                      e.stopPropagation()
                      onFollowToggle?.(user.userId)
                    }}
                    className={`h-9 rounded-xl ${user.isFollowing ? "" : "bg-gray-700"}`}
                  >
                    {user.isFollowing ? "Following" : "Follow"}
                  </Button>
                
              </div>
            ))}
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
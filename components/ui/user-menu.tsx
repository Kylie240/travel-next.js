"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { ChevronDown, LogOut, Settings, PenSquare, Heart, User, ChevronUp, Info, Globe, Bookmark } from "lucide-react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useToast } from "./use-toast"
import { useState } from "react"

export function UserMenu() {
  const router = useRouter()
  const { toast } = useToast()
  const user = auth.currentUser
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      // Remove the session cookie
      document.cookie = "firebase-session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      })
      router.push('/')
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="flex cursor-pointer items-center space-x-2 rounded-full bg-white/90 p-1.5 pr-3 hover:bg-white/100 transition-colors">
          <div className="relative h-8 w-8 rounded-full bg-travel-50 flex items-center justify-center overflow-hidden">
            {user?.photoURL ? (
              <img 
                src={user.photoURL}
                alt={user.displayName || "User avatar"} 
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-travel-900 text-sm font-medium">
                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-56 rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5 z-[100]"
          align="end"
          sideOffset={5}
        >
          <div className="px-2 py-1.5 text-sm font-medium text-gray-900 border-b border-gray-100">
            {user?.displayName || user?.email}
          </div>

          <div className="py-2 border-b border-gray-100 flex flex-col md:hidden">
            <DropdownMenu.Item
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => router.push('/explore')}
            >
              <Globe className="mr-2 h-4 w-4" />
              Explore
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => router.push('/about')}
            >
              <Info className="mr-2 h-4 w-4" />
              About
            </DropdownMenu.Item>
          </div>

          <div className="py-2">
            <DropdownMenu.Item
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => router.push('/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => router.push(`/profile?tab=${encodeURIComponent('Login & Security')}`)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
            
            <DropdownMenu.Item
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => router.push('/create')}
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Create
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => router.push('/my-itineraries')}
            >
              <PenSquare className="mr-2 h-4 w-4" />
              My Itineraries
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => router.push('/favorites')}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Favorites
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />

            <DropdownMenu.Item
              className="flex items-center px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
} 
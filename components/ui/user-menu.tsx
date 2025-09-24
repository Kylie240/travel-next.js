"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { ChevronDown, LogOut, Settings, PenSquare, User, ChevronUp, Info, Globe, Bookmark } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "./use-toast"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { CiPassport1 } from "react-icons/ci";
import { getUserProfileById } from "@/lib/actions/user.actions"

export function UserMenu() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user?.id) {
        const userProfile = await getUserProfileById(user.id)
        setUserProfile(userProfile)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
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
            {userProfile?.avatar ? (
              <img 
                src={userProfile.avatar}
                alt={user.user_metadata.username || "User avatar"} 
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-travel-900 text-sm font-medium">
                {userProfile?.username?.[0]?.toUpperCase() || " "}
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
          <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
            {userProfile?.name}
          </div>

          <div className="py-2">
            {userProfile?.username && (
            <DropdownMenu.Item
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => router.push(`/profile/${userProfile.username}`)}
            >
              <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Item
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => router.push(`/account-settings?tab=${encodeURIComponent('Login & Security')}`)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
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
              <CiPassport1 className="mr-2" size={18} strokeWidth={.75} />
              My Itineraries
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => router.push('/saves')}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Saves
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
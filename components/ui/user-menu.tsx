"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { ChevronDown, LogOut, Settings, PenSquare, User, ChevronUp, Info, Globe, Bookmark, UserCircle, MessageSquare } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useToast } from "./use-toast"
import { useState, useEffect, useCallback, useRef } from "react"
import { CiPassport1 } from "react-icons/ci";
import { getUserProfileById } from "@/lib/actions/user.actions"
import { FaUserAlt } from "react-icons/fa"
import { listenToAvatarUpdates, listenToProfileUpdates } from "@/lib/utils/avatar-events"
import Image from "next/image"
import useUser from "@/hooks/useUser"
import createClient from "@/utils/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AiOutlineDashboard } from "react-icons/ai"
import { TiTag } from "react-icons/ti"

export function UserMenu() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const { loading, error, user } = useUser()
  const [userPlan, setUserPlan] = useState<string | null>(null)

  // Track the last fetched user ID to prevent unnecessary refetches
  const lastFetchedUserIdRef = useRef<string | null>(null)

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async (force = false) => {
    if (!user?.id) {
      setUserProfile(null)
      setProfileLoading(false)
      lastFetchedUserIdRef.current = null
      return
    }

    // Skip if we already fetched for this user ID and not forcing
    if (!force && lastFetchedUserIdRef.current === user.id) {
      return
    }

    setProfileLoading(true)
    setProfileError(null)
    
    try {
      const profile = await getUserProfileById(user.id)
      setUserProfile(profile)
      lastFetchedUserIdRef.current = user.id
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      setProfileError(error instanceof Error ? error.message : "Failed to fetch profile")
      lastFetchedUserIdRef.current = null // Reset on error so we can retry
    } finally {
      setProfileLoading(false)
    }
  }, [user?.id]) // Only depend on user?.id to prevent unnecessary function recreations

  // Fetch user profile when user ID is present or changes
  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  // Listen for avatar updates
  useEffect(() => {
    const unsubscribeAvatar = listenToAvatarUpdates((event) => {
      const { userId, avatarUrl } = event.detail
      if (user?.id === userId) {
        setUserProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null)
      } else if (!user?.id) {
        setUserProfile(null)
      }
    })

    return unsubscribeAvatar
  }, [user?.id])

  // Listen for profile updates
  useEffect(() => {
    const unsubscribeProfile = listenToProfileUpdates((event) => {
      const { userId } = event.detail
      // Only refetch if it's for the current user
      if (user?.id === userId) {
        fetchUserProfile(true) // Force refetch on profile update
      }
    })

    return unsubscribeProfile
  }, [user?.id, fetchUserProfile])

  const handleSignOut = async () => {
    try {
      const protectedPages = ['/account-settings', '/my-itineraries', '/saves', '/create']
      const isOnProtectedPage = protectedPages.some(page => pathname?.startsWith(page))
      
      await supabase.auth.signOut()
      setProfileError(null)
      setProfileLoading(false)
      setIsOpen(false)
      setUserProfile(null)
      
      if (isOnProtectedPage) {
        router.push('/')
      }
      
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      })
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <>
    {user?.id ? (
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <button className="flex cursor-pointer items-center space-x-2 rounded-full bg-white/90 p-1.5 hover:bg-white/100 transition-colors">
            <div className="relative h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {profileLoading ? (
                <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : userProfile?.avatar && userProfile.avatar !== "" ? (
                <Image 
                  src={userProfile.avatar}
                  alt={userProfile.name || user?.user_metadata?.username || "User avatar"} 
                  fill
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-medium w-full h-full flex items-center justify-center">
                    <FaUserAlt className="h-4 w-4 text-gray-300" />
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
              {profileLoading ? (
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              ) : profileError ? (
                <span className="text-red-500 text-xs">Error loading profile</span>
              ) : (
                userProfile?.name || user?.user_metadata?.name || "User"
              )}
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
                  onClick={() => router.push(`/account-settings`)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenu.Item>

              {userPlan !== "free" && (
                <DropdownMenu.Item
                  className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => router.push('/my-itineraries')}
                >
                  <AiOutlineDashboard className="mr-2" size={18} strokeWidth={.75} />
                  Seller Dashboard
                </DropdownMenu.Item>
                )}

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

              {/* <DropdownMenu.Item
                className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => router.push('/purchases')}
              >
                <TiTag className="mr-2" size={18} strokeWidth={.25} />
                Purchases
              </DropdownMenu.Item> */}

              <DropdownMenu.Item
                className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => router.push('/saves')}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                Saves
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />

              <DropdownMenu.Item
                className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => {
                  router.push('/share-feedback')
                  setIsOpen(false)
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Share Feedback
              </DropdownMenu.Item>

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
    ) : (
      <div className="hidden md:block">
        <Link href="/login?mode=login">
          <Button 
            variant="ghost" 
            className="text-gray-700 hover:text-black"
          >
            Log In
          </Button>
        </Link>
      </div>
    )}
    </>
  )
} 
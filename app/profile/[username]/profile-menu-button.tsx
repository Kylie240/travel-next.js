"use client"

import { blockUser, removeBlockedUser } from '@/lib/actions/user.actions'
import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase/superbase-client'
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import React, { useEffect, useState } from 'react'
import { FaEllipsis } from 'react-icons/fa6'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'


const ProfileMenuButton = ({
  creatorId,
  userId,
  onUserBlocked,
}: {
  creatorId: string
  userId: string
  onUserBlocked?: () => void
}) => {
  const router = useRouter()

  const handleBlockUser = async (creatorId: string, userId: string) => {
    try {
      await blockUser(userId, creatorId)
      toast.success('User blocked')
      setIsBlocked(true)
      onUserBlocked?.()
      router.refresh()
    } catch (error) {
      console.log('Error blocking user', error)
      toast.error('Error blocking user')
    }
  }
  
  const handleUnblockUser = async (creatorId: string, userId: string) => {
    try {
      await removeBlockedUser(userId, creatorId)
      toast.success('User unblocked')
      setIsBlocked(false)
      router.refresh()
    } catch (error) {
      console.log('Error unblocking user', error)
      toast.error('Error unblocking user')
    }
  }
  const [isBlocked, setIsBlocked] = useState(false)
  useEffect(() => {
    if (!userId || !creatorId) {
      setIsBlocked(false)
      return
    }

    const fetchBlockedUsers = async () => {
      const { data, error } = await supabase
        .from('users_blocked')
        .select('user_id')
        .eq('user_id', userId)
        .eq('blocked_id', creatorId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching blocked status', error)
        setIsBlocked(false)
        return
      }

      setIsBlocked(!!data)
    }
    fetchBlockedUsers()
  }, [userId, creatorId])

  return (
    <div>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
            <Button 
                className="p-2 rounded-md bg-white/40 hover:bg-white/50 transition-colors"
            >
                <FaEllipsis className="h-4 w-4 text-black" />
            </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
            <DropdownMenu.Content
                className="w-48 rounded-lg bg-white p-1 shadow-lg ring-1 ring-red-500/5"
                align="end"
                sideOffset={5}
            >
                <DropdownMenu.Item
                className="flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => {
                        confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'block'} this user?`) && isBlocked ? handleUnblockUser(creatorId, userId) : handleBlockUser(creatorId, userId)
                    }}
                >
                    {isBlocked ? 'Unblock User' : 'Block User'}
                </DropdownMenu.Item>
            </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
        </div>
  )
}

export default ProfileMenuButton

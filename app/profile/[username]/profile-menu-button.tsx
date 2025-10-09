"use client"

import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase/superbase-client'
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { ChevronDown } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

const handleBlockUser = async (creatorId: string, userId: string) => {
  const { data, error } = await supabase.from('users_blocked').insert({
    user_id: userId,
    blocked_id: creatorId
  })
  if (error) {
    console.log('Error blocking user', error)
  }
  if (data) {
    console.log('User blocked', data)
  }
  toast.success('User blocked')
}

const ProfileMenuButton = ({creatorId, userId}: {creatorId: string, userId: string}) => {
  return (
    <div>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
            <Button 
                variant="outline"
                className="p-2 rounded-md bg-white/40 hover:bg-white/50 transition-colors"
            >
                <ChevronDown className="h-4 w-4 text-black" />
            </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
            <DropdownMenu.Content
                className="w-48 rounded-lg bg-white p-1 shadow-lg ring-1 ring-red-500/5"
                align="end"
                sideOffset={5}
            >
                <DropdownMenu.Item
                className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => {
                        confirm('Are you sure you want to block this user?') && handleBlockUser(creatorId, userId)
                    }}
                >
                    Block User
                </DropdownMenu.Item>
            </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
        </div>
  )
}

export default ProfileMenuButton

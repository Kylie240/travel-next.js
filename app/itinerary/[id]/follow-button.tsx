"use client"

import { Session } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { addFollow, removeFollow } from '@/lib/actions/user.actions'
import { supabase } from '@/utils/supabase/superbase-client'
import { User } from '@supabase/supabase-js'

const FollowButton = ({ creatorId }: { creatorId: string }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        setLoading(false)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const checkFollow = async () => {
      const isFollowing = await supabase.from('users_following').select('*').eq('user_id', userId).eq('following_id', user?.id).single()
      setIsFollowing(isFollowing.data?.isFollowing)
    }
    checkFollow()
  }, [creatorId])

  const toggleFollow = async (isFollow: boolean) => {
    if (isFollow) {
      await addFollow(user?.id, creatorId)
    } else {
      await removeFollow(user?.id, creatorId)
    }
    setIsFollowing(isFollow)
  }

  return (
    <Button onClick={() => toggleFollow(true)} variant="outline" className="cursor-pointer border rounded-xl flex justify-center items-center w-full p-2 hover:bg-gray-100">
      Follow
    </Button>
  )
}

export default FollowButton
"use client"

import { Session } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { addFollow, removeFollow } from '@/lib/actions/user.actions'
import { supabase } from '@/utils/supabase/superbase-client'
import { User } from '@supabase/supabase-js'
import { AuthDialog } from '@/components/ui/auth-dialog'

const FollowButton = ({ creatorId, userId }: { creatorId: string, userId: string }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

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
      if (!user?.id) {
        setLoading(false)
        return
      }
      const isFollowing = await supabase.from('users_following').select('*').eq('user_id', userId).eq('following_id', user?.id).single()
      setIsFollowing(isFollowing.data?.isFollowing)
      setLoading(false)
    }
    checkFollow()
  }, [creatorId, user?.id])

  const toggleFollow = async (isFollow: boolean) => {
    if (!user?.id) {
      // Redirect to login if user is not authenticated
      window.location.href = '/login'
      return
    }
    
    if (isFollow) {
      await addFollow(user?.id, creatorId)
    } else {
      await removeFollow(user?.id, creatorId)
    }
    setIsFollowing(isFollow)
  }

  // Don't render anything if still loading
  if (loading) {
    return null
  }

  // If user is not logged in, show login prompt
  if (!user?.id) {
    return (
      <AuthDialog 
        isOpen={isAuthOpen} 
        setIsOpen={setIsAuthOpen} 
        isSignUp={isSignUp} 
        setIsSignUp={setIsSignUp}
      >
        <Button 
          className="text-white hover:text-black w-full"
          onClick={() => {
            setIsSignUp(false)
            setIsAuthOpen(true)
          }}
        >
          Login to Follow
        </Button>
      </AuthDialog>
      
    )
  }

  return (
    <Button onClick={() => toggleFollow(!isFollowing)} variant="outline" className="cursor-pointer flex justify-center items-center w-full p-2 hover:bg-gray-800 hover:text-white">
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  )
}

export default FollowButton
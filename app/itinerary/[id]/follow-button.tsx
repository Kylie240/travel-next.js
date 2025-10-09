"use client"

import { Session } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { addFollow, removeFollow } from '@/lib/actions/user.actions'
import { supabase } from '@/utils/supabase/superbase-client'
import { AuthDialog } from '@/components/ui/auth-dialog'

const FollowButton = ({ creatorId, userId }: { creatorId: string, userId: string }) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    const checkFollow = async () => {
      if (!userId) {
        setLoading(false)
        return
      }
      const isFollowing = await supabase.from('users_following').select('*').eq('user_id', userId).eq('following_id', creatorId).single()
      setIsFollowing(isFollowing.data?.following_id)
      setLoading(false)
    }
    checkFollow()
  }, [creatorId, userId])

  const toggleFollow = async (isFollow: boolean) => {
    if (!userId) {
      // Redirect to login if user is not authenticated
      window.location.href = '/login'
      return
    }
    
    if (isFollow) {
      await addFollow(userId, creatorId)
    } else {
      await removeFollow(userId, creatorId)
    }
    setIsFollowing(isFollow)
  }

  // Don't render anything if still loading
  if (loading) {
    return null
  }

  // If user is not logged in, show login prompt
  if (!userId) {
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
    <Button onClick={() => toggleFollow(!isFollowing)} 
      variant="outline" 
      className={`${!isFollowing ? 'bg-gray-900 text-white hover:bg-gray-800 hoveR:text-white' : 'text-gray-800 hover:bg-gray-100'} cursor-pointer flex justify-center items-center w-full p-2 `}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  )
}

export default FollowButton
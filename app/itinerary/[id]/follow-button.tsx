"use client"

import { Session } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { addFollow, removeFollow } from '@/lib/actions/user.actions'
import { supabase } from '@/utils/supabase/superbase-client'
import { AuthDialog } from '@/components/ui/auth-dialog'
import { useRouter } from 'next/navigation'

const FollowButton = ({ creatorId, userId }: { creatorId: string, userId: string }) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

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

    // Check if mobile - only run on client side
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)

      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [creatorId, userId])

  const toggleFollow = async (isFollow: boolean) => {
    if (!userId) {
      router.push('/login')
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
    if (true) {
      return (
        <Button 
          className="w-full"
          onClick={() => router.push('/login?mode=login')}
        >
          Log In to Follow
        </Button>
      )
    }
    
    return (
      <AuthDialog 
        isOpen={isAuthOpen} 
        setIsOpen={setIsAuthOpen} 
        isSignUp={isSignUp} 
        setIsSignUp={setIsSignUp}
      >
        <Button 
          className="w-full"
          onClick={() => {
            setIsSignUp(false)
            setIsAuthOpen(true)
          }}
        >
          Log In to Follow
        </Button>
      </AuthDialog>
      
    )
  }

  return (
    <Button onClick={() => toggleFollow(!isFollowing)} 
      variant="outline" 
      className={`${!isFollowing ? 'bg-gray-900 text-white hover:bg-gray-800 hover:text-white' : 'text-gray-800 hover:bg-gray-100'} cursor-pointer flex justify-center items-center w-full p-2 `}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  )
}

export default FollowButton
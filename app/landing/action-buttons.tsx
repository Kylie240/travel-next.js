"use client"

import React, { useState, useEffect } from 'react'
import { AuthDialog } from '@/components/ui/auth-dialog'
import { Button } from '@/components/ui/button'
import createClient from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ActionButtons = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [currentUser, setCurrentUser] = useState<boolean | null>(null) // null = loading, true/false = auth state
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null
    let timeoutId: NodeJS.Timeout | null = null

    // Check if mobile
    const checkMobile = () => {
      if (mounted) {
        setIsMobile(window.innerWidth < 768)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Set up auth state listener first - this fires immediately with current session
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setCurrentUser(!!session?.user)
        if (event === 'SIGNED_IN') {
          router.refresh()
        }
      }
    })
    subscription = authSubscription

    // Also check session directly as a backup
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Error getting session:', sessionError)
          if (mounted) {
            setCurrentUser(false)
          }
          return
        }

        if (mounted) {
          setCurrentUser(!!session?.user)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        // If everything fails, default to not logged in
        if (mounted) {
          setCurrentUser(false)
        }
      }
    }

    checkAuth()

    // Fallback timeout - if we still haven't set the state after 2 seconds, default to false
    timeoutId = setTimeout(() => {
      if (mounted) {
        setCurrentUser((prev) => {
          if (prev === null) {
            console.warn('Auth check timeout, defaulting to not logged in')
            return false
          }
          return prev
        })
      }
    }, 2000)

    // Cleanup on unmount
    return () => {
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
      window.removeEventListener('resize', checkMobile)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  const handleAuthClick = (signUp: boolean) => {
    if (isMobile) {
      router.push(`/login?mode=${signUp ? 'signup' : 'login'}`)
    } else {
      setIsSignUp(signUp)
      setIsOpen(true)
    }
  }

  // Show nothing while loading to prevent flash of wrong buttons
  if (currentUser === null) {
    return <div className="w-full h-12" /> // Placeholder to prevent layout shift
  }

  return (
    <div className="w-full"> 
      {currentUser ? (
        <div className="flex flex-row gap-4">
          <Link href="/my-itineraries">
            <Button variant="outline" size="default" className="px-8 text-md h-10 py-4 border bg-transparent flex justify-center items-center w-full hover:bg-gray-100">
              My Itineraries
            </Button>
          </Link>
          <Link href="/create">
            <Button size="default" className="bg-cyan-700 flex items-center text-white px-8 text-md h-10 py-4">
              Start Creating
            </Button>
          </Link>
        </div>
      ) : (
      <div className="flex gap-4">
        <Button variant="outline" size="default" 
          onClick={() => router.push('/login?mode=login')}
          className="px-8 text-md h-10 py-4 border bg-transparent flex justify-center items-center w-full hover:bg-gray-100">
          Log In
        </Button>
        <Button size="default"
          onClick={() => router.push('/login?mode=signup')} 
          className="bg-cyan-700 flex items-center text-white px-8 text-md h-10 py-4"
        >
          Sign Up
        </Button>
      </div>
      )}
    </div>
  )
}

export default ActionButtons
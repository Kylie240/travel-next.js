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
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/my-itineraries">
            <Button variant="outline" size="default" className="px-8 text-lg h-10 md:h-12 py-4 md:text-xl border bg-transparent flex justify-center items-center w-full hover:bg-gray-100">
              My Itineraries
            </Button>
          </Link>
          <Link href="/create">
            <Button size="default" className="bg-gray-900 flex items-center text-white px-8 text-lg h-10 md:h-12 py-4 md:text-xl">
              Start Creating
            </Button>
          </Link>
        </div>
      ) : (
      <div className="flex gap-4">
        <Button variant="outline" size="default" 
          onClick={() => router.push('/login?mode=login')}
          className="px-8 text-lg h-10 md:h-12 py-4 md:text-lg border bg-transparent flex justify-center items-center w-full hover:bg-gray-100">
          Log In
        </Button>
        <Button size="default"
          onClick={() => router.push('/login?mode=signup')} 
          className="bg-cyan-700 flex items-center text-white px-8 text-lg h-10 md:h-12 py-4 md:text-lg"
        >
          Sign Up
        </Button>
        {/* <Button variant="outline" size="default" 
          onClick={() => handleAuthClick(false)}
          className="px-8 text-lg h-10 md:h-12 py-4 md:text-xl border bg-transparent flex justify-center items-center w-full hover:bg-gray-100">
          Log In
        </Button>
        <Button size="default"
          onClick={() => handleAuthClick(true)} 
          className="bg-gray-900 flex items-center text-white px-8 text-lg h-10 md:h-12 py-4 md:text-xl"
        >
          Sign Up
        </Button>
        {!isMobile && (
          <AuthDialog isOpen={isOpen} setIsOpen={setIsOpen} isSignUp={isSignUp} setIsSignUp={setIsSignUp}>
            <></>
          </AuthDialog>
        )} */}
      </div>
      )}
      {/* Mobile version */}
      {/* <div className="bg-white md:hidden absolute bottom-0 z-10 rounded-t-2xl w-full flex flex-col justify-center items-center pt-6 pb-8 px-16 gap-4">
        <AuthDialog isOpen={isOpen} setIsOpen={setIsOpen} isSignUp={isSignUp} setIsSignUp={setIsSignUp}>
          <button 
            onClick={() => handleAuthClick(true)} 
            className="bg-gray-900 text-white h-[50px] w-full px-12 justify-center py-3 flex items-center gap-2 shadow-[0_15px_15px_rgba(0,0,0,0.15)] rounded-lg font-medium hover:bg-gray-900 transition"
          >
            Sign Up For Free
          </button>
        </AuthDialog>
        <div className="flex gap-2 font-medium pb-6">
          <span className="text-gray-900">Already have an account?</span>
          <AuthDialog isOpen={isOpen} setIsOpen={setIsOpen} isSignUp={isSignUp} setIsSignUp={setIsSignUp}>
            <p 
              onClick={() => handleAuthClick(false)} 
              className="text-cyan-600 cursor-pointer hover:text-cyan-300 transition"
            >
              Log in
            </p>
          </AuthDialog>
        </div>
      </div> */}
    </div>
  )
}

export default ActionButtons
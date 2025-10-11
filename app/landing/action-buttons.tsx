"use client"

import React, { useState, useEffect } from 'react'
import { AuthDialog } from '@/components/ui/auth-dialog'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ActionButtons = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [currentUser, setCurrentUser] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get initial user state
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(!!user)
    }
    
    getUser()

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(!!session?.user)
      if (event === 'SIGNED_IN') {
        router.refresh()
      }
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('resize', checkMobile)
    }
  }, [supabase, router])

  const handleAuthClick = (signUp: boolean) => {
    if (isMobile) {
      router.push(`/login?mode=${signUp ? 'signup' : 'login'}`)
    } else {
      setIsSignUp(signUp)
      setIsOpen(true)
    }
  }

  return (
    <div className="w-full"> 
      {currentUser ? (
        <Link href="/create">
          <Button size="default" className="px-6 text-md md:h-12 md:py-4 md:px-8 md:text-xl cursor-pointer border bg-transparent flex justify-center items-center w-full p-2 hover:text-black hover:bg-gray-100">
            Start Creating
          </Button>
        </Link>
      ) : (
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" size="default" 
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
        )}
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
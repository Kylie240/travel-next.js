"use client"

import React, { useState, useEffect } from 'react'
import { AuthDialog } from '@/components/ui/auth-dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase/superbase-client'
import Link from 'next/link'

const ActionButtons = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [currentUser, setCurrentUser] = useState(false)

  useEffect(() => {
    // Get initial user state
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(!!user)
    }
    
    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(!!session?.user)
    })

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [])

  const handleAuthClick = (signUp: boolean) => {
    setIsSignUp(signUp)
    setIsOpen(true)
  }

  return (
    <div className="w-full"> 
      {currentUser ? (
        <Link href="/create">
          <Button size="default" className="px-6 text-md md:font-large md:h-12 md:py-4 md:px-8 md:text-xl cursor-pointer border bg-transparent flex justify-center items-center w-full p-2 hover:bg-gray-100">
            Start Creating
          </Button>
        </Link>
      ) : (
      <div className="flex flex-col sm:flex-row gap-4">
        <AuthDialog isOpen={isOpen} setIsOpen={setIsOpen} isSignUp={false} setIsSignUp={setIsSignUp}>
          <Button variant="outline" size="default" className="px-6 text-md md:font-large md:h-12 md:py-4 md:px-8 md:text-xl cursor-pointer border bg-transparent flex justify-center items-center w-full p-2 hover:bg-gray-100">
            Log In
          </Button>
        </AuthDialog>
        <AuthDialog isOpen={isOpen} setIsOpen={setIsOpen} isSignUp={true} setIsSignUp={setIsSignUp}>
          <Button size="default"
            onClick={() => handleAuthClick(true)} 
            className="bg-gray-900 flex items-center text-white px-6 text-md md:font-large md:h-12 md:py-4 md:px-8 md:text-xl"
          >
            Sign Up
            </Button>
          </AuthDialog>
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
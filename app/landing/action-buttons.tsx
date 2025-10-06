"use client"

import React, { useState } from 'react'
import { AuthDialog } from '@/components/ui/auth-dialog'
import { Button } from '@/components/ui/button'

const ActionButtons = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuthClick = (signUp: boolean) => {
    setIsSignUp(signUp)
    setIsOpen(true)
  }

  return (
    <div className="w-full"> 
      <div className="flex flex-col sm:flex-row gap-4">
        <AuthDialog isOpen={isOpen} setIsOpen={setIsOpen} isSignUp={isSignUp} setIsSignUp={setIsSignUp}>
          <Button variant="outline" className="cursor-pointer border bg-transparent flex justify-center items-center w-full p-2 hover:bg-gray-100">
            Log In
          </Button>
        </AuthDialog>
        <AuthDialog isOpen={isOpen} setIsOpen={setIsOpen} isSignUp={isSignUp} setIsSignUp={setIsSignUp}>
          <Button 
            onClick={() => handleAuthClick(true)} 
            className="bg-gray-900 flex items-center text-white font-medium"
          >
            Sign Up For Free
          </Button>
        </AuthDialog>
      </div>
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
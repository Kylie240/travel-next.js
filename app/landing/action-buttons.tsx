import React, { useState } from 'react'
import { AuthDialog } from '@/components/ui/auth-dialog'

const ActionButtons = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  return (
    <div className="flex gap-4">
        <AuthDialog isOpen={isOpen} setIsOpen={setIsOpen} isSignUp={false} setIsSignUp={setIsSignUp}>
          <button onClick={() => setIsOpen(true)} className="border-2 h-[40px] flex items-center text-white px-8 py-3 gap-2 rounded-lg font-medium hover:bg-gray-200/20 transition">
            Log In
          </button>
        </AuthDialog>
        <AuthDialog isOpen={isOpen} setIsOpen={setIsOpen} isSignUp={true} setIsSignUp={setIsSignUp}>
          <button onClick={() => setIsOpen(true)} className="bg-gray-900 h-[40px] flex items-center text-white px-8 py-3 gap-2 rounded-lg font-medium hover:bg-gray-800 transition">
            Sign Up For Free
          </button>
        </AuthDialog>
    </div>
  )
}

export default ActionButtons
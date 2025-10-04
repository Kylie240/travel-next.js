"use client"

import { MapPin } from "lucide-react"
import { useState } from "react"
import { AuthDialog } from "./auth-dialog"
import { Button } from "./button"

interface BlackBannerProps {
  icon?: React.ReactNode
  subtitle: string
  title: string
  description: string
}

export function BlackBanner({ icon = <MapPin className="w-4 h-4" />, subtitle, title, description }: BlackBannerProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <section className="py-16 bg-black">
      <div className="container text-white text-center">
        <span className="flex justify-center items-center gap-2 mb-8 text-lg text-white">
          {icon}
          {subtitle}
        </span>
        <h2 className="text-5xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-xl font-light pb-8">{description}</p>
        <AuthDialog 
          isOpen={isAuthOpen} 
          setIsOpen={setIsAuthOpen} 
          isSignUp={isSignUp} 
          setIsSignUp={setIsSignUp}
        >
          <Button 
            variant="outline" 
            className="bg-white text-black hover:bg-gray-100"
            onClick={() => {
              setIsSignUp(false)
              setIsAuthOpen(true)
            }}
          >
            Sign In
          </Button>
        </AuthDialog>
      </div>
    </section>
  )
} 
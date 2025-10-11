"use client"

import { MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <section className="py-16 bg-black">
      <div className="container text-white text-center">
        <span className="flex justify-center items-center gap-2 mb-8 text-lg text-white">
          {icon}
          {subtitle}
        </span>
        <h2 className="text-5xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-xl font-light pb-8">{description}</p>
        {!isMobile ? (
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
        ) : (
          <Button 
            variant="outline" 
            className="bg-white text-black hover:bg-gray-100"
            onClick={() => router.push('/login?mode=login')}
          >
            Sign In
          </Button>
        )}
      </div>
    </section>
  )
} 
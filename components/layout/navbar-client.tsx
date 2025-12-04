"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/ui/auth-dialog"
import { User } from "@supabase/supabase-js"

const publicNavigation = [
  { name: "Explore", href: "/explore" },
  { name: "Plans", href: "/plans" },
  { name: "About", href: "/about" },
]

const authenticatedNavigation = [
  { name: "Search", href: "/search" },
]

interface NavbarClientProps {
  user: User | null
}

export function NavbarClient({ user }: NavbarClientProps) {
  // Combine public navigation with authenticated navigation if user is logged in
  const navigation = user 
    ? [...publicNavigation, ...authenticatedNavigation]
    : publicNavigation
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        mobileMenuRef.current &&
        menuButtonRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile auth button (when not logged in) */}
      {!user && (
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            className="text-gray-700 hover:text-black"
            onClick={() => router.push('/login?mode=login')}
          >
            Log In
          </Button>
        </div>
      )}

      {/* Mobile menu button */}
      <Button
        ref={menuButtonRef}
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-gray-700 hover:text-black hover:bg-gray-100"
      >
        <span className="sr-only">Open main menu</span>
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? "text-black bg-gray-100"
                      : "text-gray-700 hover:text-black hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

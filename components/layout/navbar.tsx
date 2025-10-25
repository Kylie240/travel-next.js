"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/ui/auth-dialog"
import { UserMenu } from "@/components/ui/user-menu"
import { NavbarSearch } from "@/components/ui/navbar-search"
import { LocaleMenu } from "@/components/ui/locale-menu"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { User } from "@supabase/supabase-js"
import createClient from "@/utils/supabase/client"

const publicNavigation = [
  { name: "Explore", href: "/explore" },
  { name: "Plans", href: "/plans" },
  { name: "About", href: "/about" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const supabase2 = createClient()
  const [user, setUser] = useState<User | null>(null)
  const isExplorePage = pathname === "/explore"
  const isLandingPage = pathname === "/"
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase2.auth.getUser()
      console.log(user)
      setUser(user)
    }
    getUser()

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const unsubscribe = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session?.user ?? null)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      unsubscribe.data.subscription.unsubscribe()
      window.removeEventListener('resize', checkMobile)
    }
  }, [supabase])

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])

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

  const navigation = publicNavigation

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-[50] transition-all duration-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-black">
                Journli
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-black border-b-2 border-black"
                      : "text-gray-700 hover:text-black hover:border-gray-300"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center md:space-x-4">
            {/* {!isExplorePage && !scrolled && (
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-700 hover:text-black hover:bg-gray-100 flex items-center"
                onClick={() => window.location.href = '/explore'}
              >
                <Search className="h-5 w-5" />
              </Button>
            )} */}

            {/* User menu or auth buttons */}
            {user ? (
              <UserMenu />
            ) : (
              <div className="items-center gap-2">
                {false ? (
                  <AuthDialog 
                    isOpen={isAuthOpen} 
                    setIsOpen={setIsAuthOpen} 
                    isSignUp={isSignUp} 
                    setIsSignUp={setIsSignUp}
                  >
                    <Button 
                      variant="ghost" 
                      className="text-gray-700 hover:text-black"
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
                    variant="ghost" 
                    className="text-gray-700 hover:text-black"
                    onClick={() => router.push('/login?mode=login')}
                  >
                    Sign In
                  </Button>
                )}
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
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b">
              {navigation.map((item) => (
                <Link
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
                </Link>
              ))}
              {/* {!user && (
                <div className="flex flex-col gap-2 p-3">
                  <AuthDialog 
                    isOpen={isAuthOpen} 
                    setIsOpen={setIsAuthOpen} 
                    isSignUp={isSignUp} 
                    setIsSignUp={setIsSignUp}
                  >
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center text-gray-700 hover:text-black"
                      onClick={() => {
                        setIsSignUp(false)
                        setIsAuthOpen(true)
                        setIsOpen(false)
                      }}
                    >
                      Sign In
                    </Button>
                  </AuthDialog>
                </div>
              )} */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
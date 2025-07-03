"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/ui/auth-dialog"
import { UserMenu } from "@/components/ui/user-menu"
import { NavbarSearch } from "@/components/ui/navbar-search"
import { LocaleMenu } from "@/components/ui/locale-menu"
import { auth } from "@/lib/firebase"

const publicNavigation = [
  { name: "Explore", href: "/explore" },
  { name: "About", href: "/about" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const [user, setUser] = useState(auth.currentUser)
  const isExplorePage = pathname === "/explore"
  const isLandingPage = pathname === "/"

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

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

  // Just use publicNavigation directly since we moved private routes to the dropdown
  const navigation = publicNavigation

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 w-full z-[50] transition-all duration-200 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm" 
          : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-black">
                Travel 3.0
              </span>
            </Link>
            {
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
            }
          </div>

          {/* Centered Search Bar */}
          <div className={`hidden md:flex flex-1 justify-center px-8 transition-opacity duration-200 ${
            isLandingPage && !scrolled ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}>
            <NavbarSearch isScrolled={scrolled || !isLandingPage} />
          </div>

          {/* Secondary Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isExplorePage && (
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-700 hover:text-black hover:bg-gray-100"
                onClick={() => window.location.href = '/explore'}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            <LocaleMenu />
            {user ? (
              <UserMenu />
            ) : (
              <AuthDialog />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded="false"
              className="text-gray-700 hover:text-black hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
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
              <div className="mt-4 flex flex-col space-y-2 px-3">
                {isExplorePage ? (
                  <div className="py-2">
                    <NavbarSearch />
                  </div>
                ) : (
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/explore'}>
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-700">Language & Currency</span>
                  <LocaleMenu />
                </div>
                {!user && <AuthDialog />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
} 
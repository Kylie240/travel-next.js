"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Create", href: "/create" },
  { name: "About", href: "/about" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial scroll position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])

  return (
    <nav 
      className={`fixed w-full z-50 transition-colors duration-200 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md border-b" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className={`text-2xl font-bold ${scrolled ? 'text-travel-600' : 'text-white'}`}>
                Travel 3.0
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? scrolled 
                        ? "text-travel-600 border-b-2 border-travel-600"
                        : "text-white border-b-2 border-white"
                      : scrolled
                        ? "text-gray-500 hover:text-gray-900 hover:border-gray-300"
                        : "text-white/80 hover:text-white hover:border-white/30"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              className={scrolled ? "" : "text-white hover:bg-white/10"}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              className={scrolled ? "" : "bg-white text-black hover:bg-white/90"}
            >
              <User className="h-5 w-5 mr-2" />
              Sign In
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded="false"
              className={scrolled ? "" : "text-white hover:bg-white/10"}
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
                      ? "text-travel-600 bg-travel-50"
                      : "text-gray-700 hover:text-travel-600 hover:bg-travel-50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="mt-4 flex flex-col space-y-2 px-3">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
                <Button className="w-full justify-start">
                  <User className="h-5 w-5 mr-2" />
                  Sign In
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
} 
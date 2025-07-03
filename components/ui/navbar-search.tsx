"use client"

import { Search } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

interface NavbarSearchProps {
  isScrolled?: boolean
}

export function NavbarSearch({ isScrolled = true }: NavbarSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const isLandingPage = pathname === "/"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className={`relative flex items-center transition-colors ${
        isScrolled || !isLandingPage ? "text-gray-900" : "text-white"
      }`}>
        <Search className="absolute left-3 h-5 w-5 opacity-50" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations, activities, or itineraries..."
          className={`w-full py-2 pl-10 pr-4 rounded-full border transition-colors focus:outline-none focus:ring-2 ${
            isScrolled || !isLandingPage
              ? "bg-white/80 border-gray-200 focus:bg-white focus:ring-travel-900"
              : "bg-white/10 border-white/20 placeholder:text-white/60 focus:bg-white/20 focus:ring-white/30"
          }`}
        />
      </div>
    </form>
  )
} 
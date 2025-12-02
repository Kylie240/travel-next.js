"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, User as UserIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { searchUsers } from "@/lib/actions/user.actions"
import { FaUserLarge } from "react-icons/fa6"
import createClient from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"

interface SearchUser {
  id: string
  name: string
  username: string
  avatar: string | null
  bio: string | null
  isFollowing?: boolean
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [users, setUsers] = useState<SearchUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getCurrentUser()
  }, [])

  const performSearch = useCallback(async (query: string, userId?: string) => {
    if (!query || query.trim() === "") {
      setUsers([])
      return
    }

    setIsLoading(true)
    try {
      const results = await searchUsers(query, userId)
      setUsers(results as SearchUser[])
    } catch (error) {
      console.error("Error searching users:", error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Perform search when query changes
  useEffect(() => {
    const query = searchQuery.trim()
    if (query) {
      performSearch(query, currentUser?.id)
    } else {
      setUsers([])
    }
  }, [searchQuery, currentUser?.id, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      performSearch(query)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-0 md:pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Users</h1>
          <p className="text-gray-600">Find and connect with other travelers</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                const query = e.target.value.trim()
                if (query) {
                  router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false })
                } else {
                  router.replace("/search", { scroll: false })
                }
              }}
              className="pl-10 h-12 text-base"
            />
          </div>
        </form>

        {/* Search Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Searching...</div>
          </div>
        ) : searchQuery.trim() === "" ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed">
            <div className="mb-4">
              <UserIcon className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Start Searching</h3>
            <p className="text-gray-600 text-center">Enter a name or username to find other users</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed">
            <div className="mb-4">
              <Search className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Users Found</h3>
            <p className="text-gray-600 text-center">Try searching with a different name or username</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Found {users.length} {users.length === 1 ? "user" : "users"}
            </div>
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="block py-0 px-4 md:p-4 md:rounded-xl md:border md:border-gray-200 md:hover:border-gray-300 md:hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {user.avatar && user.avatar !== "" ? (
                    <div className="w-12 h-12 md:w-14 md:h-14 relative rounded-full flex-shrink-0">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 md:w-14 md:h-14 relative rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FaUserLarge className="h-6 w-6 text-gray-300" />
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {user.name}
                      </h3>
                      {user.isFollowing && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Following
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">@{user.username}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


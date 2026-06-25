"use client"

import Image from "next/image"
import { Loader2, Search } from "lucide-react"
import { FaUserLarge } from "react-icons/fa6"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Followers } from "@/types/followers"

interface FollowerUserPickerProps {
  label: string
  followers: Followers[]
  loadingFollowers: boolean
  subLabel: string
  selectedUserIds: string[]
  searchTerm: string
  onSearchTermChange: (term: string) => void
  onToggle: (userId: string) => void
  disabled?: boolean
}

export function FollowerUserPicker({
  label,
  followers = [],
  loadingFollowers,
  subLabel,
  selectedUserIds,
  searchTerm,
  onSearchTermChange,
  onToggle,
  disabled = false,
}: FollowerUserPickerProps) {
  const filteredFollowers = followers.filter((follower) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      follower.userName.toLowerCase().includes(searchLower) ||
      follower.userUsername.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-3 pt-4">
      <Label className="text-base font-medium">{label}</Label>

      {followers.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or username..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10 rounded-xl"
            disabled={disabled}
          />
        </div>
      )}

      {loadingFollowers ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading followers...</span>
        </div>
      ) : followers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No followers found. Share your profile to get followers!</p>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4 space-y-2">
          {filteredFollowers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No users found matching &quot;{searchTerm}&quot;</p>
            </div>
          ) : (
            filteredFollowers.map((follower) => (
              <div
                key={follower.userId}
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 ${
                  disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() => !disabled && onToggle(follower.userId)}
              >
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(follower.userId)}
                  onChange={() => !disabled && onToggle(follower.userId)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  onClick={(e) => e.stopPropagation()}
                  disabled={disabled}
                />
                <div className="relative w-10 h-10 flex-shrink-0">
                  {follower.userAvatar && follower.userAvatar !== "" ? (
                    <Image
                      src={follower.userAvatar}
                      alt={follower.userName}
                      fill
                      className="object-cover rounded-full"
                      sizes="40px"
                    />
                  ) : (
                    <div className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <FaUserLarge className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{follower.userName}</p>
                  <p className="text-sm text-gray-600 truncate">@{follower.userUsername}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedUserIds.length > 0 && (
        <div className="mt-4">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Selected ({selectedUserIds.length})
          </Label>
          <p className="text-sm text-gray-600 mb-2">{subLabel}</p>
          <div className="flex flex-wrap gap-2">
            {selectedUserIds.map((id) => {
              const person = followers.find((f) => f.userId === id)
              return person ? (
                <div
                  key={id}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  <span>{person.userName}</span>
                  <button
                    type="button"
                    onClick={() => !disabled && onToggle(id)}
                    className="text-gray-500 hover:text-gray-700 ml-1"
                    disabled={disabled}
                  >
                    ×
                  </button>
                </div>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { removeBlockedUser } from "@/lib/actions/user.actions"
import { toast } from "sonner"

export default function UnblockUserButton({
  userId,
  blockedUserId,
  className = "",
}: {
  userId: string
  blockedUserId: string
  className?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUnblock = async () => {
    if (!confirm("Unblock this user?")) return

    setLoading(true)
    try {
      await removeBlockedUser(userId, blockedUserId)
      toast.success("User unblocked")
      router.refresh()
    } catch (error) {
      console.error("Error unblocking user:", error)
      toast.error("Failed to unblock user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleUnblock}
      disabled={loading}
      variant="outline"
      className={`bg-gray-900 text-white hover:bg-gray-800 hover:text-white cursor-pointer flex justify-center items-center w-full p-2 ${className}`}
    >
      {loading ? "Unblocking..." : "Unblock"}
    </Button>
  )
}

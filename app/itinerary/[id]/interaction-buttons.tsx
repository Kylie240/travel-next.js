"use client"

import { useEffect, useState } from "react"
import createClient from "@/utils/supabase/client"
import LikeElement from "./like-element"
import BookmarkElement from "@/components/ui/bookmark-element"

export function InteractionButtons({ 
  itineraryId, 
  initialIsLiked, 
  initialIsSaved 
}: { 
  itineraryId: string
  initialIsLiked?: boolean
  initialIsSaved?: boolean
}) {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id)
      setLoading(false)
    }

    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUserId(session?.user?.id)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Don't show buttons if no user
  if (!loading && !currentUserId) {
    return null
  }

  return (
    <div className="flex gap-2">
      <LikeElement 
        itineraryId={itineraryId} 
        currentUserId={currentUserId || ""} 
        initialIsLiked={initialIsLiked}
      />  
      <BookmarkElement 
        color="black" 
        itineraryId={itineraryId} 
        currentUserId={currentUserId || ""} 
        initialIsSaved={initialIsSaved}
      />
    </div>
  )
}

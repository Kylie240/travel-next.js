"use client"

import { useEffect, useState } from "react"
import createClient from "@/utils/supabase/client"
import LikeElement from "./like-element"
import BookmarkElement from "@/components/ui/bookmark-element"

export function InteractionButtons({ 
  itineraryId, 
  initialIsLiked, 
  initialIsSaved,
  columnLayout = false,
  color = "black",
  smallButton = false,
}: { 
  itineraryId: string
  initialIsLiked?: boolean
  initialIsSaved?: boolean  
  columnLayout?: boolean
  color?: string
  smallButton?: boolean
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
    <div className={`flex ${columnLayout ? "flex-col" : "flex-row"}`}>
      <LikeElement 
        color={color} 
        itineraryId={itineraryId} 
        currentUserId={currentUserId || ""} 
        initialIsLiked={initialIsLiked}
        smallButton={smallButton}
      />  
      <BookmarkElement 
        color={color} 
        itineraryId={itineraryId} 
        currentUserId={currentUserId || ""} 
        initialIsSaved={initialIsSaved}
        smallButton={smallButton}
      />
    </div>
  )
}

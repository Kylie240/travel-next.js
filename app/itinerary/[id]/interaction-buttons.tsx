"use client"

import { useEffect, useState } from "react"
import createClient from "@/utils/supabase/client"
import LikeElement from "./like-element"
import BookmarkElement from "@/components/ui/bookmark-element"
import { FileDown } from "lucide-react"
import { exportItineraryToPDF } from "@/lib/utils/pdf-export"
import { toast } from "sonner"
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum"

export function InteractionButtons({ 
  itineraryId, 
  initialIsLiked, 
  initialIsSaved,
  itineraryStatus 
}: { 
  itineraryId: string
  initialIsLiked?: boolean
  initialIsSaved?: boolean
  itineraryStatus?: number
}) {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [hasPdfAccess, setHasPdfAccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id)
      
      // Fetch user plan if logged in
      if (user?.id) {
        const { data: planData } = await supabase
          .from('users_settings')
          .select('plan')
          .eq('user_id', user.id)
          .single()
        
        const plan = planData?.plan || null
        setUserPlan(plan)
        
        // Check if user has PDF access
        const planNum = typeof plan === 'string' && !isNaN(parseInt(plan)) ? parseInt(plan) : null
        const hasAccess = (planNum !== null && planNum > 1) || (typeof plan === 'string' && plan !== 'free' && plan !== '1')
        setHasPdfAccess(hasAccess && itineraryStatus === ItineraryStatusEnum.published && plan !== "free")
      }
      
      setLoading(false)
    }

    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUserId(session?.user?.id)
      if (session?.user?.id) {
        // Fetch user plan on auth change
        supabase
          .from('users_settings')
          .select('plan')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: planData }) => {
            const plan = planData?.plan || null
            setUserPlan(plan)
            const planNum = typeof plan === 'string' && !isNaN(parseInt(plan)) ? parseInt(plan) : null
            const hasAccess = (planNum !== null && planNum > 1) || (typeof plan === 'string' && plan !== 'free' && plan !== '1')
            setHasPdfAccess(hasAccess && itineraryStatus === ItineraryStatusEnum.published)
          })
      } else {
        setUserPlan(null)
        setHasPdfAccess(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, itineraryStatus])

  const handlePdfExport = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' })
      await exportItineraryToPDF(itineraryId)
      toast.success('PDF exported successfully', { id: 'pdf-export' })
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Failed to export PDF', { id: 'pdf-export' })
    }
  }

  // Don't show buttons if no user
  if (!loading && !currentUserId) {
    return null
  }

  return (
    <div className="flex">
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
      {hasPdfAccess && (
        <FileDown 
          size={35}
          className="transition-colors cursor-pointer h-8 w-8 p-2 text-black hover:bg-gray-100 rounded-lg"
          onClick={handlePdfExport}
        />
      )}
    </div>
  )
}

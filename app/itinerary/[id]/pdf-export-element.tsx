"use client"

import React, { useState, useEffect } from 'react'
import { FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { exportItineraryToPDF } from '@/lib/utils/pdf-export'
import { ItineraryStatusEnum } from '@/enums/itineraryStatusEnum'
import createClient from '@/utils/supabase/client'

const PdfExportElement = ({ 
  itineraryId, 
  itineraryStatus,
  smallButton = false 
}: { 
  itineraryId: string
  itineraryStatus?: number
  smallButton?: boolean 
}) => {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [hasPdfAccess, setHasPdfAccess] = useState(false)
  const [loading, setLoading] = useState(true)
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
      } else {
        setHasPdfAccess(false)
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
            setHasPdfAccess(hasAccess && itineraryStatus === ItineraryStatusEnum.published && plan !== "free")
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
    e.preventDefault()
    e.stopPropagation()
    
    if (!hasPdfAccess) {
      return
    }
    
    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' })
      await exportItineraryToPDF(itineraryId)
      toast.success('PDF exported successfully', { id: 'pdf-export' })
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Failed to export PDF', { id: 'pdf-export' })
    }
  }

  // Don't show button if user doesn't have access
  if (loading || !hasPdfAccess) {
    return null
  }

  return (
    <button 
      onClick={handlePdfExport}
      className={`${smallButton ? 'h-4 w-4' : 'h-10 w-10 hover:bg-gray-100 p-2'} cursor-pointer rounded-lg flex items-center justify-center transition-colors`}
    >
      <FileDown size={24} />
    </button>
  )
}

export default PdfExportElement


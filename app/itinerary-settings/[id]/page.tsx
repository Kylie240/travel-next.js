import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ItinerarySettingsContent } from "./settings-content"
import { getItineraryById } from "@/lib/actions/itinerary.actions"
import { getUserSettingsById } from "@/lib/actions/user.actions"
import createClient from "@/utils/supabase/server"
import { Itinerary } from "@/types/itinerary"

// Prevent page from being statically cached
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ItinerarySettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const paramsValue = await params

  if (!user) {
    redirect('/login')
  }

  const [itinerary, userSettings] = await Promise.all([
    getItineraryById(paramsValue.id) as Promise<Itinerary>,
    getUserSettingsById()
  ])

  if (!itinerary) {
    redirect('/not-found')
  }

  // Only the creator can access settings
  if (itinerary.creatorId !== user.id) {
    redirect('/not-authorized')
  }

  const userPlan = userSettings?.plan || 'free'

  return (
    <ItinerarySettingsContent 
      itinerary={itinerary}
      userId={user.id}
      userPlan={userPlan}
    />
  )
}


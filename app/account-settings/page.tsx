import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SettingsContent } from "./settings-content"
import { getUserDataById, getUserSettingsById } from "@/lib/actions/user.actions"
import { getUserStatsById } from "@/lib/actions/user.actions"
import createClient from "@/utils/supabase/server"

// Prevent page from being statically cached
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AccountSettingsPage({ searchParams }: { searchParams: { tab: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/')
  // }
  const userData = await getUserDataById()
  const userStats = await getUserStatsById()
  const userSettings = await getUserSettingsById()

  return (
    <SettingsContent 
      initialUser={user}
      userData={userData}
      userStats={userStats}
      searchParams={searchParams}
      userSettings={userSettings}
    />
  )
}
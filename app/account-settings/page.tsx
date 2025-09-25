import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SettingsContent } from "./settings-content"
import { getUserDataById, getUserSettingsById } from "@/lib/actions/user.actions"
import { getUserStatsById } from "@/lib/actions/user.actions"

export default async function AccountSettingsPage({ searchParams }: { searchParams: { tab: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }
  const userData = await getUserDataById(user.id)
  const userStats = await getUserStatsById(user.id)
  const userSettings = await getUserSettingsById(user.id)

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
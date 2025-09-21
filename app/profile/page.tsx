import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ProfileContent } from "./profile-content"
import { getUserDataById } from "@/lib/actions/user.actions"

export default async function ProfilePage({ searchParams }: { searchParams: { tab: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const userData = await getUserDataById(user.id)

  return (
    <ProfileContent 
      initialUser={user}
      userData={userData}
      searchParams={searchParams}
    />
  )
}
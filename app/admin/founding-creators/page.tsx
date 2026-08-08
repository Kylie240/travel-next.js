import { redirect } from "next/navigation"
import createClient from "@/utils/supabase/server"
import {
  countActiveFoundingCreators,
  isFoundingAdmin,
  listFoundingCreatorApplications,
} from "@/lib/founding-creator"
import { FOUNDING_CREATOR_CAP } from "@/lib/founding-creator/constants"
import { FoundingAdminClient } from "./admin-client"

export const dynamic = "force-dynamic"

export default async function FoundingCreatorsAdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?mode=login")
  }
  if (!isFoundingAdmin(user)) {
    redirect("/")
  }

  const [applications, activeCount] = await Promise.all([
    listFoundingCreatorApplications("all"),
    countActiveFoundingCreators(),
  ])

  return (
    <div className="min-h-screen bg-gray-50 py-10 md:py-14">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Founding creators
        </h1>
        <p className="mt-2 text-gray-600">
          Review claims that passed the automated checklist. Approve to grant Pro
          for one year (max {FOUNDING_CREATOR_CAP}).
        </p>
        <div className="mt-8">
          <FoundingAdminClient
            initialApplications={applications}
            activeCount={activeCount}
            cap={FOUNDING_CREATOR_CAP}
          />
        </div>
      </div>
    </div>
  )
}

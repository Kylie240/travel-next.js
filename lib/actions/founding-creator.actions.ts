"use server"

import { revalidatePath } from "next/cache"
import createClient from "@/utils/supabase/server"
import {
  approveFoundingCreator,
  claimFoundingCreator,
  evaluateFoundingCreatorEligibility,
  getMyFoundingCreatorState,
  isFoundingAdmin,
  listFoundingCreatorApplications,
  rejectFoundingCreator,
  countActiveFoundingCreators,
} from "@/lib/founding-creator"
import type { FoundingCreatorStatus } from "@/lib/founding-creator/constants"

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  return user
}

async function requireAdmin() {
  const user = await requireUser()
  if (!isFoundingAdmin(user)) {
    throw new Error("Not authorized")
  }
  return user
}

export async function getFoundingCreatorEligibilityAction() {
  const user = await requireUser()
  return evaluateFoundingCreatorEligibility(user.id)
}

export async function getMyFoundingCreatorStateAction() {
  const user = await requireUser()
  return getMyFoundingCreatorState(user.id)
}

export async function claimFoundingCreatorAction() {
  try {
    const user = await requireUser()
    const result = await claimFoundingCreator(user.id)
    if (result.success) {
      revalidatePath("/become-a-creator")
      revalidatePath("/admin/founding-creators")
    }
    return result
  } catch (err) {
    console.error("claimFoundingCreatorAction:", err)
    const message =
      err instanceof Error && err.message === "Not authenticated"
        ? "Please log in again to claim."
        : "Could not submit application. Try again."
    return { success: false, error: message }
  }
}

export async function listFoundingApplicationsAction(
  status: FoundingCreatorStatus | "all" = "pending"
) {
  await requireAdmin()
  const [applications, activeCount] = await Promise.all([
    listFoundingCreatorApplications(status),
    countActiveFoundingCreators(),
  ])
  return { applications, activeCount }
}

export async function approveFoundingCreatorAction(
  targetUserId: string,
  customMessage?: string
) {
  const admin = await requireAdmin()
  const result = await approveFoundingCreator({
    targetUserId,
    adminUserId: admin.id,
    customMessage,
  })
  if (result.success) {
    revalidatePath("/admin/founding-creators")
    revalidatePath("/become-a-creator")
    revalidatePath("/plans")
  }
  return result
}

export async function rejectFoundingCreatorAction(
  targetUserId: string,
  customMessage?: string
) {
  const admin = await requireAdmin()
  const result = await rejectFoundingCreator({
    targetUserId,
    adminUserId: admin.id,
    reason: customMessage,
    customMessage,
  })
  if (result.success) {
    revalidatePath("/admin/founding-creators")
    revalidatePath("/become-a-creator")
  }
  return result
}

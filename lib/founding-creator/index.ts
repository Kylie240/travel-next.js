import "server-only"

import type { User } from "@supabase/supabase-js"
import { createClient as createAdminClient } from "@/utils/supabase/server-admin"
import createClient from "@/utils/supabase/server"
import { ItineraryStatusEnum, viewPermissionEnum } from "@/enums/itineraryStatusEnum"
import { detectItinerarySpam } from "@/lib/moderation/itinerary-spam"
import {
  sendFoundingCreatorAdminClaimNotificationEmail,
  sendFoundingCreatorApprovedEmail,
  sendFoundingCreatorClaimConfirmationEmail,
  sendFoundingCreatorRejectedEmail,
} from "@/lib/email"
import { getSiteUrl } from "@/lib/site-url"
import {
  FOUNDING_BIO_MIN_LENGTH,
  FOUNDING_CREATOR_CAP,
  FOUNDING_DESCRIPTION_MIN_LENGTH,
  FOUNDING_MIN_DURATION_DAYS,
  FOUNDING_PRO_DURATION_MS,
  FOUNDING_TITLE_MIN_LENGTH,
  type EligibilityResult,
  type FoundingCreatorStatus,
} from "./constants"

function normalizeStatus(value: unknown): FoundingCreatorStatus {
  if (
    value === "pending" ||
    value === "active" ||
    value === "rejected" ||
    value === "expired"
  ) {
    return value
  }
  return null
}

export function getFoundingAdminEmails(): string[] {
  const raw =
    process.env.FOUNDING_CREATOR_ADMIN_EMAILS ||
    process.env.FOUNDING_CREATOR_ADMIN_EMAIL ||
    ""
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isFoundingAdmin(user: User | null | undefined): boolean {
  const email = user?.email?.trim().toLowerCase()
  if (!email) return false
  return getFoundingAdminEmails().includes(email)
}

export function hasActiveStripePro(
  stripeStatus: string | null | undefined
): boolean {
  const s = (stripeStatus || "").toLowerCase()
  return s === "active" || s === "trialing"
}

export function isFoundingProActive(input: {
  founding_creator_status?: string | null
  founding_creator_expires_at?: string | null
}): boolean {
  const status = normalizeStatus(input.founding_creator_status)
  if (status !== "active" || !input.founding_creator_expires_at) return false
  const expires = new Date(input.founding_creator_expires_at).getTime()
  return Number.isFinite(expires) && expires > Date.now()
}

export async function getFoundingFieldsForUser(userId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from("users_settings")
    .select(
      "plan, founding_creator_status, founding_creator_expires_at, stripe_subscription_status"
    )
    .eq("user_id", userId)
    .maybeSingle()
  return data
}

/**
 * Plan to store after a Stripe subscription status change.
 * Keeps founding Pro intact when Stripe cancels/expires.
 */
export async function resolvePlanAfterStripeChange(
  userId: string,
  stripeStatus: string
): Promise<"pro" | "free"> {
  if (hasActiveStripePro(stripeStatus)) return "pro"

  const fields = await getFoundingFieldsForUser(userId)
  if (
    isFoundingProActive({
      founding_creator_status: fields?.founding_creator_status as string | null,
      founding_creator_expires_at: fields?.founding_creator_expires_at as
        | string
        | null,
    })
  ) {
    return "pro"
  }

  return "free"
}

/** Prefer Stripe Pro; else founding grant if still within expiry. */
export function resolveEffectivePlan(input: {
  plan?: string | null
  stripe_subscription_status?: string | null
  founding_creator_status?: string | null
  founding_creator_expires_at?: string | null
}): "pro" | "free" {
  if (hasActiveStripePro(input.stripe_subscription_status)) {
    return "pro"
  }

  if (
    isFoundingProActive({
      founding_creator_status: input.founding_creator_status,
      founding_creator_expires_at: input.founding_creator_expires_at,
    })
  ) {
    return "pro"
  }

  return "free"
}

export async function countActiveFoundingCreators(): Promise<number> {
  try {
    const admin = createAdminClient()
    const nowIso = new Date().toISOString()
    const { count, error } = await admin
      .from("users_settings")
      .select("*", { count: "exact", head: true })
      .eq("founding_creator_status", "active")
      .gt("founding_creator_expires_at", nowIso)

    if (error) {
      // Missing migration / column → treat as empty cohort (not full).
      console.error(
        "countActiveFoundingCreators:",
        error.message,
        "(returning 0 — apply 20260808_founding_creators.sql if columns are missing)"
      )
      return 0
    }
    return count ?? 0
  } catch (err) {
    console.error("countActiveFoundingCreators failed:", err)
    return 0
  }
}

async function findQualityItineraryId(userId: string): Promise<string | null> {
  const admin = createAdminClient()

  const { data: itineraries, error } = await admin
    .from("itineraries")
    .select("id, title, short_description, main_image, duration, detailed_overview")
    .eq("creator_id", userId)
    .eq("status", ItineraryStatusEnum.published)
    .eq("view_permission", viewPermissionEnum.public)
    .eq("is_searchable", true)
    .limit(50)

  if (error || !itineraries?.length) {
    if (error) console.error("findQualityItineraryId:", error.message)
    return null
  }

  const ids = itineraries.map((row) => String(row.id))
  const { data: dayRows } = await admin
    .from("itinerary_days")
    .select("itinerary_id, title, description, notes")
    .in("itinerary_id", ids)

  const daysByItinerary = new Map<string, typeof dayRows>()
  for (const day of dayRows || []) {
    const key = String(day.itinerary_id)
    const arr = daysByItinerary.get(key) || []
    arr.push(day)
    daysByItinerary.set(key, arr)
  }

  for (const row of itineraries) {
    const id = String(row.id)
    const title = String(row.title || "").trim()
    const shortDescription = String(row.short_description || "").trim()
    const mainImage = String(row.main_image || "").trim()
    const duration = Number(row.duration) || 0
    const days = daysByItinerary.get(id) || []

    if (title.length < FOUNDING_TITLE_MIN_LENGTH) continue
    if (shortDescription.length < FOUNDING_DESCRIPTION_MIN_LENGTH) continue
    if (!mainImage) continue
    if (duration < FOUNDING_MIN_DURATION_DAYS && days.length < FOUNDING_MIN_DURATION_DAYS) {
      continue
    }

    const spam = detectItinerarySpam({
      title,
      shortDescription,
      detailedOverview: String(row.detailed_overview || ""),
      days: days.map((d) => ({
        title: d?.title,
        description: d?.description,
        notes: d?.notes,
      })),
    })
    if (spam.isSpam) continue

    return id
  }

  return null
}

export async function evaluateFoundingCreatorEligibility(
  userId: string
): Promise<EligibilityResult> {
  const admin = createAdminClient()
  const activeCount = await countActiveFoundingCreators()
  const slotsRemaining = Math.max(0, FOUNDING_CREATOR_CAP - activeCount)

  const [{ data: profile }, { data: settings }] = await Promise.all([
    admin
      .from("users")
      .select("name, username, avatar, bio")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("users_settings")
      .select(
        "founding_creator_status, founding_creator_expires_at, founding_creator_reject_reason"
      )
      .eq("user_id", userId)
      .maybeSingle(),
  ])

  const status = normalizeStatus(settings?.founding_creator_status)
  const missingProfile: string[] = []
  const name = String(profile?.name || "").trim()
  const username = String(profile?.username || "").trim()
  const avatar = String(profile?.avatar || "").trim()
  const bio = String(profile?.bio || "").trim()

  if (!name || name.length < 2) missingProfile.push("name")
  if (!username || username.length < 3) missingProfile.push("username")
  if (!avatar) missingProfile.push("avatar")
  if (bio.length < FOUNDING_BIO_MIN_LENGTH) {
    missingProfile.push(`bio (at least ${FOUNDING_BIO_MIN_LENGTH} characters)`)
  }

  const qualityItineraryId = await findQualityItineraryId(userId)
  const reasons: string[] = []

  if (status === "active") {
    reasons.push("You are already an active founding creator.")
  }
  if (status === "pending") {
    reasons.push("Your application is already pending admin review.")
  }
  if (slotsRemaining <= 0 && status !== "active" && status !== "pending") {
    reasons.push("The founding creator cohort is full (100 spots).")
  }
  if (missingProfile.length) {
    reasons.push(
      `Complete your profile: ${missingProfile.join(", ")}.`
    )
  }
  if (!qualityItineraryId) {
    reasons.push(
      "Publish at least one quality public itinerary (cover image, clear title & description, 2+ days, not spam)."
    )
  }

  const eligible =
    status !== "active" &&
    status !== "pending" &&
    slotsRemaining > 0 &&
    missingProfile.length === 0 &&
    Boolean(qualityItineraryId)

  return {
    eligible,
    reasons,
    missingProfile,
    qualityItineraryId,
    activeCount,
    slotsRemaining,
    status,
  }
}

export async function claimFoundingCreator(userId: string): Promise<{
  success: boolean
  error?: string
  status?: FoundingCreatorStatus
}> {
  const eligibility = await evaluateFoundingCreatorEligibility(userId)
  if (!eligibility.eligible) {
    return {
      success: false,
      error: eligibility.reasons[0] || "Not eligible",
      status: eligibility.status,
    }
  }

  const admin = createAdminClient()
  const now = new Date().toISOString()

  // Re-check slots inside update window
  const activeCount = await countActiveFoundingCreators()
  if (activeCount >= FOUNDING_CREATOR_CAP) {
    return { success: false, error: "The founding creator cohort is full." }
  }

  const { data, error } = await admin
    .from("users_settings")
    .update({
      founding_creator_status: "pending",
      founding_creator_applied_at: now,
      founding_creator_reject_reason: null,
      founding_creator_reviewed_at: null,
      founding_creator_reviewed_by: null,
    })
    .eq("user_id", userId)
    .select("user_id")

  if (error) {
    console.error("claimFoundingCreator:", error.message)
    return { success: false, error: "Could not submit application. Try again." }
  }

  if (!data?.length) {
    const { error: insertError } = await admin.from("users_settings").insert({
      user_id: userId,
      is_private: false,
      email_notifications: true,
      founding_creator_status: "pending",
      founding_creator_applied_at: now,
    })
    if (insertError) {
      console.error("claimFoundingCreator insert:", insertError.message)
      return { success: false, error: "Could not submit application. Try again." }
    }
  }

  await notifyFoundingClaimSubmitted(userId)

  return { success: true, status: "pending" }
}

async function loadUserForEmail(userId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from("users")
    .select("email, name, username")
    .eq("id", userId)
    .maybeSingle()
  return data
}

async function notifyFoundingClaimSubmitted(userId: string) {
  const person = await loadUserForEmail(userId)
  const email = person?.email?.trim()
  if (!email) {
    console.warn("notifyFoundingClaimSubmitted: no email for", userId)
    return
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || getSiteUrl()
  const claimNote = process.env.FOUNDING_CREATOR_CLAIM_EMAIL_NOTE?.trim() || null
  const applicant = {
    email,
    name: (person?.name as string) || null,
    username: (person?.username as string) || null,
    userId,
  }

  await Promise.allSettled([
    sendFoundingCreatorClaimConfirmationEmail(applicant, baseUrl, claimNote),
    sendFoundingCreatorAdminClaimNotificationEmail(
      getFoundingAdminEmails(),
      applicant,
      baseUrl
    ),
  ])
}

export async function approveFoundingCreator(input: {
  targetUserId: string
  adminUserId: string
  customMessage?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient()
  const activeCount = await countActiveFoundingCreators()
  if (activeCount >= FOUNDING_CREATOR_CAP) {
    return { success: false, error: "Cohort is full (100 active founding creators)." }
  }

  const { data: settings } = await admin
    .from("users_settings")
    .select("founding_creator_status")
    .eq("user_id", input.targetUserId)
    .maybeSingle()

  const status = normalizeStatus(settings?.founding_creator_status)
  if (status === "active") {
    return { success: false, error: "User is already an active founding creator." }
  }
  if (status !== "pending") {
    return { success: false, error: "User has no pending application." }
  }

  // Re-validate eligibility at approve time (profile / itinerary may have changed)
  const eligibility = await evaluateFoundingCreatorEligibility(input.targetUserId)
  // evaluate treats pending as not eligible — check pieces directly
  if (eligibility.missingProfile.length || !eligibility.qualityItineraryId) {
    return {
      success: false,
      error:
        eligibility.reasons.find((r) => !r.includes("pending")) ||
        "Applicant no longer meets profile/itinerary requirements.",
    }
  }

  const now = new Date()
  const expires = new Date(now.getTime() + FOUNDING_PRO_DURATION_MS)

  const { data, error } = await admin
    .from("users_settings")
    .update({
      founding_creator_status: "active",
      founding_creator_granted_at: now.toISOString(),
      founding_creator_expires_at: expires.toISOString(),
      founding_creator_reviewed_at: now.toISOString(),
      founding_creator_reviewed_by: input.adminUserId,
      founding_creator_reject_reason: null,
      plan: "pro",
    })
    .eq("user_id", input.targetUserId)
    .eq("founding_creator_status", "pending")
    .select("user_id")

  if (error) {
    console.error("approveFoundingCreator:", error.message)
    return { success: false, error: "Approve failed. Try again." }
  }

  if (!data?.length) {
    return { success: false, error: "Application was not pending (or already reviewed)." }
  }

  const person = await loadUserForEmail(input.targetUserId)
  if (person?.email) {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || getSiteUrl()
    await sendFoundingCreatorApprovedEmail(
      {
        email: String(person.email),
        name: (person.name as string) || null,
        username: (person.username as string) || null,
      },
      baseUrl,
      {
        customMessage: input.customMessage,
        expiresAt: expires.toISOString(),
      }
    ).catch((err) => console.error("approve email failed:", err))
  }

  return { success: true }
}

export async function rejectFoundingCreator(input: {
  targetUserId: string
  adminUserId: string
  reason?: string
  customMessage?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient()
  const now = new Date().toISOString()
  const message =
    (input.customMessage || input.reason || "").trim() || null

  const { data, error } = await admin
    .from("users_settings")
    .update({
      founding_creator_status: "rejected",
      founding_creator_reviewed_at: now,
      founding_creator_reviewed_by: input.adminUserId,
      founding_creator_reject_reason: message,
    })
    .eq("user_id", input.targetUserId)
    .eq("founding_creator_status", "pending")
    .select("user_id")

  if (error) {
    console.error("rejectFoundingCreator:", error.message)
    return { success: false, error: "Reject failed. Try again." }
  }

  if (!data?.length) {
    return { success: false, error: "Application was not pending (or already reviewed)." }
  }

  const person = await loadUserForEmail(input.targetUserId)
  if (person?.email) {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || getSiteUrl()
    await sendFoundingCreatorRejectedEmail(
      {
        email: String(person.email),
        name: (person.name as string) || null,
        username: (person.username as string) || null,
      },
      baseUrl,
      message
    ).catch((err) => console.error("reject email failed:", err))
  }

  return { success: true }
}

export async function expireFoundingCreators(): Promise<{
  expired: number
  downgraded: number
}> {
  const admin = createAdminClient()
  const nowIso = new Date().toISOString()

  const { data: rows, error } = await admin
    .from("users_settings")
    .select("user_id, stripe_subscription_status")
    .eq("founding_creator_status", "active")
    .lte("founding_creator_expires_at", nowIso)

  if (error) {
    console.error("expireFoundingCreators list:", error.message)
    return { expired: 0, downgraded: 0 }
  }

  let expired = 0
  let downgraded = 0

  for (const row of rows || []) {
    const userId = String(row.user_id)
    const keepPro = hasActiveStripePro(row.stripe_subscription_status as string)
    const patch: Record<string, unknown> = {
      founding_creator_status: "expired",
    }
    if (!keepPro) {
      patch.plan = "free"
      downgraded += 1
    }

    const { error: updateError } = await admin
      .from("users_settings")
      .update(patch)
      .eq("user_id", userId)
      .eq("founding_creator_status", "active")

    if (updateError) {
      console.error("expireFoundingCreators update:", userId, updateError.message)
      continue
    }
    expired += 1
  }

  return { expired, downgraded }
}

export async function listFoundingCreatorApplications(status: FoundingCreatorStatus | "all" = "pending") {
  const admin = createAdminClient()
  let query = admin
    .from("users_settings")
    .select(
      "user_id, founding_creator_status, founding_creator_applied_at, founding_creator_granted_at, founding_creator_expires_at, founding_creator_reject_reason, plan, stripe_subscription_status"
    )
    .not("founding_creator_status", "is", null)
    .order("founding_creator_applied_at", { ascending: false })
    .limit(200)

  if (status && status !== "all") {
    query = query.eq("founding_creator_status", status)
  }

  const { data: settingsRows, error } = await query
  if (error) {
    console.error("listFoundingCreatorApplications:", error.message)
    return []
  }

  const ids = (settingsRows || []).map((r) => String(r.user_id))
  if (!ids.length) return []

  const { data: users } = await admin
    .from("users")
    .select("id, name, username, email, avatar, bio")
    .in("id", ids)

  const userById = new Map((users || []).map((u) => [String(u.id), u]))

  return (settingsRows || []).map((row) => {
    const user = userById.get(String(row.user_id))
    return {
      userId: String(row.user_id),
      status: normalizeStatus(row.founding_creator_status),
      appliedAt: row.founding_creator_applied_at as string | null,
      grantedAt: row.founding_creator_granted_at as string | null,
      expiresAt: row.founding_creator_expires_at as string | null,
      rejectReason: row.founding_creator_reject_reason as string | null,
      plan: row.plan as string | null,
      stripeStatus: row.stripe_subscription_status as string | null,
      name: (user?.name as string) || "",
      username: (user?.username as string) || "",
      email: (user?.email as string) || "",
      avatar: (user?.avatar as string) || "",
      bio: (user?.bio as string) || "",
    }
  })
}

/** Server helper: current user's founding snapshot for UI. */
export async function getMyFoundingCreatorState(userId: string) {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from("users_settings")
    .select(
      "founding_creator_status, founding_creator_applied_at, founding_creator_granted_at, founding_creator_expires_at, founding_creator_reject_reason, plan, stripe_subscription_status"
    )
    .eq("user_id", userId)
    .maybeSingle()

  const eligibility = await evaluateFoundingCreatorEligibility(userId)

  return {
    status: normalizeStatus(settings?.founding_creator_status),
    appliedAt: settings?.founding_creator_applied_at as string | null,
    grantedAt: settings?.founding_creator_granted_at as string | null,
    expiresAt: settings?.founding_creator_expires_at as string | null,
    rejectReason: settings?.founding_creator_reject_reason as string | null,
    plan: settings?.plan as string | null,
    eligibility,
  }
}

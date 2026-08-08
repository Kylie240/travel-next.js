import "server-only"

export const FOUNDING_CREATOR_CAP = 100
export const FOUNDING_PRO_DURATION_MS = 365 * 24 * 60 * 60 * 1000

export const FOUNDING_BIO_MIN_LENGTH = 40
export const FOUNDING_TITLE_MIN_LENGTH = 10
export const FOUNDING_DESCRIPTION_MIN_LENGTH = 40
export const FOUNDING_MIN_DURATION_DAYS = 2

export type FoundingCreatorStatus =
  | "pending"
  | "active"
  | "rejected"
  | "expired"
  | null

export type EligibilityReason =
  | "not_authenticated"
  | "profile_incomplete"
  | "no_quality_itinerary"
  | "cohort_full"
  | "already_pending"
  | "already_active"
  | "already_expired_reapply_ok"

export type EligibilityResult = {
  eligible: boolean
  reasons: string[]
  missingProfile: string[]
  qualityItineraryId: string | null
  activeCount: number
  slotsRemaining: number
  status: FoundingCreatorStatus
}

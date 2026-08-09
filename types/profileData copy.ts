export interface UserSettings {
  is_private: boolean
  email_notifications: boolean
  plan: string
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_subscription_status: string
  stripe_subscription_created_date: Date
  /** When cancel is scheduled/complete; null while actively renewing. */
  stripe_subscription_ends_at: Date | null
  founding_creator_status?: string | null
  founding_creator_expires_at?: string | Date | null
  founding_creator_applied_at?: string | Date | null
  founding_creator_granted_at?: string | Date | null
  founding_creator_reject_reason?: string | null
}
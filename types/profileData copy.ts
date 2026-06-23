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
}
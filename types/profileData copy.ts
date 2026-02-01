export interface UserSettings {
  is_private: boolean
  email_notifications: boolean
  plan: string
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_subscription_status: string
  stripe_subscription_created_date: Date
}
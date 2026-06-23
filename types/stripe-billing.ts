/** Live Stripe fields for account settings (built server-side). */
export type StripeBillingSummary = {
  billingEmail: string | null;
  /**
   * Milliseconds for the next charge (upcoming invoice `next_payment_attempt` when
   * available, else preview `period_end`, else subscription current period end).
   */
  currentPeriodEndMs: number | null;
  /** e.g. "$6.00 per month" */
  priceLabel: string | null;
};

export type FilterOptions = {
  destination?: string
  duration?: string
  durationMin?: number
  durationMax?: number
  continents?: string[]
  activityTags?: string[] | number[]
  itineraryTags?: string[] | number[]
  countries?: string[]
  /** Label from explore filters, e.g. "Budget Friendly" */
  budget?: string
  budgetMin?: number
  budgetMax?: number
  sort?: string
  quickFilter?: string
  q?: string
}

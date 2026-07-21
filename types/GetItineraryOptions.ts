import type { FilterOptions } from "@/types/FilterOptions"

export type GetItineraryOptions = {
  filters?: FilterOptions
  pagination?: {
    pageSize?: number
    page?: number
  }
}

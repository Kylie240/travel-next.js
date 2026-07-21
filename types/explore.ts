import type { ExplorePageDto } from "@/dtos/ExplorePageDto"
import type { GetItineraryOptions } from "@/types/GetItineraryOptions"

export type ExploreItinerariesResult = {
  data: ExplorePageDto[]
  total: number
  totalPages: number
  currentPage: number
}

export type { GetItineraryOptions }

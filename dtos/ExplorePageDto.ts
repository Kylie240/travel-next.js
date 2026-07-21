export interface ExplorePageDto {
  id: string
  title: string
  slug?: string | null
  duration: number
  shortDescription: string
  mainImage: string
  countries: string[]
  cities: string[]
  itineraryTags: string[]
  activityTags: string[]
  featuredCategories: string[]
  views: number
  rating: number | null
  price: number | null
  likes: number
  creatorId: string
  creatorName: string
  creatorImage: string
}

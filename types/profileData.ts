export interface ProfileData {
  userId: string
  name: string
  username: string
  bio: string
  totalItineraries: number
  followersCount: number
  followingCount: number
  isFollowing: boolean
  avatar: string
  isPrivate?: boolean
  facebook?: string
  instagram?: string
  twitter?: string
  pinterest?: string
  tiktok?: string
  youtube?: string
}
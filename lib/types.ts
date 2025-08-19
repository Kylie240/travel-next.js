import { User } from "@supabase/supabase-js"

export interface UserProfile extends Partial<User> {
  username?: string
  website?: string
  title?: string
  location?: string
  bio?: string
  social?: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
  stats?: {
    trips: number
    followers: number
    following: number
    likes: number
  }
  travelPreferences?: {
    interests: string[]
    travelStyle: string[]
    languages: string[]
    visitedCountries: string[]
  }
}

export interface UserData extends User {
  username?: string
  title?: string
  location: string
  bio: string
  isFollowing?: boolean
  image?: string
  joined: string
  email: string
  social: {
    facebook: string
    instagram: string
    twitter: string
  }
  stats: {
    trips: number
    followers: number
    following: number
    likes: number
  }
  travelPreferences: {
    interests: string[]
    travelStyle: string[]
    languages: string[]
    visitedCountries: string[]
  }
} 
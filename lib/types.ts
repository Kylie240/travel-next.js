import { User as FirebaseUser } from "firebase/auth"

export interface UserProfile extends Partial<FirebaseUser> {
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

export interface UserData extends FirebaseUser {
  username?: string
  title?: string
  location: string
  bio: string
  isFollowing?: boolean
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
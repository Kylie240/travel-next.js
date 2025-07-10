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

export interface UserData {
  id: string
  name: string
  username?: string
  title?: string
  image: string
  location: string
  joined: string
  bio: string
  website: string
  email: string | null
  social: {
    facebook: string
    instagram: string
    twitter: string
  }
  achievements: {
    title: string
    description: string
    icon: any // Replace with proper icon type if available
  }[]
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
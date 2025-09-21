import { User } from "@supabase/supabase-js"

export interface UserData {
  id: string
  name: string
  email: string
  username: string
  title: string
  avatar: string
  location: string
  createdAt: string
  updatedAt: string
  bio: string
  website: string
  stats: {
    trips: number
    followers: number
    following: number
    likes: number
  }
  isFollowing: boolean
}
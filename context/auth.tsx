"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient, Session, User } from "@supabase/auth-helpers-nextjs"

type AuthContextType = {
  currentUser: User | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClientComponentClient()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error) {
        setCurrentUser(data.user)
      }
    })

    // Subscribe to auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    setSession(currentSession.data.session);
  }

  return (
    <AuthContext.Provider 
    value={{ 
        currentUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
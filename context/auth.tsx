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
    console.log(currentSession);
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


// "use client"

// import { createContext, useContext, useEffect, useState } from "react"
// import { ParsedToken, User } from "firebase/auth"
// import { auth } from "@/firebase/client"
// import { removeToken, setToken } from "./actions"

// type AuthContextType = {
//     currentUser: User | null,
// }

// const AuthContext = createContext<AuthContextType | null>(null)

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//     const [currentUser, setCurrentUser] = useState<User | null>(null);
//     const [customClaims, setCustomClaims] = useState<ParsedToken | null>(null);

//     useEffect(() => {
//         const unsubscribe = auth.onAuthStateChanged(async (user) => {
//             setCurrentUser(user ?? null);
//             if (user) {
//                 const tokenResult = await user.getIdTokenResult();
//                 const token = tokenResult.token;
//                 const refreshToken = await user.refreshToken;
//                 const claims = tokenResult.claims;
//                 setCustomClaims(claims ?? null);

//                 if (token && refreshToken) {
//                     await setToken({ token, refreshToken });
//                 }
//             } else {
//                 await removeToken();
//             }
//         })
//         return () => unsubscribe()
//     }, [])
    
//     return (
//         <AuthContext.Provider 
//         value={{
//             currentUser,
//         }}>
//             {children}
//         </AuthContext.Provider>
//     )
// }

// export const useAuth = () => {
//     return useContext(AuthContext)
// }
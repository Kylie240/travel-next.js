"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ParsedToken, User } from "firebase/auth"
import { auth } from "@/firebase/client"
import { removeToken, setToken } from "./actions"

type AuthContextType = {
    currentUser: User | null,
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [customClaims, setCustomClaims] = useState<ParsedToken | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setCurrentUser(user ?? null);
            if (user) {
                const tokenResult = await user.getIdTokenResult();
                const token = tokenResult.token;
                const refreshToken = await user.refreshToken;
                const claims = tokenResult.claims;
                setCustomClaims(claims ?? null);

                if (token && refreshToken) {
                    await setToken({ token, refreshToken });
                }
            } else {
                await removeToken();
            }
        })
        return () => unsubscribe()
    }, [])
    
    return (
        <AuthContext.Provider value={{
            currentUser,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
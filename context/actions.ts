"use server"

import { cookies } from "next/headers"
import { auth } from "@/firebase/server"

export const removeToken = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    cookieStore.delete("refreshToken");
}

export const setToken = async ({token, refreshToken}: {token: string, refreshToken: string}) => {
    try {
        const verifiesToken = await auth.verifyIdToken(token)
        if (verifiesToken) {
            const userRecord = await auth.getUser(verifiesToken.uid)
            if (userRecord.email === process.env.ADMIN_UID && !userRecord.customClaims?.admin) {
                auth.setCustomUserClaims(verifiesToken.uid, { admin: true })
            } 
            const cookieStore = cookies()
            cookieStore.set("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
            cookieStore.set("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
            return { success: true }
        } else {
            return;
        }
    } catch (error) {
        console.error(error)
    }
}

export const getToken = async () => {
    const token = cookies().get("token")
    const refreshToken = cookies().get("refreshToken")
    return { token, refreshToken }
}
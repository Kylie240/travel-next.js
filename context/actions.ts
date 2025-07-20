"use server"

import { cookies } from "next/headers"

export const setToken = async ({token, refreshToken}: {token: string, refreshToken: string}) => {
    cookies().set("token", token)
    cookies().set("refreshToken", refreshToken)
}

export const getToken = async () => {
    const token = cookies().get("token")
    const refreshToken = cookies().get("refreshToken")
    return { token, refreshToken }
}
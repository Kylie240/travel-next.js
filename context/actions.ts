"use server"

import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

// Helper to create a Supabase server client with cookie handling
const createClient = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies().set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          cookies().delete(name)
        },
      },
    }
  )

export const removeToken = async () => {
  const cookieStore = cookies()
  cookieStore.delete("sb-access-token")
  cookieStore.delete("sb-refresh-token")
}

export const setToken = async ({
  access_token,
  refresh_token,
}: {
  access_token: string
  refresh_token: string
}) => {
  try {
    const cookieStore = cookies()

    cookieStore.set("sb-access-token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    cookieStore.set("sb-refresh-token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error }
  }
}

export const getToken = async () => {
  const cookieStore = cookies()
  const token = cookieStore.get("sb-access-token")?.value
  const refreshToken = cookieStore.get("sb-refresh-token")?.value
  return { token, refreshToken }
}


// "use server"

// import { cookies } from "next/headers"
// import { auth } from "@/firebase/server"

// export const removeToken = async () => {
//     const cookieStore = await cookies();
//     cookieStore.delete("token");
//     cookieStore.delete("refreshToken");
// }

// export const setToken = async ({token, refreshToken}: {token: string, refreshToken: string}) => {
//     try {
//         const verifiesToken = await auth.verifyIdToken(token)
//         if (verifiesToken) {
//             const userRecord = await auth.getUser(verifiesToken.uid)
//             if (userRecord.email === process.env.ADMIN_UID && !userRecord.customClaims?.admin) {
//                 auth.setCustomUserClaims(verifiesToken.uid, { admin: true })
//             } 
//             const cookieStore = cookies()
//             cookieStore.set("token", token, {
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV === "production",
//             })
//             cookieStore.set("refreshToken", refreshToken, {
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV === "production",
//             })
//             return { success: true }
//         } else {
//             return;
//         }
//     } catch (error) {
//         console.error(error)
//     }
// }

// export const getToken = async () => {
//     const token = cookies().get("token")
//     const refreshToken = cookies().get("refreshToken")
//     return { token, refreshToken }
// }
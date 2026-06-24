import { type EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

function stringOrFirstString(item: string | string[] | null) {
  return Array.isArray(item) ? item[0] : item
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const token_hash = stringOrFirstString(searchParams.get("token_hash"))
  const type = stringOrFirstString(searchParams.get("type"))
  const next = stringOrFirstString(searchParams.get("next"))

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/login?error=auth_confirm_failed`)
  }

  const redirectPath =
    type === "recovery" ? "/auth/reset-password" : next || "/"
  const response = NextResponse.redirect(`${origin}${redirectPath}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.verifyOtp({
    type: type as EmailOtpType,
    token_hash,
  })

  if (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.redirect(`${origin}/login?error=auth_confirm_failed`)
  }

  return response
}

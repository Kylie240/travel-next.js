import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import createClient from '@/utils/supabase/server'

function stringOrFirstString(item: string | string[] | undefined) {
  return Array.isArray(item) ? item[0] : item
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next')
  
  let redirectPath = '/error'
  
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    })
    
    if (error) {
      console.error('Error verifying OTP:', error)
      // Optionally redirect to an error page with the error message
      redirectPath = '/auth/auth-code-error'
    } else {
      redirectPath = next || '/'
    }
  }
  
  return NextResponse.redirect(`${origin}${redirectPath}`)
}

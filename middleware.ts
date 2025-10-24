import { type NextRequest } from "next/server";

import updateSession from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/my-itineraries/:path*',
    '/create/:path*',
    '/saves/:path*',
  ],
};


// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
//   const supabase = createMiddlewareClient({ req, res })

//   const {
//     data: { session },
//   } = await supabase.auth.getSession()

//   // If there's no session and the user is trying to access a protected route
//   if (!session && (
//     req.nextUrl.pathname.startsWith('/my-itineraries') ||
//     req.nextUrl.pathname.startsWith('/create') ||
//     req.nextUrl.pathname.startsWith('/saves')
//   )) {
//     const redirectUrl = req.nextUrl.clone()
//     redirectUrl.pathname = '/'
//     return NextResponse.redirect(redirectUrl)
//   }

//   return res
// }

// export const config = {
//   matcher: [
//     '/my-itineraries/:path*',
//     '/create/:path*',
//     '/saves/:path*',
//   ],
// }
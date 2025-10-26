import { type NextRequest } from "next/server";

import updateSession from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/login/:path*',
    '/my-itineraries/:path*',
    '/create/:path*',
    '/saves/:path*',
    '/account-settings/:path*',
  ],
};
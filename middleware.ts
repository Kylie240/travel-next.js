import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a basic middleware example. You should adapt it to your authentication system.
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected-route)
  const path = request.nextUrl.pathname

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/create']

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  // Check if user is authenticated by looking for Firebase session cookie
  const isAuthenticated = checkAuthStatus(request)

  // If the route is protected and the user is not authenticated,
  // redirect to the home page where they can use the auth dialog
  if (isProtectedRoute && !isAuthenticated) {
    const response = NextResponse.redirect(new URL('/', request.url))
    return response
  }

  return NextResponse.next()
}

// Configure matcher for routes that need to trigger this middleware
export const config = {
  matcher: ['/dashboard/:path*', '/create/:path*']
}

// This is a placeholder function - replace with your actual auth check
function checkAuthStatus(request: NextRequest): boolean {
  // Check for Firebase Auth session cookie
  const firebaseSession = request.cookies.get('firebase-session-token')
  return !!firebaseSession
} 
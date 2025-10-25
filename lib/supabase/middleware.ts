import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Initialize Supabase server client with custom cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Re-create the response with updated cookies
          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Fetch the current authenticated user and refresh session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Refresh the session to ensure it's up to date
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;

  // Define protected routes that require authentication
  const protectedRoutes = ['/create', '/my-itineraries', '/saves', '/account-settings'];
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  // Redirect unauthenticated users from protected routes to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Prevent authenticated users from accessing the login page
  if (user && path.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
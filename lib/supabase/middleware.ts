import { NextResponse, type NextRequest } from "next/server";
import createClient from "@/utils/supabase/server";

export default async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const LOGIN_PATH = "/login";

  // Initialize Supabase server client with custom cookie handling
  const supabase = await createClient(
  );

  // Fetch the current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Redirect unauthenticated users to login, except for auth routes
  if (!user && !path.startsWith(LOGIN_PATH) && !path.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Prevent authenticated users from accessing the login page
  if (user && path.startsWith(LOGIN_PATH)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
import { NextResponse } from "next/server";
import createClient from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // Extract auth code and optional redirect path
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await createClient();

  // Exchange code for session (OAuth or email)
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // Fetch the logged-in user after session exchange
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If the user exists but hasn’t confirmed their email yet
  if (user && !user.email_confirmed_at) {
    return NextResponse.redirect(`${origin}/auth/confirm-email`);
  }

  // Otherwise, continue to intended destination
  return NextResponse.redirect(`${origin}${next}`);
}

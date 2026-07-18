import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const destination =
    type === "recovery" || next === "/auth/reset-password"
      ? "/auth/reset-password"
      : next;

  const response = NextResponse.redirect(`${origin}${destination}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isRecovery =
    type === "recovery" || destination === "/auth/reset-password";

  if (user && !user.email_confirmed_at && !isRecovery) {
    return NextResponse.redirect(`${origin}/auth/confirm-email`);
  }

  if (user?.id && user?.email) {
    // Guest checkouts may store email as buyer_email or customer_email depending on schema
    await supabase
      .from("itinerary_purchases")
      .update({ user_id: user.id })
      .is("user_id", null)
      .eq("buyer_email", user.email);

    await supabase
      .from("itinerary_purchases")
      .update({ user_id: user.id })
      .is("user_id", null)
      .eq("customer_email", user.email);
  }

  return response;
}

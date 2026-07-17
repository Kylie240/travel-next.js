import { NextResponse } from "next/server"
import { headers } from "next/headers"
import createClient from "@/utils/supabase/server"
import { stripe } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const headersList = await headers()
    const origin =
      headersList.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://journli.com"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to manage your subscription" },
        { status: 401 }
      )
    }

    const { data: settings, error } = await supabase
      .from("users_settings")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.error("Error loading Stripe customer id:", error)
      return NextResponse.json(
        { error: "Failed to load billing settings" },
        { status: 500 }
      )
    }

    if (!settings?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found for this account" },
        { status: 400 }
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: settings.stripe_customer_id,
      return_url: `${origin}/account-settings?tab=${encodeURIComponent("Account")}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Billing portal error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to open billing portal" },
      { status: err.statusCode || 500 }
    )
  }
}

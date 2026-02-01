import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    standardPrice: process.env.STANDARD_PRICE_ID,
    premiumPrice: process.env.PREMIUM_PRICE_ID,
  });
}

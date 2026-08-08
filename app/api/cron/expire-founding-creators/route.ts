import { NextRequest, NextResponse } from "next/server"
import { expireFoundingCreators } from "@/lib/founding-creator"

export const dynamic = "force-dynamic"
export const maxDuration = 60

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false

  const auth = request.headers.get("authorization")
  if (auth === `Bearer ${secret}`) return true

  // Vercel Cron sends this header when CRON_SECRET is set in some setups;
  // also allow explicit x-cron-secret for manual/ops calls.
  const headerSecret = request.headers.get("x-cron-secret")
  if (headerSecret === secret) return true

  return false
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await expireFoundingCreators()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("expire-founding-creators cron failed:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cron failed" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}

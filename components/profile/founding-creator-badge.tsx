import Link from "next/link"
import { HiBadgeCheck } from "react-icons/hi"

function isActiveFoundingGrant(settings: {
  founding_creator_status?: string | null
  founding_creator_expires_at?: string | null
} | null | undefined): boolean {
  if (!settings) return false
  if (settings.founding_creator_status !== "active") return false
  if (!settings.founding_creator_expires_at) return false
  const expires = new Date(settings.founding_creator_expires_at).getTime()
  return Number.isFinite(expires) && expires > Date.now()
}

export function FoundingCreatorBadge({
  className = "",
  href = "/become-a-creator",
}: {
  className?: string
  href?: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex mb-1 items-center gap-1 text-md font-semibold text-cyan-600 hover:text-cyan-700 ${className}`}
      title="Journli Founding Creator"
    >
      <HiBadgeCheck className="h-6 w-6" aria-hidden />
      {/* Founding Creator */}
    </Link>
  )
}

/** Safe for client + server — does not import server-only modules. */
export function isActiveFoundingCreatorFromSettings(settings: {
  founding_creator_status?: string | null
  founding_creator_expires_at?: string | Date | null
} | null | undefined): boolean {
  if (!settings) return false
  const expiresAt =
    settings.founding_creator_expires_at instanceof Date
      ? settings.founding_creator_expires_at.toISOString()
      : settings.founding_creator_expires_at
  return isActiveFoundingGrant({
    founding_creator_status: settings.founding_creator_status,
    founding_creator_expires_at: expiresAt,
  })
}

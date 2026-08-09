import Link from "next/link"
import { HiBadgeCheck } from "react-icons/hi"
import { isFoundingProActive } from "@/lib/founding-creator/plan"

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
  return isFoundingProActive(settings)
}

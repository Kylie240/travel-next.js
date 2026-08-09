"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { claimFoundingCreatorAction } from "@/lib/actions/founding-creator.actions"
import type { EligibilityResult } from "@/lib/founding-creator/constants"
import type { FoundingCreatorStatus } from "@/lib/founding-creator/constants"

type Props = {
  isLoggedIn: boolean
  primaryHref: string
  status: FoundingCreatorStatus
  eligibility: EligibilityResult
  expiresAt: string | null
  rejectReason: string | null
}

export function FoundingClaimPanel({
  isLoggedIn,
  primaryHref,
  status,
  eligibility,
  expiresAt,
  rejectReason,
}: Props) {
  const [pendingStatus, setPendingStatus] = useState(status)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleClaim = () => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await claimFoundingCreatorAction()
        if (!result?.success) {
          setError(result?.error || "Could not submit application")
          return
        }
        setPendingStatus("pending")
      } catch (err) {
        console.error("claimFoundingCreatorAction client:", err)
        setError("Could not submit application. Please refresh and try again.")
      }
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center sm:p-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Ready to join the Founding Creators cohort?
        </h3>
        <p className="mt-2 text-gray-600">
          Create an account, complete your profile with at least one social
          account, publish a quality itinerary, then claim your spot for admin
          review.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/login?mode=signup">
            <Button className="bg-cyan-700 text-white hover:bg-cyan-800">
              Join Now
            </Button>
          </Link>
          <Link href="/login?mode=login">
            <Button variant="outline">Log in</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (pendingStatus === "active") {
    return (
      <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-cyan-700" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              You&apos;re a founding creator
            </h3>
            <p className="mt-2 text-gray-600">
              Thank you for joining the founding cohort — we&apos;re excited to
              have you on Journli and can&apos;t wait to see the trips you share
              with travelers.
            </p>
            <p className="mt-2 text-gray-600">
              Pro is active
              {expiresAt
                ? ` until ${new Date(expiresAt).toLocaleDateString()}`
                : " for your founding year"}
              . Keep publishing quality itineraries, and we&apos;ll help more
              people find your work.
            </p>
            <Link href={primaryHref} className="mt-4 inline-flex">
              <Button className="bg-cyan-700 text-white hover:bg-cyan-800">
                Create an itinerary
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (pendingStatus === "pending") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Application submitted
            </h3>
            <p className="mt-2 text-gray-600">
              Thanks — your claim is in the review queue. We&apos;ll activate Pro
              for a year if you&apos;re approved (up to 100 founding creators).
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (pendingStatus === "rejected") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
          <div className="w-full">
            <h3 className="text-xl font-semibold text-gray-900">
              Application not approved
            </h3>
            <p className="mt-2 text-gray-600">
              {rejectReason ||
                "Your application was not approved. You can improve your profile or itinerary and claim again."}
            </p>
            {eligibility.eligible ? (
              <Button
                className="mt-4 bg-cyan-700 text-white hover:bg-cyan-800"
                onClick={handleClaim}
                disabled={isPending}
              >
                {isPending ? "Submitting…" : "Claim again"}
              </Button>
            ) : (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-600">
                {eligibility.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  // null or expired — show claim / requirements
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
      <h3 className="text-xl font-semibold text-gray-900">
        Claim your founding creator spot
      </h3>
      <p className="mt-2 text-gray-600">
        {eligibility.slotsRemaining} spot
        {eligibility.slotsRemaining === 1 ? "" : "s"} left ({eligibility.activeCount}/
        {eligibility.activeCount + eligibility.slotsRemaining} filled). Passing the
        checklist submits you for admin approval — Pro is granted only after we
        approve.
      </p>

      {eligibility.eligible ? (
        <div className="mt-6">
          <Button
            className="bg-cyan-700 text-white hover:bg-cyan-800"
            onClick={handleClaim}
            disabled={isPending}
          >
            {isPending ? "Submitting…" : "Claim for review"}
          </Button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-gray-900">
            Finish these before you can claim:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
            {eligibility.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/account-settings">
              <Button variant="outline">Edit profile</Button>
            </Link>
            <Link href="/create">
              <Button className="bg-cyan-700 text-white hover:bg-cyan-800">
                Create itinerary
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
